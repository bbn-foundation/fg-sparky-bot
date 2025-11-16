import { Command } from "commander";
import { copyFile, readdir } from "node:fs/promises";

const program = new Command("generate-number");
const sha512 = new Bun.CryptoHasher("sha512");

program
  .version("0.1.0")
  .description("Enumerate all files in a directory to generate a bunch of numbers for FG sparky");

program
  .requiredOption("-d, --directory <directory>", "Directory containing the number images")
  .requiredOption("-D, --difficulty <difficulty>", "The difficulty level for these numbers");

program.parse(process.argv);

const options = program.opts();
const directoryPath: string = options.directory as string;
const difficulty: string = options.difficulty as string;

const files = await readdir(directoryPath);

interface NumberInfo {
  name: string | null;
  hashedName: string;
  image: string;
}

const numbers: NumberInfo[] = [];

await Promise.all(files.map(async (fileName) => {
  const fileExtension = fileName.slice(fileName.lastIndexOf("."));
  if (fileExtension.endsWith("DS_Store") || fileExtension.endsWith("txt")) return;
  const number = (() => {
    const number = fileName.slice(0, fileName.lastIndexOf("."));
    switch (number) {
      default: {
        return number;
      }
    }
  })();
  const filePath = `${directoryPath}/${fileName}`;
  console.log(`Found file: ${filePath} (number: ${number})`);
  sha512.update(number.toLowerCase());
  const hash = sha512.digest("hex");
  const newFilePath = `${directoryPath}/${hash}${fileExtension}`;
  await copyFile(filePath, newFilePath);
  await Bun.file(filePath).delete();
  numbers.push({
    name: difficulty === "legendary" ? null : number,
    hashedName: hash,
    image: newFilePath,
  });
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const originalJson = await Bun.file(`src/numbers/numbers.json`).json();
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
originalJson[difficulty] = [...originalJson[difficulty], ...numbers];

await Bun.write(
  `src/numbers/numbers.json`,
  JSON.stringify(originalJson, null, 2),
);

console.log(`\nUpdated numbers.json with ${numbers.length.toString()} numbers for difficulty "${difficulty}".`);
