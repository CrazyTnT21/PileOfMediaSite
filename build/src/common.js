import esbuildPluginTsc from "esbuild-plugin-tsc";
import htmlPlugin from "./plugins/html-plugin.js";
import woff2Plugin from "./plugins/woff2-plugin.js";
import {absolutePathPlugin} from "./plugins/absolute-path-plugin.js";
import inlinePlugin from "./plugins/inline-plugin.js";
import path from "node:path";
import * as glob from "glob"

export const SRC_DIR = path.join(path.resolve("."), "src");

export function createBuildSettings(options)
{
  // noinspection SpellCheckingInspection
  return {
    entryPoints: glob.sync("src/**/*", {nodir: true}),
    outdir: "dist",
    bundle: true,
    splitting: true,
    format: "esm",
    plugins: [
      inlinePlugin(options),
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
