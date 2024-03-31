import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: path.join(__dirname, "src", "modules.js"),
  devServer: {
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
};

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
