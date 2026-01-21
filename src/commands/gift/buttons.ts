import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

export function createButtonRow(disabled?: boolean): ActionRowBuilder<ButtonBuilder> {
  const acceptButton = ButtonBuilder.from({
    // @ts-expect-error THERE SHALL BE NO URL
    customId: "gift-accept-button",
    label: "Accept",
    style: ButtonStyle.Success,
    type: ComponentType.Button,
    disabled,
  });

  const declineButton = ButtonBuilder.from({
    // @ts-expect-error THERE SHALL BE NO URL
    customId: "gift-reject-button",
    label: "Reject",
    style: ButtonStyle.Danger,
    type: ComponentType.Button,
    disabled,
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton);
}
