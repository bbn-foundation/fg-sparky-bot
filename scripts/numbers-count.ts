import { NumberInfo } from "#stores-types";
import numbersJson from "../numbers/numbers.json" with { type: "json" };

const parsedEntries = numbersJson.map((entry) => NumberInfo.parse(entry));

console.log("Amount of entries:");
console.log(`easy: ${parsedEntries.filter((entry) => entry.difficulty === "easy").length}`);
console.log(`medium: ${parsedEntries.filter((entry) => entry.difficulty === "medium").length}`);
console.log(`hard: ${parsedEntries.filter((entry) => entry.difficulty === "hard").length}`);
console.log(
  `legendary: ${parsedEntries.filter((entry) => entry.difficulty === "legendary").length}`,
);
console.log(`\nTOTAL: ${parsedEntries.length}`);
