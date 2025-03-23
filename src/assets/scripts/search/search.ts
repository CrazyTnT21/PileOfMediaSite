import {AppSearchInput} from "../../components/inputs/app-search-input/app-search-input";
import {SearchEvent} from "../../components/inputs/app-search-input/search-event";
import {Book} from "../../openapi/book";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

const params = new URLSearchParams((window.location.search))
AppSearchInput.define()

const input: AppSearchInput = document.querySelector("#search")!;
input.addEventListener(SearchEvent.type, async (e: CustomEventInit<string>) =>
{
  const searchValue = e.detail;
  if (!searchValue)
    return;
  clearLists();
  await search(searchValue)

})
const query = params.get("q");
if (query)
{
  input.value = query;
  await search(query)
}

async function search(value: string): Promise<void>
{
  window.history.replaceState(null, "", `/search?q=${value}`);
  const generator = searchBooks(value);
  loadBooks((await generator.next()).value)
}

async function* searchBooks(value: string): AsyncGenerator<Book[]>
{
  let page = 0;
  const count = 10;
  let total = 11;
  while (page * count < total)
  {
    const {data, error} = await apiClient.GET("/books/title/{title}", {
      params: {
        query: {count, page},
        path: {
          title: value
        },
        header: {...acceptLanguageHeader()}
      }
    })
    if (data == undefined)
    {
      logError(new Error(error))
      return [];
    }
    page++;
    total = data.total;
    yield data.items;
  }
}

function loadBooks(items: Book[]): void
{
  const booksUl: HTMLUListElement = document.querySelector("#books")!;
  for (const book of items)
  {
    const {translation} = getTranslatedField(book);
    const li = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = `/books/${book.slug}`;
    anchor.innerText = translation.title;
    li.append(anchor);
    booksUl.append(li);
  }
}

function clearLists(): void
{
  const booksUl: HTMLUListElement = document.querySelector("#books")!;
  booksUl.innerHTML = "";
}
