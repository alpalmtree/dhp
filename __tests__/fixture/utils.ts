import { exec } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

export const rootDir = Deno.cwd();
const testsPath = `${rootDir}/__tests__/test_apps/`;

export const runCommand = (command: string) => {
  return new Promise((resolve) => {
    exec(command, {}, (_, out) => resolve(out));
  });
};

export const removeIfExists = (path: string) => {
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
};

export const changeDir = (path: string | "root") =>
  path === "root" ? Deno.chdir(rootDir) : Deno.chdir(`${testsPath}${path}`);
