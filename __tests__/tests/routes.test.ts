import { expect } from "@std/expect/expect";
import { changeDir } from "#tests/fixture/utils.ts";
import { getPaths, transformPath } from "#src/paths.ts";
changeDir("root");

changeDir("routes");
globalThis.onbeforeunload = () => changeDir("root");

Deno.test("Paths function", async (t) => {
  const paths = await getPaths();
  const transformedPaths = paths.map(transformPath);
  const referenceValue = [
    "/",
    "/nested/",
    "/nested/contact",
    "/about",
    "/nested/:username/user",
    "/nested/:greeting",
    "/nested/**",
    "/**",
  ];

  await t.step("It should transform the routes to valid rou3 routes", () => {
    expect(transformedPaths).toEqual(referenceValue);
  });
});
