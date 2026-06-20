import { type NumberhumanData, UserProfile } from "#db";
import { Numberhumans } from "#stores";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { bold, italic, MessageFlags, type User } from "discord.js";
import { getNumberhumansBy } from "./numberhumans.ts";
import type { NumberhumanSortingOrder } from "./sorting.ts";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";

function capitalize<T extends string>(val: T): Capitalize<T> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}` as Capitalize<T>;
}

function createCollectionMessage(user: User, page: number, numberhumans: NumberhumanData[]): string {
  const header = `# Numberhuman collection for ${user.displayName} (${user.username})`;

  const body = numberhumans.map(value => {
    const humanInStore = Numberhumans.get(value.id).expect("should not be undefined");
    const totalHP = value.totalHP(Numberhumans).toFixed(2);
    const totalAtk = value.totalAtk(Numberhumans).toFixed(2);
    const evolution = capitalize(value.evolution);
    return `#${value.catchId}: Lv. ${value.level}, ${
      evolution === "None" ? "" : italic(`${evolution} `)
    }"${humanInStore.name}" (HP: ${totalHP}, ATK: ${totalAtk})`;
  });

  return `${header}\n\n${body.slice((page - 1) * 10, page * 10).join("\n")}`;
}

export default async function numberdexShowHumans(
  interaction: ServerSlashCommandInteraction,
  user: User,
  sortingOrder: NumberhumanSortingOrder,
): Promise<void> {
  const dbUser = await UserProfile.findOne({
    where: {
      id: user.id,
      guildId: interaction.guildId,
    },
  });
  if (dbUser === null) return;
  const realNumbers = await getNumberhumansBy(
    sortingOrder,
    dbUser,
    Numberhumans,
  );
  if (realNumbers.length <= 0) {
    await interaction.reply({
      content: `you do not have any numberhumans, please play NumberDex first.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const numberhumanChunk = 25;
  const paginatedContent = new PaginatedMessage();

  for (let i = 0; i < realNumbers.length; i += numberhumanChunk) {
    paginatedContent.addPageContent(createCollectionMessage(user, Math.floor(i / 10) + 1, realNumbers))
  }

  paginatedContent.run(interaction);
}
