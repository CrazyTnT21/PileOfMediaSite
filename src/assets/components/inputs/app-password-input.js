import {AppInput} from "./app-input.js";
// noinspection ES6UnusedImports
import {AppButton} from "../app-button.js";

export class AppPasswordInput extends AppInput
{
  async connectedCallback()
  {
    this.label = this.label ?? "Password";
    await super.connectedCallback();
    this.shadowRoot.querySelector("app-button").addEventListener("click", (e) =>
    {
      const input = this.shadowRoot.querySelector("input");
      const button = this.shadowRoot.querySelector("app-button");
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
        <label part="label" for="input"></label>
        <span part="outline" id="outline">
            <input part="input" id="input"/>
            <app-button exportparts="button: eye-button" class="password-icon-closed"></app-button>
        </span>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
        #outline {
            min-width: 0;
            display: inline-flex;
            flex: 1 1 100%;
            border: 1px #B6B6B6FF solid;
        }

        #outline:hover {
            border-color: #E6E6E6FF;
            transition: border-color ease 50ms;
        }

        #outline:has(input:focus) {
            outline: solid 2px;
        }

        @supports (-moz-orient: inherit) {
            #outline:has(input:focus) {
                outline-color: Highlight;
            }
        }

        input {
            outline: none;
            display: inline-flex;
            border: none
        }

        app-button {
            display: inline-flex;
            align-self: center;
            align-items: center;
        }

        ::part(button) {
            display: inline-flex;
            padding: 4px;
            border: none;
        }

        .password-icon-open::part(button):before {
            background: url('/assets/img/Eye_Placeholder.svg');
            background-size: cover;
            display: inline-block;
            width: 24px;
            height: 24px;
            content: '';
        }

        .password-icon-closed::part(button):before {
            background: url('/assets/img/Eye_Closed_Placeholder.svg');
            background-size: cover;
            display: inline-block;
            width: 24px;
            height: 24px;
            content: '';
        }
    `;
  }
}

customElements.define("app-password-input", AppPasswordInput);
