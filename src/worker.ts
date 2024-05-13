/* eslint-disable fp/no-loops, fp/no-mutation, fp/no-mutating-methods, fp/no-let, no-constant-condition */

import { MineConfig, MineResult, createHash, validateHash } from "./common";
import { humanReadableHashrate } from './hashRate';

onmessage = async (event) => {
  const config: MineConfig = event.data;
  grind(config);
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function grind(config: MineConfig) {
  let nonce = config.initialNonce || BigInt(0);
  let lastTime = new Date().getTime();

  while (true) {
    const hash = createHash(config.currentHash, config.signer, nonce);
    if (validateHash(hash, config.difficulty)) {
      const res: MineResult = {
        currentHash: config.currentHash,
        proof: hash,
        nonce,
      };
      postMessage(res);
      break;
    } else {
      if (nonce % BigInt(1_000_000) == BigInt(0)) {
        const now = new Date().getTime();
        const hashRate = Math.floor(1_000_000 / ((now - lastTime) / 1000));
        lastTime = now;
  
        console.log("[Miner]: hash rate:", humanReadableHashrate(hashRate))

        postMessage({ checkpoint: nonce, currentHash: config.currentHash });
      }

      nonce++;
    }
  }
}
