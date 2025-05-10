import { existsSync, writeFileSync } from "node:fs";
import { cwd } from "node:process";

import type { UserConfig } from "vite";

import { defaultConfigTemplate } from "./templates.ts";

export type Config = {
  viewsDir?: string;
  routesPrefix?: string;
  publicDir?: string;
  precompile?: boolean;
  routerPath?: string;
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
  // Change it to true if you want to use the generated router file. Needs build
  precompile: false,
  // Folder where the generated files will live
  routerPath: "/file-router",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources",
  // Set it to false for production. Needs build
  viteDevMode: true,
  vite: {},
};

export const getConfig = async () => {
  const inner = structuredClone(defaultConfig);

  if (!existsSync(`${cwd()}/hwr.config.ts`)) {
    writeFileSync(`${cwd()}/hwr.config.ts`, defaultConfigTemplate);
  }

  try {
    const { default: userConfig } = await import(`${cwd()}/hwr.config.ts`);
    Object.assign(inner, userConfig);
  } catch (_) {
    console.log(_);
  }
  return inner;
};
