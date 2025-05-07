import * as tsup from "tsup";

await tsup.build({
  entry: [
    `${Deno.cwd()}/src/index.ts`,
    `${Deno.cwd()}/src/cli.ts`,
    `${Deno.cwd()}/src/ViteHead.tsx`,
  ],
  tsconfig: `${Deno.cwd()}/scripts/build.tsconfig.json`,
  format: "esm",
  dts: true,
});
