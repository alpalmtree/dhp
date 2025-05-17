import { expect } from "@std/expect/expect";
import { changeDir } from "#tests/fixture/utils.ts";
import { getPaths, transformPath } from "#src/paths.ts";
changeDir("root");
console.log(Deno.cwd());

changeDir("routes");
globalThis.onbeforeunload = () => changeDir("root");

Deno.test("getPaths function", async (t) => {
  const paths = getPaths();

  /**
   * - Static routes come first
   * - Routes with parameters come second
   * - Routes with catch all come last
   *
   * - Folders prefixed with '.' should be excluded
   */
  const referenceValue = [
    "nested/contact.tsx",
    "nested/index.tsx",
    "about.tsx",
    "index.tsx",
    "nested/$greeting.tsx",
    "nested/$username/user.tsx",
    "nested/[all].tsx",
    "[all].tsx",
  ];

  await t.step("it should keep correct structure", () => {
    expect(paths).toEqual(referenceValue);
  });
});

Deno.test("transformPath function", async (t) => {
  const paths = getPaths();
  const transformedPaths = paths.map(transformPath);
  const referenceValue = [
    "/nested/contact",
    "/nested",
    "/about",
    "/",
    "/nested/:greeting",
    "/nested/:username/user",
    "/nested/**",
    "/**",
  ];

  await t.step("It should transform the routes to valid Hono routes", () => {
    expect(transformedPaths).toEqual(referenceValue);
  });
});
