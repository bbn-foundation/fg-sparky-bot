import { NumberInfo } from "#stores-types";
import type { Difficulties } from "#utils/types.ts";
import { Command } from "commander";
import { copyFile } from "node:fs/promises";

const program = new Command("generate-number");
const sha512 = new Bun.CryptoHasher("sha512");

program.version("0.1.0").description("Generates boilerplate to add the number to fg sparky.");

program
  .requiredOption("-f, --file <file>", "The picture of the number's symbol")
  .requiredOption(
    "-d, --difficulty <difficulty>",
    "Difficulty of the number (easy, medium, hard, or legendary)",
  )
  .requiredOption("-n, --number <number>", "Name of the number to add");

program.parse(process.argv);

const options = program.opts<{
  file: string;
  number: string;
  difficulty: Difficulties;
}>();

const filePath = String(options.file);
const numberName = String(options.number);
const difficulty = String(options.difficulty);

const hash = sha512.update(numberName.toLowerCase()).digest("hex");
const fileExtension = filePath.split(".").pop();
const uuid = crypto.randomUUID();

const newFileName = `${uuid}.${fileExtension!}`;
const newFilePath = `numbers/${difficulty}/${newFileName}`;

await copyFile(filePath, newFilePath);
await Bun.file(filePath).delete();

const output: NumberInfo = {
  uuid: uuid,
  name: numberName,
  hashedName: hash,
  image: newFilePath,
  // @ts-expect-error: i run this script, i trust myself
  difficulty,
};

// jsons are any-typed

const json = NumberInfo.array().parse(await Bun.file("numbers/numbers.json").json());

json.push(output);

await Bun.write("numbers/numbers.json", JSON.stringify(json, null, 2));

console.log("Generated number:");
console.log(JSON.stringify(output, null, 2));
