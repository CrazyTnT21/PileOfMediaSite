import {AppInput} from "./app-input.js";
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
      const eyeIcon: SVGUseElement = this.shadowRoot!.querySelector("use")!;

      if (input.type === "password")
      {
        input.type = "text";
        eyeIcon.href.baseVal = this.eyeHref;
      }
      else
      {
        input.type = "password";
        eyeIcon.href.baseVal = this.eyeClosedHref;
      }
    });
  }

  private get eyeClosedHref(): string
  {
    return "/assets/img/Eye_Closed_Placeholder.svg#svg";
  };

  private get eyeHref(): string
  {
    return "/assets/img/Eye_Placeholder.svg#svg";
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
      <label part="label" for="input"></label>
      <span part="outline" id="outline">
            <input part="inner-input" id="input"/>
            <app-button exportparts="button: eye-button">
              <slot name="eye-button">
                <svg class="icon">
                  <use
                    exportparts="stroke:icon-stroke, fill:icon-fill, fill-background:icon-fill-background, stroke-background: icon-stroke-background"
                    href="/assets/img/Eye_Closed_Placeholder.svg#svg">
                  </use>
                </svg>
              </slot>
            </app-button>
      </span>
    `;
  }

  override styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
      .icon {
        width: 24px;
        height: 24px;
      }

      #outline {
        max-width: 100%;
        border-radius: 5px;
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

      #outline {
        outline-color: Highlight;
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

      #outline:has(input:invalid) {
        border-color: red;
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
