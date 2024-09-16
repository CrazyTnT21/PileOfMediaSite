import esbuildPluginTsc from "esbuild-plugin-tsc";
import htmlPlugin from "./html-plugin.js";

export function createBuildSettings(options)
{
  return {
    entryPoints: ["src/**/*.ts", "src/**/*.html"],
    outdir: "dist",
    bundle: true,
    splitting: true,
    format: "esm",
    plugins: [
      esbuildPluginTsc({
        force: true,
      }),
      htmlPlugin(),
    ],
    ...options,
  };
}
