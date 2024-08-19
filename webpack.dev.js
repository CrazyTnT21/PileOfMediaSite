import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

import {default as common} from "./webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// noinspection JSUnresolvedReference
export default (env) => ({
  ...common(env),
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: env.API_URL ?? "http://localhost:3000/",
        secure: false,
        pathRewrite: { '^/api': '' },
      },
    ],
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
    port: 5000,
  },

  mode: "development",
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
