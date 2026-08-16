import "server-only";

import argon2 from "argon2";

const argon2Options = {
  type: argon2.argon2id as 2,
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return argon2.hash(password, argon2Options);
}

export function verifyPassword(passwordHash: string, password: string) {
  return argon2.verify(passwordHash, password);
}
