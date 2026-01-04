/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { NumberhumanData } from "./numberhuman.ts";

/**
 * This is a person's user profile.
 */
@Entity({ name: "user_profiles" })
export class UserProfile extends BaseEntity {
  /**
   * The discord user id for the profile.
   */
  @PrimaryColumn("text")
  id = "";

  /**
   * User guild they belong in.
   */
  @PrimaryColumn("text")
  guildId = "";

  /**
   * The current terminus token count for the user.
   */
  @Column("integer")
  tokens = 0;

  /**
   * Array of entries the player has guessed. Not unique.
   */
  @Column("json", { name: "guessed_entries" })
  guessedEntries: string[] = [];

  /**
   * Array of unique entries the player has guessed.
   */
  @Column("json", { name: "unique_guessed" })
  uniqueGuessed: string[] = [];

  /**
   * Array of numberhumans the player has captured
   */
  @Column("json", { name: "numberhumans_guessed" })
  numberhumansGuessed: string[] = [];

  /**
   * Array of unique numberhumans the player has captured
   */
  @Column("json", { name: "numberhumans_unique_guessed" })
  numberhumansGuessedUnique: string[] = [];

  /**
   * The highest streak the user has achieved.
   */
  @Column("integer", { name: "best_streak" })
  bestStreak = 0;

  /**
   * Array of numberhumans the player has caught.
   */
  @ManyToMany(() => NumberhumanData)
  @JoinTable()
  numberhumans: NumberhumanData[];
}
