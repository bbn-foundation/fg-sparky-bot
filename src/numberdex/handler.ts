import type { NumberhumanStore } from "#stores-types";
import { Logger } from "#utils/logger.ts";
import type { ICron } from "cronbake";
import type { SendableChannels } from "discord.js";
import { spawnNumberhuman } from "./utils.ts";
import { sleep } from "#utils/sleep.ts";
import { getRandomRange } from "#utils/numbers.ts";
import { catchButtonHandler } from "./button.ts";
import { messageHandler } from "./buttonless.ts";

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
        if (Deno.env.get("NUMBERDEX_BUTTON")) {
          catchButtonHandler(okNumber, sentMessage);
        } else {
          messageHandler(okNumber, sentMessage);
        }
      } else {
        const error = number.unwrapErr();
        Logger.error(`Failed to spawn numberhuman: ${error.message}`);
        Logger.error(error.stack ?? "no stack trace available");
      }
    };
  }

  return job;
}
