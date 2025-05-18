import { type DHPContext, Router } from "./router.ts";

const { cwd } = Deno;

import type { Config } from "./config.ts";
import { getViteScripts } from "./viteSetup.ts";
import { getPaths, transformPath } from "./paths.ts";

export type Resolver = (path: string) => Promise<RouteImport>;

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

export const getGlobalVariables = (): AppGlobals => {
  return {
    namedRoutes: {},
    actions: {},
    viteScripts: getViteScripts(),
  };
};

/**
 * Expected exported variables from your routes.
 */
export type RouteImport = {
  default: (props: { ctx?: DHPContext }) => string;
  name: string;
  actions: { [key: string]: <T>(ctx?: DHPContext) => T };
};

type PopulateGlobalsProps = {
  appConfig: Config;
  appGlobalsInstance: AppGlobals;
  resolver: Resolver;
};

export const populateGlobals = async (
  { appConfig, appGlobalsInstance, resolver }: PopulateGlobalsProps,
): Promise<void> => {
  const paths = await getPaths(appConfig);

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

    Router.register({
      path: route,
      methods: ["GET", "POST"],
      handler: async (ctx) => {
        const actions = exportedActions;
        const action = new URL(ctx.req.url).searchParams.get("action");

        if (actions && action) {
          const res = await actions[action]?.(ctx);
          if (res === undefined) {
            return new Response("Not found", { status: 404 });
          }
          // Identify SSX function element
          if ("type" in (res as object) && "props" in (res as object)) {
            return (res as object).toString() as BodyInit;
          }
          return res as BodyInit;
        }

        if (ctx.req.method === "GET") {
          return renderer?.({ ctx });
        }
        return new Response("Not found", { status: 404 });
      },
    });
  }
};
