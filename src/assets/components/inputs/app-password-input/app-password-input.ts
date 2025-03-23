import {AppInput, AppInputElements} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import html from "./app-number-input.html" with {type: "inline"};
import css from "./app-number-input.css" with {type: "inline"};
import {AppButton} from "../../app-button/app-button";
import {mapSelectors} from "../../../dom";

export type AppPasswordInputElements = AppInputElements & { passwordButton: AppButton, eyeIcon: HTMLSpanElement };

export class AppPasswordInput extends AppInput implements StyleCSS
{
  override readonly elements: AppPasswordInputElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    passwordButton: "app-button",
    eyeIcon: "#eye-icon"
  }

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Password";
    await super.connectedCallback();
    this.elements.passwordButton.addEventListener("click", () =>
    {
      const {input, eyeIcon} = this.elements;

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
    this.elements = mapSelectors<AppPasswordInputElements>(this.shadowRoot, AppPasswordInput.elementSelectors);
    this.elements.input.type = "password";
  }

  override render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }

  public static override define(): void
  {
    if (customElements.get("app-password-input"))
      return;
    customElements.define("app-password-input", AppPasswordInput);
  }
}

AppPasswordInput.define();
