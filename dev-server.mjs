import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const routes = [
  {
    route: "/",
    file: "index.html",
  },
  {
    route: "/user/{id/username}",
    file: "/user/user.html",
  },
  {
    route: "/user/profile",
    file: "/user/profile.html",
  },
  {
    route: "/user/comments",
    file: "/user/comments.html",
  },
  {
    route: "/user/friends",
    file: "/user/friends.html",
  },
  {
    route: "/user/reviews",
    file: "/user/reviews.html",
  },
  {
    route: "/user/preferences",
    file: "/user/preferences.html",
  },
  {
    route: "/comics",
    file: "/comics/comics.html",
  },
  {
    route: "/comics/{id}",
    file: "/comics/comics-single.html",
  },
];
validateRoutes();
const port = 4000;

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
  let file = null;
  const index = routes.findIndex(x => x.route === request.url);
  if (index >= 0)
  {
    const data = await fs.promises.readFile(path.join(process.cwd(), routes[index].file), "binary");
    const headers = {"Content-Type": "text/html"};

    file = {statusCode: 200, data: data, headers: headers};
  }
  if (!file)
  {
    let filename = path.join(process.cwd(), request.url);
    const exists = fs.existsSync(filename);
    if (exists)
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
    const data = await fs.promises.readFile(path.join(process.cwd(), "404.html"), "binary");
    const headers = {"Content-Type": "text/html"};

    file = {statusCode: 404, data: data, headers: headers};
  }

  writeResponse(response, file);

}).listen(port);

console.log(`Server running at http://localhost:${port}\nCTRL + C to shutdown\n`);
console.log("Configured routes:");
routes.forEach(x => console.log(x.route + " => \x1b[33m" + x.file + "\x1b[0m"));

function writeResponse(response, file)
{
  response.writeHead(file.statusCode, file.headers);
  response.write(file.data, "binary");
  response.end();
}

function validateRoutes()
{
  for (let i = 0; i < routes.length; i++)
    if (!fs.existsSync(path.join(process.cwd(), routes[i].file)))
      throw new Error(routes[i].file + " does not exist!");
}
