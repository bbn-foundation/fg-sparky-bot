import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { Logger } from "../utils/logger";
import type { NumberhumanInfo } from "./utils";

const hasher = new Bun.CryptoHasher("blake2b512");

export function handlePlayerGuess(message: OmitPartialGroupDMChannel<Message>, number: NumberhumanInfo): boolean | undefined {
  if (message.author.bot) return;
  // Normalize the player's guess to a standard form to avoid weird os issues
  // like macos replacing "..." with "…" (elipis) or replacing ' with ’
  const guess = message.content.toLowerCase()
    .replaceAll(/’|‘/gu, "'") // Variants of single quotation marks
    .replaceAll(/“|”/gu, "'") // Variants of double quotation marks
    .replaceAll("…", "..."); // Ellipsis
  const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
  Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
  Logger.debug(`Numberhuman: ${number.number} (hashed: ${number.hashedNumber})`);
  if (hashedGuess === number.hashedNumber) {
    Logger.info("user guessed correctly");
    return true;
  }
  Logger.info("user guessed incorrectly");
  return false;
}
