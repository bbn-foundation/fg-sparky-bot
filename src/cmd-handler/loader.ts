import { Logger } from "#utils/logger.ts";
import type { Command } from "#utils/types.ts";
import type { Client } from "discord.js";
import { readdir } from "node:fs/promises";

let reloadCount = 0;

/**
 * Loads commands to discord.
 * @param client Discord bot client
 * @param commandsFolder The folder that has all the commands to laod
 * @returns Array of commands that was successfully loaded.
 */
export async function loadCommands(client: Client, commandsFolder: string): Promise<readonly Command[]> {
  if (!client.isReady()) return [];

  Logger.notice(`Searching for commands...`);
  const commandFiles = await readdir(
    Bun.fileURLToPath(import.meta.resolve(commandsFolder, import.meta.url)),
    {
      withFileTypes: true,
    },
  );

  const commands: readonly Command[] = await Promise.all(
    commandFiles.filter(entry => entry.isFile() && entry.name.endsWith(".ts"))
      .map(entry => entry.name)
      // oxlint-disable-next-line typescript/no-unsafe-return, no-unsafe-member-access
      .map(async (src) => (await import(`${commandsFolder}/${src}?count=${reloadCount++}`)).default),
  );

  Logger.info(`Loading ${commands.length.toString()} commands (which are: %s)`, commands.map(cmd => cmd.name));
  await client.application.commands.set(commands);
  return commands;
}
