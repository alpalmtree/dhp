import { type DHPContext, Router } from "#src/router.ts";
import { expect } from "@std/expect/expect";

const dummyUrl = (path: string) => `http://localhost:8000${path}`;

type Vars = {
  hello: string;
};

Router.middleware({
  pattern: "**",
  callback: (ctx: DHPContext<Vars>) => {
    ctx.vars.hello = "world";
  },
});

Router.register({
  path: "/",
  methods: ["GET"],
  handler: (ctx: DHPContext<Vars>) => {
    console.log(ctx.vars.hello);
    return "Hello world!";
  },
});

Deno.test("Handle method should return a response", async (t) => {
  await t.step("Should work with registered paths", async () => {
    const res = await Router.handle(
      new Request(dummyUrl("/"), { headers: { method: "GET" } }),
    );
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
  });

  await t.step("Should work with non-registered paths", async () => {
    const res = await Router.handle(
      new Request(dummyUrl("/do-not-exist"), { headers: { method: "GET" } }),
    );
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(404);
  });
});
