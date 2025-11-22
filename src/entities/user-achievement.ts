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
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * This is a person's user profile.
 */
@Entity()
export class UserAchievement extends BaseEntity {
  /**
   * Primary id. Not used.
   */
  @PrimaryGeneratedColumn()
  id = 0;

  /**
   * The id of the user.
   */
  @Column()
  userId = "";

  /**
   * The id of the achievement.
   */
  @Column()
  achievementId = "";
}
