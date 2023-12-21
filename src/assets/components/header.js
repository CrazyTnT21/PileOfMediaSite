
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
    const ulElement = document.createElement("ul");
    ulElement.classList.add("col-l-12", "pad","mar-bottom");
    // language=HTML
    ulElement.innerHTML = `
        ${this.styleHTML()}
        <li>
            <a class="col-12" href="/">
                <img class="fix-1" src="/assets/img/Logo_Placeholder.png" alt="Logo"/>
                <div class="col pad">MyCollection</div>
            </a>
        </li>

        <li class="col align-center pad">
            <a class="graphic-novel-icon" href="/graphicnovels">
                Graphic novels
            </a>
        </li>
        <li class="col align-center pad">
            <a class="book-icon" href="/books">
                Books
            </a>
        </li>
        <li class="col align-center pad">
            <a class="show-icon" href="/Shows">
                Shows
            </a>
        </li>
        <li class="col align-center pad">
            <a class="game-icon" href="/Games">
                Games
            </a>
        </li>
        <div class="fix-7"></div>
        <li class="fix-7" id="profile">
            <div class="col-l-12 align-right">
                <div class="col pad">
                    <div class="col-l-12" style="font-weight: bold">TestUsername</div>
                </div>
                <img src="/assets/img/User_Placeholder.png" class="fix-1 col-s-2"
                     alt="User profile"/>
            </div>
            <div class="fix-7" id="settings" style="position: fixed; display: none; margin-top: 2.5rem">
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
                        <a href="/user/settings" class="settings-icon" style="background: gray"> Account
                            settings</a>
                    </div>
                    <div class="pad col-12" style="background: lightgray">
                        <a href="/user/preferences" class="settings-icon" style="background: darkgray">
                            Preferences</a>
                    </div>
                    <div class="pad col-12" style="background: lightgray">
                        <a href="test" class="logout-icon" style="background: gray"> Logout</a>
                    </div>
                </div>
            </div>
        </li>
    `;

    this.shadowRoot.append(ulElement);
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


            .user-icon{
              padding-left: 25px;
            }
            .user-icon::before{
              background-image: url("/assets/img/User_Placeholder.png");
              background-size: cover;
              position: absolute;
              width:25px;
              height:25px;
              content: '';
              margin-left:-25px;
            }

            .friends-icon{
              padding-left: 25px;
            }
            .friends-icon::before{
              background-image: url("/assets/img/Friends_Placeholder.png");
              background-size: cover;
              position: absolute;
              width:25px;
              height:25px;
              content: '';
              margin-left:-25px;
            }
            
            .comments-icon{
              padding-left: 25px;
            }
            .comments-icon::before{
              background-image: url("/assets/img/Comments_Placeholder.png");
              background-size: cover;
              position: absolute;
              width:25px;
              height:25px;
              content: '';
              margin-left:-25px;
            }
            
            .settings-icon{
              padding-left: 25px;
            }
            .settings-icon::before{
              background-image: url("/assets/img/Gear_Placeholder.png");
              background-size: cover;
              position: absolute;
              width:25px;
              height:25px;
              content: '';
              margin-left:-25px;
            }

            .logout-icon{
              padding-left: 25px;
            }
            .logout-icon::before{
              background-image: url("/assets/img/Logout_Placeholder.png");
              background-size: cover;
              position: absolute;
              width:25px;
              height:25px;
              content: '';
              margin-left:-25px;
            }
            
            ul, li {
                list-style-type: none;
                margin: 0;
                padding: 0;
            }

            ul {
                display: flex;
                background: lightgray;
                box-shadow: 0 5px rgb(128, 128, 128);
            }

            .pad {
                padding: .33em;
            }

            .align-center {
                display: flex;
                justify-content: center;
            }
            
            .align-right {
                margin-left: auto;
            }

            #profile {
                position: absolute;
                right: 1rem;
            }

            .mar-bottom {
              margin-bottom: 0.33rem;
            }
            .col-12,
            .col-l-12,
            .col-s-2,
            li {
                display: flex;
                flex-wrap: wrap;
                flex: 0 0 auto;
                align-self: flex-start;
                align-items: flex-start;
                box-sizing: border-box;

                flex-grow: 0;
            }

            .col {
                display: flex;
                box-sizing: border-box;
                flex-wrap: wrap;
                align-self: flex-start;
                flex-grow: 1;
            }

            .fix-1,
            .fix-7 {
                display: flex;
                flex-wrap: wrap;
                flex: 0 0 auto;
                align-self: flex-start;
                align-items: flex-start;
                box-sizing: border-box;
            }
            
            .fix-7 {
                width: 14rem;
            }
            
            .fix-1 {
                width: 2rem;
            }

            .col-12 {
                width: 100%;
            }

            @media screen and (min-width: 700px) {
                .col-l-12 {
                    width: 100%;
                }
            }
            @media screen and (max-width: 500px) {
                li {
                    width: 100%;
                }
              
                .col-s-2 {
                    width: 16.6667%;
                }
            }
        </style>
    `
  }
}

// let the browser know about the custom element
customElements.define("app-header", Header);
"use strict";
