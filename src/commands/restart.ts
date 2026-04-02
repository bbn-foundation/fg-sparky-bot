import type { Command } from "#utils/types.ts";
import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";

const Restart: Command = {
  async run(_client: Client, interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.id !== "1051147056481308744") {
      await interaction.reply("hey don't restart the bot you're not <@1051147056481308744>");
      return;
    }
    if (interaction.options.getBoolean("rebuild", false)) {
      await Bun.$`/home/linuxbrew/.linuxbrew/bin/bun run build`;
    }
    process.exit(0);
  },
  description: "Restarts the bot",
  name: "restart",
  options: [
    {
      name: "rebuild",
      description: "Also rebuild the code?",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
  ],
};

export default Restart;
