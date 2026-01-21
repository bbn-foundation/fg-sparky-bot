import { NumberhumanInfo } from "#stores-types";

const hasher = new Bun.CryptoHasher("blake2b512");
const numberhumans = NumberhumanInfo.array().parse(
  await Bun.file("numbers/numberhumans.json").json(),
);

const fixed = numberhumans.map((value) =>
  Object.assign(value, {
    hashedName: hasher.update(value.name.toLowerCase()).digest("hex"),
  })
);

await Bun.write("numbers/numberhumans.json", JSON.stringify(fixed, null, 2));
