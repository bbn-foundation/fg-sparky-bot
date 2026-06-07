import { NumberhumanData, UserProfile } from "#db";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, ComponentType, InteractionResponse, italic, MessageFlags, userMention, type Interaction, type User } from "discord.js";
import { Numberhumans } from "#stores";
import { Logger } from "#utils/logger.ts";

const giftCollection = new WeakMap<InteractionResponse, [string, string]>();

function formatHuman(numberhuman: NumberhumanData): string {
  const numberhumanData = Numberhumans.get(numberhuman.id).expect("should exist");
  return `level ${bold(numberhuman.level.toString())}, ${italic(numberhuman.evolution)} ${numberhumanData.name} (HP: ${bold(numberhuman.totalHP(Numberhumans).toString())}, ATK: ${bold(numberhuman.totalAtk(Numberhumans).toString()}))`;
}

function createButtonRow(disabled?: boolean): ActionRowBuilder<ButtonBuilder> {
  const acceptButton = ButtonBuilder.from({
    // @ts-expect-error THERE SHALL BE NO URL
    customId: "trade-accept-button",
    label: "Accept",
    style: ButtonStyle.Success,
    type: ComponentType.Button,
    disabled,
  });

  const declineButton = ButtonBuilder.from({
    // @ts-expect-error THERE SHALL BE NO URL
    customId: "trade-reject-button",
    label: "Reject",
    style: ButtonStyle.Danger,
    type: ComponentType.Button,
    disabled,
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton);
}

export async function numberdexTrade(
  interaction: ServerSlashCommandInteraction,
  recipient: User,
  traderProfile: UserProfile,
  recipientProfile: UserProfile
) {
  const trader = interaction.user;
  const traderHumanID = interaction.options.getInteger("trader-id", true);
  const recipientHumanID = interaction.options.getInteger("recipient-id", true);

  const traderHuman = await NumberhumanData.findOneBy({
    catchId: traderHumanID,
  });
  const recipientHuman = await NumberhumanData.findOneBy({
    catchId: recipientHumanID,
  });

  if (!traderHuman) {
    await interaction.reply({
      content: `you don't have a numberhuman with the id #${traderHumanID}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!recipientHuman) {
    await interaction.reply({
      content: `the other person doesnt have a numberhuman with the id #${recipientHumanID}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (trader.id === recipient.id) {
    await interaction.reply({
      content: `you can't trade with yourself silly!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // catch ids should be unique but just in case
  if (traderHumanID === recipientHumanID) {
    await interaction.reply({
      content: `you can't trade identical numberhumans dummy!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const content = [
    `User ${userMention(trader.id)} wants to trade with ${userMention(recipient.id)}:`,
    `- ${userMention(trader.id)} will give up a ${formatHuman(traderHuman)}`,
    `- ${userMention(recipient.id)} will give away a ${formatHuman(recipientHuman)}`,
    bold(`Do both of you accept the trade?`),
  ];

  await interaction.reply({
    content: content.join("\n"),
    components: [createButtonRow(false)],
  });

  const handler = async (interact: Interaction) => {
    if (
      interact.isButton()
      && (interact.customId === "trade-accept-button"
        || interact.customId === "trade-reject-button")
    ) {
      clearTimeout(timeout);
      if (interact.customId === "trade-accept-button") {
        if (giftCollection.get(reply) !== interact.user.id) {
          Logger.warning(`User ${interact.user.displayName} tried accepting someone else's gift (greedy...)`);
          await interact.reply({
            content: "You are not the person being gifted, greedy!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        Logger.info(`user ${user.displayName} accepted the gift`);
        userInDB.tokens += Math.floor(amount * 0.95);
        giftingUser.tokens -= amount;
        giftCollection.delete(reply);
        await userInDB.save();
        await giftingUser.save();
        await interaction.editReply({
          components: [createButtonRow(false)],
        });
        await interaction.followUp(
          // dprint-ignore
          `${userMention(
            user.id
          )} has accepted your gift. I wish you two a happy life together.`,
        );
      } else {
        if (giftCollection.get(reply) !== interact.user.id) {
          Logger.warning(`User ${interact.user.displayName} tried accepting someone else's gift (greedy...)`);
          await interact.reply({
            content: "You are not the person being gifted, greedy!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        Logger.info(`user ${user.displayName} declined the gift`);
        giftCollection.delete(reply);
        await interaction.editReply({
          components: [createButtonRow(false)],
        });
        await interaction.followUp(
          `${userMention(user.id)} has dumped your tokens. Sorry about that.`,
        );
      }
      client.off("interactionCreate", handler);
    }
  };

  const timeout = setTimeout(async () => {
    client.off("interactionCreate", handler);
    Logger.info(`neither ${trader.displayName} or ${recipient.displayName} accepted the trade in time.`);
    giftCollection.delete(reply);
    await interaction.editReply({
      components: [createButtonRow(true)],
    });
    await interaction.followUp(
      `Neither parties have accepted the trade within time.`,
    );
  }, 10 * 60 * 1000);

  client.on("interactionCreate", handler);
}
