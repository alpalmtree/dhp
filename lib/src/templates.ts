export const defaultConfigTemplate = `
/**
 * This file will only be generated only if it doesn't exists.
 * It is an exact copy of the default config used by HWR.
 * Feel free to remove the options that you don't need.
*/
import { Config } from "@timberstack/dhp";

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

export const routerTemplate = `
/**
 * CAUTION: This file is auto generated. Do not modify it
 * as it will be re-written with every file change.
 */

export const webRouter = (app) => {
@routes
};`
  .trimStart();

export const routeTemplate = `
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
});`
  .trimStart();
