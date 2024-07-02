import {get} from "/assets/scripts/http.js";
import {ColumnType} from "../assets/components/app-table.js";
import {Config} from "../assets/scripts/config.js";
import {SERVER_URL} from "../modules.js";

function columns()
{
  return [
    {
      key: "uri",
      display: "Cover",
      type: ColumnType.Image,
      width: "80px",
    },
    {
      key: "title",
      display: "Title",
    },
    {
      key: "pages",
      display: "Pages",
      width: "80px",
    },
    {
      key: "published",
      display: "Published",
      width: "80px",
      formatFn: (item) =>
      {
        if (!item.published)
          return null;
        return Config.getConfig().dateFormatter.format(new Date(item.published));
      },
    },
    {
      key: "score",
      display: "Score",
      width: "50px",
    },
    {
      key: "rank",
      display: "Rank",
      width: "50px",
    },
  ];
}

const table = document.querySelector("app-table");
try
{
  const result = await get(SERVER_URL + "books");
  table.classList.add("test");
  table.columns = columns();
  let items = result.items;
  items.forEach(x => x.uri = x.cover.versions[0].uri);
  table.items = items;
  table.total = result.total;
} catch (e)
{
  console.error(e);
}

