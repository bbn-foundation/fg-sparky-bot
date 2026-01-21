#!/usr/bin/env nu
#* You need [nu](https://nushell.sh/) to run this
let names = [
  # Paste the names of abilties here
]

let descriptions = [
  # Paste descriptions here
]

let ids = $names | str kebab-case

$ids | to nuon
