import {promises as fs} from "node:fs";

const file = await fs.readFile("routes.json");
const data = JSON.parse(file.toString());
const keys = Object.keys(data);
let result = [];
for (const key of keys)
{
  result.push(`
location ~ ${data[key]} {
   try_files ${key} = /404.html;
}`)
}
await fs.writeFile("locations.nginx.conf", result.join(""))
