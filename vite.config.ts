import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    sitemap({
  hostname: "https://prettybits.co.za",
  generateRobotsTxt: true,
  dynamicRoutes: ["/workshops", "/courses", "/products", "/starter-kit", "/contact"],
}),
  ],
});
