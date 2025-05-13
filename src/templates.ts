export const defaultConfigTemplate = `
/**
 * This file will only be generated only if it doesn't exists.
 * It is an exact copy of the default config used by HWR.
 * Feel free to remove the options that you don't need.
*/
import type { Config } from "dhp/mod.ts";

export default {
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
  type RouteImport,
} from "dhp/mod.ts";

export const resolver: Resolver<RouteImport> = async (
  path: string,
) => {
  return await import(path);
};
`.trimStart();
export const bootstrapTemplate = `
import { Hono, serveStatic } from "dhp/hono.ts";
import { appConfig, createRouter } from "dhp/mod.ts";
import { resolver } from "./resolver.ts";
import { build } from "npm:vite@6.3.5";

const command = Deno.args.at(0);

const app = new Hono();

export const appRuntime = await createRouter({
  app: app,
  resolver: resolver,
  devMode: command !== "start",
});

app.use("*", serveStatic({ root: "./public" }));

if (import.meta.main) {
  if (command === "build") {
    await build(appConfig.vite);
    Deno.exit();
  }

  Deno.serve(app.fetch);
}`;

export const viteBuildTemplate = `
import { Hono } from "dhp/hono.ts";
import { createRouter, appConfig } from "dhp/mod.ts";
import { resolver } from "./resolver.ts;
import { build } from "npm:vite@6.3.5";

export const appRuntime = await createRouter(new Hono(), resolver);

if (import.meta.main) {
  await build(appConfig.vite)
}`;

export const routeGettersTemplate = `
import { appGlobals } from 'dhp/mod.ts'
import type { Actions, Routes } from './routes.d.ts';

export const route = (routeName: Routes, params = {}): string => {
  let foundRoute = appGlobals.namedRoutes[routeName];

  Object.entries(params).forEach(([key, value]) => {
    foundRoute = foundRoute.replace(":" + key, value as string);
  });
  return foundRoute ?? 'not-found';
};

export const action = (
  actionName: Actions,
  params = {},
): string => {
  let foundAction = appGlobals.actions[actionName];

  Object.entries(params).forEach(([key, value]) => {
    foundAction = foundAction.replace(":" + key, value as string);
  });
  return foundAction ?? 'not-found';
};`;
