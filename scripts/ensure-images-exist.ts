import { NumberInfo } from "#stores-types";
import numbers from "../numbers/numbers.json" with { type: "json" };

const entries = await Promise.allSettled(
  numbers
    .map((value) => NumberInfo.parse(value))
    .map(async (value) => {
      try {
        await Bun.file(value.image).bytes();
        return Object.assign(value, { missingImage: false });
      } catch {
        return Object.assign(value, { missingImage: true });
      }
    }),
);

console.log("========== NUMBERS WITHOUT IMAGES ==========");
console.log(
  entries
    .filter((value) => value.status === "fulfilled")
    .filter((value) => value.value.missingImage)
    .map((value) => value.value),
);
