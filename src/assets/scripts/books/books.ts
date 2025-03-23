import {AppTable, Column, ColumnType} from "../../components/app-table/app-table";
import {Config, getTranslatedField, logError} from "../../classes/config";
import {Book} from "../../openapi/book";
import {apiClient} from "../../openapi/client";

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

const {data, error} = await apiClient.GET("/books");
if (data == undefined)
{
  logError(new Error(error));
}
else
{
  table.classList.add("test");
  table.columns = columns();
  table.items = data.items.map(x =>
  {
    const {translation} = getTranslatedField(x);
    return {
      ...
          x,
      title: translation.title,
      uri: translation.cover.versions[0]!.uri
    }
  });
  table.total = data.total;
}
