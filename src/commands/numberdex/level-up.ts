import { getUser, NumberhumanData } from "#db";
import { Numberhumans } from "#stores";
import { formatHuman } from "#utils/formatter.ts";
import { createButtonRow } from "#utils/interactions.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { bold, MessageFlags, type Interaction } from "discord.js";

function levelBuff(currentLevel: number): number {
  return (1.5 ** currentLevel);
}

export async function numberdexLevelUp(interaction: ServerSlashCommandInteraction): Promise<void> {
  const userProfile = await getUser(interaction.user.id, interaction.guildId);
  const catchId = interaction.options.getInteger("id", true);
  if (!userProfile) {
    await interaction.reply({
      content: `you do not have a profile yet, play FG sparky or numberdex first.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const numberhuman = await NumberhumanData.findOneBy({
    caughtBy: {
      id: userProfile.id,
      guildId: userProfile.guildId,
    },
    catchId,
  });
  if (!numberhuman) {
    await interaction.reply({
      content: `You do not have a numberhuman with the id of #${catchId.toString()}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const req = Math.pow(5, numberhuman.level) * 1000;
  if (userProfile.tokens < req) {
    await interaction.reply({
      content: `You do not have enough tokens to level up. You need ${req > 1e6 ? req.toExponential(3) : req.toString()} tokens.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content: [
      `Leveling up numberhuman #${catchId} (a ${formatHuman(numberhuman, Numberhumans)} to level ${bold((numberhuman.level + 1).toString())}`,
      ` will result in a ${bold((levelBuff(numberhuman.level + 1) / levelBuff(numberhuman.level)).toPrecision(4))}x buff to their attack and HP.\n`,
      `This will cost ${bold(req > 1e6 ? req.toExponential(3) : req.toString())} <:terminusfinity:1444859277515690075>. Are you sure you want to do this?`,
      ].join(""),
    components: [createButtonRow("level-up", false, true)],
  });

  const handler = async (interact: Interaction) => {
    if (
      interact.isButton()
      && (interact.customId === "level-up-accept-button"
        || interact.customId === "level-up-reject-button")
    ) {
      await interact.deferUpdate();
      clearTimeout(timeout);
      if (interact.customId === "level-up-accept-button") {
        if (interact.user.id !== interaction.user.id) {
          await interact.reply({
            content: "You cannot level up another person's numberhuman for them.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        userProfile.tokens -= req;
        numberhuman.level++;
        await userProfile.save();
        await numberhuman.save();
        await interaction.editReply({
          components: [createButtonRow("gift", true, true)],
        });
        await interaction.followUp(
          // dprint-ignore
          `:arrow_double_up: Your numberhuman has been leveled up to level ${bold(numberhuman.level.toString())}!`,
        );
      } else {
        if (interaction.user.id !== interact.user.id) {
          await interact.reply({
            content: "You cannot prevent someone else from leveling up their numberhuman.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await interaction.editReply({
          components: [createButtonRow("gift", true, true)],
        });
        await interaction.followUp(`Level up rejected.`);
      }
      client.off("interactionCreate", handler);
    }
  };

  const timeout = setTimeout(async () => {
    client.off("interactionCreate", handler);
    await interaction.editReply({
      components: [createButtonRow("gift", true, true)],
    });
    await interaction.followUp(
      `You have taken too long to respond.`,
    );
  }, 5 * 60 * 1000);

  client.on("interactionCreate", handler);
}
