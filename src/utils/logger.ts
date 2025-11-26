/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import chalk from "chalk";

export namespace Logger {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "medium" });
  // re-assigned in main.ts
  // eslint-disable-next-line prefer-const
  export let loglevel = 0;

  export function debug(str: string): void {
    if (loglevel > 0) return;
    console.debug(`[${formatter.format(Date.now())}] ${chalk.blue("[DEBUG]")}: %s`, str);
  }

  export function info(str: string): void {
    if (loglevel > 1) return;
    console.log(`[${formatter.format(Date.now())}] ${chalk.grey("[INFO]")}: %s`, str);
  }

  export function notice(str: string): void {
    if (loglevel > 2) return;
    console.log(`[${formatter.format(Date.now())}] ${chalk.whiteBright("[NOTICE]")}: %s`, str);
  }

  export function warn(str: string): void {
    if (loglevel > 3) return;
    console.warn(`[${formatter.format(Date.now())}] ${chalk.yellowBright("[WARN]")}: %s`, str);
  }

  export function error(str: string): void {
    if (loglevel > 4) return;
    console.error(`[${formatter.format(Date.now())}] ${chalk.redBright("[ERROR]")}: %s`, str);
  }

  export function crit(str: string): void {
    console.error(`[${formatter.format(Date.now())}] ${chalk.magentaBright("[CRIT]")}: %s`, str);
  }

  export function success(str: string): void {
    console.log(`[${formatter.format(Date.now())}] ${chalk.greenBright("[SUCCESS]")}: %s`, str);
  }
};
