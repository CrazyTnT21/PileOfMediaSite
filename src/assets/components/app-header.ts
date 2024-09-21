import {applyStyleSheet, attach} from "./defaults.js";
import {ApplyStyleSheet} from "./apply-style-sheet.js";
import {StyleCSS} from "./style-css.js";
import {LoginReturn} from "../types/login-return.js";
import {ImageData} from "../types/image-data.js";
import {AppButton} from "./app-button.js";

//TODO: color-scheme part
export class AppHeader extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  private loginData: LoginReturn | undefined | null;

  async connectedCallback()
  {
    const items = <HTMLLIElement[]>[...this.shadowRoot!.querySelectorAll(".items > li")];
    this.#copyToHamburger(items);
    const logoutButton: AppButton = this.shadowRoot!.querySelector("#logout > app-button")!;
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

  loadAccount()
  {
    const localAccount = localStorage.getItem("account");
    const dropDownItems = [...this.shadowRoot!.querySelector("#user-dropdown")!.children]
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
    let profilePicture: HTMLImageElement = this.shadowRoot!.querySelector("#profile-picture")!;
    if (localAccount)
    {
      const user = JSON.parse(localAccount).user;
      if (user.profile_picture)
      {
        user.profile_picture.versions.sort((x: ImageData, y: ImageData) => x.width * x.height - y.width * y.height);
        profilePicture.src = user.profile_picture.versions[0].uri;
        return;
      }
    }
    profilePicture.src = this.placeholderImageUrl;
  }

  #copyToHamburger(items: HTMLLIElement[])
  {
    const nodes = items.map(x => x.cloneNode(true));
    const ul = document.createElement("ul");
    ul.classList.add("burger-items");
    for (const item of nodes)
    {
      ul.append(item);
    }
    this.shadowRoot!.querySelector("#burger")!.appendChild(ul);
  }

  constructor()
  {
    super();
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;
  placeholderImageUrl = "/assets/img/User_Placeholder.svg";

  iconHTML(href: string, id: string = "svg"): string
  {
    //language=HTML
    return `
      <svg class="icon">
        <use
          exportparts="stroke:icon-stroke, fill:icon-fill, fill-background:icon-fill-background, stroke-background: icon-stroke-background"
          href="${href}#${id}"></use>
      </svg>`;
  }

  render()
  {
    // language=HTML
    this.shadowRoot!.innerHTML = `
      <details id="burger">
        <summary>
        </summary>
      </details>
      <a class="logo" href="/">
        <img src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
      </a>
      <nav>
        <ul class="items">
          <li><a href="/graphicnovels">${this.iconHTML("/assets/img/Graphic_novel_Placeholder.svg")} Graphic novels</a>
          </li>
          <li><a href="/books">${this.iconHTML("/assets/img/Book_Placeholder.svg")} Books</a></li>
          <li><a href="/movies">${this.iconHTML("/assets/img/Movie_Placeholder.svg")} Movies</a></li>
          <li><a href="/shows"> ${this.iconHTML("/assets/img/Show_Placeholder.svg")}Shows</a></li>
          <li><a href="/games"> ${this.iconHTML("/assets/img/Game_Placeholder.svg")}Games</a></li>
        </ul>
      </nav>
      <details id="user">
        <summary>
          <img id="profile-picture" src="${this.placeholderImageUrl}" alt="Profile"/>
        </summary>
        <ul id="user-dropdown">
          <li data-login><a href="/user/profile">${this.iconHTML("/assets/img/User_Placeholder.svg")}Profile</a></li>
          <li data-login><a href="/user/friends">${this.iconHTML("/assets/img/Friends_Placeholder.svg")}Friends</a></li>
          <li data-login>
            <a href="/user/comments">${this.iconHTML("/assets/img/Bubbles_Placeholder.svg")}Comments</a>
          </li>
          <li data-login><a href="/user/reviews">${this.iconHTML("/assets/img/Bubbles_Placeholder.svg")}Reviews</a></li>
          <li data-default><a href="/user/settings">${this.iconHTML("/assets/img/Gear_Placeholder.svg")}Settings</a>
          </li>
          <li data-default>
            <a href="/user/preferences">${this.iconHTML("/assets/img/Gear_Placeholder.svg")} Preferences</a>
          </li>
          <li data-login id="logout"></li>
          <li data-logout id="login"><a href="/login">${this.iconHTML("/assets/img/Logout_Placeholder.svg")}Log in</a>
          </li>
          <li data-logout id="signup">
            <a href="/signup">${this.iconHTML("/assets/img/Logout_Placeholder.svg")} Sign up</a>
          </li>
        </ul>
      </details>
    `;
    const appButton: AppButton = new AppButton();
    appButton.setAttribute("exportparts", "button,button: logout-button");
    appButton.innerText = "Logout"
    appButton.classList.add("logout");
    this.shadowRoot!.querySelector("#logout")!.append(appButton)
  }

  styleCSS()
  {
    //language=CSS
    return `
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
        justify-content: center;
      }

      .logo {
        width: 35px;
        height: 35px;
        /*margin-right: auto;*/
      }

      #user {
        /*margin-left: auto;*/
        height: 35px;
        width: 35px;
      }

      #user > ul {
        margin-top: 5px;
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

          & app-button {
            flex: 1;
          }

          & a {
            flex: 1;
            border-radius: 5px;
            display: inline-flex;
            padding: 5px;

            svg.icon {
              border-radius: 2px;
            }
          }
        }
      }

      #user > ul > li {
        border-radius: 10px;
      }

      #user > ul > li > a:focus,
      #user > ul > li > a:hover {
        background-color: var(--hover);
      }

      #user > ul > li {
        padding: 0;
      }

      .burger-items {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-items: stretch;
      }

      .items {
        display: flex;
      }

      .items > li > * {
        padding: 5px;
        border-radius: 15px;
      }

      .burger-items > li, .burger-items > li > * {
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
      }

      .items > * {
        display: flex;
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

      #burger > summary {
        background-position: center center;
        background-repeat: no-repeat;
        background-size: 24px 24px;
        background-image: url('/assets/img/Hamburger_Placeholder.svg');
      }

      #burger[open] > summary {
        background-position: center right 12px;
        background-image: url('/assets/img/Close_Placeholder.svg');
      }

      #burger > summary {
        width: 45px;
        height: 45px;
      }

      details > ul {
        margin-top: 5px;
      }

      details > ul > li {
        padding: 5px;
      }

      details {
        cursor: pointer;
        background: var(--background);
        user-select: none;
        padding: 0;
      }


      @media (min-width: 601px) {
        #burger {
          display: none;
        }
      }

      [hidden] {
        visibility: collapse;
      }

      @media (max-width: 600px) {
        nav {
          display: none;
        }

        :host {
          justify-content: space-between;
        }

        #user {
          /*    margin-left: auto;*/
          margin-right: 5px;
        }

        #user > ul {
          transform: translateX(calc(-100% + 35px));
        }
      }

      #burger > ul {
        position: absolute;
        z-index: 1;
        background-color: var(--primary-background);
      }

      ${this.iconsCSS()}
    `;
  }

  iconsCSS()
  {
    //language=CSS
    return `
      svg.icon {
        width: 24px;
        height: 24px;
        margin-right: 2px;
      }

      a:has(svg.icon) {
        display: inline-flex;
        align-items: center;
      }
    `;
  }
}

customElements.define("app-header", AppHeader);
