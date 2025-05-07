import { action, route } from "../file-router/route-getters.ts";
import type { Context } from "hono";
import { Layout } from "./.components/layout.tsx";

export const name = "index";

export const actions = {
  createUser: (ctx: Context) => {
    return ctx.html(<Index user="Working" />);
  },
};

export default function Index({ user = "" }) {
  return (
    <Layout script="/index.js" pageTitle="Home">
      <h1>
        Index page {route("about")} {user}{" "}
        <a href={action("createUser")}>go to action</a>{" "}
        <a href={route("dynamic", { username: "al" })}>Dynamic route</a>
        {" "}
      </h1>
    </Layout>
  );
}
