/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Why do they call it winston, reminds me of winston churchill
import { config, createLogger, format, type Logger as WinstonLogger, transports } from "winston";

export const Logger: WinstonLogger = createLogger({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "development" ? "debug" : "info"),
  format: format.combine(
    format.colorize({
      colors: config.syslog.colors,
      level: true,
    }),
    format.splat(),
    format.timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    // oxlint-disable-next-line typescript/restrict-template-expressions
    format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`),
  ),
  levels: config.syslog.levels,
  exitOnError: false,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `fg-sparky-bot.log`,
      format: format.uncolorize(),
    }),
  ],
});
