export enum EvolutionType {
  None = "none",
  Improper = "improper",
  Superscaled = "superscaled",
  Mastered = "mastered",
  Endfimidian = "endfimidian",
  Celestial = "celestial",
  Eternal = "eternal",
  Corrotechnic = "corrotechnic",
  Subeuclidean = "subeuclidean",
  Zyrolexic = "zyrolexic",
  Transcendent = "transcendent",
  Corrupt = "corrupt",
  Absolute = "absolute",
  Reverent = "reverent",
}

export const EvolutionMap: Record<EvolutionType, [number, number]> = {
  [EvolutionType.None]: [1, 1],
  [EvolutionType.Improper]: [0.5, 0.5],
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
  [EvolutionType.Reverent]: [9, 9],
};

export const EvolutionIntegerMap: Record<EvolutionType, number> = {
  [EvolutionType.None]: 1,
  [EvolutionType.Superscaled]: 2,
  [EvolutionType.Mastered]: 3,
  [EvolutionType.Endfimidian]: 4,
  [EvolutionType.Celestial]: 5,
  [EvolutionType.Eternal]: 6,
  [EvolutionType.Corrotechnic]: 7,
  [EvolutionType.Subeuclidean]: 8,
  [EvolutionType.Zyrolexic]: 9,
  [EvolutionType.Transcendent]: 10,
  [EvolutionType.Corrupt]: 11,
  [EvolutionType.Absolute]: 12,
  [EvolutionType.Reverent]: 13,
  [EvolutionType.Improper]: 14,
};

export function getEvolutionBuff(
  evolution: EvolutionType,
  type: "hp" | "atk",
): number {
  return EvolutionMap[evolution][type === "hp" ? 0 : 1];
}
