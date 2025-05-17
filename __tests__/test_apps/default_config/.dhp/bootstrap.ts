import { createRouter } from "dhp/mod.ts";

export const appRuntime = await createRouter({
  resolver: (path) => import(path),
  devMode: false,
  serveStatic: true,
});