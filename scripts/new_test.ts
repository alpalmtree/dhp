import { parseArgs } from "@std/cli/parse-args";
import { copy, exists } from "@std/fs";

import { exec } from "node:child_process";

const { name, install }: { name: string; install: boolean } = parseArgs(
  Deno.args,
);

if (!name) Deno.exit();

const NEW_TEST_DIR = `${Deno.cwd()}/__tests__/test_apps/${name}`;
const ROOT_DIR = Deno.cwd();

if (!(await exists(NEW_TEST_DIR))) {
  await copy(
    `${Deno.cwd()}/scripts/test_template`,
    NEW_TEST_DIR,
  );
}
console.log(Deno.cwd());

if (!install) Deno.exit();

Deno.chdir(NEW_TEST_DIR);

console.log(Deno.cwd());
exec("deno install");
Deno.chdir(ROOT_DIR);
console.log(Deno.cwd());
