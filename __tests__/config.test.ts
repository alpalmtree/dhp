import { expect } from "@std/expect";
import { getConfig } from "../src/config.ts";

Deno.test("should have the default config", async (t) => {
  await t.step("setup files", async () => {
    const appConfig = await getConfig();
    expect(appConfig.useVite).toBe(true);
  });
});
