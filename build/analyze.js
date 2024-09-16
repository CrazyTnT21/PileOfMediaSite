import * as esbuild from "esbuild";
import fs from "fs";
import {createBuildSettings} from "./common.js";

const settings = createBuildSettings({minify: true, metafile: true});
const result = await esbuild.build(settings);
// eslint-disable-next-line no-undef
const mode = process.env.npm_config_mode;

if (mode === "write")
  fs.writeFileSync("build-meta.json", JSON.stringify(result.metafile));
else
  console.info(await esbuild.analyzeMetafile(result.metafile, {verbose: false}));

