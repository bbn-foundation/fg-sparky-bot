import type { NumberhumanStore } from "#stores-types";
import { Logger } from "#utils/logger.ts";
import { Baker, FilePersistenceProvider } from "cronbake";
import type { Client } from "discord.js";
import { setupCallback } from "./handler.ts";

export const NumberdexBaker: Baker = Baker.create({
  logger: Logger,
  persistence: {
    enabled: true,
    strategy: "file",
    provider: new FilePersistenceProvider("./numbers/numberdex-cron-jobs.json"),
    autoRestore: true,
  },
});

export async function setupCronJobs(
  client: Client,
  store: NumberhumanStore,
  baker: Baker,
): Promise<void> {
  await baker.ready();
  const jobs = baker.getAllJobs();
  Logger.info(`re-adding callbacks to cron jobs...`);
  jobs.forEach(async (job, name) => {
    if (/numberdex-channel-[0-9]+/.test(name)) {
      const channel = await client.channels.fetch(name.slice(name.lastIndexOf("-") + 1));
      if (!channel || !channel.isSendable()) return;
      return setupCallback(store, job, channel);
    }

    return job;
  });
}
