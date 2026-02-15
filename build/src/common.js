import esbuildPluginTsc from "esbuild-plugin-tsc";
import htmlPlugin from "./plugins/html-plugin.js";
import {absolutePathPlugin} from "./plugins/absolute-path-plugin.js";
import inlinePlugin from "./plugins/inline-plugin.js";
import path from "node:path";
import fs from "node:fs";

export const SRC_DIR = path.join(path.resolve("."), "src");

export function createBuildSettings(options)
{
  // noinspection SpellCheckingInspection
  return {
    entryPoints: fs.readdirSync("src", {
      recursive: true,
      withFileTypes: true
    }).filter((x) => x.isFile()).map((x) => path.join(x.parentPath, x.name)),
    outdir: "dist",
    bundle: true,
    splitting: true,
    format: "esm",
    plugins: [
      inlinePlugin(options, SRC_DIR),
      esbuildPluginTsc({
        force: true,
      }),
      htmlPlugin(),
      absolutePathPlugin(),
    ],
    loader: {
      ".svg": "copy",
      ".jpg": "copy",
      ".png": "copy",
      ".xml": "copy",
      ".ico": "copy",
      ".webmanifest": "copy",
      ".json": "copy",
      ".txt": "copy",
      ".woff2": "copy"
    },
    ...options,
  };
}
