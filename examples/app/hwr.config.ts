import { Config } from "@timberstack/hwr";

/**
 * This file will only be generated only if it doesn't exists.
 * It is an exact copy of the default config used by HWR.
 * Feel free to remove the options that you don't need.
 */

export default {
  // Folder to be used as root for the router
  viewsDir: "/views",
  // Folder from where to serve public assets. It will also be the outDir for vite
  publicDir: "/public",
  // Serve the routes directly from your root folder by default. Change it to true if you want to use the generated router file instead.
  precompile: false,
  // Folder where the generated files will live
  routerPath: "/file-router",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources/entrypoints",
} satisfies Config;
