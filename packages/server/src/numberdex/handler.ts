import { getRandomRange, Logger, NUMBERDEX_FLEE_DELAY, type ICron } from "@fg-sparky/utils";
import { bold, ComponentType, TextInputStyle, userMention, type Interaction, type ModalComponentData, type SendableChannels } from "discord.js";
import { createGuessHandler } from "../handler.ts";
import type { NumberhumanStore } from "./class.ts";
import { createButtonRow, spawnNumberhuman, updateUserStats } from "./utils.ts";

const createGuessModal = (channelId: string): ModalComponentData => ({
  title: "yeah",
  id: channelId,
  customId: `numberhuman-guess-modal-${channelId}`,
  components: [{
    id: 0,
    label: "what's the human's name?",
    type: ComponentType.Label,
    component: {
      customId: `numberhuman-guess-input-${channelId}`,
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
    },
  }],
});

const handlePlayerGuess = createGuessHandler("blake2b512");

export function setupCallback(store: NumberhumanStore, job: ICron, channel: SendableChannels): ICron {
  if (/numberdex-channel-[0-9]+/.test(job.name)) {
    Logger.debug(`setting up callback for cron job ${job.name}`);
    job.callback = async () => {
      const timeoutDuration = process.env.NODE_ENV === "development" ? 0 : getRandomRange(0, 1200);
      Logger.info(`spawning numberhuman in channel ${channel.id} after ${timeoutDuration.toFixed(0)} seconds`);
      await Bun.sleep(timeoutDuration * 1000);
      const number = await spawnNumberhuman(store, channel);
      if (number.isOk()) {
        const [okNumber, sentMessage] = number.unwrap();
        const timeout = setTimeout(async () => {
          Logger.info("user failed to catch in time");
          client.off("interactionCreate", handler);

          const content = `the numberhuman fled.`;
          await sentMessage.edit({ components: [createButtonRow(true)] });
          await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
        }, NUMBERDEX_FLEE_DELAY);

        const handler = async (interaction: Interaction) => {
          if (interaction.channelId !== channel.id) return;
          if (interaction.isButton()) {
            Logger.debug(`User ${interaction.user.displayName} clicked the button`);
            await interaction.showModal(createGuessModal(interaction.channelId));
          } else if (interaction.inGuild() && interaction.isModalSubmit() && interaction.isFromMessage()
            && interaction.customId === `numberhuman-guess-modal-${interaction.channelId}`) {
            Logger.debug(`User ${interaction.user.displayName} submitted the numberhuman, verifying it's correct...`);
            const guess = interaction.fields.getTextInputValue(`numberhuman-guess-input-${interaction.channelId}`);
            if (handlePlayerGuess(guess, { number: okNumber.name, hashedNumber: okNumber.hashedName })) {
              client.off("interactionCreate", handler);
              clearTimeout(timeout);
              await interaction.update({
                components: [createButtonRow(true)],
              });
              await updateUserStats(interaction, okNumber);
            } else {
              await interaction.followUp(`yeah, i wish it was ${bold(guess)}, ${userMention(interaction.user.id)}.`);
            }
          }
        };

        client.on("interactionCreate", handler);
      } else {
        Logger.error(`Failed to spawn numberhuman: ${number.unwrapErr()}`);
      }
    };
  }

  return job;
}
