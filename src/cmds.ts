import type { Command } from "#utils/types";
import Gift from "./commands/gift.ts";
import Guess from "./commands/guess.ts";
import Hello from "./commands/hello.ts";
import Numberdex from "./commands/numberdex.ts";
import Poweroff from "./commands/poweroff.ts";
import Reload from "./commands/reload.ts";
import Restart from "./commands/restart.ts";
import User from "./commands/user.ts";

const Commands: readonly Command[] = [
  Gift,
  Guess,
  Numberdex,
  User,
  Poweroff,
  Restart,
  Reload,
  Hello,
]

export default Commands;
