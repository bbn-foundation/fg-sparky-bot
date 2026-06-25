import type { Command } from "#utils/types.ts";
import Gift from "./commands/gift.ts";
import Guess from "./commands/guess.ts";
import Hello from "./commands/hello.ts";
import Numberdex from "./commands/numberdex.ts";
import Stop from "./commands/stop.ts";
import Reload from "./commands/reload.ts";
import Restart from "./commands/restart.ts";
import User from "./commands/user.ts";
import Ping from "./commands/ping.ts";
import About from "./commands/about.ts";

const Commands: readonly Command[] = [
  Gift,
  Guess,
  Numberdex,
  User,
  Stop,
  Restart,
  Reload,
  Hello,
  Ping,
  About
];

export default Commands;
