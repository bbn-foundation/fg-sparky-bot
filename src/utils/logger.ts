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
  debug(str: string, ...values: string[]): void {
    if (this.loglevel > 0) return;
    console.debug(
      `[${loggerFormatter.format(Date.now())}] ${chalk.blue("[DEBUG]")}: ${str}`,
      ...values,
    );
  },

  info(str: string, ...values: string[]): void {
    if (this.loglevel > 1) return;
    console.log(
      `[${loggerFormatter.format(Date.now())}] ${chalk.grey("[INFO]")}: ${str}`,
      ...values,
    );
  },

  notice(str: string, ...values: string[]): void {
    if (this.loglevel > 2) return;
    console.log(
      `[${loggerFormatter.format(Date.now())}] ${chalk.whiteBright("[NOTICE]")}: ${str}`,
      ...values,
    );
  },

  warn(str: string, ...values: string[]): void {
    if (this.loglevel > 3) return;
    console.warn(
      `[${loggerFormatter.format(Date.now())}] ${chalk.yellowBright("[WARN]")}: ${str}`,
      ...values,
    );
  },

  error(str: string, ...values: string[]): void {
    if (this.loglevel > 4) return;
    console.error(`[${loggerFormatter.format(Date.now())}] ${chalk.redBright("[ERROR]")}: ${str}`, ...values);
  },

  crit(str: string, ...values: string[]): void {
    console.error(
      `[${loggerFormatter.format(Date.now())}] ${chalk.magentaBright("[CRIT]")}: ${str}`,
      ...values,
    );
  },

  success(str: string, ...values: string[]): void {
    console.log(
      `[${loggerFormatter.format(Date.now())}] ${chalk.greenBright("[SUCCESS]")}: ${str}`,
      ...values,
    );
  },
};
