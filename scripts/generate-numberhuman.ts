import { Command } from "commander";

const command = new Command()
  .requiredOption("-r, --rarity <rarity>")
  .requiredOption("-a, --artist <artist>")
  .requiredOption("-h, --hp <hp>")
  .requiredOption("-A, --attack <atk>")
  .requiredOption("--ability-name <name>")
  .requiredOption("--ability-description <description>")
  .argument("<file>");

command.parse(process.argv);

const args = command.opts<{
  rarity: string;
  artist: string;
  hp: string;
  attack: string;
  abilityName: string;
  abilityDescription: string;
}>();

interface NumberhumanData {
  uuid: string;
  name: string;
  rarity: "common" | "rare" | "epic";
  hashedName: string;
  image: string;
  baseHP: number;
  baseATK: number;
  ability: {
    id: string;
    name: string;
    description: string;
  };
}

const file = command.processedArgs[0] as string;
const numberhumanName = file.slice(file.lastIndexOf("/")).slice(0, -5);

const hasher = new Bun.CryptoHasher("blake2b512");
hasher.update(numberhumanName.toLowerCase());

const numberhumanData: NumberhumanData = {
  uuid: crypto.randomUUID(),
  name: numberhumanName,
  rarity: args.rarity,
  hashedName: hasher.digest("hex"),
  image: file,
  baseHP: Number.parseInt(args.hp, 10),
  baseATK: Number.parseInt(args.attack, 10),
  ability: {
    id: crypto.randomUUID(),
    name: args.abilityName,
    description: args.abilityDescription,
  },
};

const json = await Bun.file("numbers/numberhumans.json").json() as {
  numberhumans: NumberhumanData[];
  responses: string[];
};
json.numberhumans.push(numberhumanData);

await Bun.write("numbers/numberhumans.json", JSON.stringify(json, null, 2));

console.log(`Added numberhuman ${numberhumanData.name} into numberhumans.json`);
