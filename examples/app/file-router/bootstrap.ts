
/**
 * CAUTION: This file will be re-generated whenever you start the dev server.
 * If you want to edit anything, use a hwr.config.ts file or export your middleware
 */
import { Hono, serveStatic } from "dhp/hono.ts";
import { createRouter, appConfig } from "dhp/mod.ts";

Object.assign(appConfig, { viteDevMode: true });

const app = new Hono();

export const appRuntime = await createRouter(app);
app.use("*", serveStatic({ root: "./public" }));

if (import.meta.main) {
  Deno.serve(app.fetch);
}