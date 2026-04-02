import { type ChatInputCommandInteraction, type Client, MessageFlags } from "discord.js";
import { ReloadStoreType } from "./common.ts";

export default async function reloadStoreCommand(
  _: Client,
  interaction: ChatInputCommandInteraction<"raw" | "cached">,
): Promise<void> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  switch (interaction.options.getString("store", true) as ReloadStoreType) {
    case ReloadStoreType.Numberhumans: {
      await Numberhumans.reload();
      await interaction.reply({
        content: "reloaded numberhuman store.",
        flags: MessageFlags.Ephemeral,
      });
      break;
    }
    case ReloadStoreType.SparkyEntries: {
      await Numbers.reload();
      await interaction.reply({
        content: "reloaded numbers store.",
        flags: MessageFlags.Ephemeral,
      });
      break;
    }
    case ReloadStoreType.Responses: {
      await Responses.reload();
      await interaction.reply({
        content: "reloaded responses store.",
        flags: MessageFlags.Ephemeral,
      });
      break;
    }
    default: {
      await interaction.reply("sorry idk what store that is");
      break;
    }
  }
}
