/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, ChannelType, type Client, type CommandInteraction, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { handlePlayerGuess } from "../numberdex/handler.ts";
import { baker } from "../numberdex/index.ts";
import { spawnNumberhuman } from "../numberdex/utils.ts";
import { Logger } from "../utils/logger.ts";
import { joinStringArray } from "../utils/string.ts";
import { createUser, getUser } from "../utils/user.ts";
import type { Command } from "./types.ts";

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
        baker.add({
          name: `numberdex-channel-${channel.id}`,
          cron: "@every_20_minutes",
          async callback(): Promise<void> {
            Logger.info(`spawning numberhuman in channel ${channel.id}`);
            const number = await spawnNumberhuman(channel);
            if (number.isOk()) {
              const okNumber = number.unwrap();
              const handler = async (message: OmitPartialGroupDMChannel<Message>) => {
                if (message.channelId !== channel.id || message.author.bot) return;
                if (handlePlayerGuess(message, okNumber)) {
                  client.off("messageCreate", handler);

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
              client.on("messageCreate", handler);
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
  cooldown: 0,
};

export default Numberdex;
