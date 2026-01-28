import { ResponseInfo, ResponseStore } from "#stores-types";
import { Command } from "commander";

const program = new Command("generate-number");

program.version("0.1.0").description("Generates the boilerplate for new responses.");

program
  .requiredOption("-f, --file <file>", "File of each response, delimited by a new line")
  .requiredOption("-t, --type <type>", "The response message type");

program.parse(process.argv);

const options = program.opts<{
  file: string;
  type: string;
}>();

const type = String(options.type);

const newResponses = await Bun.file(options.file).text();

const responseData = ResponseInfo.array().parse(
  newResponses.split("\n").map(value => ({
    value,
    uuid: crypto.randomUUID(),
    type,
  })),
);

const responses = new ResponseStore("numbers/responses.json");
await responses.load();
await responses.add(...responseData);

console.log(`Added ${responseData.length} responses`);
