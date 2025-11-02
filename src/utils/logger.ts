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
