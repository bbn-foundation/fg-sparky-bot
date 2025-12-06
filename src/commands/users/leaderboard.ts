import type { Client, User as DiscordUser } from "discord.js";
import { UserProfile } from "../../entities/user-profile";
import { Logger } from "../../utils/logger";
import { ordinalOf } from "../../utils/numbers";
import type { ServerSlashCommandInteraction } from "../types";

export default async function userLeaderboardDisplay(client: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const displayAmount = (interaction.options.getNumber("amount", false) ?? 10);

  Logger.info("/user-leaderboard: fetching user data...");

  // Only take displayAmount from db to avoid fetching too many people and
  // getting rate-limited by discord
  console.time("/user-leaderboard: fetch user data from db");
  const users = await UserProfile.find({
    order: { tokens: "DESC" },
    select: ["id", "tokens"],
    where: { guildId: interaction.guildId },
    take: displayAmount,
  });
  console.timeEnd("/user-leaderboard: fetch user data from db");

  console.time("/user-leaderboard: fetch user data from discord");
  const discordUsers: DiscordUser[] = await Promise.all(
    users.map(profile => client.users.fetch(profile.id)),
  );
  console.timeEnd("/user-leaderboard: fetch user data from discord");

  Logger.debug("/user-leaderboard: generating user reply...");
  const content = `\
    # User leaderboard: \n \
    ${users.map((user, index) => {
      if (index > Math.min(displayAmount, 25) - 1) return "no";
      const position = ordinalOf(index + 1);
      // Sometimes an IIFE looks better then chaining ternaries
      const header = ((index) => {
        if (index === 0) return "##";
        if (index === 1) return "###";
        return "";
      })(index);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return `${header} ${position}: ${discordUsers[index]!.displayName} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
    }).filter(value => value !== "no").join("\n")}
    `;
  await interaction.editReply({ content });

  if (users.length > 25 && displayAmount > 25) {
    Logger.debug("/user-leaderboard: generating extended user reply...");
    const content = `\
    # User leaderboard (cont.): \n \
    ${users.slice(25).map((user, index) => {
      if (index > displayAmount - 25) return "no";
      const position = ordinalOf(index + 26);
      // Sometimes an IIFE looks better then chaining ternaries
      const header = ((index) => {
        if (index === 0) return "##";
        if (index === 1) return "###";
        return "";
      })(index);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return `${header} ${position}: ${discordUsers[index + 25]!.displayName} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
    }).filter(value => value !== "no").join("\n")}
    `;

    await interaction.followUp({ content });
  }
}
