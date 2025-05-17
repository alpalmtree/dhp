import { bundle } from "jsr:@deno/emit";

const CDN_MAP: { [key: string]: string } = {
  npm: "https://unpkg.com/",
  jsr: "jsr:",
};

type DependenciesManifest = {
  [key: string]: {
    alias: string;
    version: string;
    registry: "npm" | "jsr";
    additionalFiles?: string[];
    entries: {
      js: string;
      ts: string;
    };
    exports?: string[];
  };
};

const { default: dependenciesManifest } = await import(
  `${Deno.cwd()}/dependencies.manifest.json`,
  {
    with: {
      type: "json",
    },
  }
) as { default: DependenciesManifest };

const urlsManifest = Object.entries(dependenciesManifest).map(
  ([name, data]) => {
    const baseUrl = CDN_MAP[data.registry] + `${name}@${data.version}`;

    const urls: string[] = Object.values(data.entries).concat(
      data.additionalFiles ?? [],
    ).map(
      (file) => {
        return `${baseUrl}/${file}`;
      },
    );

    return ({
      registry: data.registry,
      name,
      alias: data.alias,
      baseUrl,
      urls,
      exports: data.exports,
    });
  },
);

const bundleJsr = async (data: typeof urlsManifest[0]) => {
  const template = `export { ${
    data.exports?.join(", ")
  } } from "jsr:${data.name}"`;

  const temporalFilePath = `${Deno.cwd()}/scripts/deps.ts`;
  Deno.writeTextFileSync(temporalFilePath, template);
  const { code } = await bundle(temporalFilePath, { minify: true });
  Deno.removeSync(temporalFilePath);
  return code;
};

for (const dep of urlsManifest) {
  if (dep.registry === "jsr") {
    const code = await bundleJsr(dep);
    const DEPS_PATH = `${Deno.cwd()}/src/deps/${dep.alias}`;
    const depMeta = dependenciesManifest[dep.name];

    try {
      await Deno.mkdir(DEPS_PATH);
    } catch { /** */ }

    Deno.writeTextFileSync(`${DEPS_PATH}/${depMeta.entries.js}`, code);

    continue;
  }
  const DEPS_PATH = `${Deno.cwd()}/src/deps/${dep.alias}`;
  const depMeta = dependenciesManifest[dep.name];

  try {
    await Deno.mkdir(DEPS_PATH);
  } catch { /** */ }

  const fetched = await Promise.all(dep.urls.map((url) => fetch(url)));

  for (const data of fetched) {
    const fetchedFileName = data.url.replace(dep.baseUrl + "/", "");
    const writeFileName = fetchedFileName.split("/").at(-1);
    const content = await data.text();

    if (fetchedFileName === depMeta.entries.js) {
      const typeReferencePath = "./" + depMeta.entries.ts.split("/").at(-1);

      await Deno.writeTextFile(
        `${DEPS_PATH}/${writeFileName}`,
        `/// <reference types="${typeReferencePath}"/>\n ${content}`,
      );
    } else {
      await Deno.writeTextFile(`${DEPS_PATH}/${writeFileName}`, content);
    }
  }
}
