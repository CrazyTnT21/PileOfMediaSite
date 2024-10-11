import path from "node:path";
import process from "node:process"

export function absolutePathPlugin()
{
  return {
    name: 'absolutePath',
    setup(build)
    {
      build.onResolve({filter: /^\//}, args =>
      {
        return {path: path.join(process.cwd(), "/src", args.path)}
      })
    }
  }
}
