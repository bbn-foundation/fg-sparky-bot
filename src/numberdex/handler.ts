import { Responses } from "#stores";
import type { NumberhumanStore } from "#stores-types";
import { NUMBERDEX_FLEE_DELAY } from "#utils/constants.ts";
import { createGuessHandler } from "#utils/guess-handler.ts";
import { Logger } from "#utils/logger.ts";
import { getRandomRange } from "#utils/numbers.ts";
import type { ICron } from "cronbake";
import {
  ComponentType,
  type Interaction,
  type ModalComponentData,
  type SendableChannels,
  TextInputStyle,
  userMention,
} from "discord.js";
import { updateUserStats } from "./users.ts";
import { createButtonRow, spawnNumberhuman } from "./utils.ts";

const createGuessModal = (channelId: string): ModalComponentData => ({
  title: "yeah",
  id: channelId,
  customId: `numberhuman-guess-modal-${channelId}`,
  components: [
    {
      id: 0,
      label: "what's the human's name?",
      type: ComponentType.Label,
      // @ts-expect-error: labels are not allowed in text input components
      component: {
        customId: `numberhuman-guess-input-${channelId}`,
        style: TextInputStyle.Short,
        type: ComponentType.TextInput,
      },
    },
  ],
});

const handlePlayerGuess = createGuessHandler("blake2b512");

export function setupCallback(
  store: NumberhumanStore,
  job: ICron,
  channel: SendableChannels,
): ICron {
  if (/numberdex-channel-[0-9]+/.test(job.name)) {
    Logger.debug(`setting up callback for cron job ${job.name}`);
    job.callback = async () => {
      const timeoutDuration = process.env.NODE_ENV === "development" ? 0 : getRandomRange(0, 1200);
      Logger.info(
        `spawning numberhuman in channel ${channel.id} after ${timeoutDuration.toFixed(0)} seconds`,
      );
      await Bun.sleep(timeoutDuration * 1000);
      const number = await spawnNumberhuman(store, channel);
      if (number.isOk()) {
        const [okNumber, sentMessage] = number.unwrap();
        const timeout = setTimeout(async () => {
          Logger.info("user failed to catch in time");
          client.off("interactionCreate", handler);

          const content = Responses.getRandom({
            type: "flee",
          }).unwrapOr(`the numberhuman fled.`);
          await sentMessage.edit({ components: [createButtonRow(true)] });
          await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
        }, NUMBERDEX_FLEE_DELAY);

        const handler = async (interaction: Interaction) => {
          if (interaction.channelId !== channel.id) return;
          if (interaction.isButton() && interaction.message.id === sentMessage.id) {
            Logger.debug(`User ${interaction.user.displayName} clicked the button`);
            await interaction.showModal(createGuessModal(interaction.channelId));
          } else if (
            interaction.inGuild()
            && interaction.isModalSubmit()
            && interaction.isFromMessage()
            && interaction.customId === `numberhuman-guess-modal-${interaction.channelId}`
            && interaction.message.id === sentMessage.id
          ) {
            Logger.debug(
              `User ${interaction.user.displayName} submitted the numberhuman, verifying it's correct...`,
            );
            const guess = interaction.fields.getTextInputValue(
              `numberhuman-guess-input-${interaction.channelId}`,
            );
            if (
              handlePlayerGuess(guess, { number: okNumber.name, hashedNumber: okNumber.hashedName })
            ) {
              client.off("interactionCreate", handler);
              clearTimeout(timeout);
              await interaction.update({
                components: [createButtonRow(true)],
              });
              await updateUserStats(interaction, okNumber, guess);
            } else {
              const failMessage = Responses.getRandom({
                type: "fail",
                correctHuman: okNumber.name,
                guessedHuman: guess,
                mentionId: interaction.user.id,
              }).unwrapOr(
                `yeah, i wished it was **${guess}**, ${userMention(interaction.user.id)}.`,
              );
              await interaction.reply(failMessage);
            }
          }
        };

        client.on("interactionCreate", handler);
      } else {
        const error = number.unwrapErr();
        Logger.error(`Failed to spawn numberhuman: ${error.message}`);
        Logger.error(error.stack ?? "no stack trace available");
      }
    };
  }

  return job;
}
