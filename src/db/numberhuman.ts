/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EvolutionType, getEvolutionBuff } from "#numberdex/evolutions.ts";
import type { NumberhumanStore } from "#stores-types";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserProfile } from "./user-profile.ts";

/**
 * This entity represents a numberhuman the player has caught.
 */
@Entity({ name: "numberhuman" })
export class NumberhumanData extends BaseEntity {
  /**
   * Catch ID, incremented on a new catch.
   */
  @PrimaryGeneratedColumn("increment")
  catchId: number | undefined;

  /**
   * The UUID of the numberhuman type.
   */
  @Column("text")
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
   * The numberhuman's evolution, which applies a strong buff.
   */
  @Column("text")
  evolution: EvolutionType = EvolutionType.None;

  /**
   * The user that caught this.
   */
  @ManyToOne(() => UserProfile)
  caughtBy: UserProfile | undefined;

  /**
   * The total HP of the numberhuman (total HP * bonus HP)
   */
  totalHP(store: NumberhumanStore): number {
    const baseData = store.get(this.id).expect("the numberhuman should exist");
    return (
      baseData.baseHP * this.bonusHP * getEvolutionBuff(this.evolution, "hp")
    );
  }

  /**
   * The total attack of the numberhuman (total ATK * bonus ATK)
   */
  totalAtk(store: NumberhumanStore): number {
    const baseData = store.get(this.id).expect("the numberhuman should exist");
    return (
      baseData.baseATK * this.bonusAtk * getEvolutionBuff(this.evolution, "atk")
    );
  }
}
