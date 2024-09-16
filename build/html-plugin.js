import {promises as fs} from "fs";

let htmlPlugin = () => ({
  name: "html",
  setup(build)
  {
    build.onResolve({filter: /\.html$/}, args => ({
      path: args.path,
    }));

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