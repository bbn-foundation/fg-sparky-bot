/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { EvolutionRarity, NumberhumanData, UserProfile } from "#db";
import { EvolutionType } from "#numberdex/evolutions.ts";
import { Numberhumans, Numbers } from "#stores";
import type { Command } from "#utils/types.ts";
import { ButtonStyle, ComponentType, hideLinkEmbed, hyperlink, type Client, type CommandInteraction } from "discord.js";
import { execSync } from "node:child_process";

const About: Command = {
  async run(_client: Client, interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    const commit = execSync("git rev-parse --short HEAD");
    const version = execSync("git describe --abbrev=0");
    const branch = execSync("git symbolic-ref --short HEAD");

    const botVersion = `${version.toString("utf-8").trim()} (commit ${commit.toString("utf-8").trim()}) ${Deno.env.get("NODE_ENV") === "development" ? `[**INDEV**, on ${branch.toString("utf-8").trim()} branch]` : ""}`;

    await interaction.client.guilds.fetch();

    await interaction.followUp({
      content: [
        `# info:`,
        `you are on version ${botVersion}`,
        `this bot has been added to ${interaction.client.guilds.cache.size} servers`,
        `a total of ${await UserProfile.countBy({})} people have used this bot`,
        `## entries:`,
        `there are currently ${Numbers.UNIQUE_ENTRIES} sparky entries in total, of which ${Numbers.UNIQUE_EASY_ENTRIES} are easy, ${Numbers.UNIQUE_MEDIUM_ENTRIES} are medium, ${Numbers.UNIQUE_HARD_ENTRIES} are hard, and ${Numbers.UNIQUE_LEGENDARY_ENTRIES} are legendaries`,
        `there has been ${Numberhumans.UNIQUE_ENTRIES} numberhumans added, with 13 possible evolutions, the best one being ${EvolutionType.Reverent} with a 1 in ${EvolutionRarity.find(a => a[0] === EvolutionType.Reverent)![1]} chance`,
        `A total of ${await NumberhumanData.countBy({})} numberhumans have been caught`,
        `## credits:`,
        [
          `FG sparky bot made by ${hyperlink("sky", hideLinkEmbed("https://www.youtube.com/channel/UCYI1TpAq7I3Jaak-uc1-JSA"))},`,
          `with some help from ${hyperlink("stella", hideLinkEmbed("https://www.youtube.com/channel/UC_pjqsbBYQKwhy5aZ0Bkt5w"))},`,
          `${hyperlink("theuserwhoishere", hideLinkEmbed("https://www.youtube.com/channel/UCgnEca2vL57qvMwwxfznsMg"))},`,
          `and ${hyperlink("flowi", hideLinkEmbed("https://www.youtube.com/channel/UC41bs8thlsdXCCndvk6Hk8A"))}`,
        ].join(" "),
      ].join("\n"),
      components: [{
        type: ComponentType.ActionRow,
        components: [{
          type: ComponentType.Button,
          label: "Source",
          style: ButtonStyle.Link,
          url: "https://github.com/bbn-foundation/fg-sparky-bot.git"
        }],
      }],
    });
  },
  description: "About the bot",
  name: "about",
};

export default About;
