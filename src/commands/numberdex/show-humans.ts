import { NumberhumanData, UserProfile } from "#db";
import { Numberhumans } from "#stores";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { chatInputApplicationCommandMention, type Client, italic, type User } from "discord.js";

function capitalize<T extends string>(val: T): Capitalize<T> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}` as Capitalize<T>;
}

const slashCommandMention = chatInputApplicationCommandMention(
  "numberdex show-humans",
  process.env.NODE_ENV === "development" ? "1454578425414291613" : "1452067362458308820",
);

function createCollectionMessage(user: User, page: number, numberhumans: NumberhumanData[]): string {
  const header = [
    `# Numberhuman collection for ${user.displayName} (${user.username})`,
    `Switch pages by running ${slashCommandMention} again.`,
  ];

  console.log(numberhumans);

  const body = numberhumans.map(value => {
    const humanInStore = Numberhumans.get(value.id).expect("should not be undefined");
    const totalHP = value.totalHP(Numberhumans).toFixed(2);
    const totalAtk = value.totalAtk(Numberhumans).toFixed(2);
    const evolution = capitalize(value.evolution);
    return `#${value.catchId}: Lv. ${value.level}, ${
      evolution === "None" ? "" : italic(`${evolution} `)
    }"${humanInStore.name}" (HP: ${totalHP}, ATK: ${totalAtk})`;
  });

  return `${header.join("\n")}\n\n${body.slice((page - 1) * 10, page * 10).join("\n")}`;
}

export default async function numberdexShowHumans(
  _c: Client,
  interaction: ServerSlashCommandInteraction,
  user: User,
  pageNumber: number,
): Promise<void> {
  const dbUser = await UserProfile.findOne({
    where: {
      id: user.id,
      guildId: interaction.guildId,
    },
  });
  const realNumbers = await NumberhumanData.find({
    relations: {
      caughtBy: true,
    },
    where: {
      caughtBy: {
        guildId: interaction.guildId,
        id: user.id,
      },
    },
  });
  if (dbUser === null) return;

  await interaction.reply({
    content: createCollectionMessage(user, pageNumber, realNumbers),
  });
}
