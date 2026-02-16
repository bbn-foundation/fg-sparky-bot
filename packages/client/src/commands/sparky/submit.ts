import { type Difficulties, REVIEW_CHANNEL_ID, type ServerSlashCommandInteraction, joinStringArray } from "@fg-sparky/utils";
import { type Client, type Interaction, MessageFlags, bold, userMention } from "discord.js";
import { Numbers } from "../../stores.ts";
import { createReviewMessage } from "./helpers.ts";
import { EntryStatus, denialFeedbackModal, entrySubmissionModal } from "./types.ts";

export default async function sparkySubmitEntry(
  client: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.showModal(entrySubmissionModal);
  const submissionHandler = async (interaction: Interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === "entry-submission-modal") {
      client.off("interactionCreate", submissionHandler);
      const name = interaction.fields.getTextInputValue("entry-submission-number-input");
      const difficulty = interaction.fields
        .getStringSelectValues("entry-submission-number-difficulty") as readonly Difficulties[];
      const symbol = interaction.fields.getUploadedFiles("entry-submission-symbol", true).at(0)!;
      const reviewChannel = await interaction.client.channels.fetch(REVIEW_CHANNEL_ID);

      if (!reviewChannel?.isSendable()) {
        await interaction.reply({
          content: joinStringArray([
            `your entry ${bold(name)} couldn't be submitted cause she forgot to setup a channel for this.`,
            `try again in a moment, maybe ping her to remind her.`,
          ]),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await reviewChannel.send(createReviewMessage({
        status: EntryStatus.Waiting,
        user: interaction.user.id,
        name,
        difficulty: difficulty[0],
        id: crypto.randomUUID(),
        symbol,
      }));

      await interaction.reply({
        content: joinStringArray([
          `your entry ${bold(name)} has been sent to the reviewers and is currently waiting approval.`,
          "please wait for them to review it.",
        ]),
        flags: MessageFlags.Ephemeral,
      });
    }
  };

  client.on("interactionCreate", submissionHandler);

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isButton()
      && (interaction.customId === "entry-review-approve"
        || interaction.customId === "entry-review-deny")) {
      const status = (interaction.customId === "entry-review-approve"
        ? EntryStatus.Approved
        : EntryStatus.Denied);

      if (status === EntryStatus.Denied) await interaction.showModal(denialFeedbackModal);
      await interaction.update({
        content: interaction.message.content + `${bold("REVIEWED:")} the entry was reviewed by ${userMention(interaction.user.id)} and was ${bold(status)}.`,
      });
      if (status === EntryStatus.Approved) {
        Numbers.addToSparky(interaction.message.attachments);
      }
    } else if (interaction.isModalSubmit() && interaction.isMessageComponent()) {
      const e = false;
    }
  });
}
