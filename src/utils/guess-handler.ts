import { Logger } from "./logger.ts";

export interface GuessObject {
  number: string | null;
  hashedNumber: string;
}

export type HandlerFunction<T extends object> = (message: string, number: T) => boolean;

export function createGuessHandler<T extends GuessObject>(
  hashAlgo: Bun.SupportedCryptoAlgorithms,
): HandlerFunction<T> {
  const hasher = new Bun.CryptoHasher(hashAlgo);
  return function(message: string, number: GuessObject): boolean {
    // Normalize the player's guess to a standard form to avoid weird os issues
    // like macos replacing "..." with "…" (elipis) or replacing ' with ’
    const guess = message
      .toLowerCase()
      .replaceAll(/’|‘/gu, "'")
      .replaceAll(/“|”/gu, "'")
      .replaceAll("…", "...");
    const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
    Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
    Logger.debug(`Numberhuman: ${number.number ?? "<unknown>"} (hashed: ${number.hashedNumber})`);
    if (hashedGuess === number.hashedNumber) {
      Logger.info("user guessed correctly");
      return true;
    }
    Logger.info("user guessed incorrectly");
    return false;
  };
}
