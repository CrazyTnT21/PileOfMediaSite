import esbuild from "esbuild";
import {createBuildSettings} from "./common.js";
import * as fs from "fs";
import * as glob from "glob";
import * as http from "http";
import * as path from "path";
import httpProxy from "http-proxy";

const settings = createBuildSettings({
  sourcemap: true,
  write: false,
});
settings.outdir = "src";

const ctx = await esbuild.context(settings);
const entryPointsFiles = settings.entryPoints.map(x => glob.sync(x));
const files = [];
for (const x of entryPointsFiles)
  files.push(...x);

let buildOutput = await ctx.rebuild();
let lastError;
for (const file of files)
{
  (async () =>
  {
    const result = await fs.promises.watch(file);
    // eslint-disable-next-line no-unused-vars
    for await (const x of result)
    {
      try
      {
        buildOutput = await ctx.rebuild();
        if (lastError)
        {
          lastError = null;
          console.log("Rebuilt sucessfully!");
        }
      }
      catch (e)
      {
        lastError = e.message;
        console.error(e.message);
      }
    }
  })();
}

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
await runServer();

// eslint-disable-next-line no-undef
export async function runServer(port = 5000, src = path.join(process.cwd(), "src"))
{
  const proxyTarget = "http://localhost:3000";
  const proxyServer = httpProxy.createProxyServer({target: proxyTarget});
  http.createServer(async (request, response) =>
  {
    if (request.url.startsWith("/api/"))
    {
      request.url = request.url.split("/api/")[1];
      proxyServer.web(request, response, null, (error) =>
      {
        console.error(`Error while proxying request to ${proxyTarget}:`, error["code"]);
        writeResponse(response, {statusCode: 500, data: null, headers: {}})
      });

      return;
    }
    const responseItem = await processRequest(request, src);
    await writeResponse(response, responseItem);
  }).listen(port);

  console.info(`Server running at http://localhost:${port}\nCTRL + C to shutdown\n`);
}

function writeResponse(response, file)
{
  response.writeHead(file.statusCode, file.headers);
  if (file.data !== null && file.data !== undefined)
    response.write(file.data, "binary");
  response.end();
}

async function processRequest(request, src)
{
  const filePath = path.join(src, request.url);

  return await getFile(filePath) ??
    await getFile(filePath + ".html") ??
    await getFile(path.join(filePath, "/index.html")) ??
    await getFile(path.join(filePath, `/${last(filePath.split("\\"))}.html`)) ??
    {statusCode: 404, data: null, headers: {}};
}

function last(items)
{
  return items[items.length - 1];
}

export async function getFile(filePath)
{
  const find = buildOutput.outputFiles.find(x => x.path === filePath);
  if (find)
  {
    const extension = last(find.path.split("."));
    const headers = {};
    if (extension && contentTypeExtensions[extension])
      headers["Content-Type"] = contentTypeExtensions[extension];

    return {statusCode: 200, data: find.contents, headers};
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory())
    return null;

  const headers = {};
  const extension = last(filePath.split("."));
  if (contentTypeExtensions[extension])
    headers["Content-Type"] = contentTypeExtensions[extension];
  const data = await fs.promises.readFile(filePath, "binary");
  return {statusCode: 200, data, headers};
}
