import {get, server_Url} from "/assets/scripts/http.js";
import {ColumnType} from "../assets/components/app-table.js";
import {Config} from "../assets/scripts/config.js";

function columns()
{
  return [
    {
      key: "cover.uri",
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

const items = await get(server_Url + "books");

if (items.length > 0)
{
  table.classList.add("test");
  table.columns = columns();
  table.items = items;
}

