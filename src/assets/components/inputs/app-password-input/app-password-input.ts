import {AppInput, AppInputElements} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import html from "./app-password-input.html" with {type: "inline"};
import css from "./app-password-input.css" with {type: "inline"};
import {AppButton} from "../../app-button/app-button";
import {mapSelectors} from "../../../dom";
import {AttributeValue} from "../common";
import {disabledAttr} from "./attributes";
import {applyStyleSheet} from "../../defaults";

export type AppPasswordInputElements = AppInputElements & { passwordButton: AppButton, eyeIcon: HTMLSpanElement };

export class AppPasswordInput extends AppInput implements StyleCSS
{
  override readonly elements: AppPasswordInputElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    passwordButton: "app-button",
    eyeIcon: "#eye-icon"
  }
  //TODO: as conversion
  protected static override readonly observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "disabled": (element: AppInput, value: AttributeValue): void =>
        disabledAttr(element as AppPasswordInput, value, (element as AppPasswordInput).internals, (element as AppPasswordInput).hasDisabledFieldset),
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
    applyStyleSheet(this.shadowRoot, this.styleCSS());
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
