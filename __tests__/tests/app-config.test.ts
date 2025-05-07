import { expect } from "@std/expect";
import { getConfig } from "../../src/config.ts";
import { defaultConfigTemplate } from "../../src/templates.ts";

import { changeDir } from "../fixture/utils.ts";

Deno.test("should have the default config", async (t) => {
  await t.step(
    "Move to default config dir",
    () => changeDir("default_config"),
  );

  const appConfig = await getConfig();
  expect(appConfig.useVite).toBe(true);

  changeDir("root");
});

Deno.test("should accept user config", async (t) => {
  await t.step("Move to user config dir", () => {
    changeDir("user_config");
  });

  await t.step("setup files", async () => {
    await Deno.writeTextFile(
      `${Deno.cwd()}/hwr.config.ts`,
      defaultConfigTemplate.replace("useVite: true", "useVite: false"),
    );
  });

  const appConfig = await getConfig();
  expect(appConfig.useVite).toBe(false);

  changeDir("root");
});
