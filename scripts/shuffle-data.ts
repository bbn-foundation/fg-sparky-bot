function shuffleArray<T>(baseArray: T[]): T[] {
  const array = structuredClone(baseArray);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
  }
  return array;
}

const shuffledJsons = await Promise.all(
  process.argv.slice(2).map(async file => [file, await Bun.file(file).json()] as const),
);

for (const [file, data] of shuffledJsons) {
  // oxlint-disable-next-line typescript/no-unsafe-argument, no-await-in-loop
  await Bun.write(file, JSON.stringify(shuffleArray(data), undefined, 2));
}
