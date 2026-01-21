import { Option } from "@sapphire/result";
import { bold, userMention } from "discord.js";
import { ResponseInfo } from "./schema.ts";
import { DataStore } from "./store.ts";

interface SpawnResponseArgs {
  type: "spawn";
  correctHuman?: string;
  guessedHuman?: string;
  mentionId?: string;
}

interface FleeResponseArgs {
  type: "flee";
  correctHuman?: string;
  guessedHuman?: string;
  mentionId?: string;
}

interface FailResponseArgs {
  type: "fail";
  correctHuman: string;
  guessedHuman: string;
  mentionId: string;
}

interface CorrectResponseArgs {
  type: "success";
  correctHuman: string;
  guessedHuman: string;
  mentionId: string;
}

type RandomResponseArgs = CorrectResponseArgs | FailResponseArgs | FleeResponseArgs | SpawnResponseArgs;

export class ResponseStore extends DataStore<ResponseInfo> {
  /**
   * Constructs the {@link ResponseStore} class, with a path to a JSON file as the storage backing.
   */
  constructor(file: string) {
    super(file, ResponseInfo);
  }

  /**
   * Returns a random response based on the type, replacing the templated values.
   * @returns The entry.
   */
  getRandom(args: RandomResponseArgs): Option<string> {
    const responsePool = this.data.filter((value) => value.type === args.type);
    const response = responsePool[Math.floor(Math.random() * responsePool.length)];
    // oxlint-disable-next-line no-unsafe-type-assertion
    if (!response) return Option.none as Option<string>;
    return Option.from(
      response.value
        .replaceAll("{mention}", userMention(args.mentionId ?? ""))
        .replaceAll("{correct}", bold(args.correctHuman ?? ""))
        .replaceAll("{guess}", bold(args.guessedHuman ?? "")),
    );
  }
}
