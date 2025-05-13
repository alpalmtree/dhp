import { path } from "./src/vendor/std.ts";

console.log("just import meta url:", new URL(import.meta.url));
console.log(
  "with reference to a file:",
  new URL(import.meta.resolve("./src/cli.ts")),
);
