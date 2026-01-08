import { NumberhumanInfo } from "@fg-sparky/server";
import type { Rarities } from "@fg-sparky/utils";
import { Command } from "commander";
import { copyFile } from "node:fs/promises";

const command = new Command()
  .requiredOption("-r, --rarity <rarity>")
  .requiredOption("-h, --hp <hp>")
  .requiredOption("-a, --attack <atk>")
  .requiredOption("-A, --ability <ability>")
  .argument("<file>");

command.parse(process.argv);

const args = command.opts<{
  rarity: string;
  artist: string;
  hp: string;
  attack: string;
  ability: string;
}>();

const file = String(command.processedArgs[0]);

const fileExtension = file.slice(file.lastIndexOf("."));
const directoryPath = file.slice(0, file.lastIndexOf("/"));
const numberUUID = crypto.randomUUID();
const newFilePath = `${directoryPath}/${args.rarity}/${numberUUID}${fileExtension}`;
await copyFile(file, newFilePath);
await Bun.file(file).delete();

const numberhumanName = file.slice(file.lastIndexOf("/") + 1).slice(0, -5);

const hasher = new Bun.CryptoHasher("blake2b512");
hasher.update(numberhumanName.toLowerCase());

const numberhumanData: NumberhumanInfo = {
  uuid: numberUUID,
  name: numberhumanName,
  // oxlint-disable-next-line no-unsafe-type-assertion
  rarity: args.rarity as Rarities,
  hashedName: hasher.digest("hex"),
  image: newFilePath,
  baseHP: Number.parseInt(args.hp, 10),
  baseATK: Number.parseInt(args.attack, 10),
  ability: args.ability,
};

const json = NumberhumanInfo.array().parse(await Bun.file("numbers/numberhumans.json").json());
json.push(numberhumanData);

await Bun.write("numbers/numberdex-data.json", JSON.stringify(json, null, 2));

console.log(`Added numberhuman ${numberhumanData.name} into numberdex-data.json`);
