import { existsSync, readFileSync } from "node:fs";
import type { Context, Hono } from "./vendor/hono.ts";

const { cwd } = Deno;

import type { Config } from "./config.ts";
import { getViteScripts } from "./viteSetup.ts";
import { getPaths, transformPath } from "./paths.ts";
import { routeTemplate } from "./templates.ts";

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

export const getGlobalVariables = (appConfig: Config) => {
  const fileRouterPath: string = `${cwd()}${appConfig.routerPath}`;

  return {
    namedRoutes: getNames("namedRoutes", fileRouterPath),
    actions: getNames("actions", fileRouterPath),
    viteScripts: getViteScripts(),
  };
};

export type AppGlobals = ReturnType<typeof getGlobalVariables>;

type PopulateGlobalsProps = {
  appConfig: Config;
  buildMode: boolean;
  appGlobalsInstance: ReturnType<typeof getGlobalVariables>;
};

type RoutesDict = { routesStrings: string[]; routes: ((app: Hono) => void)[] };

export const populateGlobals = async (
  { buildMode = false, appConfig, appGlobalsInstance }: PopulateGlobalsProps,
): Promise<RoutesDict> => {
  const routes: RoutesDict = {
    routes: [],
    routesStrings: [],
  };

  const paths = getPaths(appConfig);
  if (paths.length === 0) return routes;

  for (const path of paths) {
    const exportPath = `${cwd()}${appConfig.viewsDir}/${path}`;
    const exports = await import(exportPath);
    const name = exports.name;
    const exportedActions = exports.actions;

    const route = transformPath(path as string);

    if (name) appGlobalsInstance.namedRoutes[name] = route;
    if (exportedActions) {
      Object.keys(exportedActions).forEach((name) =>
        appGlobalsInstance.actions[name] = `${route}?action=${name}`
      );
    }

    const appRoute = (app: Hono) => {
      app.on(["GET", "POST"], route, async (ctx: Context) => {
        const exports = await import(exportPath);
        const defaultExport = exports.default;
        const actions = exports.actions;

        const { action } = ctx.req.query();

        if (actions && action) {
          return actions[action]?.(ctx);
        }

        if (ctx.req.method === "GET") {
          return ctx.html(defaultExport?.(ctx));
        }
      });
    };

    buildMode
      ? routes.routesStrings.push(
        routeTemplate!.replace("@route", `"${route}"`).replace(
          "@exportPath",
          `"..${appConfig.viewsDir}/${path}"`,
        ),
      )
      : routes.routes.push(appRoute);
  }

  return routes;
};
