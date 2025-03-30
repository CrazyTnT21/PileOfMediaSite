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
  clearList();
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
  const count = 15;
  let total = 16;
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
  const booksUl: HTMLUListElement = document.querySelector("#items")!;
  for (const book of items)
  {
    const {translation, language} = getTranslatedField(book);
    const li = document.createElement("li");
    //language=HTML
    li.innerHTML = `
      <a class="col-12 pad border bigger">
        <img class="small-din-4" alt="" src="">
        <div class="col column pad-left">
          <div class="underscore-any" data-id="title"></div>
          <div class="col-12">
            <span data-id="type">Book</span>
            <span class="rating" data-id="rating"></span>
          </div>
        </div>
      </a>
    `;
    const anchor = li.querySelector("a")!;
    const text: HTMLDivElement = li.querySelector("[data-id='title']")!;
    const image = li.querySelector("img")!;
    anchor.href = `/books/${book.slug}`;
    text.innerText = translation.title;
    anchor.lang = language.toLowerCase();
    if (book.statistic.rating?.score)
    {
      const rating: HTMLDivElement = li.querySelector("[data-id='rating']")!;
      rating.setAttribute("data-rating", "");
      rating.innerText = book.statistic.rating.score.toString()
    }
    image.srcset = translation.cover.versions.map(x => `${x.uri} ${x.width}w`).join(",");
    booksUl.append(li);
  }
}

function clearList(): void
{
  const booksUl: HTMLUListElement = document.querySelector("#items")!;
  booksUl.innerHTML = "";
}
