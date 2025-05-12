/**
 * CLI for working directly with the app. It allows to:
 * - Scaffold the basic files needed for the app to run
 * - Build the vite assets
 * - Start dev server with viteDevMode set to true
 * - Start server with prod config
 * @module
 */
import { build } from "npm:vite@6.3.5";
import { copy, exists } from "jsr:@std/fs@1.0.x";

import { appConfig } from "./index.ts";

import {
  writeBootstrapFile,
  writeConfigFile,
  writeRouteGettersFile,
} from "./writeFiles.ts";

const baseDenoConfig = {
  tasks: {
    dhp: "echo \"import 'dhp/cli.ts'\" | deno run -A -",
    init: "deno run dhp init",
    dev: "deno run dhp dev",
    build: "deno run dhp build",
    start: "deno run dhp start",
  },
  imports: {
    "dhp/": "https://deno.land/x/dhp/",
    "dhp/jsx-runtime": "https://deno.land/x/dhp/ssx.ts",
  },
  compilerOptions: {
    jsx: "precompile",
    jsxImportSource: "dhp",
  },
};

const availableCommands = ["start", "dev", "build", "init", "scaffold"];
const { cwd } = Deno;
const command = Deno.args.at(0);

if (!command || !availableCommands.includes(command)) {
  console.log(`Available commands are: ${availableCommands.join(" | ")}`);
  Deno.exit();
}

const generateTemplateFiles = (dev = true) => {
  writeRouteGettersFile(appConfig);
  writeBootstrapFile(appConfig, dev);
  writeConfigFile();
};

const copyDir = async (name: string) => {
  if (await exists(`${cwd()}/${name}`)) return;
  await copy(`./src/scaffold_template/${name}`, `${cwd()}/${name}`);
};

const commands: { [key: string]: () => void } = {
  "scaffold": async () => {
    generateTemplateFiles();

    if (!await exists(`${cwd()}/deno.json`)) {
      Deno.writeTextFileSync(
        `${cwd()}/deno.json`,
        JSON.stringify(baseDenoConfig, null, 2),
      );
    }

    await copyDir("resources");
    await copyDir("views");
    await copyDir("public");
  },
  "init": () => {
    generateTemplateFiles();
  },
  "build": async () => {
    generateTemplateFiles();
    if (!appConfig.useVite) return;
    await build(appConfig.vite);
  },
  "start": () => {
    generateTemplateFiles(false);
    const start = new Deno.Command("deno", {
      args: `run -A ${cwd()}${appConfig.routerPath}/bootstrap.ts`
        .split(" "),
    });
    start.spawn();
  },
  "dev": () => {
    generateTemplateFiles();

    const dev = new Deno.Command("deno", {
      args:
        `run -A --watch --watch-exclude=${appConfig.routerPath} ${cwd()}${appConfig.routerPath}/bootstrap.ts`
          .split(" "),
    });

    dev.spawn();
  },
};

commands[command]?.();
