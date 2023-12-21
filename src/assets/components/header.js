
class Header extends HTMLElement
{
  user = {
    name: "TestUsername",
    mail: "TestUsername@Email.com",
  };


  showDropdown(e)
  {
    const item = this.shadowRoot.querySelector("#settings");
    if (item.style.display === "none")
      item.style.display = "flex";
    else
      item.style.display = "none";
  }

  connectedCallback()
  {
    const header = this.shadowRoot.querySelector("#profile");
    header.addEventListener("click", (e) => this.showDropdown(e));
  }

  disconnectedCallback()
  {
    const header = document.querySelector("#profile");
    header.removeEventListener("click", (e) => this.showDropdown(e));
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});
    const header = document.createElement("ul");
    header.classList.add("header", "col-l-12", "pad", "mar-bottom");
    // language=HTML
    header.innerHTML = `
      ${this.styleHTML()}
      <link rel="stylesheet" href="/assets/css/columns.css">
      <link rel="stylesheet" href="/assets/css/main.css">
      <li class="col-s-12">
        <a class="col-s-12" href="/">
          <img class="fix-1" src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
          <div class="col pad">MyCollection</div>
        </a>
      </li>

      <li class="col-s-12 col align-center pad">
        <a class="graphic-novel-icon" href="/graphicnovels">
          Graphic novels
        </a>
      </li>
      <li class="col-s-12 col align-center pad">
        <a class="book-icon" href="/books">
          Books
        </a>
      </li>
      <li class="col-s-12 col align-center pad">
        <a class="show-icon" href="/Shows">
          Shows
        </a>
      </li>
      <li class="col-s-12 col align-center pad">
        <a class="game-icon" href="/Games">
          Games
        </a>
      </li>
      <div class="fix-7"></div>
      <li class="fix-7 col-s-12 right" id="profile">
        <div class="col-l-12 align-right">
          <div class="col pad">
            <div class="col-l-12" style="font-weight: bold">TestUsername</div>
          </div>
          <img src="/assets/img/User_Placeholder.png" class="fix-1 col-s-2"
               alt="User profile"/>
        </div>
        <div class="fix-7 col-s-12" id="settings" style="position: fixed; display: none; margin-top: 2.5rem">
          <div class="col-12">
            <div class="pad col-12" style="background: lightgray">
              <a href="/user/profile" class="user-icon" style="background: gray"> Profile</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/user/friends" class="friends-icon" style="background: darkgray"> Friends</a>
            </div>
            <div class="pad col-12" style="background: lightgray;">
              <a href="/user/comments" class="comments-icon" style="background: gray"> Comments</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/user/reviews" class="comments-icon" style="background: darkgray"> Reviews</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/user/settings" class="settings-icon" style="background: gray"> Account settings</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/user/preferences" class="settings-icon" style="background: darkgray"> Preferences</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="test" class="logout-icon" style="background: gray"> Logout</a>
            </div>
          </div>
        </div>
      </li>`;

    this.shadowRoot.append(header);
  }

  styleHTML(){
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
      </style>
    `
  }
}

// let the browser know about the custom element
customElements.define("app-header", Header);
"use strict";
