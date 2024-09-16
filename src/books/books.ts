import {AppTable, Column, ColumnType} from "../assets/components/app-table.js";
import {Config} from "../assets/classes/config.js";
import {API_URL} from "../modules.js";
import {Book} from "../assets/types/book.js";
import {components} from "mycollection-openapi";
import {get} from "../assets/scripts/http.js";

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
      formatFn: (item: Book) =>
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
try
{
  const result: components["schemas"]["BooksTotal"] = await get(API_URL + "books");
  table.classList.add("test");
  table.columns = columns();
  let items = result.items;
  items.forEach(x => (<any>x)["uri"] = x.cover.versions[0]!.uri);
  table.items = items;
  table.total = result.total;
}
catch (e)
{
  console.error(e);
}

