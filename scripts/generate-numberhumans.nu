#!/usr/bin/env nu
let rarities: list<string> = []

let names: list<string> = []

let hp: list<int> = []

let atk: list<int> = []

let abilities: list<string> = [] | each { str kebab-case }

def map_humans [elem] {
  let uuid = random uuid
  let rarity = ($rarities | get $elem.index | str downcase)
  let file = $uuid + ".webp"
  return {
    uuid: $uuid,
    name: $elem.item,
    rarity: $rarity,
    hashedName: ($elem.item | hash blake2b-512),
    image: ("numbers/humans" | path join $rarity | path join $file)
    baseHP: ($hp | get $elem.index),
    baskATK: ($atk | get $elem.index),
    ability: ($abilities | get $elem.index)
  }
}

let store = $names | enumerate | each { map_humans $in }

$store | each { |elem| cp (echo "numbers/humans/" | path join ($elem.name + ".webp")) $elem.image}

$store | to json | save numberhumans.json
