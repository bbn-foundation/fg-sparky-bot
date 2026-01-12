import { Option } from "@fg-sparky/utils";
import { bold, userMention } from "discord.js";
import { DataStore } from "../store.ts";
import { ResponseInfo } from "./schema.ts";

interface SpawnReponseArgs {
  type: "spawn";
  correctHuman?: string;
  guessedHuman?: string;
  mentionId?: string;
}

interface FleeReponseArgs {
  type: "flee";
  correctHuman?: string;
  guessedHuman?: string;
  mentionId?: string;
}

interface FailReponseArgs {
  type: "fail";
  correctHuman: string;
  guessedHuman: string;
  mentionId: string;
}

interface CorrectReponseArgs {
  type: "success";
  correctHuman: string;
  guessedHuman: string;
  mentionId: string;
}

type RandomReponseArgs = CorrectReponseArgs | FailReponseArgs | FleeReponseArgs | SpawnReponseArgs;

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
  getRandom(args: RandomReponseArgs): Option<string> {
    const responsePool = this.data.filter(value => value.type === args.type);
    const response = responsePool[Math.floor(Math.random() * responsePool.length)];
    // oxlint-disable-next-line no-unsafe-type-assertion
    if (!response) return Option.none as Option<string>;
    return Option.from(response.value
      .replaceAll("{mention}", userMention(args.mentionId ?? ""))
      .replaceAll("{correct}", bold(args.correctHuman ?? ""))
      .replaceAll("{guess}", bold(args.guessedHuman ?? "")));
  }
}
