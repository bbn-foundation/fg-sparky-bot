import { type Attachment, ComponentType, type ModalComponentData, TextInputStyle } from "discord.js";

export const entrySubmissionModal: ModalComponentData = {
  title: "entry submission form",
  customId: `entry-submission-modal`,
  components: [{
    id: 0,
    label: "what's the number name?",
    type: ComponentType.Label,
    // @ts-expect-error: text input components cannot have a label or the discord api
    // will throw an error
    component: {
      customId: `entry-submission-number-input`,
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
    },
  }, {
    id: 1,
    label: "what's the number difficulty?",
    type: ComponentType.Label,
    component: {
      required: true,
      customId: `entry-submission-number-difficulty`,
      type: ComponentType.StringSelect,
      options: [{
        label: "Easy",
        value: "easy",
      }, {
        label: "Medium",
        value: "medium",
      }, {
        label: "Hard",
        value: "hard",
      }, {
        label: "Legendary",
        value: "legendary",
      }],
    },
  }, {
    id: 2,
    content: "an image of the symbol.",
    type: ComponentType.Label,
    component: {
      customId: "entry-submission-symbol",
      required: true,
      type: ComponentType.FileUpload,
    },
  }],
};

export const denialFeedbackModal: ModalComponentData = {
  title: "denial feedback",
  customId: `denial-feedback-modal`,
  components: [{
    id: 0,
    label: "why was it denied?",
    type: ComponentType.Label,
    // @ts-expect-error: text input components cannot have a label or the discord api
    // will throw an error
    component: {
      customId: `denial-feedback-input`,
      style: TextInputStyle.Short,
      type: ComponentType.TextInput,
    },
  }],
};

export enum EntryStatus {
  Waiting = "waiting",
  Approved = "approved",
  Denied = "denied",
}

export interface EntryReviewMessage {
  status: EntryStatus;
  id: string;
  user: string;
  name: string;
  symbol: Attachment;
  difficulty?: string | undefined;
}
