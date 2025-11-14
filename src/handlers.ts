import type { Client, Interaction } from "discord.js";
import { Logger } from "../scripts/logger";
import { Commands } from "./commands/commands";
import { handleSlashCommand } from "./commands/listener";
import { formatter } from "./utils/formatter";

export function registerHandlers(client: Client): void {
  client.once("clientReady", (client: Client<true>) => {
    const formattedDate = formatter.format(Date.now());
    Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      await handleSlashCommand(client, interaction, Commands);
    }
  });
}
