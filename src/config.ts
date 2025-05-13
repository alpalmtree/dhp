import type { UserConfig } from "./deps/vite.ts";

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
export const getConfig = (
  config?: Config,
): Config => {
  const inner = structuredClone(defaultConfig);
  Object.assign(inner, config ?? {});

  return inner;
};
