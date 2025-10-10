import {applyStyleSheet, attach} from "../defaults";
import {LoginReturn} from "../../openapi/login-return";
import {ImageData} from "../../openapi/image-data";
import {AppButton} from "../app-button/app-button";
import {AppSearchInput, appSearchInputTexts} from "../inputs/app-search-input/app-search-input";
import html from "./app-header.html" with {type: "inline"}
import css from "./app-header.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {AppHeaderSearch} from "./app-header-search/app-header-search";
import {Observer} from "../../observer";
import {IncludesString, indexArray, matchNestedTexts, templateString} from "../inputs/common";

export type AppHeaderElements = {
  burger: HTMLDetailsElement,
  user: HTMLDetailsElement,
  logoutButton: AppButton,
  profilePicture: HTMLImageElement,
  profileLink: HTMLAnchorElement,
  searchInput: AppSearchInput,
  navigationItems: HTMLUListElement,
  searchElements: HTMLUListElement,
  searchDropdown: HTMLDivElement,
  graphicNovelsText: [HTMLSpanElement, HTMLSpanElement],
  gamesText: [HTMLSpanElement, HTMLSpanElement],
  moviesText: [HTMLSpanElement, HTMLSpanElement],
  showsText: [HTMLSpanElement, HTMLSpanElement],
  booksText: [HTMLSpanElement, HTMLSpanElement],
  profileText: HTMLSpanElement,
  friendsText: HTMLSpanElement,
  reviewsText: HTMLSpanElement,
  settingsText: HTMLSpanElement,
  preferencesText: HTMLSpanElement,
  commentsText: HTMLSpanElement,
  logoutText: HTMLSpanElement,
  loginText: HTMLSpanElement,
  settingsIcon: HTMLSpanElement,
  showingResults: HTMLDivElement,
  loginLink: HTMLAnchorElement
  settings: HTMLDetailsElement,
};
export const appHeaderTexts = {
  graphicNovels: "Graphic novels",
  books: "Books",
  movies: "Movies",
  shows: "Shows",
  games: "Games",
  profile: "Profile",
  friends: "Friends",
  reviews: "Reviews",
  settings: "Settings",
  preferences: "Preferences",
  comments: "Comments",
  logout: "Logout",
  login: "Log in",
  showingResults: templateString<IncludesString<["{count}", "{total}"]>>("Showing {count} of {total} results"),
  ...appSearchInputTexts
};

const headerTag = "app-header" as const;
export type HeaderTag = typeof headerTag;

export class AppHeader extends HTMLElement
{
  public readonly texts = new Observer(appHeaderTexts);

  private readonly placeholderImageUrl = "/assets/img/User_Placeholder.svg";

  public override shadowRoot: ShadowRoot;
  private readonly searchDropdown: AppHeaderSearch;

  private readonly elements: AppHeaderElements;
  protected static readonly elementSelectors: { [key in keyof AppHeader["elements"]]: string } = {
    burger: "#burger",
    user: "#user",
    logoutButton: "#logout-button",
    profilePicture: "#profile-picture",
    profileLink: "#profile-link",
    searchInput: "app-search-input",
    navigationItems: "#items",
    searchElements: "#search-elements",
    searchDropdown: "#search-dropdown",
    graphicNovelsText: "[data-id=graphic-novels-text]",
    gamesText: "[data-id=games-text]",
    moviesText: "[data-id=movies-text]",
    showsText: "[data-id=shows-text]",
    booksText: "[data-id=books-text]",
    showingResults: "#showing-results",
    profileText: "#profile-text",
    friendsText: "#friends-text",
    reviewsText: "#reviews-text",
    settingsText: "#settings-text",
    preferencesText: "#preferences-text",
    commentsText: "#comments-text",
    logoutText: "#logout-text",
    loginText: "#login-text",
    loginLink: "#login",
    settings: "#settings",
    settingsIcon: "#settings-icon",
  }

  public get account(): LoginReturn | null
  {
    const data = localStorage.getItem("account");
    if (!data)
      return null;
    return JSON.parse(data);
  }

  public set account(value: LoginReturn | null)
  {
    if (value == null)
      localStorage.removeItem("account");
    else
      localStorage.setItem("account", JSON.stringify(value));

    this.loadAccount();
  }

  public constructor()
  {
    super();
    this.shadowRoot = attach(this);
    this.render();
    this.elements = mapSelectors<AppHeaderElements>(this.shadowRoot, AppHeader.elementSelectors);
    this.searchDropdown = new AppHeaderSearch(this);
    this.searchDropdown.setupSearch(this.shadowRoot);
    this.matchAllLabelTexts([
      ["graphicNovels", this.elements.graphicNovelsText],
      ["games", this.elements.gamesText],
      ["books", this.elements.booksText],
      ["movies", this.elements.moviesText],
      ["shows", this.elements.showsText],
      ["profile", this.elements.profileText],
      ["friends", this.elements.friendsText],
      ["reviews", this.elements.reviewsText],
      ["settings", this.elements.settingsText],
      ["preferences", this.elements.preferencesText],
      ["comments", this.elements.commentsText],
      ["logout", this.elements.logoutText],
      ["login", this.elements.loginText],
    ]);
    this.texts.addListener("settings", (value) => this.elements.settingsIcon.title = value);
    matchNestedTexts(this.texts, this.elements.searchInput.texts);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected async connectedCallback(): Promise<void>
  {
    const {burger, user, logoutButton, settings} = this.elements;

    burger.addEventListener("focusout", (e) =>
    {
      if (burger.contains(<HTMLElement | null>e.relatedTarget))
        return;
      burger.open = false;
    });

    user.addEventListener("focusout", (e) =>
    {
      if (user.contains(<HTMLElement | null>e.relatedTarget))
        return;
      user.open = false;
    });

    settings.addEventListener("focusout", (e) =>
    {
      if (settings.contains(<HTMLElement | null>e.relatedTarget))
        return;
      settings.open = false;
    });

    logoutButton.addEventListener("click", () => this.account = null);
    this.loadAccount();
  }

  private loadAccount(): void
  {
    const localAccount = localStorage.getItem("account");
    this.elements.loginLink.hidden = !!localAccount;
    this.elements.user.hidden = !localAccount;

    const {profilePicture} = this.elements;
    if (localAccount)
    {
      const user: LoginReturn["user"] = JSON.parse(localAccount).user;
      const {profileLink} = this.elements;
      profileLink.href = `/users/${user.name}`;
      if (user.profile_picture)
      {
        user.profile_picture.versions.sort((x: ImageData, y: ImageData) => x.width * x.height - y.width * y.height);
        profilePicture.src = indexArray(user.profile_picture.versions, 0).unwrap().uri;
        return;
      }
    }
    profilePicture.src = this.placeholderImageUrl;
  }

  private copyToHamburger(items: HTMLLIElement[]): void
  {
    const nodes = items.map(x => x.cloneNode(true));
    const ul = document.createElement("ul");
    ul.classList.add("burger-items");
    for (const item of nodes)
    {
      ul.append(item);
    }
    const burger: AppHeaderElements["burger"] = this.shadowRoot.querySelector(AppHeader.elementSelectors.burger)!;
    burger.appendChild(ul);
  }

  private matchAllLabelTexts(labels: [keyof typeof appHeaderTexts, HTMLElement | HTMLElement[]][]): void
  {
    for (const [key, elements] of labels)
    {
      if (!Array.isArray(elements))
      {
        this.matchLabelText(key, elements);
        continue;
      }
      for (const element of elements)
      {
        this.matchLabelText(key, element);
      }
    }
  }

  private matchLabelText(key: keyof typeof appHeaderTexts, element: HTMLElement): void
  {
    this.texts.addListener(key, (value) => element.innerText = value);
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    const items = <HTMLLIElement[]>[...this.shadowRoot.querySelector(AppHeader.elementSelectors.navigationItems)!.children];
    this.copyToHamburger(items);
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  private styleCSS(): string
  {
    return css;
  }


  public static define(): void
  {
    if (customElements.get(headerTag))
      return;

    AppSearchInput.define();
    AppButton.define();
    customElements.define(headerTag, AppHeader);
  }
}

AppHeader.define()
