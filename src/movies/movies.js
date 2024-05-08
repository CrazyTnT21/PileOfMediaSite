import {get} from "/assets/scripts/http.js";
import {ColumnType} from "../assets/components/app-table.js";
import {Config} from "../assets/scripts/config.js";
import {SERVER_URL} from "../modules.js";

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
      key: "added",
      display: "Added",
      width: "80px",
      formatFn: (item) =>
      {
        if (!item.added)
          return null;
        return Config.getConfig().dateFormatter.format(new Date(item.added));
      },
    },
    {
      key: "airing",
      display: "Airing",
      width: "80px",
      formatFn: (item) =>
      {
        if (!item.airing)
          return null;
        return Config.getConfig().dateFormatter.format(new Date(item.airing));
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

const items = await get(SERVER_URL + "movies");
if (items.length > 0)
{
  table.columns = columns();
  table.items = items;
}

