import {AppInput} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import html from "./app-number-input.html" with {type: "inline"};
import css from "./app-number-input.css" with {type: "inline"};

export class AppPasswordInput extends AppInput implements StyleCSS
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Password";
    await super.connectedCallback();
    this.shadowRoot.querySelector("app-button")!.addEventListener("click", () =>
    {
      const input = this.shadowRoot.querySelector("input")!;
      const eyeIcon: HTMLSpanElement = this.shadowRoot.querySelector("#eye-icon")!;

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
    this.shadowRoot.querySelector("input")!.type = "password";
  }

  override render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }
}

customElements.define("app-password-input", AppPasswordInput);
