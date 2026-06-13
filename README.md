# hi chat

this is the source code for the very work in progress fg sparky discord bot.

the fg sparky "bot" is a game made by [stella](https://www.youtube.com/@stellarcherries). the goal is to guess an fg number based on its symbol.

this is (presumably) inspired by the gd sparky bot, a game where you have to guess a geometry dash level based on a screenshot of the level.

## how to run

you'll need [deno](https://deno.com/) to run the bot and install dependencies.\
if you don't have it, install it first.

now install dependencies and build the bot:

```bash
deno install
```

and run the bot:

```bash
deno run -A src/main.ts -t $DISCORD_TOKEN
```

or pass the bot token as an environment variable:

```bash
# in .env.local
DISCORD_TOKEN=#bot token here#
# on the terminal
deno run -A src/main.ts
```

## license

GPL-3.0-or-later, see [the license](./LICENSE.md)
