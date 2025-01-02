import {applyStyleSheet, attach} from "../defaults";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import {LoginReturn} from "../../types/login-return";
import {ImageData} from "../../types/image-data";
import {AppButton} from "../app-button/app-button";
import {AppSearchInput} from "../inputs/app-search-input/app-search-input";
import {SearchEvent} from "../inputs/app-search-input/search-event";
import html from "./app-header.html" with {type: "inline"}
import css from "./app-header.css" with {type: "inline"}

export class AppHeader extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  private loginData: LoginReturn | undefined | null;

  override shadowRoot: ShadowRoot;

  async connectedCallback(): Promise<void>
  {
    const burger: HTMLDetailsElement = this.shadowRoot.querySelector("#burger")!;
    const user: HTMLDetailsElement = this.shadowRoot.querySelector("#user")!;
    burger.addEventListener("click", () => user.open = false);
    user.addEventListener("click", () => burger.open = false);

    const items = <HTMLLIElement[]>[...this.shadowRoot.querySelectorAll(".items > li")];
    this.copyToHamburger(items);
    const logoutButton: AppButton = this.shadowRoot.querySelector("#logout > app-button")!;
    logoutButton.addEventListener("click", () => this.account = null);
    this.loadAccount();
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
    const dropDownItems = [...this.shadowRoot.querySelector("#user-dropdown")!.children]
    dropDownItems.forEach(x =>
    {
      const element = (<HTMLElement>x);

      element.hidden = element.dataset["default"] != "";

      if (localAccount)
      {
        if (element.dataset["login"] == "")
          element.hidden = false
      }
      else
      {
        if (element.dataset["logout"] == "")
          element.hidden = false;
      }
    });
    const profilePicture: HTMLImageElement = this.shadowRoot.querySelector("#profile-picture")!;
    if (localAccount)
    {
      const user: LoginReturn["user"] = JSON.parse(localAccount).user;
      const profileLink: HTMLAnchorElement = this.shadowRoot.querySelector("#profile-link")!;
      profileLink.href = `/user/${user.name}`;
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
    this.shadowRoot.querySelector("#burger")!.appendChild(ul);
  }

  constructor()
  {
    super();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;
  placeholderImageUrl = "/assets/img/User_Placeholder.svg";

  render(): void
  {
    this.shadowRoot.innerHTML = html;
    this.shadowRoot.querySelector("app-search-input")!.addEventListener(SearchEvent.type, (e: CustomEventInit<string>) =>
    {
      const emptySearch = e.detail!.trim().length == 0;
      window.location.href = emptySearch ? "/search" : "/search?q=" + e.detail!;
    })
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
