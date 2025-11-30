# changelog

## 0.10.0 - November 30th, 2025
### features:
- \[[`5c1755f0`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/5c1755f07d013f47f111f6bd25ca8cce0a5e68aa)] - feat(guess): omni oridnal
- \[[`303411c5`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/303411c505f78e32ef362b9a59539b2ad137abe2)] - feat(entries): another 600 entries

### fixes:
- \[[`9fb77c3a`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/9fb77c3a149be45d29f50730a770fead7358804b)] - fix(entries): fix an easy
- \[[`303411c5`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/303411c505f78e32ef362b9a59539b2ad137abe2)] - fix(entries): fix earthifinity
- \[[`afd73ab2`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/afd73ab2f5b33b120ab2ebfcd97355af48aa71a8)] - fix(entries): fix the misspelled entries again ([#12](https://github.com/skylafalls/fg-sparky-bot/pull/12))

### refactors:
- \[[`365cd0d9`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/365cd0d918430cf43903e3d5c5b69d4b2cef85af)] - refactor(entries): move the entries to a separate directory
- \[[`a8eda4cd`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/a8eda4cd1665ab4509afcd987fdd54be5b2418f2)] - refactor(entries): stop committing the entries to git

### chores:
- \[[`57057c45`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/57057c45605a1718a60ab987f9498680df23d0c0)] - chore: shorten license header to use spdx 

## 0.9.0 - November 25th, 2025
### features:
- \[[`18b3eef1`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/18b3eef1ce2315cf2c9947c79566b0460a9e78ff)] - feat: add user profiles ([#11](https://github.com/skylafalls/fg-sparky-bot/pull/11))

### refactors:
- \[[`311cb502`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/311cb5025fd7176efcf556175c7c6496534d6646)] - refactor(cmds): move /guess response logic to different file
- \[[`a5137ead`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/a5137eaddaae0fc1244a2c23c56e75f8834fdb65)] - refactor(entries): migrate to UUIDs to point to numbers
- \[[`69fc1db1`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/69fc1db1339c1311c5849320580bbcd80d2c3c45)] - refactor(cmds): slightly improve logging

### fixes:
- \[[`1591cf20`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/1591cf2017ea1927690ccb8a113f4aa1b43903a2)] - fix(entries): fix paths for batches of numbers
- \[[`8d74ee98`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/8d74ee98e1169f4945184e5e1bfda0a9aae6cc39)] - fix(guess): fix race conditions

## chores:
- \[[`faf9b6ee`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/faf9b6ee53d8a151bc63d2ac6083ca120305defa)] - chore(deps): update linters

## 0.8.1 - November 23rd, 2025
### chores:
- chore(deps): update deps lol \[[`6c1595fa`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/6c1595fa67b3e3de864a6d058926fc40ad68afc4)]

## 0.8.0 - November 23rd, 2025
### BREAKING CHANGES:
- **fix(entries)!**: do not strip backslashes while guessing \[[`b718dc88`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/b718dc88ff68bf11b03128121270f121b6a569a3)]

### features:
- feat(cmds): implement better cooldown handling for /guess \[[`673b2ee2`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/673b2ee2b076f0f6eae19a5a3fce5bc4bbcfeed5)] ([#7](https://github.com/skylafalls/fg-sparky-bot/pull/7))
- feat(entries): add new batch of hard numbers \[[`a1967e0c`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/a1967e0c850218ac33622b25513e697d02ac9cb5)]
- feat(entries): even more numbers \[[`a4c46551`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/a4c465510678887922244adc7ea7d9e063389be0)] ([#8](https://github.com/skylafalls/fg-sparky-bot/pull/8))
- feat(entries): Add multiple batches of numbers \[[`72bf7158`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/72bf715843939debee59c186ab8497c66e8d54d2)]

### refactors:
- refactor(guess): made legendaries rarer (1/48 -> 1/60) \[[`1ac61a91`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/1ac61a91c311c4004aa896cdebbdaf99319fadad)]

### bug fixes:
- fix(entries): fix another easy number \[[`42fa49c3`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/42fa49c3621b9533a410060c294c3447c8825a3a)]
- fix(entries): fix a medium \[[`993fde0f`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/993fde0f3bd6761a93ef1d012a05bf991d1ce6a5)]
- fix(entries): fix a couple incorrect entries \[[`28b7721e`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/28b7721e38d02291720064f5c2c8ea2e95376321)]

## 0.7.0 - November 14th, 2025
### BREAKING CHANGES:
- **refactor(bot)!**: convert the bot into a cli app \[[`8ad9bbfd`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/8ad9bbfda83cbac7d32744dcd320870c2adfc583)] ([#5](https://github.com/skylafalls/fg-sparky-bot/pull/5))

## 0.6.2 - November 13th, 2025
### bug fixes:
- fix(guess): Replace unicode characters with their ASCII variants before processing guess \[[`ac43893f`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/ac43893fc66d3f316075be7604f49cd46ad72445)]
- fix(entries): fix an easy number \[[`84c1b876`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/84c1b87616091723debce68f140c3a509ca645ba)]

## 0.6.1 - November 13th, 2025
### refactors:
- refactor: add binary build script \[[`ddf536ef`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/ddf536ef7df740fc3b841df3182d65cb99a9dde5)]

## 0.6.0 - November 13th, 2025
### features:
- feat(entries): add support for randomized and hard difficulties \[[`3fb36bff`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/3fb36bff73a949800477295caace22e2a8adc618)] ([#4](https://github.com/skylafalls/fg-sparky-bot/pull/4))

## 0.5.4 - November 12th, 2025

### fixes
- fix(entries): rename some incorrect entries \[[`7057fb31`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/7057fb31313039584cb786813d364f03cd11e179)] ([#3](https://github.com/skylafalls/fg-sparky-bot/pull/3))

## 0.5.3 - November 11th, 2025

### features:
- feat(entries): add the last batch of mediums \[[`27587ac4`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/27587ac40c51ece3438da4ec7b54240d1b9d4c8f)\]

### refactors:
- refactor: update deps and improve scripts \[[`d656a7bb`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/d656a7bba2facfa383676d9b9f2046bd3691f215)\]

## 0.5.2 - November 11th, 2025
- feat(entries): add new medium \[[`4201a57d`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/4201a57d0cd29124036b12834584a1c246f3a347)\]

## 0.5.1 - November 11th, 2025

### features
- feat(entries): add new easy ([`8cde98b181`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/8cde98b181aa82f407550efd757b649d7241612c))

### refactors
- refactor(scripts): convince linter to shut ([`525c6f1db2`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/525c6f1db23dacd3df219fea2db89d114e874a71))

### fixes
- fix(release): try fixing commit links ([`246d5ee0dc`](https://codeberg.org/skylafalls/fg-sparky-bot/commit/246d5ee0dc4887cd813a151fa49344ff773cc75a))

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
- fix(entries): phreezium and unending pint was wrong ([d3d5709](https://codeberg.org/skylafalls/fg-sparky-bot/commit/d3d5709c22c89e7783589ca6911d8d77184b9a78))
- fix(cmds): also the medium difficulty is partially implemented ([f0f423b](https://codeberg.org/skylafalls/fg-sparky-bot/commit/f0f423b7911774fb91d00f4f9d0fe5dcb0975bda))
- fix(entries): renamed second earthifinity to tierrafinity ([e87eda7](https://codeberg.org/skylafalls/fg-sparky-bot/commit/e87eda7c8051724e32b063d440b7e7d3a6cc56ee))
- refactor(cmds): one more logging statement ([ebbccaf](https://codeberg.org/skylafalls/fg-sparky-bot/commit/ebbccaf65abbd24f87ce7415488c1a641aec0de5))
- fix(entries): fix rotated entry ([afc7a0b](https://codeberg.org/skylafalls/fg-sparky-bot/commit/afc7a0b4b28f568a0e3d0d7747daf4dcd84e6b9f))
- fix(entries): fix number names ([9d61a88](https://codeberg.org/skylafalls/fg-sparky-bot/commit/9d61a88969730b826764b7c66ba41b226b24aaa4))
- feat(cmds): implement cooldowns to prevent spamming ([0ccc586](https://codeberg.org/skylafalls/fg-sparky-bot/commit/0ccc5865dc72ff87dc8aba971578d0c18ac0cf1d))
- feat(guess): improve reply messages ([9c410ea](https://codeberg.org/skylafalls/fg-sparky-bot/commit/9c410eafc53b3430e424d6e4e3c1e5d5e180f76a))

## 0.3.0 - November 9th, 2025
- feat(entries): Add a bunch of mediums ([8fc7dcf](https://codeberg.org/skylafalls/fg-sparky-bot/commit/8fc7dcf69be4950b293225376fe5b69d16fd7717))

## 0.2.1 - November 9th, 2025
- fix: warn on unsupported difficulties

## 0.2.0 - November 9th, 2025
- added 400 easy entries
- added a few scripts to make it easier for me to add entries

## 0.1.0 - November 9th, 2025
- made it work lol
