import type { Config } from "./index.ts";

export const defaultConfigTemplate = `
/**
 * This file will only be generated only if it doesn't exists.
 * It is an exact copy of the default config used by HWR.
 * Feel free to remove the options that you don't need.
*/
import type { Config } from "@timberstack/dhp/";

export default {
  // Folder to be used as root for the router
  viewsDir: "/views",
  // Folder from where to serve public assets. It will also be the outDir for vite
  publicDir: "/public",
  // Folder where the generated files will live
  routerPath: "/file-router",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources",
  // Set it to false for production. Needs build
  viteDevMode: true,
} satisfies Config;`
  .trimStart();

export const routesTypesTemplate = `
/**
 * CAUTION: This file is auto generated. Do not modify it
 * as it will be re-written with every file change.
 */

export type Routes = @routeTypes
export type Actions = @actionTypes`
  .trimStart();

export const resolverTemplate = `
import {
  type Resolver,
  RouteImport,
} from "@timberstack/dhp/";

export const resolver: Resolver<RouteImport> = async (
  path: string,
) => {
  return await import(path);
};
`.trimStart();

export const bootstrapTemplate = (appConfig: Config, dev: boolean) => `
/**
 * CAUTION: This file will be re-generated whenever you start the dev server.
 * If you want to edit anything, use a hwr.config.ts file or export your middleware
 */
import { Hono, serveStatic } from "@timberstack/dhp/hono";
import { createRouter, appConfig } from "@timberstack/dhp/";
import { resolver } from "./resolver.ts";
const userConfig = (await import(\`\${Deno.cwd()}/dhp.config.ts\`)).default;
Object.assign(appConfig, ${
  dev ? "userConfig" : "{... userConfig, viteDevMode: false}"
});

const app = new Hono();

export const appRuntime = await createRouter(app, resolver);
app.use("*", serveStatic({ root: ".${appConfig.publicDir}" }));

if (import.meta.main) {
  Deno.serve(app.fetch);
}`;

export const routeGettersTemplate = `
import { namedRoutes, actions } from '@timberstack/dhp/'
import type { Actions, Routes } from './routes.d.ts';

export const route = (routeName: Routes, params = {}): string => {
  let foundRoute = namedRoutes[routeName];

  Object.entries(params).forEach(([key, value]) => {
    foundRoute = foundRoute.replace(":" + key, value as string);
  });
  return foundRoute ?? 'not-found';
};

export const action = (
  actionName: Actions,
  params = {},
): string => {
  let foundAction = actions[actionName];

  Object.entries(params).forEach(([key, value]) => {
    foundAction = foundAction.replace(":" + key, value as string);
  });
  return foundAction ?? 'not-found';
};`;
