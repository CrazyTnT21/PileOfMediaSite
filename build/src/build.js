import * as esbuild from 'esbuild';
import { createBuildSettings } from './common.js';
import * as fs from "node:fs"
const settings = createBuildSettings({ minify: true });
await fs.promises.rm("dist", {recursive: true,force: true});
await esbuild.build(settings);
