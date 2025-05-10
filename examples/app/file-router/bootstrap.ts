
/**
 * CAUTION: This file will be re-generated whenever you start the dev server.
 * If you want to edit anything, use a hwr.config.ts file or export your middleware
 */
import { Hono, serveStatic } from "@timberstack/dhp/hono";
import { createRouter } from "@timberstack/dhp";


const app = new Hono();

createRouter(app);
app.use("*", serveStatic({ root: "./public" }));

Deno.serve(app.fetch);