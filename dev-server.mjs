// Require in some of the native stuff that comes with Node

// Port number to use
import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const port = 4000;
// Colors for CLI output
const gray = "\x1b[37m";

// Create the server
http.createServer(async (request, response) =>
{
  let filename = path.join(process.cwd(), request.url);

  const contentTypesByExtension = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "text/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
  };
  const exists = fs.existsSync(filename);
  if (!exists)
  {
    const htmlFilename = filename + ".html";

    const existsHtmlFile = fs.existsSync(htmlFilename);
    if (!existsHtmlFile)
    {
      writeNotFound(response);
      return;
    }

    const file = await fs.promises.readFile(htmlFilename, "binary")
      .catch(x => writeError(response, x));

    const contentType = contentTypesByExtension[path.extname(filename)];
    const headers = {};
    if (contentType)
      headers["Content-Type"] = contentType;

    writeOK(response, file, headers);
    return;
  }
  if (path.basename(filename).toLowerCase() === "mycollectionsite")
  {
    const file = await fs.promises.readFile(path.join("MyCollectionSite", "index.html"), "binary")
      .catch(x => writeError(response, x));

    const contentType = contentTypesByExtension[path.extname(filename)];
    const headers = {};
    if (contentType)
      headers["Content-Type"] = contentType;

    writeOK(response, file, headers);
    return;
  }
  if (fs.statSync(filename).isDirectory())
  {
    //Having multiple index.html files sucks, so a file with the same name as the directory is considered the index
    const directoryIndex = path.join(filename, path.basename(filename) + ".html");

    const existsIndex = fs.existsSync(directoryIndex);
    if (!existsIndex)
    {
      writeNotFound(response);
      return;
    }

    const file = await fs.promises.readFile(directoryIndex, "binary")
      .catch(x => writeError(response, x));

    const contentType = contentTypesByExtension[path.extname(filename)];
    const headers = {};
    if (contentType)
      headers["Content-Type"] = contentType;

    writeOK(response, file, headers);
    return;
  }
  const file = await fs.promises.readFile(filename, "binary")
    .catch(x => writeError(response, x));

  const contentType = contentTypesByExtension[path.extname(filename)];
  const headers = {};
  if (contentType)
    headers["Content-Type"] = contentType;

  writeOK(response, file, headers);

}).listen(port);

console.log(gray + `Server running at http://localhost:${port}\nCTRL + C to shutdown`);

function writeNotFound(response)
{
  response.writeHead(404, {"Content-Type": "text/plain"});
  response.write("Not Found" + "\n");
  response.end();
}

function writeOK(response, file, headers)
{
  response.writeHead(200, headers);
  response.write(file, "binary");
  response.end();
}

function writeError(response, error)
{
  console.error(error);
  response.writeHead(500, {"Content-Type": "text/plain"});
  response.write(error + "\n");
  response.end();
}
