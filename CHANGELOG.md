# changelog

## 0.7.0 - November 14th, 2025
### BREAKING CHANGES:
- **refactor(bot)!**: convert the bot into a cli app \[[`8ad9bbfd`](https://github.com/skylafalls/fg-sparky-bot/commit/8ad9bbfda83cbac7d32744dcd320870c2adfc583)] ([#5](https://github.com/skylafalls/fg-sparky-bot/pull/5)) by @skylafalls

## 0.6.2 - November 13th, 2025
### bug fixes:
- fix(guess): Replace unicode characters with their ASCII variants before processing guess \[[`ac43893f`](https://github.com/skylafalls/fg-sparky-bot/commit/ac43893fc66d3f316075be7604f49cd46ad72445)] by @skylafalls
- fix(entries): fix an easy number \[[`84c1b876`](https://github.com/skylafalls/fg-sparky-bot/commit/84c1b87616091723debce68f140c3a509ca645ba)] by @skylafalls

## 0.6.1 - November 13th, 2025
### refactors:
- refactor: add binary build script \[[`ddf536ef`](https://github.com/skylafalls/fg-sparky-bot/commit/ddf536ef7df740fc3b841df3182d65cb99a9dde5)]

## 0.6.0 - November 13th, 2025
### features:
- feat(entries): add support for randomized and hard difficulties \[[`3fb36bff`](https://github.com/skylafalls/fg-sparky-bot/commit/3fb36bff73a949800477295caace22e2a8adc618)] ([#4](https://github.com/skylafalls/fg-sparky-bot/pull/4))

## 0.5.4 - November 12th, 2025

### fixes
- fix(entries): rename some incorrect entries \[[`7057fb31`](https://github.com/skylafalls/fg-sparky-bot/commit/7057fb31313039584cb786813d364f03cd11e179)] ([#3](https://github.com/skylafalls/fg-sparky-bot/pull/3))

## 0.5.3 - November 11th, 2025

### features:
- feat(entries): add the last batch of mediums \[[`27587ac4`](https://github.com/skylafalls/fg-sparky-bot/commit/27587ac40c51ece3438da4ec7b54240d1b9d4c8f)\]

### refactors:
- refactor: update deps and improve scripts \[[`d656a7bb`](https://github.com/skylafalls/fg-sparky-bot/commit/d656a7bba2facfa383676d9b9f2046bd3691f215)\]

## 0.5.2 - November 11th, 2025
- feat(entries): add new medium \[[`4201a57d`](https://github.com/skylafalls/fg-sparky-bot/commit/4201a57d0cd29124036b12834584a1c246f3a347)\]

## 0.5.1 - November 11th, 2025

### features
- feat(entries): add new easy ([`8cde98b181`](https://github.com/skylafalls/fg-sparky-bot/commit/8cde98b181aa82f407550efd757b649d7241612c))

### refactors
- refactor(scripts): convince linter to shut ([`525c6f1db2`](https://github.com/skylafalls/fg-sparky-bot/commit/525c6f1db23dacd3df219fea2db89d114e874a71))

### fixes
- fix(release): try fixing commit links ([`246d5ee0dc`](https://github.com/skylafalls/fg-sparky-bot/commit/246d5ee0dc4887cd813a151fa49344ff773cc75a))

## 0.5.0 - November 10th, 2025

### features
- feat(entries): add even more mediums [a7ff2c3f69d9edf5dfb875d1ad1a1eb04b5e82dc]
- feat(guess): try adding support for numbers without their names available [47db55df4e2b3815256244529e2ba869028811b7]
- feat(entries): add more mediums and update generation script [b62f0ce43b1a088ec600df015428d296f003d267]

### refactors
- refactor: improve scripts [c01d1863f384925268e640bf9e0f11df906b03ed]

### bug fixes
- fix(cooldowns): divide the warning log by 1000 [09267bd726d46a2dabd8ffc94e7cb6e8f7f9ddd6]
- fix(misc): add type attributes to json imports [2a983587f265c4036e86adf57d150542e28d7a54]
- fix(entries): fix a number name [55485422d0b0cdfe843b25a0e7d9594fd961cc5b]
- fix(cmds): check that CommandInteraction is a ChatInputCommandInteraction [40c9a4b96bca39c6acb4c58c02f6c41828f594c2]
- fix(entries): remove hashed .DS_Store "number" [257214ce236df0fb4fcbdf9740106fa8552d6f29]

### chores
- chore: bump version [13717798814858512279e5d2b98873ac94356fff]
- chore: add license in [32d5ebf3f9329c722b3c8b5e00403ead9aa2feb0]
- chore(deps): update oxlint and remove temporal polyfill [f5ed87ba1345638426bc231b3f4c9744f9dad470]

## 0.4.0 - November 9th, 2025
- fix(entries): phreezium and unending pint was wrong ([d3d5709](https://github.com/skylafalls/fg-sparky-bot/commit/d3d5709c22c89e7783589ca6911d8d77184b9a78))
- fix(cmds): also the medium difficulty is partially implemented ([f0f423b](https://github.com/skylafalls/fg-sparky-bot/commit/f0f423b7911774fb91d00f4f9d0fe5dcb0975bda))
- fix(entries): renamed second earthifinity to tierrafinity ([e87eda7](https://github.com/skylafalls/fg-sparky-bot/commit/e87eda7c8051724e32b063d440b7e7d3a6cc56ee))
- refactor(cmds): one more logging statement ([ebbccaf](https://github.com/skylafalls/fg-sparky-bot/commit/ebbccaf65abbd24f87ce7415488c1a641aec0de5))
- fix(entries): fix rotated entry ([afc7a0b](https://github.com/skylafalls/fg-sparky-bot/commit/afc7a0b4b28f568a0e3d0d7747daf4dcd84e6b9f))
- fix(entries): fix number names ([9d61a88](https://github.com/skylafalls/fg-sparky-bot/commit/9d61a88969730b826764b7c66ba41b226b24aaa4))
- feat(cmds): implement cooldowns to prevent spamming ([0ccc586](https://github.com/skylafalls/fg-sparky-bot/commit/0ccc5865dc72ff87dc8aba971578d0c18ac0cf1d))
- feat(guess): improve reply messages ([9c410ea](https://github.com/skylafalls/fg-sparky-bot/commit/9c410eafc53b3430e424d6e4e3c1e5d5e180f76a))

## 0.3.0 - November 9th, 2025
- feat(entries): Add a bunch of mediums ([8fc7dcf](https://github.com/skylafalls/fg-sparky-bot/commit/8fc7dcf69be4950b293225376fe5b69d16fd7717))

## 0.2.1 - November 9th, 2025
- fix: warn on unsupported difficulties

## 0.2.0 - November 9th, 2025
- added 400 easy entries
- added a few scripts to make it easier for me to add entries

## 0.1.0 - November 9th, 2025
- made it work lol
