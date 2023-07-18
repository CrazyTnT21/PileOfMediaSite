import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const port = 4000;
// Colors for CLI output
const gray = "\x1b[37m";

const contentTypeExtensions = {
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
http.createServer(async (request, response) =>
{
  let filename = path.join(process.cwd(), request.url);
  let file = null;
  const filepath = path.basename(filename).toLowerCase();

  if (filepath === 'mycollectionsite')
  {
    const data = await fs.promises.readFile(path.join("MyCollectionSite", "index.html"), "binary");
    const headers = {"Content-Type": contentTypeExtensions[".html"]};

    file = {statusCode: 200, data: data, headers: headers};
  }
  const exists = fs.existsSync(filename);

  if (!file && exists)
  {
    if (fs.statSync(filename).isDirectory())
    {
      const directoryIndex = path.join(filename, path.basename(filename) + ".html");

      const existsIndex = fs.existsSync(directoryIndex);
      if (existsIndex)
      {
        const data = await fs.promises.readFile(directoryIndex, "binary");
        const contentType = contentTypeExtensions[path.extname(directoryIndex)];
        const headers = {};
        if (contentType)
          headers["Content-Type"] = contentType;

        file = {statusCode: 200, data: data, headers: headers};
      }
    }
    else
    {
      const data = await fs.promises.readFile(filename, "binary");
      const contentType = contentTypeExtensions[path.extname(filename)];
      const headers = {};
      if (contentType)
        headers["Content-Type"] = contentType;

      file = {statusCode: 200, data: data, headers: headers};
    }
  }
  if (!file)
  {
    const htmlFileName = filename + ".html";
    const existsHtml = fs.existsSync(htmlFileName);
    if (existsHtml)
    {
      const data = await fs.promises.readFile(htmlFileName, "binary");
      const contentType = contentTypeExtensions[path.extname(htmlFileName)];
      const headers = {};
      if (contentType)
        headers["Content-Type"] = contentType;

      file = {statusCode: 200, data: data, headers: headers};
    }
  }
  if (!file)
  {
    const data = await fs.promises.readFile(path.join(process.cwd(), "MyCollectionSite", "404.html"), "binary");
    const contentType = contentTypeExtensions[".html"];
    const headers = {"Content-Type": contentType};

    file = {statusCode: 404, data: data, headers: headers};
  }

  writeResponse(response, file);

}).listen(port);

console.log(gray + `Server running at http://localhost:${port}\nCTRL + C to shutdown`);

function writeResponse(response, file)
{
  response.writeHead(file.statusCode, file.headers);
  response.write(file.data, "binary");
  response.end();
}
