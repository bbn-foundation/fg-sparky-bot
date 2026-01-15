/**
 * @enum
 */
export const EvolutionType = {
  None: "none",
  Superscaled: "superscaled",
  Mastered: "mastered",
  Endfimidian: "endfimidian",
  Celestial: "celestial",
  Eternal: "eternal",
  Corrotechnic: "corrotechnic",
  Subeuclidean: "subeuclidean",
  Zyrolexic: "zyrolexic",
  Transcendent: "transcendent",
  Corrupt: "corrupt",
  Absolute: "absolute",
} as const;
export type EvolutionType = (typeof EvolutionType)[keyof typeof EvolutionType];

export const EvolutionMap: Record<EvolutionType, [number, number]> = {
  [EvolutionType.None]: [1, 1],
  [EvolutionType.Superscaled]: [1.5, 1.5],
  [EvolutionType.Mastered]: [2, 2],
  [EvolutionType.Endfimidian]: [2.5, 1.5],
  [EvolutionType.Celestial]: [2, 3],
  [EvolutionType.Eternal]: [5, 1.6],
  [EvolutionType.Corrotechnic]: [1.5, 4],
  [EvolutionType.Subeuclidean]: [3.5, 3],
  [EvolutionType.Zyrolexic]: [4, 4],
  [EvolutionType.Transcendent]: [5, 4],
  [EvolutionType.Corrupt]: [2, 6],
  [EvolutionType.Absolute]: [7, 7],
};

export function getEvolutionBuff(
  evolution: EvolutionType,
  type: "hp" | "atk",
): number {
  return EvolutionMap[evolution][type === "hp" ? 0 : 1];
}
