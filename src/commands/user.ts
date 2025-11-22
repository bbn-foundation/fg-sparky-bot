import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";
import { Logger } from "../utils/logger";
import { createUser } from "../utils/user";
import type { Command } from "./types";

const User: Command = {
  async run(client: Client, interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand()) {
      case "register": {
        Logger.info(`Creating user profile for ${interaction.user.displayName} [${interaction.user.username}]`);
        await createUser(interaction.user.id);
        return;
      }
      default: {
        await interaction.reply(`Subcommand ${interaction.options.getSubcommand()} not supported!`);
      }
    }
  },
  description: "User management command",
  name: "user",
  options: [{
    name: "register",
    description: "Creates a user profile for you",
    type: ApplicationCommandOptionType.Subcommand,
  }],
};

export default User;
