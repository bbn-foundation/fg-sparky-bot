import type { ICron } from "cronbake";
import type { Message, OmitPartialGroupDMChannel, SendableChannels } from "discord.js";
import { Logger } from "../utils/logger";
import { getRandomRange } from "../utils/numbers";
import { joinStringArray } from "../utils/string";
import { createUser, getUser } from "../utils/user";
import { spawnNumberhuman, type NumberhumanInfo } from "./utils";

const hasher = new Bun.CryptoHasher("blake2b512");

export function handlePlayerGuess(message: OmitPartialGroupDMChannel<Message>, number: NumberhumanInfo): boolean | undefined {
  if (message.author.bot) return;
  // Normalize the player's guess to a standard form to avoid weird os issues
  // like macos replacing "..." with "…" (elipis) or replacing ' with ’
  const guess = message.content.toLowerCase()
    .replaceAll(/’|‘/gu, "'") // Variants of single quotation marks
    .replaceAll(/“|”/gu, "'") // Variants of double quotation marks
    .replaceAll("…", "..."); // Ellipsis
  const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
  Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
  Logger.debug(`Numberhuman: ${number.number} (hashed: ${number.hashedNumber})`);
  if (hashedGuess === number.hashedNumber) {
    Logger.info("user guessed correctly");
    return true;
  }
  Logger.info("user guessed incorrectly");
  return false;
}

export function setupCallback(job: ICron, channel: SendableChannels): ICron {
  if (/numberdex-channel-[0-9]+/.test(job.name)) {
    Logger.debug(`setting up callback for cron job ${job.name}`);
    job.callback = async () => {
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
        }, getRandomRange(30000, 60000));

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
        client.on("messageCreate", handler);
      }
    };
  }

  return job;
}
