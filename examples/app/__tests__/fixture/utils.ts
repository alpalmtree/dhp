import { exec } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

export const runCommand = (command: string) => {
  return new Promise((resolve) => {
    exec(command, {}, (_, out) => resolve(out));
  });
};

export const removeIfExists = (path: string) => {
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
};
