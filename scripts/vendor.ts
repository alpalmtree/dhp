const CDN_MAP: { [key: string]: string } = {
  npm: "https://unpkg.com/",
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

    return ({ name, alias: data.alias, baseUrl, urls });
  },
);

for (const dep of urlsManifest) {
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
