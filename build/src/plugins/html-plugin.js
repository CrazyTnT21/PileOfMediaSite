import {promises as fs} from "node:fs";
import path from "node:path";

let htmlPlugin = () => ({
  name: "html",
  setup(build)
  {
    build.onResolve({filter: /\.html$/}, args =>
    {
      return {
        path: path.join(args.resolveDir, args.path),
      }
    });


    build.onLoad({filter: /\.html$/}, async (args) =>
    {
      let contents = await fs.readFile(args.path, "utf8");
      contents = contents.replace(/(?<=src=".+?).ts"/g, ".js\"");
      return {
        contents,
        loader: "copy",
      };
    });
  },
});
export default htmlPlugin;
