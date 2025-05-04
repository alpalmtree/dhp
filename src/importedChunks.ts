import { readFileSync } from "node:fs";
/** Function copied from Vite docs */
import type { Manifest, ManifestChunk } from "vite";
import { appConfig } from ".";

export default function importedChunks(
  manifest: Manifest,
  name: string,
): ManifestChunk[] {
  const seen = new Set<string>();

  function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
    const chunks: ManifestChunk[] = [];
    for (const file of chunk.imports ?? []) {
      const imported = manifest[file];
      if (seen.has(file)) {
        continue;
      }
      seen.add(file);

      chunks.push(...getImportedChunks(imported));
      chunks.push(imported);
    }

    return chunks;
  }

  return getImportedChunks(manifest[name]);
}

const cssLink = (cssFile: string) =>
  `<link rel="stylesheet" href="/${cssFile}" />`;
const scriptLink = (manifest: Manifest, name: string) =>
  `<script type="module" src="/${manifest[name].file}"></script>`;
const preloadLink = (chunk: ManifestChunk) =>
  `<link rel="modulepreload" href="/${chunk.file}" />`;

export const generateHeadScripts = (fileName: string) => {
  const viteManifest: Manifest = JSON.parse(
    readFileSync(`.${appConfig.publicDir}/.vite/manifest.json`, {
      encoding: "utf-8",
    }),
  );
  const strings = [];

  const cssChunks = viteManifest[fileName].css ?? [];
  for (const cssFile of cssChunks) {
    strings.push(cssLink(cssFile));
  }

  for (const chunk of importedChunks(viteManifest, fileName)) {
    const cssChunks = chunk.css ?? [];

    for (const cssFile of cssChunks) {
      strings.push(cssLink(cssFile));
    }
  }
  strings.push(scriptLink(viteManifest, fileName));

  for (const chunk of importedChunks(viteManifest, fileName)) {
    strings.push(preloadLink(chunk));
  }

  return strings.join("\n");
};
