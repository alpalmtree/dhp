/**
 * CLI for working directly with the app. It allows to:
 * - Scaffold the basic files needed for the app to run
 * - Build the vite assets
 * - Start dev server with viteDevMode set to true
 * - Start server with prod config
 * @module
 */

import { ensureDir } from "./deps/std.ts";

import { generateTemplateFiles } from "./writeFiles.ts";

const availableCommands = ["start", "dev", "build", "init"];
const { cwd } = Deno;
const command = Deno.args.at(0);

if (!command || !availableCommands.includes(command)) {
  console.log(`Available commands are: ${availableCommands.join(" | ")}`);
  Deno.exit();
}
await ensureDir(`${Deno.cwd()}/.dhp`);

const commands: { [key: string]: () => void } = {
  "init": () => {
    generateTemplateFiles();
  },
  "build": () => {
    (new Deno.Command("deno", {
      args: [
        "eval",
        "--ext=ts",
        `import App from './.dhp/bootstrap.ts'; import { build } from 'dhp/vite.ts'; await build(App.appConfig.vite); Deno.exit()`,
      ],
    })).spawn();
  },
  "start": () => {
    const start = new Deno.Command("deno", {
      args: `run -A ${cwd()}/.dhp/bootstrap.ts start`
        .split(" "),
    });
    start.spawn();
  },
  "dev": () => {
    const dev = new Deno.Command("deno", {
      args: `run -A --watch --watch-exclude=/.dhp ${cwd()}/.dhp/bootstrap.ts`
        .split(" "),
    });

    dev.spawn();
  },
};

commands[command]?.();
