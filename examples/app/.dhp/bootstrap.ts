import { Hono, serveStatic } from "../../../hono.ts";
import { appConfig, createRouter } from "../../../mod.ts";
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
}
