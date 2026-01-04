import { createGuessHandler, createUser, getUser, type NumberhumanStore } from "@fg-sparky/server";
import { joinStringArray, Logger, NUMBERDEX_FLEE_DELAY, type ICron } from "@fg-sparky/utils";
import { bold, ComponentType, TextInputStyle, userMention, type Interaction, type ModalComponentData, type SendableChannels } from "discord.js";
import { createButtonRow, spawnNumberhuman } from "./utils.ts";

const guessModal: ModalComponentData = {
  title: "yeah",
  customId: `numberhuman-guess-modal`,
  components: [{
    id: 0,
    label: "what's the human's name?",
    type: ComponentType.Label,
    component: {
      customId: "numberhuman-guess-input",
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
    },
  }],
};

const handlePlayerGuess = createGuessHandler("blake2b512");

export function setupCallback(store: NumberhumanStore, job: ICron, channel: SendableChannels): ICron {
  if (/numberdex-channel-[0-9]+/.test(job.name)) {
    Logger.debug(`setting up callback for cron job ${job.name}`);
    job.callback = async () => {
      // const timeoutDuration = getRandomRange(0, 1200);
      const timeoutDuration = 0;
      Logger.info(`spawning numberhuman in channel ${channel.id} after ${timeoutDuration.toFixed(0)} seconds`);
      await Bun.sleep(timeoutDuration * 1000);
      const number = await spawnNumberhuman(store, channel);
      if (number.isOk()) {
        const [okNumber, sentMessage] = number.unwrap();
        const timeout = setTimeout(async () => {
          Logger.info("user failed to catch in time");
          client.off("interactionCreate", handler);

          const content = `the numberhuman fled.`;
          await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
        }, NUMBERDEX_FLEE_DELAY);

        const handler = async (interaction: Interaction) => {
          if (interaction.isButton()) {
            await interaction.showModal(guessModal);
          } else if (interaction.inGuild() && interaction.isModalSubmit() && interaction.isFromMessage()) {
            await interaction.update({
              components: [createButtonRow(true)],
            });
            const guess = interaction.fields.getTextInputValue("numberhuman-guess-input");
            if (handlePlayerGuess(guess, { number: okNumber.name, hashedNumber: okNumber.hashedName })) {
              client.off("interactionCreate", handler);
              clearTimeout(timeout);

              const user = await getUser(interaction.user.id, interaction.guildId);
              Logger.debug(`tried looking up user ${interaction.user.id} (found: ${user ? "true" : "false"})`);

              if (user) {
                Logger.info(`user already exists, adding the numberhuman to their collection`);
                // update the player stats first...
                user.numberhumansGuessed.push(okNumber.uuid);
                if (user.numberhumansGuessedUnique.includes(okNumber.uuid)) {
                  await interaction.followUp(joinStringArray([
                    `hey, you managed to ~~kidnap~~ catch ${bold(okNumber.name)} ${userMention(interaction.user.id)}!`,
                  ]));
                } else {
                  user.numberhumansGuessedUnique.push(okNumber.uuid);
                  await interaction.followUp(joinStringArray([
                    `hey, you managed to ~~kidnap~~ catch ${bold(okNumber.name)} ${userMention(interaction.user.id)}!`,
                    "woah is that a new numberhuman you caught??",
                  ]));
                }
                // and saves.
                await user.save();
              } else {
                Logger.info(`user not found, creating user and adding the numberhuman`);
                const newUser = await createUser(interaction.user.id, interaction.guildId);
                newUser.numberhumansGuessed.push(okNumber.uuid);
                // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
                // so we can add it without checking.
                newUser.numberhumansGuessedUnique.push(okNumber.uuid);
                await interaction.followUp(joinStringArray([
                  `hey, you managed to ~~kidnap~~ catch ${bold(okNumber.name)} ${userMention(interaction.user.id)}!`,
                  `i've also created a profile for you with that numberhuman.`,
                ]));
                await newUser.save();
              }
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
