import { UserProfile } from "#db";
import { Achievements } from "#stores";
import { Logger } from "#utils/logger.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { italic, type Client} from "discord.js";

export async function userAchievementsDisplay(
  _client: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const displayAmount = interaction.options.getInteger("page", false) ?? 1;
  const discordUser = interaction.options.getUser("user", true);

  Logger.info("/user-achievements: fetching user data...");

  // Only take displayAmount from db to avoid fetching too many people and
  // getting rate-limited by discord
  console.time("/user-achievements: fetch user data from db");
  const user = await UserProfile.findOne({
    where: {
      id: discordUser.id,
      guildId: interaction.guildId,
    },
    order: {
      achievements: "DESC",
    },
  });
  console.timeEnd("/user-achievements: fetch user data from db");

  if (!user) {
    await interaction.editReply(`sorry you dont have a user profile`);
    return;
  }

  Logger.debug("/user-achievements: generating user reply...");
  const content = `\
    # User achievements for ${interaction.user.displayName} [${interaction.user.username}] (page #${displayAmount}): \n \
    ${
      user.achievements.map(id => {
        const ach = Achievements.get(id);
        if (!ach) return "";
        return `\
          ## ${ach.id}: ${ach.name}\n \
          ${italic(ach.description)} \
        `;
      }).join("\n")
    }
    `;
  await interaction.editReply({ content });

  // if (users.length > 25 && displayAmount > 25) {
  //   Logger.debug("/user-leaderboard: generating extended user reply...");
  //   const content = `\
  //   # User leaderboard (cont.): \n \
  //   ${
  //     users
  //       .slice(25)
  //       .map((user, index) => {
  //         if (index > displayAmount - 25) return "no";
  //         const position = ordinalOf(index + 26);
  //         // Sometimes an IIFE looks better then chaining ternaries
  //         const header = ((index) => {
  //           if (index === 0) return "##";
  //           if (index === 1) return "###";
  //           return "";
  //         })(index);
  //         return `${header} ${position}: ${
  //           discordUsers[index + 25]!.displayName
  //         } (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
  //       })
  //       .filter((value) => value !== "no")
  //       .join("\n")
  //   }
  //   `;

  //   await interaction.followUp({ content });
  // }
}
