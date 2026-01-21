import { NumberInfo as NumberInfoSchema } from "#stores-types";
import type { Difficulties } from "#utils/types";
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

const { directory, difficulty } = program.opts<{
  directory: string;
  difficulty: string;
}>();

const entries = await readdir(directory);

const numbers = (
  await Promise.all(
    entries.map(async (fileName) => {
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
      const filePath = `${directory}/${fileName}`;
      console.log(`Found file: ${filePath} (number: ${number})`);
      sha512.update(number.toLowerCase());
      const hash = sha512.digest("hex");
      const uuid = crypto.randomUUID();
      const newFilePath = `${directory}/${uuid}${fileExtension}`;
      await copyFile(filePath, newFilePath);
      await Bun.file(filePath).delete();
      return {
        uuid,
        name: difficulty === "legendary" ? null : number,
        hashedName: hash,
        image: newFilePath,
        // oxlint-disable-next-line no-unsafe-type-assertion
        difficulty: difficulty as Difficulties,
      };
    }),
  )
).filter((value) => value !== undefined);

const originalJson = NumberInfoSchema.array().parse(await Bun.file(`numbers/numbers.json`).json());
originalJson.push(...numbers);

await Bun.write(`numbers/numbers.json`, JSON.stringify(originalJson, null, 2));

console.log(
  `\nUpdated numbers.json with ${numbers.length.toString()} numbers for difficulty "${difficulty}".`,
);
