import { existsSync, readFileSync } from "node:fs";
import type { Context, Hono } from "./vendor/hono.ts";

const { cwd } = Deno;

import type { Config } from "./config.ts";
import { getViteScripts } from "./viteSetup.ts";
import { getPaths, transformPath } from "./paths.ts";

const getNames = (
  name: "actions" | "namedRoutes",
  fileRouterPath: string,
): { [key: string]: string } => {
  if (existsSync(`${fileRouterPath}/names.json`)) {
    const names = JSON.parse(
      readFileSync(`${fileRouterPath}/names.json`, { encoding: "utf-8" }),
    );
    return names[name];
  }
  return {};
};

export type AppGlobals = {
  namedRoutes: {
    [key: string]: string;
  };
  actions: {
    [key: string]: string;
  };
  viteScripts: {
    [key: string]: string;
  };
};

export const getGlobalVariables = (appConfig: Config): AppGlobals => {
  const fileRouterPath: string = `${cwd()}${appConfig.routerPath}`;

  return {
    namedRoutes: getNames("namedRoutes", fileRouterPath),
    actions: getNames("actions", fileRouterPath),
    viteScripts: getViteScripts(),
  };
};

type Routes = ((app: Hono) => void)[];
/**
 * Type for the function that will be used in your app's
 * entrypoint for resolving dynamic imports. Currently,
 * JSR doesn't allow dynamically importing from your
 * project's files.
 */
export type Resolver<T> = (path: string) => Promise<T>;

/**
 * Expected exported variables from your routes.
 */
export type RouteImport = {
  default: (ctx?: Context) => string;
  name: string;
  actions: { [key: string]: <T>(ctx?: Context) => T };
};

type PopulateGlobalsProps = {
  appConfig: Config;
  appGlobalsInstance: ReturnType<typeof getGlobalVariables>;
  resolver: Resolver<RouteImport>;
};

export const populateGlobals = async (
  { appConfig, appGlobalsInstance, resolver }: PopulateGlobalsProps,
): Promise<Routes> => {
  const routes: Routes = [];

  const paths = getPaths(appConfig);
  if (paths.length === 0) return routes;

  for (const path of paths) {
    const exportPath = `${cwd()}${appConfig.viewsDir}/${path}`;
    const exports = await resolver(exportPath);
    const name = exports.name;
    const exportedActions = exports.actions;
    const renderer = exports.default;

    const route = transformPath(path as string);

    if (name) appGlobalsInstance.namedRoutes[name] = route;
    if (exportedActions) {
      Object.keys(exportedActions).forEach((name) =>
        appGlobalsInstance.actions[name] = `${route}?action=${name}`
      );
    }

    const appRoute = (app: Hono) => {
      app.on(["GET", "POST"], route, async (ctx: Context) => {
        await Promise.resolve();
        const actions = exportedActions;
        const { action } = ctx.req.query();

        if (actions && action) {
          return actions[action]?.(ctx);
        }

        if (ctx.req.method === "GET") {
          return ctx.html(renderer?.(ctx));
        }
      });
    };

    routes.push(appRoute);
  }

  return routes;
};
