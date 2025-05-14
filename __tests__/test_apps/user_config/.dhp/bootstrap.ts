
import { Hono, serveStatic } from "dhp/hono.ts";
import { build } from "dhp/vite.ts";
import { appConfig, type Config, createRouter } from "dhp/mod.ts";

const command = Deno.args.at(0);

const app = new Hono();

export const appRuntime = await createRouter(app, {
  resolver: (path) => import(path),
  devMode: command !== "start",
});

app.use("*", serveStatic({ root: "./public" }));

if (import.meta.main) {
  if (command === "build") {
    await build(appConfig.vite);
    Deno.exit();
  }

  Deno.serve(app.fetch);
}