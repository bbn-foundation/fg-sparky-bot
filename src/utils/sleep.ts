/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
 // why does deno not have a sleep function in the Deno namespace

/**
  * Sleep asynchronously for the amount of milliseconds specified.
  * @param {number} ms Milliseconds to sleep.
  */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleeps synchronously for the amount of milliseconds specified.
 * @param {number} ms Milliseconds to sleep.
 */
export function sleepSync(ms: number): void {
  // bro wants us to use `Atomics` :joy: - https://github.com/denoland/std/issues/2268
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
