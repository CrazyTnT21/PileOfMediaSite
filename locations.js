import {promises as fs} from "node:fs";
import routes from './routes.json' with {type: "json"};

const keys = Object.keys(routes);
let result = [];
for (const key of keys)
{
  result.push(`
location ~ ${routes[key]} {
   try_files ${key} = /404.html;
}`)
}
await fs.writeFile("locations.nginx.conf", result.join(""))
