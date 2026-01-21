/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import chalk from "chalk";
import { loggerFormatter } from "./formatter.ts";

export const Logger = {
  loglevel: 0,
  debug(str: string): void {
    if (this.loglevel > 0) return;
    console.debug(`[${loggerFormatter.format(Date.now())}] ${chalk.blue("[DEBUG]")}: %s`, str);
  },

  info(str: string): void {
    if (this.loglevel > 1) return;
    console.log(`[${loggerFormatter.format(Date.now())}] ${chalk.grey("[INFO]")}: %s`, str);
  },

  notice(str: string): void {
    if (this.loglevel > 2) return;
    console.log(
      `[${loggerFormatter.format(Date.now())}] ${chalk.whiteBright("[NOTICE]")}: %s`,
      str,
    );
  },

  warn(str: string): void {
    if (this.loglevel > 3) return;
    console.warn(
      `[${loggerFormatter.format(Date.now())}] ${chalk.yellowBright("[WARN]")}: %s`,
      str,
    );
  },

  error(str: string): void {
    if (this.loglevel > 4) return;
    console.error(`[${loggerFormatter.format(Date.now())}] ${chalk.redBright("[ERROR]")}: %s`, str);
  },

  crit(str: string): void {
    console.error(
      `[${loggerFormatter.format(Date.now())}] ${chalk.magentaBright("[CRIT]")}: %s`,
      str,
    );
  },

  success(str: string): void {
    console.log(
      `[${loggerFormatter.format(Date.now())}] ${chalk.greenBright("[SUCCESS]")}: %s`,
      str,
    );
  },
};
