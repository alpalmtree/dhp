# Deno Hypertext Preprocessor (DHP)

> [!NOTE]
> This package is meant to be used with Deno.

Plain, simple server side rendering using JSX as templating language. It uses
Hono under the hood, so anything compatible with Hono should be compatible with
DHP. It has an optional integration with Vite for handling JS and CSS files.

I developed this primarily for testing and better playing with the rest of the
timberstack packages. I saw, however, a great potential to this, so I've decided
to open source it. As you may imagine, this comes with no frontend framework
integration. It's just like a vanilla PHP project but on steroids.

It assumes 0 config from your side. It does, however, create a `dhp.config.ts`
file in the root of your project for exposing the most useful config options,
just in case you need to tweak anything.

## Getting started

If you're starting from a blank project, you can run the following command
_inside your desired root folder_:

```bash
deno run -A https://deno.land/x/dhp@v0.0.15/scaffold.ts
```

This will scaffold the basic config and files for getting you started. It will
create the following file structure:

```bash
├── deno.json
├── public
├── resources
│   └── example.js
└── views
    └── index.tsx
```

And a `deno.json` looking like this:

```json
{
  "tasks": {
    "dhp": "echo \"import 'dhp/cli.ts'\" | deno run -A -",
    "init": "deno run dhp init",
    "dev": "deno run dhp dev",
    "build": "deno run dhp build",
    "start": "deno run dhp start"
  },
  "imports": {
    "dhp/": "https://deno.land/x/dhp@v0.0.15/",
    "dhp/jsx-runtime": "https://deno.land/x/dhp@v0.0.15/ssx.ts"
  },
  "nodeModulesDir": "auto",
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "dhp",
    "lib": [
      "deno.window",
      "dom"
    ]
  }
}
```

You can now start enjoying the simplicity of rendering your JSX on the server
without build step (except for Vite's assets).

## Commands

```bash
deno run dhp init # generates the base files
deno run dhp dev # initializes the hono server and the vite dev server
deno run dhp build # vite assets
deno run dhp start # runs your application without the vite dev server
```

## Routing

This is how the routing works. Say you have this structure in your `/views`
directory:

```bash
views
    ├── [all].tsx # /* -> catch all routes in the web router
    ├── about.tsx # /about
    ├── index.tsx # /
    └── nested
        ├── [all].tsx # /nested/*
        ├── $greeting.tsx # /nested/:greeting
        ├── $username
        │   └── user.tsx # /nested/:username/user
        ├── contact.tsx # /nested/contact
        └── index.tsx # /nested
```

## File router folder

Under the hood, we are creating a folder in the root of your project called
`/file-router`. You shall **not** touch anything inside it, since everything
inside is auto-generated. The most relevant files are:

```bash
file-router
   ├── bootstrap.ts # Entry point of your application. After registering your routes, we also register an endpoint pointing at the public folder
   ├── route-getters.ts # We export two functions from here: route and action. More on those below
   └── routes.d.ts # Type definitions for your named routes and actions
```

## Anatomy of a file

```tsx
import type { Context } from "dhp/hono.ts";

// it includes the exported ViteHead component. No magic here, just create and use it.
import { Layout } from "./_components/layout.tsx";

// this name will be available for you to access the route without having to worry about the folder structure
export const name = "index";

// actions are functions called only via POST and GET methods. You can use the action helper to get intellisense.
// It would be equivalent to making a request to the current route with a ?action=actionName param.
export const actions = {
  createUser: (ctx: Context) => {
    return ctx.html(<Index user="Working" />);
  },
};

// Your JSX must be the default export
export default function Index({ user = "" }) {
  return <h1>Hello from Home page</h1>;
}
```

## Utils

### `route` and `action`

Remember the `route-getters` file is auto-generated. you should run `hwr init`
for it to not error. alternatively, when running the dev server it will also
generate it. The reason fot that is so we can get a good intellisense based on
the dynamically generated types.

```tsx
import { action, route } from "../file-router/route-getters.ts";

export default function () {
  return (
    <h1>
      <a href={route("about")}>About page at route /about</a>{" "}
      <a href={route("dynamic", { username: "jane" })}>
        Dynamic route at route /nested/:username/user
      </a>{" "}
      <form method="POST" action={action("createUser")}>
        {/* post request to /user?action=createUser */}
      </form>
    </h1>
  );
}
```

## Components

### `ViteHead`

```tsx
import { ViteHead } from "dhp/vite.ts";

<head>
  {/* the script name must be relative to your specified resources dir path. By default, "/resources/entrypoints/" */}
  <ViteHead script="script.js" />
</head>;
```

## Config

When first running the project, you'll have a file called `dhp.config.ts` in
your project's root. It ships with the following defaults (code copied from
source code):

```ts
const defaultConfig: Config = {
  // Folder to be used as root for the router
  viewsDir: "/views",
  // Folder from where to serve public assets. It will also be the outDir for vite
  publicDir: "/public",
  // Folder where the generated files will live
  routerPath: "/file-router",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources",
  // Set it to false for production. Don't forget to run build first!
  viteDevMode: true,
  // It accepts a vite UserConfig like object. Under the hood, we are creating our own for the build, but just in case you need to add plugins and stuff.
  vite: {},
};
```
