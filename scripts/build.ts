import * as tsup from "tsup";

await tsup.build({
  entry: [
    `${Deno.cwd()}/src/index.ts`,
    `${Deno.cwd()}/src/cli.ts`,
    `${Deno.cwd()}/src/ViteHead.tsx`,
  ],
  noExternal: ["@timberstack/vite-plugin-better-manifest"],
  tsconfig: `${Deno.cwd()}/scripts/build.tsconfig.json`,
  format: "esm",
  dts: true,
});
