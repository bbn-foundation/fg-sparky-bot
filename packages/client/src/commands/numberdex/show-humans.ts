import { type NumberhumanData, UserProfile } from "@fg-sparky/server";
import { formatAdd, getEvolutionBuff, type ServerSlashCommandInteraction } from "@fg-sparky/utils";
import type { Client, User } from "discord.js";
import { Numberhumans } from "../../stores.ts";

function createCollectionMessage(user: User, page: number, numberhumans: NumberhumanData[]): string {
  const header = [
    `# Numberhuman collection for ${user.displayName} (${user.username})`,
    `Switch pages by running /numberdex show-humans again.`,
  ];

  console.log(numberhumans);

  const body = numberhumans.map(value => {
    const humanInStore = Numberhumans.get(value.id).expect("should not be undefined");
    const evolutionHPBonus = getEvolutionBuff(value.evolution, "hp");
    const evolutionATKBonus = getEvolutionBuff(value.evolution, "atk");
    const HPString = `${humanInStore.baseHP}, ${formatAdd(value.bonusHP * 100)}%, ×${evolutionHPBonus.toFixed(1)} = ${
      value.totalHP(Numberhumans).toFixed(2)
    }`;
    const ATKString = `${humanInStore.baseATK}, ${formatAdd(value.bonusAtk * 100)}%, ×${
      evolutionATKBonus.toFixed(1)
    } = ${value.totalHP(Numberhumans).toFixed(2)}`;
    return [
      `#${value.catchId}: Lv. ${value.level}, "${humanInStore.name}"`,
      `-# HP: ${HPString}, ATK: ${ATKString}`,
    ].join("\n");
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
    relations: {
      numberhumans: true,
    },
  });
  if (dbUser === null) return;

  await interaction.reply({
    content: createCollectionMessage(user, pageNumber, dbUser.numberhumans!),
  });
}
