class AppHeader extends HTMLElement
{
  user;

  showDropdown()
  {
    const settings = this.shadowRoot.querySelector("#settings");
    if (settings.style.display === "none")
    {
      settings.parentElement.style.display = "flex";
      settings.style.display = "flex";
    }
    else
    {
      settings.parentElement.style.display = "none";
      settings.style.display = "none";
    }
  }

  connectedCallback()
  {
    const header = this.shadowRoot.querySelector("#profile");
    header.addEventListener("click", () => this.showDropdown());
  }

  disconnectedCallback()
  {
    const header = document.querySelector("#profile");
    header.removeEventListener("click", () => this.showDropdown());
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});

    // language=HTML
    this.shadowRoot.innerHTML = `
      ${this.styleHTML()}
      <nav>
        <ul>
          <li>
            <a class="col-12" href="/">
              <img class="fix-1" src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
              <div style="padding-left: 5px" class="">MyCollection</div>
            </a>
          </li>
          <li>
            <a href="/graphicnovels">
              <div class="graphic-novel-icon">Graphic novels</div>
            </a>
          </li>
          <li>
            <a href="/books">
              <div class="book-icon">Books</div>
            </a>
          </li>
          <li>
            <a href="/shows">
              <div class="show-icon">Shows</div>
            </a>
          </li>
          <li>
            <a href="/movies">
              <div class="movie-icon">Movies</div>
            </a>
          </li>
          <li>
            <a href="/games">
              <div class="game-icon">Games</div>
            </a>
          </li>
          <div style="display: none; width: 0">
            <ul id="settings" style="display: none;">
              <li>
                <a href="/user/profile" class="user-icon">Profile</a>
              </li>
              <li>
                <a href="/user/friends" class="friends-icon">Friends</a>
              </li>
              <li>
                <a href="/user/comments" class="comments-icon">Comments</a>
              </li>
              <li>
                <a href="/user/reviews" class="comments-icon">Reviews</a>
              </li>
              <li>
                <a href="/user/settings" class="settings-icon">Account settings</a>
              </li>
              <li>
                <a href="/user/preferences" class="settings-icon">Preferences</a>
              </li>
              <li>
                <a href="/" class="logout-icon"> Logout</a>
              </li>
            </ul>
          </div>
          <li id="profile">
            <div id="user">
              <div id="username" style="display: none">
                Test
              </div>
              <img src="/assets/img/User_Placeholder.png" alt="User profile"/>
            </div>
          </li>
        </ul>
      </nav>
    `;
  }

  styleHTML()
  {
    //language=HTML
    return `
      <style>
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
          padding-left: 25px;
        }

        .user-icon:before {
          background-image: url("/assets/img/User_Placeholder.png");
          background-size: cover;
          position: absolute;
          width: 25px;
          height: 25px;
          content: '';
          margin-left: -25px;
        }

        .friends-icon {
          padding-left: 25px;
        }

        .friends-icon:before {
          background-image: url("/assets/img/Friends_Placeholder.png");
          background-size: cover;
          position: absolute;
          width: 25px;
          height: 25px;
          content: '';
          margin-left: -25px;
        }

        .comments-icon {
          padding-left: 25px;
        }

        .comments-icon:before {
          background-image: url("/assets/img/Comments_Placeholder.png");
          background-size: cover;
          position: absolute;
          width: 25px;
          height: 25px;
          content: '';
          margin-left: -25px;
        }

        .settings-icon {
          padding-left: 25px;
        }

        .settings-icon:before {
          background-image: url("/assets/img/Gear_Placeholder.png");
          background-size: cover;
          position: absolute;
          width: 25px;
          height: 25px;
          content: '';
          margin-left: -25px;
        }

        .logout-icon {
          padding-left: 25px;
        }

        .logout-icon:before {
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

        nav,
        ul,
        ul > li,
        ul > li > * {
          display: flex;
        }

        img {
          height: 40px;
          width: 40px;
        }

        nav {
          font: 1rem "Fira Sans", sans-serif;
          display: flex;
          background: var(--primary_background);
        }

        ul > li:hover {
          background-color: var(--hover);
        }

        ul > li > * {
          align-items: center;
          text-align: center;
          padding: 5px;
        }

        .pad {
          padding: 5px;
        }

        #settings {
          position: absolute;
          flex-direction: column;
          margin-top: 50px;
          background-color: var(--secondary_background);
          padding: 5px 5px 5px 5px;
        }

        @media (max-width: 700px) {
          nav > ul {
            flex-direction: column;
          }

          nav > ul,
          nav > ul > *,
          nav > ul > * > * {
            width: 100%;
          }

          #settings > * > * {
            width: 100%;
          }
        }
      </style>
    `;
  }
}

// let the browser know about the custom element
customElements.define("app-header", AppHeader);
"use strict";
