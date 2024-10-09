import {AppInput} from "./app-input/app-input.js";
import {StyleCSS} from "../style-css.js";

export class AppPasswordInput extends AppInput implements StyleCSS
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Password";
    await super.connectedCallback();
    this.shadowRoot!.querySelector("app-button")!.addEventListener("click", (e) =>
    {
      const input = this.shadowRoot!.querySelector("input")!;
      const eyeIcon: HTMLSpanElement = this.shadowRoot!.querySelector("#eye-icon")!;

      if (input.type === "password")
      {
        input.type = "text";
        eyeIcon.className = "eye-open-icon";
      }
      else
      {
        input.type = "password";
        eyeIcon.className = "eye-closed-icon";
      }
    });
  }

  constructor()
  {
    super();
    this.shadowRoot!.querySelector("input")!.type = "password";
  }

  override render()
  {
    //language=HTML
    this.shadowRoot!.innerHTML = `
      <span class="input parent" part="outline" id="outline">
      <label part="label" for="input"></label>
        <input class="control" part="inner-input" id="input"/>
            <app-button exportparts="button: eye-button">
              <slot name="eye-button">
                <span id="eye-icon" class="eye-closed-icon" part="icon"></span>
              </slot>
            </app-button>
      </span>
    `;
  }

  override styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
      .eye-open-icon::before {
        content: "visibility";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }
      .eye-closed-icon::before {
        content: "visibility_off";
        font-family: "Material Symbols Outlined", serif;
        font-size: 24px;
      }
      input {
        display: inline-flex;
        flex: 1 1 100%;
        min-width: 0;
        outline: none;
        border: none
      }
      .parent {
        flex: 1;
      }

      #outline:hover {
        border-color: #E6E6E6FF;
        transition: border-color ease 50ms;
      }

      #outline:has(input:focus) {
        outline: solid 2px;
      }

      #outline {
        outline-color: Highlight;
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

      #outline:has(input:invalid) {
        border-color: red;
      }
    `;
  }
}

customElements.define("app-password-input", AppPasswordInput);
