import { Logger } from "@fg-sparky/utils";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

export interface GuessObject {
  number: string;
  hashedNumber: string;
}

export type HandlerFunction<T extends object> = (message: OmitPartialGroupDMChannel<Message>, number: T) => boolean | undefined;

export function createGuessHandler<T extends GuessObject>(hashAlgo: Bun.SupportedCryptoAlgorithms): HandlerFunction<T> {
  const hasher = new Bun.CryptoHasher(hashAlgo);
  return function (message: OmitPartialGroupDMChannel<Message>, number: GuessObject): boolean | undefined {
    if (message.author.bot) return;
    // Normalize the player's guess to a standard form to avoid weird os issues
    // like macos replacing "..." with "…" (elipis) or replacing ' with ’
    const guess = message.content.toLowerCase()
      .replaceAll(/’|‘/gu, "'")
      .replaceAll(/“|”/gu, "'")
      .replaceAll("…", "...");
    const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
    Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
    Logger.debug(`Numberhuman: ${number.number} (hashed: ${number.hashedNumber})`);
    if (hashedGuess === number.hashedNumber) {
      Logger.info("user guessed correctly");
      return true;
    }
    Logger.info("user guessed incorrectly");
    return false;
  };
}
