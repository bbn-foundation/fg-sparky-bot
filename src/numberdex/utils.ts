/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { NumberhumanInfo, NumberhumanStore } from "#stores-types";
import { Result } from "@sapphire/result";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type Message,
  type SendableChannels,
} from "discord.js";
import { Responses } from "../stores.ts";

export function createButtonRow(
  disabled?: boolean,
): ActionRowBuilder<ButtonBuilder> {
  const button = ButtonBuilder.from({
    // @ts-expect-error THERE SHALL BE NO URL
    customId: "numberhuman-catch-button",
    label: "Catch",
    style: ButtonStyle.Primary,
    type: ComponentType.Button,
    disabled,
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

export async function spawnNumberhuman(
  store: NumberhumanStore,
  channel: SendableChannels,
): Promise<Result<[NumberhumanInfo, Message], Error | ReferenceError>> {
  const numberhuman = store.getRandom();
  const randomSpawnMessage = Responses.getRandom({
    type: "spawn",
  }).unwrapOr("hello");
  try {
    for (const okHuman of numberhuman) {
      const image = new AttachmentBuilder(okHuman.image)
        .setName(okHuman.image.slice(okHuman.image.lastIndexOf("/") + 1))
        .setDescription("The numberhuman you have to guess")
        .setSpoiler(
          okHuman.uuid === "c6e6c334-16cd-479c-bd75-d82d23af50cb"
            || okHuman.uuid === "c9c69c3c-3637-49a1-b667-29efd687a518",
        );
      return Result.ok([
        okHuman,
        // oxlint-disable-next-line no-await-in-loop: still not a loop
        await channel.send({
          content: randomSpawnMessage,
          files: [image],
          components: [createButtonRow()],
        }),
      ]);
    }
    return Result.err(new ReferenceError("no numberhuman was found"));
  } catch (err) {
    if (!Error.isError(err)) throw err;
    return Result.err(err);
  }
}
