/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Baker, FilePersistenceProvider } from "cronbake";
import type { Client } from "discord.js";
import { Logger } from "../utils/logger";
import { setupCallback } from "./handler";

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
      return setupCallback(job, channel);
    }
  });
}
