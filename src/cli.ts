/**
 * CLI for working directly with the app. It allows to:
 * - Scaffold the basic files needed for the app to run
 * - Build the vite assets
 * - Start dev server with viteDevMode set to true
 * - Start server with prod config
 * @module
 */
import { build } from "npm:vite@6.3.5";

import { appConfig } from "./index.ts";

import {
  writeBootstrapFile,
  writeConfigFile,
  writeResolverFile,
  writeRouteGettersFile,
} from "./writeFiles.ts";

const availableCommands = ["start", "dev", "build", "init"];
const { cwd } = Deno;
const command = Deno.args.at(0);

if (!command || !availableCommands.includes(command)) {
  console.log(`Available commands are: ${availableCommands.join(" | ")}`);
  Deno.exit();
}

const generateTemplateFiles = (dev = true) => {
  writeRouteGettersFile(appConfig);
  writeResolverFile(appConfig);
  writeBootstrapFile(appConfig, dev);
  writeConfigFile();
};

const commands: { [key: string]: () => void } = {
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
