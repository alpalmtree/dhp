import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import type { PathLike } from "node:fs";
import { cwd } from "node:process";
import type { Context, Hono } from "hono";

import {
  routerTemplate,
  routesTypesTemplate,
  routeTemplate,
} from "./templates.ts";

import { Config, getConfig } from "./config.ts";
import { getViteScripts, viteSetup } from "./viteSetup.ts";
import { getPaths, transformPath } from "./paths.ts";

export const appConfig: Config = await getConfig();
if (appConfig.useVite) await viteSetup(appConfig);

// ------ File router --------
const fileRouterPath: PathLike = `${cwd()}${appConfig.routerPath}`;

const getNames = (
  name: "actions" | "namedRoutes",
): { [key: string]: string } => {
  if (existsSync(`${fileRouterPath}/names.json`)) {
    const names = JSON.parse(
      readFileSync(`${fileRouterPath}/names.json`, { encoding: "utf-8" }),
    );
    return names[name];
  }
  return {};
};

const globals = {
  namedRoutes: getNames("namedRoutes"),
  actions: getNames("actions"),
  viteScripts: getViteScripts(),
};

export const namedRoutes: { [key: string]: string } = getNames("namedRoutes");
export const actions: { [key: string]: string } = getNames("actions");
export const viteScripts: { [key: string]: string } = getViteScripts();

const routesStrings: string[] = [];
const routes: ((app: Hono) => void)[] = [];

if (!existsSync(fileRouterPath)) mkdirSync(fileRouterPath);

const paths = getPaths(appConfig);

const populateGlobals = async () => {
  if (paths.length === 0) return;

  for (const path of paths) {
    const exportPath = `${cwd()}${appConfig.viewsDir}/${path}`;
    const exports = await import(exportPath);
    const name = exports.name;
    const exportedActions = exports.actions;

    const route = transformPath(path as string);

    if (name) namedRoutes[name] = route;
    if (exportedActions) {
      Object.keys(exportedActions).forEach((name) =>
        actions[name] = `${route}?action=${name}`
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

    routes.push(appRoute);

    routesStrings.push(
      routeTemplate!.replace("@route", `"${route}"`).replace(
        "@exportPath",
        `"..${appConfig.viewsDir}/${path}"`,
      ),
    );
  }
};

const writeFiles = (file: "types" | "routes" | "all"): void => {
  const files = {
    "types": () => {
      const namedRoutesTypesFile = routesTypesTemplate.replace(
        "@routeTypes",
        Object.keys(namedRoutes).map((name, index) =>
          index === 0 ? `"${name}"` : `| "${name}"`
        ).join(" "),
      ).replace(
        "@actionTypes",
        Object.keys(actions).map((name, index) =>
          index === 0 ? `"${name}"` : `| "${name}"`
        ).join(" "),
      );

      writeFileSync(
        `${fileRouterPath}/routes.d.ts`,
        namedRoutesTypesFile,
      );
    },

    "routes": () => {
      const writeTemplate = routerTemplate
        .replace(
          "@routes",
          routesStrings.join("\n"),
        );

      writeFileSync(`${fileRouterPath}/router.js`, writeTemplate);
      writeFileSync(
        `${fileRouterPath}/names.json`,
        JSON.stringify({
          actions,
          namedRoutes,
        }),
      );
    },

    "all": () => {
      files.types();
      files.routes();
    },
  };
  files[file]?.();
};

const devRoutes = async (app: Hono) => {
  await populateGlobals();
  writeFiles("types");
  routes.forEach((cb) => cb(app));
};

export const generateRouteFiles = async () => {
  await populateGlobals();
  writeFiles("all");
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

export { ViteHead } from "./ViteHead.tsx";
