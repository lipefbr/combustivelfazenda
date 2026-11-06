import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================================
// next.config.ts — FuelGest (LipeHost)
// Fix do build na LipeHost (mesma correcao do NewMobility): Next 16.3+ tem um
// bug no Turbopack com @import CSS bare-specifier ("tailwindcss",
// "tw-animate-css") — o root fica vazio e o path escapa do projeto
// ("outside configured roots"). Correcoes:
//   1. package.json com "next" PINADO exato 16.1.3 (versao sem o bug)
//   2. "workspaces": [] no package.json (nao sobe p/ /var/www/lipehost)
//   3. turbopack.root + outputFileTracingRoot absolutos (ESM-safe)
// ============================================================================
let projectRoot: string;
try {
  const configUrl: string = (import.meta as { url: string }).url;
  projectRoot = path.dirname(fileURLToPath(configUrl));
} catch {
  const dir: string | undefined = (globalThis as { __dirname?: string }).__dirname;
  projectRoot = dir ? path.resolve(dir) : process.cwd();
}
projectRoot = path.resolve(projectRoot);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
