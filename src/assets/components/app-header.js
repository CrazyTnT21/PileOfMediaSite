class AppHeader extends HTMLElement
{
  user;

  connectedCallback()
  {
    const details = [...this.shadowRoot.querySelectorAll(".items > li > details")];
    for (const detailElement of details)
    {
      detailElement.addEventListener("click", () => this.closeOtherDetails(detailElement, details));
    }
    this.#copyToHamburger(details);
  }

  disconnectedCallback()
  {
  }

  #copyToHamburger(items)
  {
    items = items.map(x => x.cloneNode(true));
    const ul = document.createElement("ul");
    for (const details of items)
    {
      details.addEventListener("click", () => this.closeOtherDetails(details, items));
      const li = document.createElement("li");
      li.append(details);
      ul.append(li);
    }
    this.shadowRoot.querySelector("#burger").appendChild(ul);
  }

  closeOtherDetails(value, others)
  {
    for (const detailElement of others)
    {
      if (!value.isSameNode(detailElement))
        detailElement.open = false;
    }
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});

    // language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <nav>
        <ul>
          <li>
            <a href="/">
              <img class="fix-1" src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
              <div class="pad">MyCollection</div>
            </a>
          </li>
        </ul>
        <ul class="items">
          <li>
            <details>
              <summary>
                <span class="graphic-novel-icon">Graphic novels</span>
              </summary>
              <ul>
                <li><a href="/graphicnovels">Browse</a></li>
                <li><a href="/graphicnovels">Popular</a></li>
                <li><a href="/graphicnovels">Newest</a></li>
                <li><a href="/graphicnovels">Highest rated</a></li>
                <li><a href="/graphicnovels">Most favorited</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span class="book-icon">Books</span>
              </summary>
              <ul>
                <li><a href="/books">Browse</a></li>
                <li><a href="/books">Popular</a></li>
                <li><a href="/books">Newest</a></li>
                <li><a href="/books">Highest rated</a></li>
                <li><a href="/books">Most favorited</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span class="movie-icon">movies</span>
              </summary>
              <ul>
                <li><a href="/movies">Browse</a></li>
                <li><a href="/movies">Popular</a></li>
                <li><a href="/movies">Newest</a></li>
                <li><a href="/movies">Highest rated</a></li>
                <li><a href="/movies">Most favorited</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <span class="game-icon">games</span>
              </summary>
              <ul>
                <li><a href="/games">Browse</a></li>
                <li><a href="/games">Popular</a></li>
                <li><a href="/games">Newest</a></li>
                <li><a href="/games">Highest rated</a></li>
                <li><a href="/games">Most favorited</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <img src="/assets/img/User_Placeholder.png" alt="User profile"/>
              </summary>
              <ul>
                <li><a href="/user/profile" class="user-icon">Profile</a></li>
                <li><a href="/user/friends" class="friends-icon">Friends</a></li>
                <li><a href="/user/comments" class="comments-icon">Comments</a></li>
                <li><a href="/user/reviews" class="comments-icon">Reviews</a></li>
                <li><a href="/user/settings" class="settings-icon">Account settings</a></li>
                <li><a href="/user/preferences" class="settings-icon">Preferences</a></li>
                <li><a href="/" class="logout-icon"> Logout</a></li>
              </ul>
            </details>
          </li>
        </ul>
        <details id="burger">
          <summary>
          </summary>
        </details>
      </nav>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      details {
        cursor: pointer;
        background: var(--primary_background);
        user-select: none;
        padding: 0;
      }

      a {
        padding: 5px;
      }

      details > ul {
        background-color: var(--primary_background);
      }

      details > ul,
      ul > li,
      nav > *, a,
      img,
      summary {
        border-radius: 5px;
      }


      a {
        width: 100%;
      }

      summary {
        display: flex;
        align-items: center;
        text-align: center;
      }

      nav,
      details[open] > summary {
        border-bottom: 1px solid var(--border);
      }


      details > ul {
        flex-direction: column
      }

      a {
        color: var(--primary_text);
        text-decoration: none;
      }

      ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      nav,
      ul,
      ul > li,
      ul > li > * {
        display: flex;
      }

      img {
        height: 35px;
        width: 35px;
      }

      nav {
        font: 1rem "Fira Sans", sans-serif;
        display: flex;
        background: var(--primary_background);
      }

      summary:hover, summary:focus, a:focus, a:hover {
        background-color: var(--hover);
      }

      ul > li > * {
        align-items: center;
        text-align: center;
      }

      .pad {
        padding: 5px;
      }

      #burger > summary {
        background-position: center center;
        background-repeat: no-repeat;
        background-image: url('/assets/img/Hamburger_Placeholder.svg');
      }

      #burger[open] > summary {
        background-position: center right 15px;
        background-image: url('/assets/img/Close_Placeholder.svg');
      }

      @media (min-width: 701px) {
        summary {
          padding-left: 5px;
          padding-right: 5px;
        }

        summary {
          height: 100%;
        }

        #burger {
          display: none;
        }


        details > ul {
          margin-top: 5px;
          position: absolute;
        }
      }

      details {
        -webkit-tap-highlight-color: transparent; /* Prevent blue highlight on chrome */
      }

      #burger > summary {
        width: 45px;
        height: 45px;
      }

      @media (max-width: 700px) {
        nav > ul {
          flex-direction: column;
        }

        nav:has(#burger[open]) > ul,
        .items {
          display: none;
        }

        #burger[open],
        #burger[open] > summary,
        nav > .items,
        nav > .items > *,
        ul > * > * {
          width: 100%;
        }

        #burger,
        #burger[open] > summary > * {
          margin-left: auto;
          margin-right: 0;
        }

        summary > * {
          padding: 10px
        }
      }

      ${this.iconsCSS()}
    `;
  }

  iconsCSS()
  {
    //language=CSS
    return `
      .graphic-novel-icon {
        padding-left: 25px;
      }

      .graphic-novel-icon:before {
        content: '';
        background: url('/assets/img/Graphic_novel_Placeholder.svg');
        background-size: cover;
        position: absolute;
        width: 20px;
        height: 20px;
        margin-left: -24px;
      }

      .book-icon {
        padding-left: 25px;
      }

      .book-icon:before {
        content: '';
        background: url('/assets/img/Book_Placeholder.svg');
        background-size: cover;
        position: absolute;
        width: 20px;
        height: 20px;
        margin-left: -24px;
      }

      .show-icon {
        padding-left: 25px;
      }

      .show-icon:before {
        content: '';
        background: url('/assets/img/Show_Placeholder.svg');
        background-size: cover;
        position: absolute;
        width: 20px;
        height: 20px;
        margin-left: -24px;
      }

      .game-icon {
        padding-left: 25px;
      }

      .game-icon:before {
        content: '';
        background: url('/assets/img/Game_Placeholder.svg');
        background-size: cover;
        position: absolute;
        width: 20px;
        height: 20px;
        margin-left: -24px;
      }

      .movie-icon {
        padding-left: 25px;
      }

      .movie-icon:before {
        content: '';
        background: url('/assets/img/Movie_Placeholder.svg');
        background-size: cover;
        position: absolute;
        width: 20px;
        height: 20px;
        margin-left: -24px;
      }

      .user-icon {
        padding-left: 27px;
      }

      .user-icon:before {
        background-image: url("/assets/img/User_Placeholder.png");
        background-size: cover;
        position: absolute;
        width: 25px;
        height: 25px;
        content: '';
        margin-left: -25px;
        border-radius: 5px;
      }

      .friends-icon {
        padding-left: 27px;
      }

      .friends-icon:before {
        border-radius: 5px;
        background-image: url("/assets/img/Friends_Placeholder.png");
        background-size: cover;
        position: absolute;
        width: 25px;
        height: 25px;
        content: '';
        margin-left: -25px;
      }

      .comments-icon {
        padding-left: 27px;
      }

      .comments-icon:before {
        border-radius: 5px;
        background-image: url("/assets/img/Comments_Placeholder.png");
        background-size: cover;
        position: absolute;
        width: 25px;
        height: 25px;
        content: '';
        margin-left: -25px;
      }

      .settings-icon {
        padding-left: 27px;
      }

      .settings-icon:before {
        border-radius: 5px;
        background-image: url("/assets/img/Gear_Placeholder.png");
        background-size: cover;
        position: absolute;
        width: 25px;
        height: 25px;
        content: '';
        margin-left: -25px;
      }

      .logout-icon {
        padding-left: 27px;
      }

      .logout-icon:before {
        border-radius: 5px;
        background-image: url("/assets/img/Logout_Placeholder.png");
        background-size: cover;
        position: absolute;
        width: 25px;
        height: 25px;
        content: '';
        margin-left: -25px;
      }
    `;
  }
}

// let the browser know about the custom element
customElements.define("app-header", AppHeader);
"use strict";
