import { RouterContext } from "./deps/rou3/index.mjs";
import {
  addRoute,
  createRouter,
  findAllRoutes,
  findRoute,
} from "./deps/rou3/index.mjs";

class ResponseFactory {
  options: ResponseInit;
  constructor(options: ResponseInit) {
    this.options = options;
  }
  respond(body: BodyInit | Response) {
    return body instanceof Response ? body : new Response(body, this.options);
  }
}

export type AllowedMethods = "GET" | "POST" | "ALL";
export type DHPContext<T = unknown> = {
  req: Request;
  params?: { [key: string]: string };
  additionalContext?: T;
};
export type RouteHandler = (
  ctx: DHPContext,
) => BodyInit | Response | Promise<BodyInit | Response>;

type HookCallback<T> = (ctx: DHPContext) => T;

export type Hook<T = unknown> = (
  callback: HookCallback<T>,
) => void;

type MiddlewareHandler = (
  ctx: DHPContext,
) => void | Response | Promise<Response>;

export type RouterInstance = {
  routesRegistry: RouterContext<{
    payload: {
      handler: RouteHandler;
      middlewares?: MiddlewareHandler | MiddlewareHandler[];
    };
  }>;
  middlewaresRegistry: RouterContext<{
    payload: MiddlewareHandler;
  }>;
  _routes: string[];
  routes: string;
  register: (
    options: {
      path: string;
      methods: string | string[];
      middleware?: MiddlewareHandler | MiddlewareHandler[];
      handler: RouteHandler;
    },
  ) => void;

  fetch: (req: Request) => Response | Promise<Response>;
  middleware: (
    options: {
      pattern: string;
      callback: MiddlewareHandler;
    },
  ) => void;
};

const context = (
  { req, params, additionalContext }: DHPContext,
): DHPContext => {
  return {
    req,
    ...(params ? { params } : {}),
    ...(additionalContext ? { additionalContext } : {}),
  };
};

export const Router: RouterInstance = {
  routesRegistry: createRouter(),
  middlewaresRegistry: createRouter(),

  _routes: [],
  get routes() {
    return Router._routes.join("\n");
  },
  middleware: ({ pattern, callback }) => {
    addRoute(Router.middlewaresRegistry, undefined, pattern, {
      payload: callback,
    });
  },
  register: ({ path, methods, middleware, handler }) => {
    for (const method of (Array.isArray(methods) ? methods : [methods])) {
      addRoute(
        Router.routesRegistry,
        method === "ALL" ? undefined : method,
        path,
        {
          payload: {
            handler,
            middlewares: middleware,
          },
        },
      );
      Router._routes.push(`[${method}] ${path}`);
    }
  },
  fetch: async (req: Request) => {
    const currentContext = context({ req });

    const matchedRoute = findRoute(
      Router.routesRegistry,
      req.method,
      new URL(req.url).pathname,
    );

    const matchingMiddleware = findAllRoutes(
      Router.middlewaresRegistry,
      undefined,
      new URL(req.url).pathname,
    ).map((middleware) => middleware.data.payload);

    for (const middleware of matchingMiddleware) {
      const res = await middleware(currentContext);
      if (res) return res;
    }

    if (!matchedRoute) {
      return new Response("Not found", {
        status: 404,
      });
    }
    const { params, data } = matchedRoute;
    currentContext.params = params;
    const { handler, middlewares } = data.payload;
    const body = await handler(currentContext);
    const headers = new Headers({
      "Content-Type": typeof body === "string" ? "html" : "application/json",
    });

    const currentResponse = new ResponseFactory({ headers });

    if (!middlewares) {
      return currentResponse.respond(
        typeof body === "string" ? body : JSON.stringify(body),
      );
    }

    for (
      const middleware
        of (Array.isArray(middlewares) ? middlewares : [middlewares])
    ) {
      const res = await middleware(currentContext);
      if (res) return res;
    }

    return currentResponse.respond(body) as Response;
  },
};
