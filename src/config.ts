import { existsSync, writeFileSync } from "node:fs";

import type { UserConfig } from "npm:vite@6.3.5";

import { defaultConfigTemplate } from "./templates.ts";
import type { Resolver } from "./appGlobals.ts";
const { cwd } = Deno;

/**
 * Accepted parameters for configuring your app.
 */
export type Config = {
  viewsDir?: string;
  routesPrefix?: string;
  publicDir?: string;
  resourcesPath?: string;
  viteDevMode?: boolean;
  useVite?: boolean;
  vite?: UserConfig;
};

const defaultConfig: Config = {
  // Folder to be used as root for the router
  viewsDir: "/views",
  // Folder from where to serve public assets. It will also be the outDir for vite
  publicDir: "/public",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources",
  // Set it to false for production. Needs build
  viteDevMode: true,
  vite: {},
};

/**
 * Function for overwriting the default configuration.
 * @returns
 */
export const getConfig = async (
  resolver: Resolver<Config>,
): Promise<Config> => {
  const inner = structuredClone(defaultConfig);

  if (!existsSync(`${cwd()}/dhp.config.ts`)) {
    writeFileSync(`${cwd()}/dhp.config.ts`, defaultConfigTemplate);
  }

  try {
    const { default: userConfig } = await resolver(
      `${cwd()}/dhp.config.ts`,
    ) as { default: Config };
    Object.assign(inner, userConfig);
  } catch (_) { /** */ }
  return inner;
};
