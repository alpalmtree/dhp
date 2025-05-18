import { exists, walk } from "./deps/std.ts";
import type { Config } from "./config.ts";

const { cwd } = Deno;

export const transformPath = (path: string) => {
  const segments = path.split("/").map((segment: string) => segment.split("."));
  const segmentsToRoute = segments.map((segment: string | string[]) => {
    if (Array.isArray(segment)) {
      return segment.at(0);
    }
    return segment;
  });
  const route = segmentsToRoute.map((segment) => {
    if (segment === "index") return `/`;
    if (segment?.startsWith("$")) return `${segment.replace("$", ":")}`;
    if (segment === "[all]") return "**";
    return `${segment}`;
  }).join("/");

  const noBackSlash = (route.length > 1 && route.endsWith("/"))
    ? route.slice(0, -1)
    : route;

  return noBackSlash;
};

export const getPaths = async (appConfig?: Config) => {
  const routerFolderPath: string = `${cwd()}${appConfig?.viewsDir ?? "/views"}`;

  if (!await exists(routerFolderPath)) return [];

  const staticPaths = [];
  const wildcardPaths = [];
  const dynamicPaths = [];
  for await (
    const file of walk(routerFolderPath, { exts: ["ts", "tsx", "js", "jsx"] })
  ) {
    const relativePath = file.path.replace(
      `${cwd()}${appConfig?.viewsDir ?? "/views"}`,
      "",
    );
    if (!file.isFile || relativePath.startsWith("/.")) continue;

    relativePath.includes("$")
      ? dynamicPaths.push(relativePath)
      : relativePath.includes("[all]")
      ? wildcardPaths.push(relativePath)
      : staticPaths.push(relativePath);
  }

  const sortBySegmentsLength = (a: string, b: string) => {
    return (b.split("/").length - 1) - (a.split("/").length - 1);
  };

  const paths = [
    ...staticPaths,
    ...dynamicPaths.toSorted(sortBySegmentsLength),
    ...wildcardPaths.toSorted(sortBySegmentsLength),
  ];

  return paths;
};
