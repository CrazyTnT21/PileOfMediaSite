import {promises as fs} from "node:fs";
import * as path from "node:path";

let woff2Plugin = () => ({
  name: "woff2",
  setup(build)
  {
    build.onResolve({filter: /\.woff2$/}, args => ({
      path: args.path,
      namespace: 'woff2',
    }));

    build.onLoad({filter: /\.woff2$/, namespace: "woff2"}, async (args) =>
    {
      //TODO
      let contents;
      if (args.path.startsWith("./material-symbols"))
        contents = await fs.readFile(path.join("node_modules", "@material-symbols", "font-400", args.path));
      else
        contents = await fs.readFile(args.path);
      return {
        contents,
        loader: "copy",
      };
    });
  },
});
export default woff2Plugin;

