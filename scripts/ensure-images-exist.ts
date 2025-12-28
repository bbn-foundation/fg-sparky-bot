import numbers from "../numbers/numbers.json" with { type: "json" };

const easies = await Promise.allSettled(numbers.easy.map(async (value) => {
  try {
    await Bun.file(value.image).bytes();
    return Object.assign(value, { missingImage: false });
  } catch {
    return Object.assign(value, { missingImage: true });
  }
}));

const medium = await Promise.allSettled(numbers.medium.map(async (value) => {
  try {
    await Bun.file(value.image).bytes();
    return Object.assign(value, { missingImage: false });
  } catch {
    return Object.assign(value, { missingImage: true });
  }
}));

const hard = await Promise.allSettled(numbers.hard.map(async (value) => {
  try {
    await Bun.file(value.image).bytes();
    return Object.assign(value, { missingImage: false });
  } catch {
    return Object.assign(value, { missingImage: true });
  }
}));

const legendary = await Promise.allSettled(numbers.legendary.map(async (value) => {
  try {
    await Bun.file(value.image).bytes();
    return Object.assign(value, { missingImage: false });
  } catch {
    return Object.assign(value, { missingImage: true });
  }
}));

console.log("========== EASIES ==========");
console.log(easies.filter(value => value.status === "fulfilled" && value.value.missingImage).map(value => value.value));
console.log("========== MEDIUMS ==========");
console.log(medium.filter(value => value.status === "fulfilled" && value.value.missingImage));
console.log("========== HARD ==========");
console.log(hard.filter(value => value.status === "fulfilled" && value.value.missingImage));
console.log("========== LEGENDARIES ==========");
console.log(legendary.filter(value => value.status === "fulfilled" && value.value.missingImage));
