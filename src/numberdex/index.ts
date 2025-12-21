/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Baker, FilePersistenceProvider } from "cronbake";
import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import { Logger } from "../utils/logger";
import { joinStringArray } from "../utils/string";
import { createUser, getUser } from "../utils/user";
import { handlePlayerGuess } from "./handler";
import { spawnNumberhuman } from "./utils";

export const baker: Baker = Baker.create({
  logger: Logger,
  persistence: {
    enabled: true,
    strategy: "file",
    provider: new FilePersistenceProvider("./numbers/numberdex-cron-jobs.json"),
    autoRestore: true,
  },
});

export async function setupCronJobs(client: Client, baker: Baker): Promise<void> {
  await baker.ready();
  const jobs = baker.getAllJobs();
  Logger.info(`re-adding callbacks to cron jobs...`);
  jobs.forEach(async (job, name) => {
    if (/numberdex-channel-[0-9]+/.test(name)) {
      const channel = await client.channels.fetch(name.slice(name.lastIndexOf("-") + 1));
      if (!channel || !channel.isSendable()) return;
      job.callback = async () => {
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
      };
    }
  });
}
