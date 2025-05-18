import { generateTemplateFiles } from "./src/writeFiles.ts";
import { ensureDir, exists } from "./src/deps/std.ts";

import { currentVersion } from "./scripts/current_version.ts";

const REMOTE_URL =
  `https://deno.land/x/dhp@${currentVersion}/scaffold_template`;
const writeIfNotExists = async (fileRelativePath: string): Promise<void> => {
  const fileExists = await exists(`${Deno.cwd()}${fileRelativePath}`);
  if (fileExists) return new Promise((r) => r());

  const file = await fetch(`${REMOTE_URL}${fileRelativePath}`);
  const fileContent = await file.text();
  return Deno.writeTextFile(
    `${Deno.cwd()}${fileRelativePath}`,
    fileContent,
  );
};

const baseDenoConfig = {
  lock: false,
  tasks: {
    dhp: "echo \"import 'dhp/cli.ts'\" | deno run -A -",
    init: "deno run dhp init",
    dev: "deno run dhp dev",
    build: "deno run dhp build",
    start: "deno run dhp start",
  },
  imports: {
    "dhp/": `https://deno.land/x/dhp@${currentVersion}/`,
    "dhp/jsx-runtime": `https://deno.land/x/dhp@${currentVersion}/ssx.ts`,
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

await ensureDir(`${Deno.cwd()}/.dhp`);

await Promise.all([
  ensureDir(`${Deno.cwd()}/resources`),
  ensureDir(`${Deno.cwd()}/views`),
  ensureDir(`${Deno.cwd()}/public`),
]);

await Promise.all([
  writeIfNotExists("/resources/index.js"),
  writeIfNotExists("/views/index.tsx"),
]);

generateTemplateFiles();
