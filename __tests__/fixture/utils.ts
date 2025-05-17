import { existsSync } from "@std/fs/exists";
import { exec } from "node:child_process";
import { rmSync } from "node:fs";

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
) => {
  appFolder === "root"
    ? Deno.chdir(rootDir)
    : Deno.chdir(`${testsPath}${appFolder}`);
};

const testBootstrapTemplate = `
import { createRouter } from "dhp/mod.ts";

export const appRuntime = await createRouter({
  resolver: (path) => import(path),
  devMode: false,
  serveStatic: true,
});`.trimStart();

export const patchScaffold = () => {
  if (existsSync(`${Deno.cwd()}/deno.json`)) {
    Deno.removeSync(`${Deno.cwd()}/deno.json`);
  }
  if (existsSync(`${Deno.cwd()}/.dhp`)) {
    Deno.writeTextFileSync(
      `${Deno.cwd()}/.dhp/bootstrap.ts`,
      testBootstrapTemplate,
    );
  }
};
