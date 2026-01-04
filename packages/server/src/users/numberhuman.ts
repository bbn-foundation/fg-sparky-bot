/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import type { NumberhumanStore } from "../numberdex/class.ts";

/**
 * This entity represents a numberhuman the player has caught.
 */
@Entity({ name: "numberhuman" })
export class NumberhumanData extends BaseEntity {
  /**
   * The UUID for the numberhuman.
   */
  @PrimaryColumn("text")
  id = "";

  /**
   * The specific ability it has, pointed by its id.
   */
  @Column("text")
  ability = "";

  /**
   * The HP multiplier after being caught.
   */
  @Column("float")
  bonusHP = 1;

  /**
   * The attack multiplier after being caught.
   */
  @Column("float")
  bonusAtk = 1;

  /**
   * The current number's level.
   */
  @Column("integer")
  level = 0;

  /**
   * The evolution of the numberhuman, please ask Stella what it does,
   * cause I have no idea.
   */
  @Column("integer")
  evolution = 0;

  /**
   * Catch ID, incremented on a new catch.
   */
  @Column("integer")
  catchId = 0;

  /**
   * The total HP of the numberhuman (total HP * bonus HP)
   */
  totalHP(store: NumberhumanStore): number {
    const baseData = store.getByID(this.id).expect("the numberhuman should exist");
    return baseData.baseHP * this.bonusHP;
  }

  /**
   * The total attack of the numberhuman (total ATK * bonus ATK)
   */
  totalAtk(store: NumberhumanStore): number {
    const baseData = store.getByID(this.id).expect("the numberhuman should exist");
    return baseData.baseATK * this.bonusAtk;
  }
}
