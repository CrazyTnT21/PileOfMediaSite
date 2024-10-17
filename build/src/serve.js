import esbuild from "esbuild";
import {createBuildSettings} from "./common.js";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import * as process from "node:process";
import httpProxy from "http-proxy";

const settings = createBuildSettings({
  sourcemap: true,
  write: false,
});
settings.outdir = "src";

const ctx = await esbuild.context(settings);

let buildOutput = await ctx.rebuild();

let lastError;
const result = fs.promises.watch(settings.outdir, {recursive: true});
(async () =>
{
  for await (const x of result)
  {
    try
    {
      buildOutput = await ctx.rebuild();
      if (lastError)
      {
        lastError = null;
        console.info("Rebuilt sucessfully!");
      }
    }
    catch (e)
    {
      lastError = e.message;
      console.error(e.message);
    }
  }
})();

export const contentTypeExtensions = {
  "html": "text/html",
  "css": "text/css",
  "js": "text/javascript",
  "json": "text/json",
  "svg": "image/svg+xml",
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "ico": "image/x-icon",
  "ts": "video",
};
const proxies = [{
  pattern: /^\/api\/(.*)/,
  target: "http://localhost:3000/",
  params: "$1"
}];
runServer({port: 5000, src: path.join(process.cwd(), "src"), proxies});

/**
 * @param {{port: number, src: string, proxies: {pattern: RegExp, params: string,target}[]}} settings
 */
export function runServer({port, src, proxies})
{
  http.createServer(async (request, response) =>
  {
    const proxyServers = new Map();
    proxies.forEach(x =>
    {
      // noinspection JSUnresolvedReference
      proxyServers.set(x.target, httpProxy.createProxyServer({target: x.target}));
    })
    for (const proxy of proxies)
    {
      const matches = request.url.match(proxy.pattern);

      if (matches)
      {
        const proxyServer = proxyServers.get(proxy.target)
        proxyRequest(request, response, proxy, proxyServer, matches)
        return;
      }
    }

    const responseItem = processRequest(request, src);
    writeResponse(response, responseItem);
  }).listen(port);

  console.info(`Server running at http://localhost:${port}\nCTRL + C to shutdown\n`);
}

function proxyRequest(request, response, proxy, proxyServer, matches)
{
  let resultLocation = proxy.params;
  const indices = resultLocation.match(/(?<=\$)\d+/);
  for (const index of indices)
  {
    resultLocation = resultLocation.replaceAll("$" + index, matches[index]);
  }
  resultLocation = proxy.target + resultLocation;
  request.url = resultLocation;
  proxyServer.web(request, response, null, (error) =>
  {
    console.error(`Error while proxying request to ${resultLocation}:`, error["code"]);
    writeResponse(response, {statusCode: 500, data: null, headers: {}});
  });
}

function writeResponse(response, file)
{
  response.writeHead(file.statusCode, file.headers);
  if (file.data !== null && file.data !== undefined)
    response.write(file.data, "binary");
  response.end();
}

function processRequest(request, src)
{
  const filePath = path.join(src, request.url).split("?")[0];

  return getFile(filePath) ??
    getFile(filePath + ".html") ??
    getFile(path.join(filePath, "/index.html")) ??
    getFile(path.join(filePath, `/${last(filePath.split("\\"))}.html`)) ??
    getFile(path.join(filePath, `/${secondLast(filePath.split("\\"))}.html`)) ??
    {statusCode: 404, data: null, headers: {}};
}

function last(items)
{
  return items[items.length - 1];
}
function secondLast(items)
{
  return items[items.length - 2] ?? "";
}

export function getFile(filePath)
{
  const find = buildOutput.outputFiles.find(x => x.path === filePath);
  if (!find)
  {
    return null;
  }
  const extension = last(find.path.split("."));
  const headers = {};
  if (extension && contentTypeExtensions[extension])
    headers["Content-Type"] = contentTypeExtensions[extension];

  return {statusCode: 200, data: find.contents, headers};
}
