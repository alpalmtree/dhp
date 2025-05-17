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
import { Router } from "./router.ts";
import { serveDir } from "./deps/std/http_file-server.js";

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
  resolver: Resolver,
): Promise<void> => {
  await fs.ensureDir(`${Deno.cwd()}/.dhp`);
  appGlobals = getGlobalVariables();

  if (appConfig.useVite) await viteSetup(appConfig);

  await populateGlobals({
    appConfig,
    appGlobalsInstance: appGlobals,
    resolver: resolver as Resolver,
  });

  writeTypesFiles(appGlobals);
};

export type StartupConfiguration = {
  resolver: Resolver;
  devMode: boolean;
  config?: () => Promise<Config>;
  serveStatic: boolean;
};

const startServer = (config: Config, serveStatic: boolean) =>
(
  options?:
    | Deno.ServeTcpOptions
    | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem),
) => {
  serveStatic
    ? Deno.serve(options ?? {}, async (req) => {
      const response = await Router.fetch(req);
      if (response.status === 404) {
        return serveDir(req, {
          fsRoot: config.publicDir?.slice(1) ?? "public",
          quiet: true,
        });
      }
      return response;
    })
    : Deno.serve(Router.fetch);
};

/**
 * Function accepting a Hono app instance for initializing
 * the file-based web router. It returns the runtime config
 * generated after the creation of the router.
 * @param startupConfiguration Startup config
 * @returns
 */
export const createRouter = async (
  { resolver, devMode, serveStatic }: StartupConfiguration,
): Promise<{
  appConfig: Config;
  appGlobals: AppGlobals;
  fetch: typeof Router.fetch;
  listen: ReturnType<typeof startServer>;
}> => {
  const projectConfig = await resolver(
    `file://${Deno.cwd()}/dhp.config.ts`,
  ) as { default: Config };

  appConfig = getConfig(projectConfig.default);

  await main(resolver);
  appConfig.viteDevMode = devMode;

  if (appConfig.useVite && appConfig.viteDevMode) {
    await viteDevServer(appConfig);
  }

  const listen = startServer(appConfig, serveStatic);

  return {
    appConfig,
    appGlobals,
    fetch: Router.fetch,
    listen,
  };
};

export type { Config, Resolver, RouteImport };
export { getConfig };
