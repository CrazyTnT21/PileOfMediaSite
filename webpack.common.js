import path from "path";
import {fileURLToPath} from "url";

import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => ({
  entry: path.join(__dirname, "src", "modules.js"),
  output: {
    filename: "modules.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "module",
    },
  },

  experiments: {outputModule: true},
  target: "web",

  plugins: [
    new webpack.DefinePlugin({
      "env.API_URL": env.API_URL ?  JSON.stringify(env.API_URL): null,
    }),
  ],
});