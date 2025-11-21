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
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

/**
 * This is a person's user profile.
 */
@Entity()
export class UserProfile extends BaseEntity {
  /**
   * The discord user id for the profile.
   */
  @PrimaryColumn("identity")
  id = "0";

  /**
   * The current terminus token count for the user.
   */
  @Column("integer")
  tokens = 0;

  /**
   * Array of achievements the user has, pointed by achievement id.
   */
  @Column()
  achievements: number[] = [];

  /**
   * Array of secret achievements the user has, pointed by their id.
   */
  @Column()
  secret_achievements: number[] = [];

  /**
   * Array of unique numbers the player has guessed, by the number's UUID.
   */
  @Column()
  unique_guessed: string[] = [];
}
