import { actions, namedRoutes } from "@timberstack/dhp";
import type { Actions, Routes } from "./routes.d.ts";

export const route = (routeName: Routes, params = {}): string => {
  let foundRoute = namedRoutes[routeName];

  Object.entries(params).forEach(([key, value]) => {
    foundRoute = foundRoute.replace(":" + key, value as string);
  });
  return foundRoute ?? "not-found";
};

export const action = (
  actionName: Actions,
  params = {},
): string => {
  let foundAction = actions[actionName];

  Object.entries(params).forEach(([key, value]) => {
    foundAction = foundAction.replace(":" + key, value as string);
  });
  return foundAction ?? "not-found";
};
