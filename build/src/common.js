import esbuildPluginTsc from "esbuild-plugin-tsc";
import htmlPlugin from "./html-plugin.js";
import woff2Plugin from "./woff2-plugin.js";
import {absolutePathPlugin} from "./absolute-path-plugin.js";

export function createBuildSettings(options)
{
  // noinspection SpellCheckingInspection
  return {
    entryPoints: ["src/**/*"],
    outdir: "dist",
    bundle: true,
    splitting: true,
    format: "esm",
    plugins: [
      esbuildPluginTsc({
        force: true,
      }),
      htmlPlugin(),
      woff2Plugin(),
      absolutePathPlugin(),
    ],
    loader: {
      ".svg": "copy",
      ".png": "copy",
      ".xml": "copy",
      ".ico": "copy",
      ".webmanifest": "copy",
      ".json": "copy",
      ".txt": "copy",

    },
    ...options,
  };
}
