import {AppInput, AppInputElements} from "../app-input/app-input";
import html from "./app-password-input.html" with {type: "inline"};
import css from "./app-password-input.css" with {type: "inline"};
import {AppButton} from "../../app-button/app-button";
import {mapSelectors} from "../../../dom";
import {AttributeValue} from "../common";
import {disabledAttribute} from "./attributes";
import {applyStyleSheet} from "../../defaults";

export type AppPasswordInputElements = AppInputElements & { passwordButton: AppButton, eyeIcon: HTMLSpanElement };

const passwordInputTag = "app-password-input" as const;
export type PasswordInputTag = typeof passwordInputTag;

export class AppPasswordInput extends AppInput
{
  public override readonly elements: AppPasswordInputElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    passwordButton: "app-button",
    eyeIcon: "#eye-icon"
  }
  //TODO: as conversion
  protected static override readonly observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "disabled": (element: AppInput, value: AttributeValue): void =>
        disabledAttribute(element as AppPasswordInput, value),
  }

  public constructor()
  {
    super();
    this.elements = mapSelectors<AppPasswordInputElements>(this.shadowRoot, AppPasswordInput.elementSelectors);
    this.elements.input.type = "password";
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected override async connectedCallback(): Promise<void>
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

  protected override render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  protected override styleCSS(): string
  {
    return css;
  }

  public static override define(): void
  {
    if (customElements.get(passwordInputTag))
      return;
    customElements.define(passwordInputTag, AppPasswordInput);
  }
}

AppPasswordInput.define();
