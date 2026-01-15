/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { getUser } from "@fg-sparky/server";
import { type Command, Logger } from "@fg-sparky/utils";
import {
  ApplicationCommandOptionType,
  type Client,
  type CommandInteraction,
  type Interaction,
  MessageFlags,
  userMention,
} from "discord.js";
import { createButtonRow } from "./gift/buttons.ts";

const Gift: Command = {
  async run(
    _client: Client,
    interaction: CommandInteraction<"raw" | "cached">,
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    const amount = interaction.options.getNumber("amount", true);
    const user = interaction.options.getUser("user", true);
    const userInDB = await getUser(user.id, interaction.guildId);
    const giftingUser = await getUser(interaction.user.id, interaction.guildId);

    if (!giftingUser) {
      Logger.warn(
        `user ${interaction.user.displayName} tried gifting but they dont have a profile`,
      );
      await interaction.reply({
        content: `You don't even have a profile, go play FG sparky first!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (giftingUser.tokens < amount) {
      Logger.warn(
        `user ${interaction.user.displayName} tried gifting but they dont have enough tokens`,
      );
      await interaction.reply({
        content: `You don't have enough tokens to gift. You currently have ${giftingUser.tokens}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!userInDB) {
      Logger.warn(
        `user ${interaction.user.displayName} tried gifting to a person that doesnt have a profile`,
      );
      await interaction.reply({
        content: `User ${
          userMention(
            user.id,
          )
        } doesn't have a profile with FG sparky.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const content = [
      `User ${userMention(interaction.user.id)} wants to gift ${
        userMention(
          user.id,
        )
      } ${amount} <:terminusfinity:1444859277515690075>.`,
      "A tax of 5% will be applied. Do you accept?",
    ].join("\n");

    Logger.info(
      `user ${interaction.user.displayName} wants to gift ${amount} tokens to ${user.displayName}`,
    );
    await interaction.reply({
      content,
      components: [createButtonRow()],
    });

    const handler = async (interact: Interaction) => {
      if (
        interact.isButton()
        && (interact.customId === "gift-accept-button"
          || interact.customId === "gift-reject-button")
      ) {
        clearTimeout(timeout);
        if (interact.customId === "gift-accept-button") {
          Logger.info(`user ${user.displayName} accepted the gift`);
          userInDB.tokens += Math.floor(amount * 0.95);
          giftingUser.tokens -= amount;
          await userInDB.save();
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
          Logger.info(`user ${user.displayName} declined the gift`);
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
      Logger.info(`user ${user.displayName} took too long to accept`);
      await interaction.editReply({
        components: [createButtonRow(false)],
      });
      await interaction.followUp(
        `Sorry ${userMention(interaction.user.id)}, they ghosted you.`,
      );
    }, 5 * 60 * 1000);

    client.on("interactionCreate", handler);
  },
  description: "Gift a person some of your tokens",
  name: "gift",
  options: [
    {
      name: "amount",
      description: "How much to send the person",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "user",
      description: "The person to send the gift to",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
};

export default Gift;
