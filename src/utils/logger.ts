/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import chalk from "chalk";

export namespace Logger {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "medium" });
  export function debug(str: string): void {
    console.debug(`[${formatter.format(Date.now())}] ${chalk.blue("[DEBUG]")}: %s`, str);
  }

  export function info(str: string): void {
    console.log(`[${formatter.format(Date.now())}] ${chalk.grey("[INFO]")}: %s`, str);
  }

  export function notice(str: string): void {
    console.log(`[${formatter.format(Date.now())}] ${chalk.whiteBright("[NOTICE]")}: %s`, str);
  }

  export function warn(str: string): void {
    console.warn(`[${formatter.format(Date.now())}] ${chalk.yellowBright("[WARN]")}: %s`, str);
  }

  export function error(str: string): void {
    console.error(`[${formatter.format(Date.now())}] ${chalk.redBright("[ERROR]")}: %s`, str);
  }

  export function crit(str: string): void {
    console.error(`[${formatter.format(Date.now())}] ${chalk.magentaBright("[CRIT]")}: %s`, str);
  }

  export function success(str: string): void {
    console.log(`[${formatter.format(Date.now())}] ${chalk.greenBright("[SUCCESS]")}: %s`, str);
  }
};
