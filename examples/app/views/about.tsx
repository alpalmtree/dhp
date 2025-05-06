import { route } from "../file-router/route-getters.ts";
import { Layout } from "./.components/layout.tsx";
export const name = `about`;

export default function About() {
  return (
    <Layout script="/about.js">
      <h1>About page {route("about")}</h1>
    </Layout>
  );
}
