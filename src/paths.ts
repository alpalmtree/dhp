import { cwd } from "node:process";
import { existsSync, readdirSync } from "node:fs";
import type { Config } from "./config.ts";

const isFile = (path: string) => path.includes(".");

export const transformPath = (path: string) => {
  const segments = path.split("/").map((segment: string) =>
    isFile(segment) ? segment.split(".") : segment
  );
  const segmentsToRoute = segments.map((segment: string | string[]) => {
    if (Array.isArray(segment)) {
      return segment.at(0);
    }
    return segment;
  });
  const route = segmentsToRoute.map((segment) => {
    if (segment === "index") return `/`;
    if (segment?.startsWith("$")) return `/${segment.replace("$", ":")}`;
    if (segment === "[all]") return "/*";
    return `/${segment}`;
  }).join("");

  const noBackSlash = (route.length > 1 && route.endsWith("/"))
    ? route.slice(0, -1)
    : route;

  return noBackSlash;
};

export const getPaths = (appConfig?: Config) => {
  const routerFolderPath: string = `${cwd()}${appConfig?.viewsDir ?? "/views"}`;

  if (!existsSync(routerFolderPath)) return [];
  const dirs = readdirSync(routerFolderPath, { recursive: true }) as string[];
  const allPaths = dirs
    .toReversed()
    .filter(
      (path) => isFile(path as string) && !path.startsWith("."),
    );

  const { staticPaths, dynamicPaths } = allPaths.reduce(
    (prev, current) => {
      (current.includes("$") || current.includes("[all]"))
        ? prev.dynamicPaths.push(current)
        : prev.staticPaths.push(current);
      return prev;
    },
    { dynamicPaths: [], staticPaths: [] } as {
      dynamicPaths: string[];
      staticPaths: string[];
    },
  );

  const paths = [
    ...staticPaths,
    ...dynamicPaths.sort((a, _b) => {
      if (a.includes("[all]")) return 1;
      return -1;
    }),
  ];
  return paths;
};
