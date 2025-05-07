import { cwd } from "node:process";
import { existsSync, readFileSync } from "node:fs";
import { Config } from "./config.ts";

export const viteSetup = async (appConfig: Config) => {
  const { default: BetterManifest } = await import(
    "@timberstack/vite-plugin-better-manifest"
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
