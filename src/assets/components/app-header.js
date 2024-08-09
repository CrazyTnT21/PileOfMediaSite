class AppHeader extends HTMLElement
{
  user;

  connectedCallback()
  {
    const items = [...this.shadowRoot.querySelectorAll(".items > li")];
    this.#copyToHamburger(items);
  }

  disconnectedCallback()
  {
  }

  #copyToHamburger(items)
  {
    items = items.map(x => x.cloneNode(true));
    const ul = document.createElement("ul");
    ul.classList.add("burger-items")
    for (const item of items)
    {
      ul.append(item);
    }
    this.shadowRoot.querySelector("#burger").appendChild(ul);
  }

  constructor()
  {
    super();
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach()
  {
    this.attachShadow({
      mode: "open",
    });
  }

  applyStyleSheet()
  {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(this.styleCSS());
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  render()
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
                <li><a class="graphic-novel-icon" href="/graphicnovels">Graphic novels</a></li>
                <li><a class="book-icon" href="/books">Books</a></li>
                <li><a class="movie-icon" href="/movies">Movies</a></li>
                <li><a class="show-icon" href="/shows">Shows</a></li>
                <li><a class="game-icon" href="/games">games</a></li>
            </ul>
        </nav>
        <details id="user">
            <summary>
                <img src="/assets/img/User_Placeholder.png" alt="User profile"/>
            </summary>
            <ul>
                <li><a href="/user/profile" class="user-icon">Profile</a></li>
                <li><a href="/user/friends" class="friends-icon">Friends</a></li>
                <li><a href="/user/comments" class="comments-icon">Comments</a></li>
                <li><a href="/user/reviews" class="comments-icon">Reviews</a></li>
                <li><a href="/user/settings" class="settings-icon">Settings</a></li>
                <li><a href="/user/preferences" class="settings-icon">Preferences</a></li>
                <li><a href="/" class="logout-icon"> Logout</a></li>
            </ul>
        </details>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
        img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
        }

        :host {
            display: flex;
            border-bottom: 1px solid var(--border);
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
        }

        #user > ul {
            display: inline-flex;
            flex-direction: column;
            justify-content: flex-end;
            overflow: hidden;
        }

        #user > ul > li {
            white-space: nowrap;
        }

        #user > ul > li {
            border-radius: 10px;
        }

        #user > ul > li:focus,
        #user > ul > li:hover {
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
            background-image: url('/assets/img/Hamburger_Placeholder.svg');
        }

        #burger[open] > summary {
            background-position: center right 15px;
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
            background-color: var(--primary-background);
        }

        ${this.iconsCSS()}
    `;
  }

  iconsCSS()
  {
    //language=CSS
    return `
        .graphic-novel-icon:before {
            background: url('/assets/img/Graphic_novel_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 20px;
            height: 20px;
            content: '';
        }

        .book-icon:before {
            background: url('/assets/img/Book_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 20px;
            height: 20px;
            content: '';
        }

        .show-icon:before {
            background: url('/assets/img/Show_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 20px;
            height: 20px;
            content: '';
        }
        
        .game-icon:before {
            background: url('/assets/img/Game_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 20px;
            height: 20px;
            content: '';
        }
        
        .movie-icon:before {
            background: url('/assets/img/Movie_Placeholder.svg');      
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 20px;
            height: 20px;
            content: '';
        }

        .user-icon:before {
            background: transparent url("/assets/img/User_Placeholder.png") center bottom;
            border-radius: 2px;
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 25px;
            height: 25px;
            content: '';
        }

        .friends-icon:before {
            background-image: url("/assets/img/Friends_Placeholder.png");
            border-radius: 2px;
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 25px;
            height: 25px;
            content: '';
        }

        .comments-icon:before {
            background-image: url("/assets/img/Comments_Placeholder.png");
            border-radius: 2px;
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 25px;
            height: 25px;
            content: '';
        }

        .settings-icon:before {
            background-image: url("/assets/img/Gear_Placeholder.png");
            border-radius: 2px;
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 25px;
            height: 25px;
            content: '';
        }

        .logout-icon:before {
            background-image: url("/assets/img/Logout_Placeholder.png");
            border-radius: 2px;
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 25px;
            height: 25px;
            content: '';
        }
    `;
  }
}

// let the browser know about the custom element
customElements.define("app-header", AppHeader);
"use strict";
