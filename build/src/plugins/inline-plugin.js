import {createBuildSettings, SRC_DIR} from "../common.js";
import esbuild from "esbuild";

let inlinePlugin = (options) => ({
  name: "inline",
  setup(build)
  {
    build.onLoad({filter: /.*/}, async args =>
    {
      if (args.with.type === "inline")
      {
        const newOptions = {...options};
        newOptions.write = false;
        newOptions.sourcemap = false;
        newOptions.absWorkingDir = SRC_DIR;
        const split = args.path.split(SRC_DIR)
        newOptions.entryPoints = [split[1] ?? split[0]];

        const settings = createBuildSettings(newOptions);
        const result = await esbuild.build(settings);
        const contents = result.outputFiles[0].text;

        return {
          contents,
          loader: 'text'
        };
      }
      return null;
    });
  },
});
export default inlinePlugin;
