import {AppTable, Column, ColumnType} from "../assets/components/app-table.js";
import {Config} from "../assets/classes/config.js";
import {API_URL} from "../modules.js";
import {Book} from "../assets/types/book.js";
import {paths} from "mycollection-openapi";
import createClient from "openapi-fetch";

function columns(): Column<Book>[]
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
      type: ColumnType.Text
    },
    {
      key: "pages",
      display: "Pages",
      width: "80px",
      type: ColumnType.Text
    },
    {
      key: "published",
      display: "Published",
      width: "80px",
      type: ColumnType.Text,
      formatFn: (item: Book): string =>
      {
        if (!item.published)
          return "";
        return Config.getConfig().dateFormatter.format(new Date(item.published));
      },
    },
    {
      key: "score",
      display: "Score",
      width: "50px",
      type: ColumnType.Text
    },
    {
      key: "rank",
      display: "Rank",
      width: "50px",
      type: ColumnType.Text
    },
  ];
}

const table: AppTable<Book> = document.querySelector("app-table")!;

const client = createClient<paths>({baseUrl: API_URL})
const {data, error} = await client.GET("/books");
if (data == undefined)
{
  console.error(error);
}
else
{
  table.classList.add("test");
  table.columns = columns();
  table.items = data.items.map(x => ({...x, uri: x.cover.versions[0]!.uri}));
  table.total = data.total;
}
