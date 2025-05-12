import { build, createServer } from "npm:vite@6.3.5";

import { cwd } from "node:process";
import { existsSync, readFileSync } from "node:fs";
import type { Config } from "./config.ts";

export const viteSetup = async (appConfig: Config) => {
  const { default: BetterManifest } = await import(
    "npm:@timberstack/vite-plugin-better-manifest@0.x"
  );

  const manifestPlugin = () =>
    BetterManifest({
      resourcesDir: appConfig.resourcesPath,
      publicDir: appConfig.publicDir,
    });

  const userPlugins = appConfig.vite?.plugins;
  userPlugins ? userPlugins.push(manifestPlugin()) : appConfig.vite!.plugins = [
    manifestPlugin(),
  ];
};

export const getViteScripts = () => {
  if (existsSync(`${cwd()}/.vite/better-manifest.json`)) {
    const scripts = JSON.parse(
      readFileSync(`${cwd()}/.vite/better-manifest.json`, {
        encoding: "utf-8",
      }),
    );
    return scripts;
  }
  return {};
};

export const viteDevServer = async (appConfig: Config) => {
  if (!appConfig.useVite) return;

  const server = await createServer(appConfig.vite);
  await server.listen();

  server.printUrls();
  server.bindCLIShortcuts({ print: true });
};

export const viteBuild = async (appConfig: Config) => {
  if (!appConfig.useVite) return;
  await build(appConfig.vite);
};
