# Hono Web Router (HWR)
> [!NOTE]
> This package is meant to be used with Deno. If you see the source code, you'll see a lot of apis imported from node. This is because I might give support to node eventually.

Plain, simple server side rendering using JSX as templating language. It uses Hono under the hood, so anything compatible with Hono should be compatible with HWR. It has an optional integration with Vite for handling JS and CSS files.

I developed this primarily for testing and better playing with the rest of the timberstack packages. I saw, however, a great potential to this, so I've decided to open source it. As you may imagine, this comes with no frontend framework integration. It's just like a vanilla PHP project but on steroids.

It assumes 0 config from your side. It does, however, create a `hwr.config.ts` file in the root of your project for exposing the most useful config options, just in case you need to tweak anything.

Given the following structure:

```bash
├── deno.json
├── public
├── resources
│   ├── entrypoints
│   │   └── example.js
│   └── js
└── views
    └── index.tsx
```

And your `deno.json` looking like this:
```json
{
  "tasks": {
    "dev": "hwr dev",
    "start": "hwr start",
    "build": "hwr build",
    "init": "hwr init"
  },
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "hono/jsx"
  },
  "nodeModulesDir": "auto",
  "imports": {
    "@timberstack/hwr": "npm:@timberstack/hwr@0.0.1",
    "hono": "npm:hono@^4.7.8",
    "vite": "npm:vite@^6.3.4"
  }
}
```

You can start enjoying the simplicity of rendering your JSX on the server "without" build step. Well, unless you use vite, in which case you should just run the build command for generating the assets and the manifest.json file.

## Commands
```bash
hwr init # generates the files from where you are exporting types and helpers
hwr dev # initializes the hono server and the vite dev server
hwr build # builds the hardcoded router, vite assets and generates a json file used to load the vite assets based on the manifest.json
hwr start # runs your application in production mode
```

## Routing
This is how the routing works. Say you have this structure in your `/views` directory:
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
Under the hood, we are creating a folder in the root of your project called `/file-router`. You shall **not** touch anything inside it, since everything inside is auto-generated. The most relevant files are:

```bash
file-router
   ├── bootstrap.ts # Entry point of your application. After registering your routes, we also register an endpoint pointing at the public folder
   ├── names.json # Map for populating the named routes and actions when precompile options is set to true
   ├── route-getters.ts # We export two functions from here: route and action. More on those below
   ├── router.js # Hard coded routes for your views directory. Used when precompile is set to true. Useful for mitigating cold starts
   ├── routes.d.ts # Type definitions for your named routes and actions
   └── vite.scripts.json # Generated during vite build. Used by the vite head component to determine the scripts and css to be loaded based on the manifest.json
```

## Anatomy of a file
```tsx
import type { Context } from "hono";

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
  return <h1>Hello from Home page</h1>
}
```

## Utils
### `route` and `action` 
Remember the `route-getters` file is auto-generated. you should run `hwr init` for it to not error. alternatively, when running the dev server it will also generate it. The reason fot that is so we can get a good intellisense based on the dynamically generated types.

```tsx
import { action, route } from "../file-router/route-getters.ts";

export default function() {
    return ( 
        <h1>
            <a href={route("about")}>About page at route /about </a>{" "}
            <a href={route("dynamic", { username: "jane" })}>Dynamic route at route /nested/:username/user </a>{" "}
            <form method="POST" action={action("createUser")}>{/* post request to /user?action=createUser */}</form>
        </h1>
    )
}

```

## Components
### `ViteHead`
```tsx
import { ViteHead } from "@timberstack/hwr";

<head>
    {/* the script name must be relative to your specified resources dir path. By default, "/resources/entrypoints/" */}
    <ViteHead script="script.js" />
</head>
```

## Config
When first running the project, you'll have a file called `hwr.config.ts` in your project's root. It ships with the following defaults (code copied from source code):

```ts
const defaultConfig: Config = {
  // Folder to be used as root for the router
  viewsDir: "/views",
  // Folder from where to serve public assets. It will also be the outDir for vite
  publicDir: "/public",
  // Serve the routes directly from your root folder by default. Change it to true if you want to use the generated router file instead.
  precompile: false,
  // Folder where the generated files will live
  routerPath: "/file-router",
  // You can opt out from vite by setting this to false
  useVite: true,
  // Entry points for vite build
  resourcesPath: "/resources/entrypoints",
  // Set it to false for production. Don't forge to run "hwr build" first!
  viteDevMode: true,
  // It accepts a vite UserConfig like object. Under the hood, we are creating our own for the build, but just in case you need to add plugins and stuff.
  vite: {},
};
```