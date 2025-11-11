import { Command } from "commander";
import { copyFile } from "node:fs/promises";

const program = new Command("generate-number");
const sha512 = new Bun.CryptoHasher("sha512");

program
  .version("0.1.0")
  .description("Generates boilerplate to add the number to fg sparky.");

program
  .requiredOption("-f, --file <file>", "The picture of the number's symbol")
  .requiredOption("-d, --difficulty <difficulty>", "Difficulty of the number (easy, medium, hard, or legendary)")
  .requiredOption("-n, --number <number>", "Name of the number to add");

program.parse(process.argv);

const options = program.opts();

const filePath: string = options.file as string;
const numberName: string = options.number as string;
const difficulty: string = options.difficulty as string;

const hash = sha512.update(numberName.toLowerCase()).digest("hex");
const fileExtension = filePath.split(".").pop();
const newFileName = `${hash}.${fileExtension}`;
const newFilePath = `src/numbers/${difficulty}/${newFileName}`;

await copyFile(filePath, newFilePath);
await Bun.file(filePath).delete();

const output = {
  name: numberName,
  hashedName: hash,
  image: newFilePath,
};

// jsons are any-typed
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const json = await Bun.file("src/numbers/numbers.json").json();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
json[difficulty].push(output);

await Bun.write(
  "src/numbers/numbers.json",
  JSON.stringify(json, null, 2),
);

console.log("Generated number:");
console.log(JSON.stringify(output, null, 2));
