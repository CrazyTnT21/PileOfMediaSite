class AppHeader extends HTMLElement
{
  user;

  connectedCallback()
  {
    const details = [...this.shadowRoot.querySelectorAll("details")];
    for (const detailElement of details)
    {
      detailElement.addEventListener("click", () => this.closeOtherDetails(detailElement));
    }
  }

  disconnectedCallback()
  {
    const details = [...this.shadowRoot.querySelectorAll("details")];
    for (const detailElement of details)
    {
      detailElement.removeEventListener("click", () => this.closeOtherDetails(detailElement));
    }
  }

  closeOtherDetails(value)
  {
    const details = [...this.shadowRoot.querySelectorAll("details")];
    for (const detailElement of details)
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
      <style>
        ${this.styleCSS()}
      </style>

      <nav>
        <ul>
          <li style="padding: 5px;">
            <a class="col-12" href="/">
              <img class="fix-1" src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
              <div class="">MyCollection</div>
            </a>
          </li>
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
                <div id="user">
                  <span id="username" style="display:none;"></span>
                  <img src="/assets/img/User_Placeholder.png" alt="User profile"/>
                </div>
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

      summary {
        padding-left: 5px;
        padding-right: 5px;
        height: 100%;
      }

      details, details > ul, a {
        padding: 5px;
      }

      details > ul {
        background-color: var(--primary_background);
        margin-top: 10px;
        position: absolute;
      }

      details > ul,
      ul > li,
      nav > *, a,
      img,
      summary {
        border-radius: 5px;
      }

      summary {
        display: flex;
        align-items: center;
        text-align: center;
      }

      nav,
      details[open] summary {
        border-bottom: 1px solid var(--border);
      }


      details > ul {
        flex-direction: column
      }

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

      a {
        color: var(--primary_text);
        text-decoration: none;
      }

      ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      nav {
        height: 50px;
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

      @media (max-width: 700px) {
        nav > ul {
          flex-direction: column;
        }

        nav > ul,
        nav > ul > *,
        ul > * > * {
          width: 100%;
        }

        #settings > * > * {
          width: 100%;
        }
      }

      a {
        width: 100%;
      }

      summary > * {
        width: 100%;
      }
    `;
  }
}

// let the browser know about the custom element
customElements.define("app-header", AppHeader);
"use strict";
