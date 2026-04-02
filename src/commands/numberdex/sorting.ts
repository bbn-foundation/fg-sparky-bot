/**
 * Enumeration of sorting methods used to display numberhumans.
 * @default ByCatchID
 */
export enum NumberhumanSortingOrder {
  /** Sorts by the numberhuman's HP. */
  ByHealth = "by-hp",
  /** Sorts by the numberhuman's attack power. */
  ByAttack = "by-attack",
  /** Sorts by the catch id. */
  ByCatchId = "by-catch-id",
  /** Sorts by the numberhuman's evolution. */
  ByEvolution = "by-evolution",
  /** Sorts by their level */
  ByLevel = "by-level",
}
