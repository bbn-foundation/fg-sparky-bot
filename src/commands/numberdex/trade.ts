import { NumberhumanData, UserProfile } from "#db";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, ComponentType, InteractionResponse, italic, MessageFlags, userMention, type Interaction, type User } from "discord.js";
import { Numberhumans } from "#stores";
import { Logger } from "#utils/logger.ts";
import { formatHuman } from "#utils/formatter.ts";

const tradeCollection = new WeakMap<InteractionResponse, {
  users: [string, string];
  accepted: [boolean, boolean];
}>();

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

async function commenceTrade(interaction: ServerSlashCommandInteraction, traderProfile: UserProfile, recipientProfile: UserProfile, traderHuman: NumberhumanData, recipientHuman: NumberhumanData) {
  traderHuman.caughtBy = recipientProfile;
  recipientHuman.caughtBy = traderProfile;
  await traderHuman.save();
  await recipientHuman.save();
  traderProfile.numberhumansGuessed = traderProfile.numberhumansGuessed.filter(uuid => uuid !== traderHuman.id).concat(recipientHuman.id);
  traderProfile.numberhumansGuessedUnique = traderProfile.numberhumansGuessedUnique.filter(uuid => uuid !== traderHuman.id).concat(recipientHuman.id);
  recipientProfile.numberhumansGuessed = recipientProfile.numberhumansGuessed.filter(uuid => uuid !== recipientHuman.id).concat(traderHuman.id);
  recipientProfile.numberhumansGuessedUnique = recipientProfile.numberhumansGuessedUnique.filter(uuid => uuid !== recipientHuman.id).concat(traderHuman.id);
  await traderProfile.save();
  await recipientProfile.save();
  await interaction.followUp({
    content: [
      `Both sides have accepted the trade. Numberhumans #${traderHuman.catchId} and #${recipientHuman.catchId} have swapped owners.`,
      `-# This is a beta feature, please report any bugs you find.`,
    ].join("\n"),
  });
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
    `- ${userMention(trader.id)} will give up a ${formatHuman(traderHuman, Numberhumans)}`,
    `- ${userMention(recipient.id)} will give away a ${formatHuman(recipientHuman, Numberhumans)}`,
    bold(`Do both of you accept the trade?`),
  ];

  const reply = await interaction.reply({
    content: content.join("\n"),
    components: [createButtonRow(false)],
  });
  tradeCollection.set(reply, {
    users: [trader.id, recipient.id],
    accepted: [false, false],
  });

  const handler = async (interact: Interaction) => {
    if (
      interact.isButton()
      && (interact.customId === "trade-accept-button"
        || interact.customId === "trade-reject-button")
    ) {
      clearTimeout(timeout);
      if (interact.customId === "trade-accept-button") {
        if (tradeCollection.has(reply)) {
          // we already checked if the trade request exists
          if (!tradeCollection.get(reply)!.users.includes(interact.user.id)) {
            // neither the recipient nor trader acted on the button
            Logger.warning(`User ${interact.user.displayName} tried accepting someone else's trades`);
            await interact.reply({
              content: "You are not the person being traded with, greedy!",
              flags: MessageFlags.Ephemeral,
            });
            return;
          } else if (tradeCollection.get(reply)!.users[0] === interact.user.id) {
            // trader accepted the deal
            if (tradeCollection.get(reply)!.accepted[0]) {
              // player already accepted
              await interact.reply({
                content: `You already accepted the trade deal, to change trades you need to reject it.`,
                flags: MessageFlags.Ephemeral,
              });
              return;
            } else {
              // player hasnt accepted
              tradeCollection.get(reply)!.accepted[0] = true;
              await interaction.editReply({
                content: content.concat(`-# Proposer ${trader.displayName} has accepted the trade.`).join("\n"),
              });
              if (tradeCollection.get(reply)!.accepted.reduce((a, b) => a && b)) {
                commenceTrade(interaction, traderProfile, recipientProfile, traderHuman, recipientHuman);
              }
            }
          } else if (tradeCollection.get(reply)!.users[1] === interact.user.id) {
            // recipient accepted the deal
            if (tradeCollection.get(reply)!.accepted[1]) {
              // player already accepted
              await interact.reply({
                content: `You already accepted the trade deal, to change trades you need to reject it.`,
                flags: MessageFlags.Ephemeral,
              });
              return;
            } else {
              // player hasnt accepted
              tradeCollection.get(reply)!.accepted[1] = true;
              await interaction.editReply({
                content: content.concat(`-# Recipient ${recipient.displayName} has accepted the trade.`).join("\n"),
              });
              if (tradeCollection.get(reply)!.accepted.reduce((a, b) => a && b)) {
                commenceTrade(interaction, traderProfile, recipientProfile, traderHuman, recipientHuman);
              }
            }
          }
        }
      } else {
        if (!tradeCollection.get(reply)!.users.includes(interact.user.id)) {
          Logger.warning(`User ${interact.user.displayName} tried rejecting someone else's traders`);
          await interact.reply({
            content: "You cannot reject a trade that you aren't a part of! Maybe try convincing them it's a bad trade?",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await interaction.editReply({
          components: [createButtonRow(true)],
        });
        await interact.reply(`${interact.user.id === trader.id ? "Trader" : "Recipient"} ${userMention(interact.user.id)} has rejected the trade offer. Sorry.`);
      }
      client.off("interactionCreate", handler);
    }
  };

  const timeout = setTimeout(async () => {
    client.off("interactionCreate", handler);
    Logger.info(`neither ${trader.displayName} or ${recipient.displayName} accepted the trade in time.`);
    tradeCollection.delete(reply);
    await interaction.editReply({
      components: [createButtonRow(true)],
    });
    await interaction.followUp(
      `Neither parties have accepted the trade within time.`,
    );
  }, 10 * 60 * 1000);

  client.on("interactionCreate", handler);
}
