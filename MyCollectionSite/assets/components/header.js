
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
      <link rel="stylesheet" href="/MyCollectionSite/assets/styles/columns.css">
      <link rel="stylesheet" href="/MyCollectionSite/assets/styles/styles.css">
      <li class="col-s-12">
        <a class="col-s-12" href="/MyCollectionSite">
          <img class="fix-1" src="/MyCollectionSite/assets/images/Logo_Placeholder.png" alt="Logo"/>
          <div class="col pad">MyCollection</div>
        </a>
      </li>
      <li class="col-s-12 col  align-center pad">
        <a href="/MyCollectionSite/comics">Comics</a>
      </li>
      <li class="col col-s-12 align-center pad">
        <a href="/MyCollectionSite/manga">Manga</a>
      </li>
      <li class="col col-s-12 align-center pad">
        <a href="/MyCollectionSite/shows">Shows</a>
      </li>
      <li class="col col-s-12 align-center pad">
        <a href="/MyCollectionSite/anime">Anime</a>
      </li>
      <li class="col col-s-12 align-center pad">
        <a href="/MyCollectionSite/games">Games</a>
      </li>
      <li class="col col-s-12 align-center pad">
        <a href="/MyCollectionSite/music">Music</a>
      </li>
      <div class="fix-7"></div>
      <li class="fix-7 col-s-12 right" id="profile">
        <div class="col-l-12 align-right">
          <div class="col pad">
            <div class="col-l-12" style="font-weight: bold">TestUsername</div>
          </div>
          <img src="/MyCollectionSite/assets/images/User_Placeholder.png" class="fix-1 col-s-2"
               alt="User profile"/>
        </div>
        <div class="fix-7 col-s-12" id="settings" style="position: fixed; display: none; margin-top: 2.5rem">
          <div class="col-12">
            <div class="pad col-12" style="background: lightgray">
              <a href="/MyCollectionSite/user/profile" class="user-icon" style="background: gray"> Profile</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/MyCollectionSite/user/friends" class="friends-icon" style="background: darkgray"> Friends</a>
            </div>
            <div class="pad col-12" style="background: lightgray;">
              <a href="/MyCollectionSite/user/comments" class="comments-icon" style="background: gray"> Comments</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/MyCollectionSite/user/reviews" class="comments-icon" style="background: darkgray"> Reviews</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/MyCollectionSite/user/settings" class="settings-icon" style="background: gray"> Account settings</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="/MyCollectionSite/user/preferences" class="settings-icon" style="background: darkgray"> Preferences</a>
            </div>
            <div class="pad col-12" style="background: lightgray">
              <a href="test" class="logout-icon" style="background: gray"> Logout</a>
            </div>
          </div>
        </div>
      </li>`;

    this.shadowRoot.append(header);
  }
}

// let the browser know about the custom element
customElements.define("app-header", Header);
"use strict";
