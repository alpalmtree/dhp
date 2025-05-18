# Deno Hypertext Preprocessor (DHP)

> [!NOTE]
> This package is meant to be used with Deno.

Plain, simple server side rendering using JSX as templating language. It has an optional integration with Vite for handling JS and CSS files.

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
deno run -A https://deno.land/x/dhp@v0.0.17/scaffold.ts
```

This will scaffold the basic config and files for getting you started. It will
create the following file structure:

```bash
.
├── .dhp # Auto-generated folder with core files. This would be created also when running the dev command
│   ├── bootstrap.ts # File where we create the app instance and entrypoint of dev command. Feel free to modify it!
│   ├── route-getters.ts # Route and action getters for a better intellisense
│   └── routes.d.ts # Auto-generated file. Do not touch!
├── deno.json # Deno config file with base imports and commands
├── dhp.config.ts # File for customizing your app
├── public # Default folder for serving static assets.
├── resources # Entry folder for vite
│   └── index.js
└── views # Your actual router
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
    "dhp/": "https://deno.land/x/dhp@v0.0.17/",
    "dhp/jsx-runtime": "https://deno.land/x/dhp@v0.0.17/ssx.ts"
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
    ├── [all].tsx # /** -> catch all routes in the web router
    ├── about.tsx # /about
    ├── index.tsx # /
    └── nested
        ├── [all].tsx # /nested/**
        ├── $greeting.tsx # /nested/:greeting
        ├── $username
        │   └── user.tsx # /nested/:username/user
        ├── contact.tsx # /nested/contact
        └── index.tsx # /nested
```

> Note: routes will be automatically ordered to respect the correct order. The registry hierarchy is: Static routes > Dynamic routes > Catch all routes

## Anatomy of a file

```tsx
import type { DHPContext } from "dhp/mod.ts";

// No magic here, feel free to create your layout in jsx and use it.
import { Layout } from "./_components/layout.tsx";

// this name will be available for you to access the route without having to worry about the folder structure
export const name = "index";

// actions are functions called only via POST and GET methods. You can use the action helper to get intellisense.
// It would be equivalent to making a request to the current route with a ?action=actionName param.
export const actions = {
  createUser: (ctx: DHPContext) => {
    return <Index ctx={ctx} user="Working" />;
  },
};

type Props = {
  ctx: DHPContext, // will always be passed down
  user?: string
}

// Your JSX must be the default export
export default function Index({ ctx, user = "" }: Props) {
  return <h1>Hello from Home page {user}</h1>;
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
    <>
      <h1>
        <a href={route("about")}>About page at route /about</a>{" "}
        <a href={route("dynamic", { username: "jane" })}>
          Dynamic route at route /nested/:username/user
        </a>{" "}
      </h1>
      <form method="POST" action={action("createUser")}>
        {/* post request to /user?action=createUser */}
      </form>
    </>
  );
}
```

## Components

### `ViteHead`

```tsx
import { ViteHead } from "dhp/vite.ts";

<head>
  {/* the script name must be relative to your specified resources dir path. By default, "/resources" */}
  <ViteHead script="/script.js" />
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
## Acknowledgments 
This library aims at being as close to the standard response-request lifecycle as possible. Besides the Deno standard library, we also use two libraries to make this possible. They are, however, vendored and will not show in the dependencies graph:

- [rou3](https://github.com/h3js/rou3/tree/main): This is the routing library that powers [h3](https://github.com/h3js/h3) and, hence, [nitro](https://github.com/nitrojs/nitro). Its size and simplicity make it perfect for the goals of DHP.
- [@lumeland/ssx](https://github.com/oscarotero/ssx): Super fast and bare-bones JSX renderer created by [Óscar Otero](https://github.com/oscarotero), which also powers the JSX in its amazing project called [Lume](https://github.com/lumeland/lume). Besides, it served as a huge inspiration for how to organize and distribute DHP. Moitas grazas polo teu traballo 🔥

## License
MIT
