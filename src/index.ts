import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import type { PathLike } from "node:fs";
import { cwd } from "node:process";
import type { Context, Hono } from "hono";
import type { UserConfig } from "vite";
import BetterManifest from "@timberstack/vite-plugin-better-manifest";

const isFile = (path: string) => path.includes(".");

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

const currentDir: string = cwd();

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
};

export const appConfig: Config = defaultConfig;
export const runtimeConfig: Config = {};

const defaultConfigTemplate = `
/**
 * This file will only be generated only if it doesn't exists.
 * It is an exact copy of the default config used by HWR.
 * Feel free to remove the options that you don't need.
*/
import { Config } from "@timberstack/hwr";

export default {
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
} satisfies Config;
`.trimStart();

if (!existsSync(`${currentDir}/hwr.config.ts`)) {
  writeFileSync(`${currentDir}/hwr.config.ts`, defaultConfigTemplate);
}

try {
  const { default: userConfig } = await import(`${currentDir}/hwr.config.ts`);
  Object.assign(appConfig, userConfig);
} catch (_) { /** */ }

appConfig.vite = {
  ...appConfig.vite,
};

appConfig.vite!.plugins = [
  ...appConfig.vite!.plugins ?? [],
  BetterManifest({
    resourcesDir: appConfig.resourcesPath,
    publicDir: appConfig.publicDir,
  }),
];

// ------ File router --------
const fileRouterPath: PathLike = `${currentDir}${appConfig.routerPath}`;

const getNames = (name: "actions" | "namedRoutes") => {
  if (existsSync(`${fileRouterPath}/names.json`)) {
    const names = JSON.parse(
      readFileSync(`${fileRouterPath}/names.json`, { encoding: "utf-8" }),
    );
    return names[name];
  }
  return {};
};

const getViteScripts = () => {
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

export const namedRoutes: { [key: string]: string } = getNames("namedRoutes");
export const actions: { [key: string]: string } = getNames("actions");
export const viteScripts: { [key: string]: string } = getViteScripts();

const routesStrings: string[] = [];
const routes: ((app: Hono) => void)[] = [];

if (!existsSync(fileRouterPath)) mkdirSync(fileRouterPath);

const routesTypesTemplate = `
/**
 * CAUTION: This file is auto generated. Do not modify it
 * as it will be re-written with every file change.
 */

export type Routes = @routeTypes
export type Actions = @actionTypes`;

const routerTemplate = `
/**
 * CAUTION: This file is auto generated. Do not modify it
 * as it will be re-written with every file change.
 */

export const webRouter = (app) => {
@routes
};`;

const routeTemplate = `
app.on(["GET", "POST"], @route, async (ctx) => {
  const exports = await import(@exportPath);
  const defaultExport = exports.default;
  const actions = exports.actions;

  const { action } = ctx.req.query();

  if (actions && action) {
    return actions[action]?.(ctx);
  }

  if (ctx.req.method === "GET") {
    return ctx.html(defaultExport?.(ctx));
  }
});`;

const routerFolderPath: PathLike = `${currentDir}${appConfig.viewsDir}`;
const transformPath = (path: string) => {
  const segments = path.split("/").map((segment: string) =>
    isFile(segment) ? segment.split(".") : segment
  );
  const segmentsToRoute = segments.map((segment: string | string[]) => {
    if (Array.isArray(segment)) {
      return segment.at(0);
    }
    return segment;
  });
  const route = segmentsToRoute.map((segment) => {
    if (segment === "index") return `/`;
    if (segment?.startsWith("$")) return `/${segment.replace("$", ":")}`;
    if (segment === "[all]") return "/*";
    return `/${segment}`;
  }).join("");

  const noBackSlash = (route.length > 1 && route.endsWith("/"))
    ? route.slice(0, -1)
    : route;

  return noBackSlash;
};
const getPaths = () => {
  if (!existsSync(routerFolderPath)) return [];
  const dirs = readdirSync(routerFolderPath, { recursive: true }) as string[];
  const allPaths = dirs
    .toReversed()
    .filter(
      (path) => isFile(path as string) && !path.startsWith("."),
    );

  const { staticPaths, dynamicPaths } = allPaths.reduce(
    (prev, current) => {
      (current.includes("$") || current.includes("[all]"))
        ? prev.dynamicPaths.push(current)
        : prev.staticPaths.push(current);
      return prev;
    },
    { dynamicPaths: [], staticPaths: [] } as {
      dynamicPaths: string[];
      staticPaths: string[];
    },
  );

  const paths = [
    ...staticPaths,
    ...dynamicPaths.sort((a, _b) => {
      if (a.includes("[all]")) return 1;
      return -1;
    }),
  ];
  return paths;
};

const paths = getPaths();

const populateGlobals = async () => {
  if (paths.length === 0) return;

  for (const path of paths) {
    const exportPath = `${currentDir}${appConfig.viewsDir}/${path}`;
    // let exports;
    // try {
    //   exports = await import(exportPath);
    // } catch {
    //   continue;
    // }
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
