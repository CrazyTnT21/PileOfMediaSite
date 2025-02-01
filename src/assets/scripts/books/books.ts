import {AppTable, Column, ColumnType} from "../../components/app-table/app-table";
import {Config, logError} from "../../classes/config";
import {API_URL} from "../modules";
import {Book} from "../../openapi/book";
import {paths} from "pileofmedia-openapi";
import createClient from "openapi-fetch";

function columns(): Column<Book>[]
{
  return [
    {
      key: "uri",
      display: "Cover",
      type: ColumnType.Image,
      width: "80px",
      height: "113px"
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
        return Config.dateFormatter.format(new Date(item.published));
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
  logError(new Error(error));
}
else
{
  table.classList.add("test");
  table.columns = columns();
  table.items = data.items.map(x => ({...x, uri: x.cover.versions[0]!.uri}));
  table.total = data.total;
}
