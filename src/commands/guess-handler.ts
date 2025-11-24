import type { ChatInputCommandInteraction, Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import type { NumberInfo } from "../numbers/get-random-number";
import { Logger } from "../utils/logger";
import { createUser, getUser } from "../utils/user";
import { guessCooldowns } from "./cooldowns";

const hasher = new Bun.CryptoHasher("sha512");

function handlePlayerGuess(message: OmitPartialGroupDMChannel<Message>, number: NumberInfo): boolean | undefined {
  if (message.author.bot) return;
  // Normalize the player's guess to a standard form to avoid weird os issues
  // like macos replacing "..." with "…" (elipis) or replacing ' with ’
  const guess = message.content.toLowerCase()
    .replaceAll(/’|‘/gu, "'") // Variants of single quotation marks
    .replaceAll(/“|”/gu, "'") // Variants of double quotation marks
    .replaceAll("…", "..."); // Ellipsis
  const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
  Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
  Logger.debug(`Number: ${number.number ?? "<hidden>"} (hashed: ${number.hashedNumber})`);
  if (hashedGuess === number.hashedNumber) {
    Logger.info("user guessed correctly");
    return true;
  }
  Logger.info("user guessed incorrectly");
  return false;
}

function getGainFromDifficulty(difficulty: "easy" | "medium" | "hard" | "legendary"): 10 | 25 | 50 | 500 {
  switch (difficulty) {
    case "easy": {
      return 10;
    }
    case "medium": {
      return 25;
    }
    case "hard": {
      return 50;
    }
    case "legendary": {
      return 500;
    }
  }
}

export async function handleResponse(client: Client, interaction: ChatInputCommandInteraction, number: NumberInfo): void {
  const user = await getUser(interaction.user.id);
  const gain = getGainFromDifficulty(number.difficulty);

  const handler = async (message: OmitPartialGroupDMChannel<Message>) => {
    if (message.channelId !== interaction.channelId) return;
    if (handlePlayerGuess(message, number)) {
      Logger.debug("user guessed correctly, replying and clearing timeout");
      clearTimeout(timeout);
      client.off("messageCreate", handler);
      guessCooldowns.set(interaction.channelId, false);
      if (user) {
        user.tokens += gain;
        await interaction.reply(`hey you guessed correctly, nice job! you also earned ${gain.toString()} tokens!`);
        await user.save();
      } else {
        const newUser = await createUser(interaction.user.id);
        newUser.tokens += gain;
        await interaction.reply(`hey you guessed correctly, nice job! i've also created a profile for you with ${gain.toString()} tokens.`);
        await newUser.save();
      }
    }
  };

  const timeout = setTimeout(async () => {
    Logger.info("user failed to guess in time");
    client.off("messageCreate", handler);
    guessCooldowns.set(interaction.channelId, false);

    const content = `no one guessed in time${number.number ? `, the correct answer was ${number.number}.` : "."}`;
    await interaction.followUp({ content, allowedMentions: { repliedUser: false } });
  }, number.difficulty === "legendary" ? 60000 : 40000);

  client.on("messageCreate", handler);
}
