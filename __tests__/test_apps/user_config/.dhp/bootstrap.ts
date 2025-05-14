import { Hono } from "dhp/hono.ts";
import { createRouter } from "dhp/mod.ts";

const app = new Hono();

export const appRuntime = await createRouter(app, {
  resolver: (path) => import(path),
  devMode: false,
});