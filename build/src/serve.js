import esbuild from "esbuild";
import {createBuildSettings, SRC_DIR} from "./common.js";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import httpProxy from "http-proxy";

// noinspection SpellCheckingInspection
const settings = createBuildSettings({
  sourcemap: true,
  write: false,
  outdir: "src",
});
let context = await esbuild.context(settings);
let buildFiles = await context.rebuild().then(x => x.outputFiles);

const result = fs.promises.watch(settings.outdir, {recursive: true});
(async () =>
{
  for await (const x of result)
  {
    try
    {
      if (x.eventType === "change")
        continue;

      if (x.filename.endsWith("~"))
        x.filename = x.filename.slice(0, x.filename.length - 1);

      if (!settings.entryPoints.includes(x.filename))
      {
        settings.entryPoints.push(path.join(settings.outdir, x.filename));
        context = await esbuild.context(settings);
      }
      buildFiles = await context.rebuild().then(x => x.outputFiles);
      console.info("Rebuilt successfully!", new Date().toLocaleTimeString());
    }
    catch (e)
    {
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
const port = 5000;
const file = await fs.promises.readFile("routes.json");
const data = JSON.parse(file.toString());
const keys = Object.keys(data).map(x => ({
  pattern: new RegExp(data[x]),
  target: `http://localhost:${port}` + x
}))
const proxies = [{
  pattern: /^\/api\/(.*)/,
  target: "http://localhost:3000/$1"
}, ...keys];
runServer({port, src: SRC_DIR, proxies});

/**
 * @param {{port: number, src: string, proxies: {pattern: RegExp,target}[]}} settings
 */
export function runServer({port, src, proxies})
{
  const proxyServers = new Map();
  proxies.forEach(x =>
  {
    // noinspection JSUnresolvedReference
    proxyServers.set(x.target, httpProxy.createProxyServer({target: new URL(x.target).origin}));
  })
  http.createServer(async (request, response) =>
  {
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
  let resultLocation = proxy.target;
  const indices = resultLocation.match(/(?<=\$)\d+/g) ?? [];
  for (const index of indices)
  {
    resultLocation = resultLocation.replaceAll("$" + index, matches[index]);
  }
  request.url = resultLocation;
  //TODO DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead
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
  let filePath = path.join(src, request.url).split("?")[0];
  filePath = decodeURI(filePath);
  if (!request.headers.accept?.includes("text/html"))
  {
    return getFile(filePath) ?? {statusCode: 404, data: null, headers: {}};
  }
  return getFile(filePath.replace(/\/$/, "") + ".html") ??
    getFile(path.join(filePath, "index.html")) ??
    getFile(filePath) ??
    getFile(path.join(src, "404.html"))
}

function last(items)
{
  return items[items.length - 1];
}

export function getFile(filePath)
{
  const foundItem = buildFiles.find(x => x.path === filePath);
  if (!foundItem)
    return null;
  const extension = last(filePath.split("."));
  const headers = {};
  if (extension && contentTypeExtensions[extension])
    headers["Content-Type"] = contentTypeExtensions[extension];

  return {statusCode: 200, data: foundItem.contents, headers};
}
