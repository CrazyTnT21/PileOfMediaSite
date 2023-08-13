import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const routes =
    {
        route: "",
        file: "index.html",
        routes: [
            {
                route: "user",
                routes: [
                    {
                        route: "{id/username}",
                        file: "/user/user.html",
                        routes: [
                            {
                                route: "profile",
                                file: "/user/profile.html",
                            },
                            {
                                route: "comments",
                                file: "/user/comments.html",
                            },
                            {
                                route: "friends",
                                file: "/user/friends.html",
                            },
                            {
                                route: "reviews",
                                file: "/user/reviews.html",
                            },
                            {
                                route: "preferences",
                                file: "/user/preferences.html",
                            },
                        ],
                    },

                ],
            },
            {
                route: "comics",
                file: "/comics/comics.html",
                routes: [
                    {
                        route: "{id}",
                        file: "/comics/comics-single.html",
                    },
                ],
            },
            {
                route: "books",
                file: "/books/main/books.html",
                routes: [
                    {
                        route: "{id}",
                        file: "/books/single/books-single.html",
                        routes: [
                            {
                                route: "edit",
                                file: "/books/edit/books-edit.html",
                            },
                        ],
                    },
                ],
            },
        ],
    };
validateRoutes(routes);
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

/**
 * Sort the routes, so that wildcard routes ({id}) appear last and don't invalidate working routes that appear later
 * @param route
 */
function sortRoutes(route)
{
    if (!route.routes)
        return;

    route.routes.sort((x, y) =>
        {
            const pattern = new RegExp(/\{.*\}/);
            if (pattern.test(x.route))
                return 0;
            return -1;
        },
    );
    for (let i = 0; i < route.routes.length; i++)
    {
        sortRoutes(route.routes[i]);
    }
}

function getRoute(route, currentRoute)
{
    const pattern = /\{.*\}/;

    for (let i = 0; i < currentRoute.routes.length; i++)
    {
        if (route[0] === currentRoute.routes[i].route ||
            pattern.test(currentRoute.routes[i].route))
        {
            if (route.length === 1)
                return currentRoute.routes[i];

            route.splice(0, 1);
            return getRoute(route, currentRoute.routes[i]);
        }
    }
    return null;
}

sortRoutes(routes);
http.createServer(async (request, response) =>
{
    let file = null;
    if (request.headers.accept.split(",").includes("text/html"))
    {
        const route = request.url.split("/");
        route.splice(0, 1);
        let currentRoute = getRoute(route, routes);
        if (currentRoute && currentRoute.file)
        {
            const data = await fs.promises.readFile(path.join(process.cwd(), currentRoute.file), "binary");
            const headers = {"Content-Type": "text/html"};

            file = {statusCode: 200, data: data, headers: headers};
        }
    }
    if (!file)
    {
        let filename = path.join(process.cwd(), request.url);
        const exists = fs.existsSync(filename);
        if (exists && !fs.statSync(filename).isDirectory())
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

function writeResponse(response, file)
{
    response.writeHead(file.statusCode, file.headers);
    response.write(file.data, "binary");
    response.end();
}

function validateRoutes(route)
{
    if (!route.routes)
        return;

    for (let i = 0; i < route.routes.length; i++)
    {
        validateRoutes(route.routes[i]);
        if (route.routes[i].file && !fs.existsSync(path.join(process.cwd(), route.routes[i].file)))
            throw new Error(route.routes[i].file + " does not exist!");
    }
}
