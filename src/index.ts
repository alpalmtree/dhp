import { existsSync, mkdirSync } from "node:fs";

import type { PathLike } from "node:fs";
import { cwd } from "node:process";
import type { Hono } from "hono";

import { Config, getConfig } from "./config.ts";
import { viteSetup } from "./viteSetup.ts";
import { getGlobalVariables, populateGlobals } from "./appGlobals.ts";
import { writeRoutesFile, writeTypesFiles } from "./writeFiles.ts";

export const appConfig: Config = await getConfig();
if (appConfig.useVite) await viteSetup(appConfig);

const fileRouterPath: PathLike = `${cwd()}${appConfig.routerPath}`;

export const appGlobals = getGlobalVariables(
  appConfig,
);

if (!existsSync(fileRouterPath)) mkdirSync(fileRouterPath);

const devRoutes = async (app: Hono) => {
  const { routes } = await populateGlobals({
    appConfig,
    buildMode: false,
    appGlobalsInstance: appGlobals,
  });

  writeTypesFiles(appGlobals, appConfig);
  routes.forEach((cb) => cb(app));
};
console.log("from refactor");

export const generateRouteFiles = async () => {
  const { routesStrings } = await populateGlobals({
    appConfig,
    buildMode: true,
    appGlobalsInstance: appGlobals,
  });

  writeRoutesFile(appGlobals, appConfig, routesStrings);
  writeTypesFiles(appGlobals, appConfig);
};

export const createRouter = async (
  app: Hono,
): Promise<void> => {
  if (appConfig.precompile) {
    const { webRouter } = await import(`${fileRouterPath}/router.js`);
    webRouter(app);
    return;
  }
  await devRoutes(app);
};

export const { namedRoutes, actions, viteScripts } = appGlobals;
export { ViteHead } from "./ViteHead.tsx";
export type { Config };
