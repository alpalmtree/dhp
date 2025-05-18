import { expect } from "@std/expect/expect";
import { emptyDir, existsSync } from "@std/fs";
import { changeDir, rootDir, runCommand, testsPath } from "../fixture/utils.ts";

globalThis.onbeforeunload = () => {
  changeDir("root");
  emptyDir(`${testsPath}scaffolded_app`);
};

changeDir("scaffolded_app");

Deno.test("Should scaffold the basic template", async (t) => {
  await t.step("Run scaffold file without failing", async () => {
    await runCommand(`deno run -A ${rootDir}/scaffold.ts`);
  });

  await t.step("Check if files exists", () => {
    expect(existsSync(`${Deno.cwd()}/views`)).toBe(true);
    expect(existsSync(`${Deno.cwd()}/resources`)).toBe(true);
    expect(existsSync(`${Deno.cwd()}/public`)).toBe(true);
    expect(existsSync(`${Deno.cwd()}/.dhp`)).toBe(true);
    expect(existsSync(`${Deno.cwd()}/deno.json`)).toBe(true);
  });
});
