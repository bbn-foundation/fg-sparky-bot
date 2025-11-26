/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
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
  @PrimaryColumn("text")
  id = "";

  /**
   * The current terminus token count for the user.
   */
  @Column("integer")
  tokens = 0;
}
