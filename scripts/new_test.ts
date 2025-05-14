import {
  changeDir,
  patchScaffold,
  rootDir,
  runCommand,
  testsPath,
} from "#tests/fixture/utils.ts";

const newTestName = Deno.args.at(0);
if (!newTestName) {
  console.error("No name provided");
  Deno.exit();
}
const newTestPath = `${testsPath}${newTestName}`;

await Deno.mkdir(newTestPath);
changeDir(newTestName);
await runCommand(`deno run -A ${rootDir}/scaffold.ts`);
patchScaffold();
changeDir("root");
