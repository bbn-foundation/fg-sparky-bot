import { ResponseInfo } from "#stores-types";
import { Command } from "commander";
import responsea from "../numbers/responses.json" with { type: "json" };

const program = new Command("add-responses");

program.version("0.1.0").description("Adds a shit ton of responses ");

program.requiredOption("-t, --type <type>", "the type of the response").argument("<input-file>");

program.parse(process.argv);

const { type } = program.opts<{ type: string }>();
const file = program.args[0]!;

const responses = await Bun.file(file)
  .text()
  .then((contents) =>
    contents
      .split("\n")
      .map((value) =>
        ResponseInfo.parse({
          uuid: crypto.randomUUID(),
          type,
          value,
        })
      )
      .filter((value) => value.value !== "")
  );

responsea.push(...responses);

await Bun.write("numbers/responses.json", JSON.stringify(responsea, null, 2));
