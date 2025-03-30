import {Err, Ok, Result} from "../../../result/result";
import {apiClient} from "../../../openapi/client";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../../classes/config";
import {queryParam} from "../../inputs/common";
import {SearchEvent} from "../../inputs/app-search-input/search-event";
import {AppSearchInput} from "../../inputs/app-search-input/app-search-input";
import searchHTML from "../app-header-search/app-header-search-item.html" with {type: "inline"}

type SearchItem = {
  title: string,
  srcset: string,
  href: string,
  lang: string,
  type: string,
  rating: { score: number | undefined | null, amount: number } | null
};

export class AppHeaderSearch
{
  private readonly searchDropdown: HTMLElement;
  private readonly searchElements: HTMLElement;
  private readonly maxResults: HTMLElement;
  private readonly searchResultsNumber: HTMLElement;
  private readonly searchInput: AppSearchInput;
  private readonly cachedSearch: Map<string, { items: SearchItem[], total: number }> = new Map();
  private currentSearch: string | undefined;
  private previousRequestTime: Date = new Date();

  constructor(searchDropdown: HTMLElement, searchElements: HTMLElement, maxResults: HTMLElement, searchResultsNumber: HTMLElement, searchInput: AppSearchInput)
  {
    this.searchDropdown = searchDropdown;
    this.searchElements = searchElements;
    this.maxResults = maxResults;
    this.searchResultsNumber = searchResultsNumber;
    this.searchInput = searchInput;
  }

  async search(value: string): Promise<Result<void, Error>>
  {
    this.currentSearch = value;
    const title = value;
    const cached = this.cachedSearch.get(title);
    if (cached)
    {
      this.setItems(cached.items, cached.total);
      return new Ok(undefined);
    }
    if (!title)
    {
      this.setItems([], 0);
      return new Ok(undefined);
    }

    const cooldownTimeMs = 1000;
    const oneSecondAgo = new Date();
    oneSecondAgo.setMilliseconds(oneSecondAgo.getMilliseconds() - cooldownTimeMs);
    if (this.previousRequestTime.getTime() > oneSecondAgo.getTime())
    {
      setTimeout(() => this.search(this.currentSearch!), cooldownTimeMs / 4);
      return new Ok(undefined);
    }
    this.previousRequestTime = new Date();

    const {ok: books, error: booksError} = await this.searchBooks(title);
    if (booksError != null)
      return new Err(booksError);

    this.cachedSearch.set(value, {items: books.items, total: books.total});
    this.setItems(books.items, books.total);
    return new Ok(undefined)
  }

  private async searchBooks(value: string): Promise<Result<{ items: SearchItem[], total: number }, Error>>
  {
    const {data, error} = await apiClient.GET("/books/title/{title}", {
      params: {
        header: {...acceptLanguageHeader()},
        path: {
          title: value
        },
        ...queryParam(0, 15),
      },
    })
    if (error != null)
      return new Err(new Error(error));

    const mappedItems = data.items.map(item =>
    {
      const {score, amount} = item.statistic.rating;
      const rating = {score, amount};
      const {translation, language} = getTranslatedField(item);
      const srcset = translation.cover.versions.map(x => `${x.uri} ${x.width}w`).join(",");
      return {
        title: translation.title,
        srcset,
        href: `/books/${item.slug}`,
        lang: language,
        type: "Book",
        rating
      }
    })
    return new Ok({items: mappedItems, total: data.total});
  }

  private setItems(items: SearchItem[], total: number): void
  {
    this.searchElements.innerHTML = "";
    this.searchDropdown.setAttribute("data-total", total.toString());
    this.maxResults.innerText = items.length.toString();
    this.searchResultsNumber.innerText = total.toString();
    for (const item of items)
    {
      const liElement = this.addItem(item);
      this.searchElements.appendChild(liElement);
    }
  }

  private addItem(item: SearchItem): HTMLLIElement
  {
    const li = document.createElement("li");
    li.innerHTML = searchHTML;
    const anchor = li.querySelector("a")!;
    const image = li.querySelector("img")!;
    const title: HTMLSpanElement = li.querySelector(".title")!;
    const type: HTMLSpanElement = li.querySelector(".type")!;
    anchor.href = item.href;
    anchor.lang = item.lang.toLowerCase();

    image.srcset = item.srcset;
    title.innerText = item.title;
    type.innerText = item.type;

    if (item.rating?.score)
    {
      const rating: HTMLElement = li.querySelector(".rating")!;
      rating.setAttribute("data-rating", "");
      rating.classList.add("rating");
      rating.innerText = item.rating.score.toString()
    }

    return li;
  }


  setupSearch(shadowRoot: ShadowRoot): void
  {
    const {searchInput, searchElements} = this;
    searchInput.addEventListener(SearchEvent.type, (e: CustomEventInit<string>) =>
    {
      const emptySearch = e.detail!.trim().length == 0;
      window.location.href = emptySearch ? "/search" : "/search?q=" + e.detail!;
    });
    searchInput.addEventListener("input", async () =>
    {
      const {error} = await this.search(searchInput.value)
      if (error)
        logError(error);
    });
    searchElements.addEventListener("keydown", e => this.searchElementsKeyDown(shadowRoot, e))
  }

  private searchElementsKeyDown(shadowRoot: ShadowRoot, event: KeyboardEvent): void
  {
    if (event.key != "ArrowUp" && event.key != "ArrowDown")
      return;

    event.preventDefault();
    const {searchElements} = this;

    const currentFocus = shadowRoot.activeElement!;
    const currentFocusParent = currentFocus.parentElement!;
    if (currentFocus.isSameNode(searchElements))
    {
      const anchor: HTMLAnchorElement = <HTMLAnchorElement>searchElements.children[0]!.children[0]!;
      anchor.focus();
    }

    let nextSelectedParent = null;

    if (event.key == "ArrowDown")
    {
      if (searchElements.contains(currentFocusParent.nextElementSibling))
      {
        nextSelectedParent = currentFocusParent.nextElementSibling!;
      }
    }

    if (event.key == "ArrowUp")
    {
      if (searchElements.contains(currentFocusParent.previousElementSibling))
      {
        nextSelectedParent = currentFocusParent.previousElementSibling!;
      }
    }

    if (nextSelectedParent)
    {
      const anchor: HTMLAnchorElement = <HTMLAnchorElement>nextSelectedParent.firstElementChild;
      anchor.focus();
    }
  }
}
