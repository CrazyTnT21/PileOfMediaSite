import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => ({
  entry: path.join(__dirname, "src", "modules.js"),
  devServer: {
    liveReload: false,
    static: {
      directory: path.join(__dirname, "src"),
      staticOptions: {
        extensions: ["html"],
      },
    },
    historyApiFallback: {
      rewrites: [
        {
          from: /\//,
          to: context => customDirectoryIndex(context),
        },
      ],
    },

    compress: true,
    port: 80,
  },
  output: {
    filename: "modules.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "module",
    },
  },

  experiments: {
    outputModule: true,
  },

  mode: "development",
  target: "web",

  plugins: [
    new webpack.DefinePlugin({
      "env.SERVER_URL": JSON.stringify(env.SERVER_URL ?? (() =>
      {
        throw new Error("SERVER_URL missing!");
      })()),
    }),
  ],
});

function customDirectoryIndex(context)
{
  const parts = context.parsedUrl.path.split("/");
  const filePath = context.parsedUrl.path + parts[parts.length - 2] + ".html";

  if (fs.existsSync(path.join(__dirname, "src", filePath)))
  {
    return filePath;
  }
  return "404.html";
}
