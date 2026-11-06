import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config.mjs";

const NOINDEX = /\/(doc|tai|en\/read|en\/download)\//;

export default defineConfig({
  site: SITE.url,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap({ filter: (page) => !NOINDEX.test(new URL(page).pathname) })],
});
