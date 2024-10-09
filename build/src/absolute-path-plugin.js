import path from "node:path";

export function absolutePathPlugin()
{
  return {
    name: 'absolutePath',
    setup(build)
    {
      build.onResolve({filter: /^\//}, args =>
      {
        // eslint-disable-next-line no-undef
        return {path: path.join(process.cwd(), "/src", args.path)}
      })
    }
  }
}
