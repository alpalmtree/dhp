import { type Resolver, type RouteImport } from "../../../mod.ts";

export const resolver: Resolver<RouteImport> = async (
  path: string,
) => {
  return await import(path);
};
