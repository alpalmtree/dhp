import { appConfig, generateRouteFiles } from "./index.ts";
import { argv, cwd } from "node:process";
import { writeFileSync } from "node:fs";
import { build, createServer, UserConfig } from "vite";

export const viteDevServer = async (config: UserConfig = {}) => {
  const server = await createServer(config);
  await server.listen();

  server.printUrls();
  server.bindCLIShortcuts({ print: true });
};

const availableCommands = ["start", "dev", "build", "init"];

const command = argv.at(2);
if (!command || !availableCommands.includes(command)) {
  console.log(`Available commands are: ${availableCommands.join(" | ")}`);
  Deno.exit();
}

const bootstrapTemplate = () => `
/**
 * CAUTION: This file will be re-generated whenever you start the dev server.
 * If you want to edit anything, use a hwr.config.ts file or export your middleware
 */
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createRouter } from "@timberstack/hwr";


const app = new Hono();

createRouter(app);
app.use("*", serveStatic({ root: ".${appConfig.publicDir}" }));

Deno.serve(app.fetch);`;

const routeGettersTemplate = `
import { namedRoutes, actions } from '@timberstack/hwr'
import type { Actions, Routes } from './routes.d.ts';

export const route = (routeName: Routes, params = {}): string => {
  let foundRoute = namedRoutes[routeName];

  Object.entries(params).forEach(([key, value]) => {
    foundRoute = foundRoute.replace(":" + key, value as string);
  });
  return foundRoute ?? 'not-found';
};

export const action = (
  actionName: Actions,
  params = {},
): string => {
  let foundAction = actions[actionName];

  Object.entries(params).forEach(([key, value]) => {
    foundAction = foundAction.replace(":" + key, value as string);
  });
  return foundAction ?? 'not-found';
};`;

const generateTemplateFiles = () => {
  writeFileSync(
    `${cwd()}${appConfig.routerPath}/route-getters.ts`,
    routeGettersTemplate,
  );
  writeFileSync(
    `${cwd()}${appConfig.routerPath}/bootstrap.ts`,
    bootstrapTemplate(),
  );
};

const commands: { [key: string]: () => void } = {
  "init": () => {
    generateTemplateFiles();
  },
  "build": async () => {
    generateTemplateFiles();
    await generateRouteFiles();
    if (!appConfig.useVite) return;
    await build(appConfig.vite);
  },
  "start": () => {
    const start = new Deno.Command("deno", {
      args: `run -A ${cwd()}${appConfig.routerPath}/bootstrap.ts`
        .split(" "),
    });
    start.spawn();
  },
  "dev": async () => {
    generateTemplateFiles();

    const dev = new Deno.Command("deno", {
      args:
        `run -A --watch --watch-exclude=${appConfig.routerPath} ${cwd()}${appConfig.routerPath}/bootstrap.ts`
          .split(" "),
    });

    dev.spawn();
    if (appConfig.useVite) await viteDevServer(appConfig.vite);
  },
};

commands[command]?.();
