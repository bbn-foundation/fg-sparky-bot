import type { Command } from "#utils/types.ts";
import { type Client, type CommandInteraction } from "discord.js";

const Restart: Command = {
  async run(_client: Client, interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.id !== "1051147056481308744") {
      await interaction.reply("hey don't restart the bot you're not <@1051147056481308744>");
      return;
    }
    process.exit(0);
  },
  description: "Restarts the bot",
  name: "restart",
};

export default Restart;
