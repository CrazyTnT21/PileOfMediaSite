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
            min-width: 0;
            display: inline-flex;
            flex: 1 1 100%;
            border: 1px var(--border) solid;
            background-color: var(--input-background);
        }

        #outline:hover {
            border-color: var(--hover);
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

        button {
            align-self: center;
            border: none;
            background-color: var(--input-background);
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
