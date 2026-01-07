import { Command } from "commander";
import { copyFile } from "node:fs/promises";
import type { NumberInfo } from "@fg-sparky/server";

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

const filePath = String(options.file);
const numberName = String(options.number);
const difficulty = String(options.difficulty);

const hash = sha512.update(numberName.toLowerCase()).digest("hex");
const fileExtension = filePath.split(".").pop();
const uuid = crypto.randomUUID();
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const newFileName = `${uuid}.${fileExtension!}`;
const newFilePath = `numbers/${difficulty}/${newFileName}`;

await copyFile(filePath, newFilePath);
await Bun.file(filePath).delete();

const output: NumberInfo = {
  uuid: uuid,
  name: numberName,
  hashedName: hash,
  image: newFilePath,
  difficulty,
};

// jsons are any-typed
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const json = await Bun.file("numbers/numbers.json").json();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
json.push(output);

await Bun.write(
  "numbers/numbers.json",
  JSON.stringify(json, null, 2),
);

console.log("Generated number:");
console.log(JSON.stringify(output, null, 2));
