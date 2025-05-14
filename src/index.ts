import type { Hono } from "./deps/hono.ts";
import { fs } from "./deps/std.ts";

import { type Config, getConfig } from "./config.ts";
import { viteDevServer, viteSetup } from "./viteSetup.ts";
import {
  type AppGlobals,
  getGlobalVariables,
  populateGlobals,
  type Resolver,
  type RouteImport,
} from "./appGlobals.ts";
import { writeTypesFiles } from "./writeFiles.ts";

/**
 * Configuration for your app. It has its default options
 * and will read your local `dhp.config.ts` file in the
 * root of your project.
 */
export let appConfig: Config;

/**
 * Global variables used by the application to work. It includes:
 * - Named routes
 * - Named actions
 * - Vite scripts manifest (for vite production mode)
 */
export let appGlobals: AppGlobals;

const main = async (
  app: Hono,
  resolver: Resolver,
): Promise<void> => {
  await fs.ensureDir(`${Deno.cwd()}/.dhp`);
  appGlobals = getGlobalVariables();

  if (appConfig.useVite) await viteSetup(appConfig);

  const routes = await populateGlobals({
    appConfig,
    appGlobalsInstance: appGlobals,
    resolver: resolver as Resolver,
  });

  writeTypesFiles(appGlobals);
  routes.forEach((cb) => cb(app));
};

export type StartupConfiguration = {
  resolver: Resolver;
  devMode: boolean;
  config?: () => Promise<Config>;
};

/**
 * Function accepting a Hono app instance for initializing
 * the file-based web router. It returns the runtime config
 * generated after the creation of the router.
 * @param app Hono instance
 * @param startupConfiguration Startup config
 * @returns
 */
export const createRouter = async (
  app: Hono,
  { resolver, devMode }: StartupConfiguration,
): Promise<{
  appConfig: Config;
  appGlobals: AppGlobals;
  app: Hono;
}> => {
  const projectConfig = await resolver(
    `file://${Deno.cwd()}/dhp.config.ts`,
  ) as { default: Config };
  appConfig = getConfig(projectConfig.default);
  console.log(appConfig);
  await main(app, resolver);
  appConfig.viteDevMode = devMode;

  if (appConfig.useVite && appConfig.viteDevMode) {
    await viteDevServer(appConfig);
  }

  return {
    appConfig,
    appGlobals,
    app,
  };
};

export type { Config, Resolver, RouteImport };
export { getConfig };
