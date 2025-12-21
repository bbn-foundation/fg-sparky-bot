import { Command } from "commander";
import { copyFile, readdir } from "node:fs/promises";

const program = new Command("generate-number");
// use blake2b to prevent numberhuman hashes matching with their respective non-human counterparts
const sha512 = new Bun.CryptoHasher("blake2b512");

program
  .version("0.1.0")
  .description("Enumerate all files in a directory to generate a bunch of numberhumans for numberdex");

program
  .requiredOption("-d, --directory <directory>", "Directory containing the number images")
  .requiredOption("-r, --rarity <rarity>", "How rare are the numberhumans");

program.parse(process.argv);

const options = program.opts<{
  directory: string;
  rarity: string;
}>();
const directoryPath: string = options.directory;
const difficulty: string = options.rarity;

const files = await readdir(directoryPath);

interface NumberInfo {
  uuid: string;
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
  const uuid = crypto.randomUUID();
  const newFilePath = `${directoryPath}/${uuid}${fileExtension}`;
  await copyFile(filePath, newFilePath);
  // await Bun.file(filePath).delete();
  numbers.push({
    uuid,
    name: difficulty === "legendary" ? null : number,
    hashedName: hash,
    image: newFilePath,
  });
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const originalJson = await Bun.file(`numbers/numberhumans.json`).json();
console.log(originalJson[difficulty]);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
originalJson[difficulty] = [...originalJson[difficulty], ...numbers];

await Bun.write(
  `numbers/numberhumans.json`,
  JSON.stringify(originalJson, null, 2),
);

console.log(`\nUpdated numberhumans.json with ${numbers.length.toString()} numbers for difficulty "${difficulty}".`);
