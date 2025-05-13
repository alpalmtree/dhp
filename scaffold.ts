import { generateTemplateFiles } from "./src/cli.ts";
import { fs } from "./src/deps/std.ts";
const { exists, ensureDir } = fs;

const REMOTE_URL = "https://deno.land/x/dhp/src/scaffold_template"; // always get the latest
const writeIfNotExists = async (fileRelativePath: string): Promise<void> => {
  const fileExists = await exists(`${Deno.cwd()}${fileRelativePath}`);
  if (fileExists) return new Promise((r) => r());

  const file = await fetch(`${REMOTE_URL}${fileRelativePath}`);
  const fileContent = await file.text();

  return new Promise((resolve) => {
    Deno.writeTextFile(
      `${Deno.cwd()}${fileRelativePath}`,
      fileContent,
    );

    resolve();
  });
};

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
    lib: ["deno.window", "dom"],
  },
};

if (!await exists(`${Deno.cwd()}/deno.json`)) {
  Deno.writeTextFileSync(
    `${Deno.cwd()}/deno.json`,
    JSON.stringify(baseDenoConfig, null, 2),
  );
}

Promise.all([
  ensureDir(`${Deno.cwd()}/resources`),
  ensureDir(`${Deno.cwd()}/views`),
  ensureDir(`${Deno.cwd()}/public`),
]);

Promise.all([
  writeIfNotExists("/resources/index.js"),
  writeIfNotExists("/views/index.tsx"),
]);

generateTemplateFiles();
