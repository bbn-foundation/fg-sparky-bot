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
import { DataSource } from "typeorm";
import { UserProfile } from "./entities/user-profile.ts";

export const AppDataSource: DataSource = new DataSource({
  type: "sqlite",
  database: "sparky-bot-db.sqlite",
  synchronize: true,
  logging: false,
  entities: [UserProfile],
  migrations: [],
  subscribers: [],
});
