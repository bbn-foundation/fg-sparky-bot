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
import { AppDataSource } from "../db.ts";
import { SparkySession } from "../entities/user-profile.ts";
import { formatter } from "./formatter.ts";
import { Logger } from "./logger.ts";

export async function saveSession(channelId: bigint): Promise<void> {
  Logger.info("Generating new sparky session...");
  const expiration = new Date().setMinutes(new Date().getMinutes() + 1);
  const session = new SparkySession();
  session.expiration_time = BigInt(expiration);
  session.channel_id = channelId;
  Logger.debug(`Saving new session for channel ${channelId.toString()} (id: ${session.id.toString()}, expires at ${formatter.format(expiration)})`);
  await AppDataSource.manager.save(session);
}

export async function getSession(channelId: bigint): Promise<SparkySession | null> {
  return await AppDataSource.manager.findOneBy(SparkySession, { channel_id: channelId });
}
