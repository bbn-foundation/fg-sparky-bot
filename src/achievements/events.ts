//
import type { NumberhumanData, UserProfile } from "#db";
import type { AchievementContext, AchievementTrigger } from "./types.ts";

export class AchievementEvent extends Event {
  /**
   * The person's user profile.
   */
  readonly profile: UserProfile;
  /**
   * The numberhuman that has been caught.
   */
  readonly numberhuman?: NumberhumanData | undefined;
  /**
   * Their guess.
   */
  readonly userGuess: string;
  /**
   * The correct answer.
   */
  readonly correctGuess: string;
  constructor(ctx: AchievementContext) {
    super(ctx.trigger);
    this.profile = ctx.profile;
    this.numberhuman = ctx.numberhuman;
    this.userGuess = ctx.userGuess;
    this.correctGuess = ctx.correctGuess;
  }
}

interface StateEventMap {
  [AchievementTrigger.SparkyGuess]: AchievementEvent;
  [AchievementTrigger.NumberdexGuess]: AchievementEvent;
}

interface StateEventTarget extends EventTarget {
  addEventListener<K extends keyof StateEventMap>(
    type: K,
    listener: (ev: StateEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    callback: EventListener | EventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void;
}

const TypedEventTarget = EventTarget as {
  new(): StateEventTarget;
  prototype: StateEventTarget;
};

export class AchievementSubject extends TypedEventTarget {
}
