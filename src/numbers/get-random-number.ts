import numbers from "./numbers.json" with { type: "json" };

export type Difficulties = "easy" | "medium" | "hard" | "random";

export interface NumberInfo {
  number: string;
  symbol: string;
  difficulty: "easy" | "medium" | "hard" | "legendary";
}

function getRandomDifficulty(): "easy" | "medium" | "hard" | "legendary" {
  if (Math.random() * 48 < 1) return "legendary";
  // uhh i kinda need the non-null assertion here cause it's not gonna be undefined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (["easy", "medium", "hard"] as const)[Math.floor(Math.random() * 3)]!;
}

export function findRandomNumber(difficulty: Difficulties): NumberInfo {
  const actualDifficulty = difficulty === "random" ? getRandomDifficulty() : difficulty;
  const numberPool = numbers[actualDifficulty];
  const randomIndex = Math.floor(Math.random() * numberPool.length);
  const number = numberPool[randomIndex];
  // Uh yeah same here
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { number: number!.name, symbol: number!.image, difficulty: actualDifficulty };
}
