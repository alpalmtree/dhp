import { expect } from "@std/expect";
import { removeGeneratedFiles } from "../fixture/test_start.ts";
import { getConfig } from "@lib/config";
import { defaultConfigTemplate } from "@lib/templates";
import { existsSync } from "node:fs";

const generateConfig = async () => {
  await Deno.writeTextFile(
    `${Deno.cwd()}/hwr.config.ts`,
    defaultConfigTemplate.replace("useVite: true", "useVite: false"),
  );
  globalThis.dispatchEvent(
    new Event("config:generated", {
      bubbles: true,
    }),
  );
};

await generateConfig();

Deno.test("should accept user config", async (t) => {
  await t.step("read config file", async () => {
    const appConfig = await getConfig();
    console.log(appConfig);
    expect(appConfig.useVite).toBe(false);
  });

  removeGeneratedFiles();
});
