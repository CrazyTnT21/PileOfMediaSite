import esbuildPluginTsc from "esbuild-plugin-tsc";
import htmlPlugin from "./html-plugin.js";
import woff2Plugin from "./woff2-plugin.js";
import {absolutePathPlugin} from "./absolute-path-plugin.js";

export function createBuildSettings(options)
{
  return {
    entryPoints: ["src/**/*.ts", "src/**/*.html", "src/**/*.css"],
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
      '.svg': 'dataurl',
    },
    ...options,
  };
}
