import { joinStringArray } from "@fg-sparky/utils";
import { ActionRowBuilder, bold, type ButtonBuilder, ButtonStyle, Collection, ComponentType, type MessageCreateOptions, userMention } from "discord.js";
import { type EntryReviewMessage, EntryStatus } from "./types.ts";

const awaitingReviews = new Collection<string, Omit<EntryReviewMessage, "id">>();

export function createReviewMessage(
  options: EntryReviewMessage,
): MessageCreateOptions {
  const approveButton = {
    custom_id: "entry-review-approve",
    label: "Approve",
    style: ButtonStyle.Success,
    type: ComponentType.Button,
    disabled: options.status !== EntryStatus.Waiting,
  } as const;

  const denyButton = {
    custom_id: "entry-review-deny",
    label: "Deny",
    style: ButtonStyle.Danger,
    type: ComponentType.Button,
    disabled: options.status !== EntryStatus.Waiting,
  } as const;

  const actionRow = ActionRowBuilder.from<ButtonBuilder>({
    components: [approveButton, denyButton] as const,
    type: ComponentType.ActionRow,
  });

  awaitingReviews.set(options.id, options);

  return {
    content: joinStringArray([
      `user ${userMention(options.user)} submitted an entry called ${bold(options.name)}`,
      options.difficulty ? `they think it should be ${bold(options.difficulty)}` : "",
    ]),
    components: [actionRow],
  };
}
