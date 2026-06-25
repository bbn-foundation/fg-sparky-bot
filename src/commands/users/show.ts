import { getUser, NumberhumanData } from "#db";
import { EvolutionType } from "#numberdex/evolutions.ts";
import { Numberhumans, Numbers } from "#stores";
import { formatHuman, formatPercent } from "#utils/formatter.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { bold, ButtonStyle, chatInputApplicationCommandMention, ComponentType, type Client } from "discord.js";

const slashCommandMention = chatInputApplicationCommandMention(
  "numberdex show-humans",
  process.env.NODE_ENV === "development" ? "1469819026602590221" : "1452067362458308820",
);

function showLatestGuessed(latestGuessed: string | undefined, latestUniqueGuessed: string | undefined): string {
  if (latestGuessed && latestUniqueGuessed) {
    const latest = Numbers.get(latestGuessed).expect("the store should have the entry");
    const latestUnique = Numbers.get(latestUniqueGuessed).expect("the store should have the entry");

    return `Your latest number guessed was ${latest.name ?? "a legendary, which cannot be shown as those names are not stored"}, while your latest unique entry was ${latestUnique.name ?? "a legendary, which cannot be shown as those names are not stored."}.`;
  }

  return "You have not played FG sparky yet."
}

function showLatestCaught(latestCaught: NumberhumanData | undefined, latestUniqueCaught: NumberhumanData | undefined): string {
  if (latestCaught && latestUniqueCaught) {
    return `Your latest numberhuman caught was a ${formatHuman(latestCaught, Numberhumans)}, while your latest unique catch was a ${formatHuman(latestUniqueCaught, Numberhumans)}`;
  }

  return "You have not played NumberDex yet.";
}

export default async function userShow(
  _: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const discordUser = interaction.options.getUser("user", true);
  const userInfo = await getUser(discordUser.id, interaction.guildId);
  if (userInfo) {
    const { guessedEntries, uniqueGuessed, numberhumansGuessed, numberhumansGuessedUnique } = userInfo;
    const percentage = {
      all: uniqueGuessed.length / Numbers.UNIQUE_ENTRIES,
      easy: Numbers.countEntriesUnique("easy", uniqueGuessed) / Numbers.UNIQUE_EASY_ENTRIES,
      medium: Numbers.countEntriesUnique("medium", uniqueGuessed) / Numbers.UNIQUE_MEDIUM_ENTRIES,
      hard: Numbers.countEntriesUnique("hard", uniqueGuessed) / Numbers.UNIQUE_HARD_ENTRIES,
      legendary: Numbers.countEntriesUnique("legendary", uniqueGuessed) / Numbers.UNIQUE_LEGENDARY_ENTRIES,
      numberdex: numberhumansGuessedUnique.length / Numberhumans.UNIQUE_ENTRIES,
    };
    const numberhumans = await NumberhumanData.find({
      where: {
        caughtBy: {
          id: userInfo.id,
          guildId: userInfo.guildId,
        },
      },
      relations: {
        caughtBy: true,
      },
    });

    const message = new PaginatedMessage();

    message.setActions([
      {
        customId: "@sapphire/paginated-messages.previousPage",
        style: ButtonStyle.Primary,
        emoji: "◀️",
        type: ComponentType.Button,
        run: ({ handler }) => {
          if (handler.index === 0) {
            handler.index = handler.pages.length - 1;
          } else {
            --handler.index;
          }
        },
      },
      {
        customId: "@sapphire/paginated-messages.nextPage",
        style: ButtonStyle.Primary,
        emoji: "▶️",
        type: ComponentType.Button,
        run: ({ handler }) => {
          if (handler.index === handler.pages.length - 1) {
            handler.index = 0;
          } else {
            ++handler.index;
          }
        },
      },
    ]);

    message.addPageContent([
      `# Profile information for ${discordUser.displayName} (${discordUser.username})`,
      "## FG Sparky:",
      `Your highest guessing streak before failing was ${bold(Math.max(userInfo.bestStreak - 1, 0).toString())}.`,
      `Terminus Tokens earned: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
      `In total, you have guessed ${bold(guessedEntries.length.toString())
      } entries correctly. Out of those, ${uniqueGuessed.length.toString()} were a unique entry within the number store, meaning you are ${formatPercent(percentage.all)
      } of the way to completing FG sparky.`,
      showLatestGuessed(guessedEntries.at(-1), uniqueGuessed.at(-1)),
      `### Numbers guessed by difficulty:`,
      `- Easy numbers: ${Numbers.countEntriesTotal("easy", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("easy", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.easy)}]`,
      `- Medium numbers: ${Numbers.countEntriesTotal("medium", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("medium", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.medium)}]`,
      `- Hard numbers: ${Numbers.countEntriesTotal("hard", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("hard", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.hard)}]`,
      `- Legendary numbers: ${Numbers.countEntriesTotal("legendary", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("legendary", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.legendary)}]`,
    ].join("\n"));

    const bestHuman = numberhumans.toSorted((a, b) =>
      (b.totalHP(Numberhumans) + b.totalAtk(Numberhumans))
      - (a.totalHP(Numberhumans) + a.totalAtk(Numberhumans))
    )[0];

    const uniqueNumberhumanIds: string[] = [];
    const numberhumansUnique = numberhumans.filter(item => {
      if (uniqueNumberhumanIds.includes(item.id)) return false;
      else {
        uniqueNumberhumanIds.push(item.id);
        return true;
      }
    })

    message.addPageContent([
      `# Profile information for ${discordUser.displayName} (${discordUser.username})`,
      "## Numberdex stats:",
      `You have caught ${numberhumansGuessed.length.toString()} in total, ${numberhumansGuessedUnique.length.toString()} of which were unique catches, meaning you are ${
        formatPercent(percentage.numberdex)
      } of the way there to completing the Numberdex set.`,
      `Out of the ${numberhumansGuessed.length.toString()} numberhumans caught:`,
      `- ${
        numberhumansGuessed.length - numberhumans.length
      } of them were caught before v0.14.0, the update that added stats to numberhumans.`,
      `- ${numberhumans.filter(value => value.evolution !== EvolutionType.None).length} had an evolution.`,
      `- ${bestHuman ? `Your best numberhuman is catch #${bestHuman.catchId}, a ${formatHuman(bestHuman, Numberhumans)}` : `You have not caught a numberhuman yet, to determine the best one you have.`}`,
      `- ${showLatestCaught(numberhumans.at(-1), numberhumansUnique.at(-1))}`,
      `View your numberhuman collection with ${slashCommandMention}.`,
    ].join("\n"));

    message.run(interaction);
  } else {
    await interaction.followUp("sorry, fg sparky bot doesn't have data for this user");
  }
}
