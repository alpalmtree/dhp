import { route } from "../../file-router/route-getters.ts";
import { ViteHead } from "@timberstack/dhp/vite";

type LayoutProps = {
  script?: string;
  children: unknown;
  pageTitle?: string;
  page?: string;
};

export const Layout = (
  { script = "", children, pageTitle = "Untitled", page = "" }: LayoutProps,
) => {
  return (
    <>
      {"<!DOCTYPE html>"}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{pageTitle}</title>
          <ViteHead script={script} />
        </head>
        <body>
          <header>
            <nav>
              <ul>
                <li>
                  <a
                    href={route("index")}
                    className={page === "index" ? "active" : ""}
                  >
                    Index
                  </a>
                </li>
                <li>
                  <a
                    href={route("about")}
                    className={page === "about" ? "active" : ""}
                  >
                    About
                  </a>
                </li>
              </ul>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </>
  );
};
