import {applyStyleSheet, attach} from "../defaults";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import {LoginReturn} from "../../openapi/login-return";
import {ImageData} from "../../openapi/image-data";
import {AppButton} from "../app-button/app-button";
import {AppSearchInput} from "../inputs/app-search-input/app-search-input";
import html from "./app-header.html" with {type: "inline"}
import css from "./app-header.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {AppHeaderSearch} from "./app-header-search/app-header-search";

export type AppHeaderElements = {
  burger: HTMLDetailsElement,
  user: HTMLDetailsElement,
  logoutButton: AppButton,
  userDropdown: HTMLUListElement,
  profilePicture: HTMLImageElement,
  profileLink: HTMLAnchorElement,
  searchInput: AppSearchInput,
  navigationItems: HTMLUListElement,
  searchElements: HTMLUListElement,
  searchResultsNumber: HTMLSpanElement,
  searchDropdown: HTMLDivElement,
  maxResults: HTMLSpanElement
};

export class AppHeader extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  private loginData: LoginReturn | undefined | null;

  override shadowRoot: ShadowRoot;
  private readonly searchDropdown: AppHeaderSearch;

  readonly elements: AppHeaderElements;
  protected static readonly elementSelectors: { [key in keyof AppHeader["elements"]]: string } = {
    burger: "#burger",
    user: "#user",
    logoutButton: "#logout-button",
    userDropdown: "#user-dropdown",
    profilePicture: "#profile-picture",
    profileLink: "#profile-link",
    searchInput: "app-search-input",
    navigationItems: ".items",
    searchElements: "#search-elements",
    searchResultsNumber: "#results",
    searchDropdown: "#search-dropdown",
    maxResults: "#max-results"
  }

  async connectedCallback(): Promise<void>
  {
    const {burger, user, logoutButton} = this.elements;
    burger.addEventListener("focusout", (e) =>
    {
      if (burger.contains(<HTMLElement | null>e.relatedTarget))
        return;
      burger.open = false
    });

    user.addEventListener("focusout", (e) =>
    {
      if (user.contains(<HTMLElement | null>e.relatedTarget))
        return;
      user.open = false
    });

    const items = <HTMLLIElement[]>[...this.elements.navigationItems.children];
    this.copyToHamburger(items);
    logoutButton.addEventListener("click", () => this.account = null);
    this.loadAccount();
  }

  get account(): LoginReturn | null
  {
    const data = localStorage.getItem("account");
    if (!data)
      return null;
    return JSON.parse(data);
  }

  set account(value: LoginReturn | null)
  {
    if (value == null)
      localStorage.removeItem("account");
    else
      localStorage.setItem("account", JSON.stringify(value));

    this.loginData = value;
    this.loadAccount();
  }

  loadAccount(): void
  {
    const localAccount = localStorage.getItem("account");
    const userDropdown = [...this.elements.userDropdown.children];
    userDropdown.forEach(x =>
    {
      const element = (<HTMLElement>x);

      element.hidden = element.getAttribute("data-default") != "";

      if (localAccount)
      {
        if (element.getAttribute("data-login") == "")
          element.hidden = false
      }
      else
      {
        if (element.getAttribute("data-logout") == "")
          element.hidden = false;
      }
    });
    const {profilePicture} = this.elements;
    if (localAccount)
    {
      const user: LoginReturn["user"] = JSON.parse(localAccount).user;
      const {profileLink} = this.elements;
      profileLink.href = `/users/${user.name}`;
      if (user.profile_picture)
      {
        user.profile_picture.versions.sort((x: ImageData, y: ImageData) => x.width * x.height - y.width * y.height);
        profilePicture.src = user.profile_picture.versions[0]!.uri;
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
    this.elements.burger.appendChild(ul);
  }

  constructor()
  {
    super();
    this.shadowRoot = this.attach();
    this.render();
    this.elements = mapSelectors<AppHeaderElements>(this.shadowRoot, AppHeader.elementSelectors);
    this.applyStyleSheet();
    const {searchElements, searchDropdown, maxResults, searchResultsNumber, searchInput} = this.elements;
    this.searchDropdown = new AppHeaderSearch(searchDropdown, searchElements, maxResults, searchResultsNumber, searchInput);
    this.searchDropdown.setupSearch(this.shadowRoot)
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;
  placeholderImageUrl = "/assets/img/User_Placeholder.svg";

  render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  styleCSS(): string
  {
    return css;
  }

  public static define(): void
  {
    AppSearchInput.define();
    AppButton.define();
    if (customElements.get("app-header"))
      return;
    customElements.define("app-header", AppHeader);
  }
}

AppHeader.define()
