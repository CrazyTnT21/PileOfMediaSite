import {default as common} from "./webpack.common.js";

export default (env) => ({
  ...common(env),
  mode: "production",
});