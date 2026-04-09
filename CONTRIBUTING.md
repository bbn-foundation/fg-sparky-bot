# Contributing to the bot

Hey welcome! Thanks for helping and contributing to the bot. You don't really
have to do a lot, but there are many things you could do here like updating
the entries, writing bug reports (or fixing them), creating feature requests,
and writing some of your own code that will be added!

There's a few guidelines you should look at that will help and respect the
developers maintaining this bot. As long as you follow through with this,
the maintainers will help you back and treat you nicely.

## Preparations

### Requirements

You should know how to use [git](https://git-scm.com/) and work with the command line since
you will be using that a lot.\
You will also need [Bun](https://bun.sh/) to run and build the bot, as well as to check your code.

Make sure to setup Git so it knows you:

```bash
git config --global user.name "your username here"
git config --global user.email "your email here"
```

You can use any username/email you prefer. We just need it so we can figure out who we should give
credits to in the changelogs.

## General help/guidance

If you only need help with using or setting up the bot, you can use GitHub's
[discussions](https://github.com/bbn-foundation/fg-sparky-bot/discussions) feature or you can
join the [BBN Foundation's Discord server](https://discord.gg/4nFyfyfdEU).

## Incorrect Entries

If this is someone else's bot instance (aka, the bot's username is not
`FG Sparky Bot#4464` (prod) or `FG Sparky Bot#6017`), you should DM the person that runs that bot.\
Otherwise, you should DM `@skylalights` to fix the entries. Do not make an issue for incorrect entries,
we'd like to keep those only for issues with the bot itself.

## Other Issues

I assume if you reached this point, that means there's a definite issue with the bot itself. Great!

You can [submit an issue](#submitting-issues) to the repository
and fill in the appropriate details. If you know how to fix it, that's even better!
You can [submit a pull request](#submiting-issuespull-requests) with the fix and help improve the bot.

## Submission Guideliens

### Submitting issues

Before you do submit an issue, please check [the issue tracker](https://github.com/bbn-foundation/fg-sparky-bot/issues)
for related issues. Someone could have already figured out a fix for your problems.
If not, you can help provide more details about the problem, and we can probably fix it.

If no one made an issue for your problem, you can then make an issue with the `Bug Report` template,
which you should fill out to the best of your ability. You don't need every single detail, just
fill it with information related to the problem.

If you will be filing an issue, please make sure you have a minimal reproduction. We cannot easily
fix issues if we cannot reproduce the problem. It allows us to easily figure out the exact bug without
having to continually pester you back and forth with your scenario.

See [this stackoverflow guide](https://stackoverflow.com/help/minimal-reproducible-example) for guidance,
but since you interact with the bot differently (via Discord commands and interactions, not code), you
should switch to different methods for diagnosing, mainly:

- Use a brand new/fresh server to run the bot, this can filter out a lot of the other member's noise

### Submitting pull requests

There's only one person maintaining this bot (@skylafalls), so please do value her time. Mainly,

1. Please first [search if someone else](https://github.com/bbn-foundation/fg-sparky-bot/pulls)
   has already made, merged, or closed the pull request to avoid duplicating existing work.
1. [Make sure to allow us to edit your pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork),
   since it makes trivial fixes a lot easier.

### New entries

Adding new entries should be simple, there's a couple of scripts in the `scripts/` folder that can
generate the boilerplate for you. The only things you will need is:

- The number's name
- A screenshot of the number's symbol ONLY

After that, you can then [make a pull request]()

## Commit message style
