/**
 * CAUTION: This file will be re-generated whenever you start the dev server.
 * If you want to edit anything, use a hwr.config.ts file or export your middleware
 */
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createRouter } from "@timberstack/hwr";

const app = new Hono();

createRouter(app);
app.use("*", serveStatic({ root: "./public" }));

Deno.serve(app.fetch);
