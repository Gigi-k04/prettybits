import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import sitemap from "vite-plugin-sitemap";

const sitemapPlugin = sitemap({
  hostname: "https://prettybits.co.za",
  generateRobotsTxt: true,
  dynamicRoutes: ["/workshops", "/courses", "/products", "/starter-kit", "/contact"],
});

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      ...sitemapPlugin,
      // Generate only after Vite writes dist; closeBundle also runs on build failure.
      closeBundle: undefined,
      writeBundle: sitemapPlugin.closeBundle,
    },
  ],
});
