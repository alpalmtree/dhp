/**
 * CAUTION: This file is auto generated. Do not modify it
 * as it will be re-written with every file change.
 */

export const webRouter = (app) => {
  app.on(["GET", "POST"], "/nested/contact", async (ctx) => {
    const exports = await import("../views/nested/contact.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/nested", async (ctx) => {
    const exports = await import("../views/nested/index.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/about", async (ctx) => {
    const exports = await import("../views/about.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/", async (ctx) => {
    const exports = await import("../views/index.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/nested/:greeting", async (ctx) => {
    const exports = await import("../views/nested/$greeting.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/nested/:username/user", async (ctx) => {
    const exports = await import("../views/nested/$username/user.tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/nested/*", async (ctx) => {
    const exports = await import("../views/nested/[all].tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
  app.on(["GET", "POST"], "/*", async (ctx) => {
    const exports = await import("../views/[all].tsx");
    const defaultExport = exports.default;
    const actions = exports.actions;

    const { action } = ctx.req.query();

    if (actions && action) {
      return actions[action]?.(ctx);
    }

    if (ctx.req.method === "GET") {
      return ctx.html(defaultExport?.(ctx));
    }
  });
};
