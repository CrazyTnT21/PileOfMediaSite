import {AppInput} from "./app-input.js";

export class AppPasswordInput extends AppInput
{
  async connectedCallback()
  {
    this.label = this.label ?? "Password";
    await super.connectedCallback();
    this.shadowRoot.querySelector("button").addEventListener("click", (e) =>
    {
      const input = this.shadowRoot.querySelector("input");
      const button = this.shadowRoot.querySelector("button");
      if (input.type === "password")
      {
        input.type = "text";
        button.className = "password-icon-open";
      }
      else
      {
        input.type = "password";
        button.className = "password-icon-closed";
      }
    });
  }

  constructor()
  {
    super();
    this.shadowRoot.querySelector("input").type = "password";
  }

  render()
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
        <label for="input"></label>
        <span id="outline">
            <input id="input"/>
            <button class="password-icon-closed"></button>
        </span>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
        #outline {
            border: 1px var(--border) solid;
            background-color: var(--input-background);
        }

        #outline:has(input:focus) {
            accent-color: auto;
            outline: solid 2px black;
        }

        @supports (-moz-orient: inherit) {
            #outline:has(input:focus) {
                outline-color: deepskyblue;
            }
        }

        input {
            outline: none;
            display: inline-flex;
            border: none
        }

        button {
            border: none;
            background-color: var(--input-background);
            align-self: end;
        }

        .password-icon-open:before {
            background: url('/assets/img/Eye_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 24px;
            height: 24px;
            content: '';
        }

        .password-icon-closed:before {
            background: url('/assets/img/Eye_Closed_Placeholder.svg');
            background-size: cover;
            margin-bottom: -5px;
            display: inline-block;
            width: 24px;
            height: 24px;
            content: '';
        }
    `;
  }
}

customElements.define("app-password-input", AppPasswordInput);
