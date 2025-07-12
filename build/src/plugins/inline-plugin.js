import {createBuildSettings} from "../common.js";
import esbuild from "esbuild";

const inlinePlugin = (options, srcDirectory) => ({
  name: "inline",
  setup(build)
  {
    build.onLoad({filter: /.*/}, async args =>
    {
      if (args.with.type !== "inline")
        return null;

      const newOptions = {...options, write: false, sourcemap: false, absWorkingDir: srcDirectory};
      const [path, file] = args.path.split(srcDirectory)
      newOptions.entryPoints = [file ?? path];

      const settings = createBuildSettings(newOptions);
      const result = await esbuild.build(settings);
      const contents = result.outputFiles[0].text;

      return {
        contents,
        loader: 'text'
      };
    });
  },
});
export default inlinePlugin;
