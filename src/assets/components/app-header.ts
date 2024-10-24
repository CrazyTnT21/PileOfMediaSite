import {applyStyleSheet, attach} from "./defaults.js";
import {ApplyStyleSheet} from "./apply-style-sheet.js";
import {StyleCSS} from "./style-css.js";
import {LoginReturn} from "../types/login-return.js";
import {ImageData} from "../types/image-data.js";
import {AppButton} from "./app-button.js";
import {AppSearchInput} from "./inputs/app-search-input/app-search-input";
import {SearchEvent} from "./inputs/app-search-input/search-event";

//TODO: color-scheme part
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
      profileLink.href = `/user/${user.id}`//`/user/${user.name}`
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
    // language=HTML
    this.shadowRoot.innerHTML = `
      <details id="burger">
        <summary>
        </summary>
      </details>
      <a class="logo" href="/">
        <img src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
      </a>
      <nav>
        <ul class="items">
          <li><a href="/graphicnovels"><span class="graphic-novel-icon" part="icon"></span>Graphic novels</a></li>
          <li><a href="/books"><span class="book-icon" part="icon"></span>Books</a></li>
          <li><a href="/movies"><span class="movie-icon" part="icon"></span>Movies</a></li>
          <li><a href="/shows"><span class="show-icon" part="icon"></span>Shows</a></li>
          <li><a href="/games"><span class="game-icon" part="icon"></span>Games</a></li>
        </ul>
      </nav>
      <slot name="search-input">
      </slot>
      <details id="user">
        <summary>
          <img id="profile-picture" src="${this.placeholderImageUrl}" alt="Profile"/>
        </summary>
        <ul id="user-dropdown">
          <li data-login>
            <a id="profile-link" href="/user/user"><span class="profile-icon" part="icon"></span>Profile</a>
          </li>
          <li data-login><a href="/user/friends"><span class="friends-icon" part="icon"></span>Friends</a></li>
          <li data-login>
            <a href="/user/comments"><span class="comment-icon" part="icon"></span>Comments</a>
          </li>
          <li data-login><a href="/user/reviews"><span class="review-icon" part="icon"></span>Reviews</a></li>
          <li data-default><a href="/user/settings"><span class="settings-icon" part="icon"></span>Settings</a>
          </li>
          <li data-default>
            <a href="/user/preferences"><span class="settings-icon" part="icon"></span>Preferences</a>
          </li>
          <li data-login id="logout">
            <app-button class="logout" exportparts="button,button: logout-button">
              <span class="center"><span class="logout-icon" part="icon, logout-icon"></span>Logout</span>
            </app-button>
          </li>
          <li data-logout id="login"><a href="/login"><span class="login-icon" part="icon"></span>Log in</a>
          </li>
          <li data-logout id="signup">
            <a href="/signup"><span class="login-icon" part="icon"></span>Sign up</a>
          </li>
        </ul>
      </details>
    `;
    //Inside innerHTML, so it gets styled
    this.innerHTML = `<app-search-input slot="search-input"></app-search-input>`
    this.querySelector("app-search-input")!.addEventListener(SearchEvent.type, (e: CustomEventInit<string>) =>
    {
      if (e.detail!.trim().length > 0)
        window.location.href = "/search?q=" + e.detail!
      else
        window.location.href = "/search"!
    })
  }

  styleCSS(): string
  {
    //language=CSS
    return `
      ::part(button) {
        padding: 5px;
      }

      ::slotted(app-search-input) {
        display: flex;
        min-width: 0;
        margin-left: auto;
      }

      .center {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logout {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
      }

      :host {
        display: flex;
        border-bottom: 1px solid gray;
        gap: 5px;
        align-items: center;
        align-content: center;
        justify-content: center;
      }

      .logo {
        margin-left: 5px;
        width: 35px;
        height: 35px;
        display: flex;
      }

      #user {
        margin-right: 5px;
        height: 35px;
        width: 35px;
      }

      li {
        box-sizing: border-box;

        & a {
          align-items: center;
        }
      }

      #user {
        summary {
          aspect-ratio: 1;
        }

        ul {
          z-index: 1;
          position: absolute;
          background-color: var(--primary-background);
          border-radius: 5px;
          padding: 5px;
          display: inline-flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;

          & li {
            white-space: nowrap;
            display: inline-flex;
            background-color: var(--clickable);
            padding: 0;

            & app-button {
              flex: 1;
            }

            & a {
              flex: 1;
              border-radius: 5px;
              display: inline-flex;
              padding: 5px;
            }
          }
        }
      }

      #user > ul > li > a:focus,
      #user > ul > li > a:hover {
        background-color: var(--hover);
      }

      .burger-items {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-items: stretch;
      }

      .items {
        display: flex;

        & li {
          * {
            display: flex;
            padding: 4px;
            border-radius: 2px;
            align-items: center;
          }
        }
      }

      .burger-items > li,
      .burger-items > li > * {
        display: flex;
        width: 100%;
      }

      .items > li > *:focus,
      .items > li > *:hover,
      .burger-items > li:has(*:focus),
      .burger-items > li:hover {
        background-color: var(--hover);
      }

      .items {
        align-items: center;
        justify-content: center;

        * {
          display: flex;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      summary {
        list-style: none;
      }

      a {
        color: var(--primary-text);
        text-decoration: none;
      }

      #burger {
        summary {
          display: flex;
          font-family: "Material Symbols Outlined", serif;
          padding-left: 5px;
          font-size: 1.6rem;
          place-content: center;
          place-items: center;
          width: 35px;
          height: 35px;
        }

        summary::after {
          content: "menu";
        }

        ul {
          margin-top: 8px;
          position: absolute;
          z-index: 1;
          background-color: var(--background);

          li {
            border-bottom: 1px solid var(--secondary-background);
          }
        }
      }

      #burger[open] {
        summary::after {
          content: "close";
          font-size: 1.4rem;
        }
      }

      details {
        cursor: pointer;
        background: var(--background);
        user-select: none;
        padding: 0;

        ul {
          margin-top: 1px;

          li {
            padding: 5px;
          }
        }
      }

      @media (min-width: 701px) {
        #burger {
          display: none;
        }

        ::slotted(app-search-input) {
          max-width: 400px;
        }
      }

      [hidden] {
        visibility: collapse;
        width: 0;
        height: 0;
      }

      @media (max-width: 700px) {
        nav {
          display: none;
        }

        :host {
          justify-content: space-between;
        }

        .logo {
          margin-right: auto;
        }
      }

      #user {
        margin-right: 5px;

        ul {
          transform: translateX(calc(-100% + 35px));
        }
      }

      ${this.iconsCSS()}
    `;
  }

  iconsCSS(): string
  {
    //language=CSS
    return `
      .movie-icon::before {
        content: "theaters";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .book-icon::before {
        content: "book_2";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .graphic-novel-icon::before {
        content: "menu_book";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .show-icon::before {
        content: "tv";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .game-icon::before {
        content: "videogame_asset";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .profile-icon::before {
        content: "person";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .friends-icon::before {
        content: "group";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .comment-icon::before {
        content: "comment";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .comment-icon::before {
        content: "comment";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .review-icon::before {
        content: "reviews";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .settings-icon::before {
        content: "settings";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .login-icon::before {
        content: "login";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }

      .logout-icon::before {
        content: "logout";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }
    `;
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
