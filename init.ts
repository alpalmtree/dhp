import { copy, exists } from "jsr:@std/fs@1.0.x";

const baseDenoConfig = {
  tasks: {
    dhp: "echo \"import 'dhp/cli.ts'\" | deno run -A -",
    init: "deno run dhp init",
    dev: "deno run dhp dev",
    build: "deno run dhp build",
    start: "deno run dhp start",
  },
  imports: {
    "dhp/": "https://deno.land/x/dhp/",
    "dhp/jsx-runtime": "https://deno.land/x/dhp/ssx.ts",
  },
  nodeModulesDir: "auto",
  compilerOptions: {
    jsx: "precompile",
    jsxImportSource: "dhp",
  },
};

const copyDir = async (name: string) => {
  if (await exists(`${Deno.cwd()}/${name}`)) return;
  await copy(`./src/scaffold_template/${name}`, `${Deno.cwd()}/${name}`);
};

if (!await exists(`${Deno.cwd()}/deno.json`)) {
  Deno.writeTextFileSync(
    `${Deno.cwd()}/deno.json`,
    JSON.stringify(baseDenoConfig, null, 2),
  );
}

await copyDir("resources");
await copyDir("views");
await copyDir("public");
