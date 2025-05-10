import { action, route } from "../file-router/route-getters.ts";
import type { Context } from "hono";
import { Layout } from "./.components/layout.tsx";
import { render } from "@timberstack/dhp"

export const name = "index";

export const actions = {
  createUser: (ctx: Context) => {
    return ctx.html(render(<Index user="Working" />));
  },
};

export const Head = () => {
  <>
    <title>Index page</title>
  </>
}

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
