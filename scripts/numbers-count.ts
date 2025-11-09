import numbersJson from "../src/numbers/numbers.json" with { type: "json" };

const easiesCount = numbersJson.easy.length;
const mediumsCount = numbersJson.medium.length;
const hardCount = numbersJson.hard.length;
const legendaryCount = numbersJson.legendary.length;
const totalCount = easiesCount + mediumsCount + hardCount + legendaryCount;

console.log("Amount of entries:");
console.log(`easy: ${easiesCount.toString()}`);
console.log(`medium: ${mediumsCount.toString()}`);
console.log(`hard: ${hardCount.toString()}`);
console.log(`legendary: ${legendaryCount.toString()}`);
console.log(`\nTOTAL: ${totalCount.toString()}`);
