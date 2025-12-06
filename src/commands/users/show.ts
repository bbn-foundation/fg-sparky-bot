import type { Client } from "discord.js";
import { countEntriesTotal, countEntriesUnique } from "../../utils/numbers";
import { getUser } from "../../utils/user";
import type { ServerSlashCommandInteraction } from "../types";

export default async function userShow(client: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  const userId = interaction.options.get("user", true).value as string;
  const userInfo = await getUser(userId, interaction.guildId);
  const discordUser = await client.users.fetch(userId);
  if (userInfo) {
    const { guessedEntries, uniqueGuessed } = userInfo;
    const content = [
      `## Profile information for ${discordUser.displayName} (${discordUser.username})`,
      `terminus tokens: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
      `numbers guessed: ${guessedEntries.length.toString()} (total), ${uniqueGuessed.length.toString()} (unique)`,
      `- easy numbers: ${countEntriesTotal("easy", guessedEntries).toString()} (total), ${countEntriesUnique("easy", uniqueGuessed).toString()} (unique)`,
      `- medium numbers: ${countEntriesTotal("medium", guessedEntries).toString()} (total), ${countEntriesUnique("medium", uniqueGuessed).toString()} (unique)`,
      `- hard numbers: ${countEntriesTotal("hard", guessedEntries).toString()} (total), ${countEntriesUnique("hard", uniqueGuessed).toString()} (unique)`,
      `- legendary numbers: ${countEntriesTotal("legendary", guessedEntries).toString()} (total), ${countEntriesUnique("legendary", uniqueGuessed).toString()} (unique)`,
    ];
    await interaction.reply({
      content: content.join("\n"),
    });
  } else {
    await interaction.reply("sorry, fg sparky bot doesn't have data for this user");
  }
}
