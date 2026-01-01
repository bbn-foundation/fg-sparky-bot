/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createUser, getUser, handlePlayerGuess, NumberdexBaker, spawnNumberhuman } from "@fg-sparky/server";
import { getRandomRange, joinStringArray, Logger, NUMBERDEX_FLEE_DELAY, type Command } from "@fg-sparky/utils";
import { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits, type Client, type CommandInteraction, type Message, type OmitPartialGroupDMChannel } from "discord.js";

const Numberdex: Command = {
  async run(client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.memberPermissions.has("ManageChannels")) {
      await interaction.reply("you do not have permisison to set which channel fg sparky bot can spawn numberhumans in.");
      return;
    }
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        NumberdexBaker.add({
          name: `numberdex-channel-${channel.id}`,
          cron: "@every_20_minutes",
          async callback(): Promise<void> {
            const timeoutDuration = getRandomRange(0, 1200);
            Logger.info(`spawning numberhuman in channel ${channel.id} after ${timeoutDuration.toFixed(0)} seconds`);
            await Bun.sleep(timeoutDuration * 1000);
            const number = await spawnNumberhuman(channel);
            if (number.isOk()) {
              const [okNumber, sentMessage] = number.unwrap();
              const timeout = setTimeout(async () => {
                Logger.info("user failed to catch in time");
                client.off("messageCreate", handler);

                const content = `the numberhuman fled.`;
                await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
              }, NUMBERDEX_FLEE_DELAY);

              const handler = async (message: OmitPartialGroupDMChannel<Message>) => {
                if (message.channelId !== channel.id || message.author.bot) return;
                if (handlePlayerGuess(message, okNumber)) {
                  client.off("messageCreate", handler);
                  clearTimeout(timeout);

                  // @ts-expect-error: assertion fails for some reason even though the bot can only
                  // be installed in a guild
                  const user = await getUser(message.author.id, message.guildId);
                  Logger.debug(`tried looking up user ${message.author.id} (found: ${user ? "true" : "false"})`);

                  if (user) {
                    Logger.info(`user already exists, adding the numberhuman to their collection`);
                    // update the player stats first...
                    user.numberhumansGuessed.push(okNumber.uuid);
                    if (user.numberhumansGuessedUnique.includes(okNumber.uuid)) {
                      await message.reply(joinStringArray([
                        `hey, you managed to ~~kidnap~~ catch **${okNumber.number}**!`,
                      ]));
                    } else {
                      user.numberhumansGuessedUnique.push(okNumber.uuid);
                      await message.reply(joinStringArray([
                        `hey, you managed to ~~kidnap~~ catch **${okNumber.number}**!`,
                        "woah is that a new numberhuman you caught??",
                      ]));
                    }
                    // and saves.
                    await user.save();
                  } else {
                    Logger.info(`user not found, creating user and adding the numberhuman`);
                    // @ts-expect-error: assertion fails for some reason even though the bot can only
                    // be installed in a guild
                    const newUser = await createUser(message.author.id, message.guildId);
                    newUser.numberhumansGuessed.push(okNumber.uuid);
                    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
                    // so we can add it without checking.
                    newUser.numberhumansGuessedUnique.push(okNumber.uuid);
                    await message.reply(joinStringArray([
                      `hey, you managed to ~~kidnap~~ catch **${okNumber.number}**!`,
                      `i've also created a profile for you with that numberhuman.`,
                    ]));
                    await newUser.save();
                  }
                }
              };
            }
          },
        });
        await interaction.reply(`added channel <#${channel.id}>.`);
        return;
      }
      default: {
        throw new TypeError("unknown subcommand");
      }
    }
  },
  description: "Numberdex subcommands.",
  name: "numberdex",
  options: [{
    name: "add",
    description: "Adds a channel where the bot will spawn numberhumans.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "channel",
      description: "The channel.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    }],
  }],
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
};

export default Numberdex;
