import * as tsup from "tsup";

await Deno.remove(`${Deno.cwd()}/lib/dist`, { recursive: true });

await tsup.build({
  entry: [
    `${Deno.cwd()}/lib/src/vendor/preact.ts`,
    `${Deno.cwd()}/lib/src/vendor/hono.ts`,
  ],
  outDir: `${Deno.cwd()}/lib/dist/vendor`,
  tsconfig: `${Deno.cwd()}/scripts/build.tsconfig.json`,
  format: "esm",
  dts: true,
});

await tsup.build({
  entry: [
    `${Deno.cwd()}/lib/src/index.ts`,
    `${Deno.cwd()}/lib/src/cli.ts`,
    `${Deno.cwd()}/lib/src/ViteHead.tsx`,
    `${Deno.cwd()}/lib/src/vendor/hono.ts`,
  ],
  outDir: `${Deno.cwd()}/lib/dist`,
  noExternal: [
    "@timberstack/vite-plugin-better-manifest",
  ],
  external: ["npm:vite"],
  tsconfig: `${Deno.cwd()}/scripts/build.tsconfig.json`,
  format: "esm",
  dts: true,
});
