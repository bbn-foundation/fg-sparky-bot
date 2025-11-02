import type { Client, CommandInteraction } from "discord.js";
import type { Command } from "./types.ts";

const Ping: Command = {
  async run(client: Client, interaction: CommandInteraction): Promise<void> {
    await interaction.followUp("Hi chat");
  },
  description: "Pings the bot",
  name: "ping",
};

export default Ping;
