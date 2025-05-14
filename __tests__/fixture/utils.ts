import { exec } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

export const rootDir = Deno.cwd();
export const testsPath = `${rootDir}/__tests__/test_apps/`;

export const runCommand = (command: string) => {
  return new Promise((resolve) => {
    exec(command, {}, (_, out) => resolve(out));
  });
};

export const createProcess = (command: string) => {
  const args = command.split(" ");

  return new Deno.Command(args.at(0)!, {
    args: args!.slice(1),
  });
};

export const removeIfExists = (path: string) => {
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
};

export const changeDir = (
  appFolder: string | "root",
  { cleanup }: { cleanup?: boolean } = { cleanup: false },
) => {
  if (cleanup) {
    [`${Deno.cwd()}/dhp.config.ts`, `${Deno.cwd()}/.dhp`].forEach(
      removeIfExists,
    );
  }
  appFolder === "root"
    ? Deno.chdir(rootDir)
    : Deno.chdir(`${testsPath}${appFolder}`);
};
