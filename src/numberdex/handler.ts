import { Responses } from "#stores";
import type { NumberhumanStore } from "#stores-types";
import { NUMBERDEX_FLEE_DELAY } from "#utils/constants.ts";
import { createGuessHandler } from "#utils/guess-handler.ts";
import { Logger } from "#utils/logger.ts";
import type { ICron } from "cronbake";
import { Message, type SendableChannels, userMention} from "discord.js";
import { updateUserStats } from "./users.ts";
import { spawnNumberhuman } from "./utils.ts";
import { sleep } from "#utils/sleep.ts";
import { getRandomInt, getRandomRange } from "#utils/numbers.ts";

const handlePlayerGuess = createGuessHandler("blake2b512");

export function setupCallback(
  store: NumberhumanStore,
  job: ICron,
  channel: SendableChannels,
): ICron {
  if (/numberdex-channel-[0-9]+/.test(job.name)) {
    Logger.debug(`setting up callback for cron job ${job.name}`);
    job.callback = async () => {
      const timeoutDuration = getRandomRange(0, 300);
      Logger.info(
        `spawning numberhuman in channel ${channel.id} after ${timeoutDuration.toFixed(0)} seconds`,
      );
      await sleep(timeoutDuration * 1000);
      const number = await spawnNumberhuman(store, channel);
      if (number.isOk()) {
        const [okNumber, sentMessage] = number.unwrap();
        const collector = channel.createMessageCollector({
          dispose: true,
          time: NUMBERDEX_FLEE_DELAY - 1,
        });

        collector.once("end", async (_, reason: string) => {
          if (reason === "success") return;
          Logger.info("user failed to catch in time");
          collector.stop();

          const content = Responses.getRandom({
            type: "flee",
            correctHuman: okNumber.name,
          }).unwrapOr(`the numberhuman fled.`);
          try {
            await sentMessage.edit({
              content: sentMessage.content + '\n-# ❌ This numberhuman has despawned before you could catch it.',
            });
            await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
          } catch (err) {
            if (!Error.isError(err)) throw err;
            Logger.error(`failed to edit/reply to spawn message:`);
            Logger.error(err);
          }
        });

        collector.on("collect", async (message: Message) => {
          if (message.author.bot) return;
          if (collector.collected.size >= getRandomInt(10, 25)) {
            await message.reply(`Too many requests in 5 minutes. Try again later.`);
            collector.stop();
            return;
          }
          if (
            handlePlayerGuess(message.content, { number: okNumber.name, hashedNumber: okNumber.hashedName })
          ) {
            collector.stop("success");
            await sentMessage.edit({
              content: sentMessage.content + `\n-# ✅ This numberhuman has been caught by ${userMention(message.author.id)}.`
            })
            await updateUserStats(message as Message<true>, okNumber);
          } else {
            const failMessage = Responses.getRandom({
              type: "fail",
              correctHuman: okNumber.name,
              guessedHuman: message.content,
              mentionId: message.author.id,
            }).unwrapOr(
              `yeah, i wished it was **${message.content}**, ${userMention(message.author.id)}.`,
            );
            try {
              await message.reply(failMessage);
            } catch (error) {
              if (!Error.isError(error)) throw error;
              return;
            }
          }
        });
      } else {
        const error = number.unwrapErr();
        Logger.error(`Failed to spawn numberhuman: ${error.message}`);
        Logger.error(error.stack ?? "no stack trace available");
      }
    };
  }

  return job;
}
