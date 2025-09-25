import {applyStyleSheet, attachDelegates} from "../defaults";
import {StyleCSS} from "../style-css";
import {handleFieldset, setOrRemoveBooleanAttribute} from "../inputs/common";
import html from "./app-button.html" with {type: "inline"};
import css from "./app-button.css" with {type: "inline"};
import {mapSelectors} from "../../dom";
import {disabledAttribute, typeAttribute} from "./attributes";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

type AttributeKey = keyof typeof AppButton["observedAttributesMap"];

export type AppButtonElements = {
  button: HTMLButtonElement,
  slot: HTMLSlotElement
};

export class AppButton extends HTMLElement implements StyleCSS
{
  private readonly elements: AppButtonElements;
  protected static readonly elementSelectors: { [key in keyof AppButton["elements"]]: string } = {
    button: "button",
    slot: "slot"
  }
  public static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "disabled": disabledAttribute,
    "type": typeAttribute,
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = unsafeObjectKeys(AppButton.observedAttributesMap);

  public get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.isDisabledByFieldSet;
  }

  public set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  private parentFieldSet: HTMLFieldSetElement | null | undefined;

  /**
   * If a parent fieldset is disabled, descendant form controls are also disabled.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled#overview)
   */
  public get isDisabledByFieldSet(): boolean
  {
    return Boolean(this.parentFieldSet?.disabled);
  }

  public get type(): "button" | "submit" | "reset"
  {
    return this.elements.button.type
  }

  public set type(value: "button" | "submit" | "reset")
  {
    this.setAttribute("type", value);
  }

  public constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.role = "button";
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppButtonElements>(this.shadowRoot, AppButton.elementSelectors);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected connectedCallback(): void
  {
    this.addEventListener("click", () =>
    {
      const {button} = this.elements;
      if (button.type != "submit" || !this.internals.form)
        return;

      this.internals.form.requestSubmit();
    });

    handleFieldset(this,
        (fieldSet) => this.parentFieldSet = fieldSet,
        () => disabledAttribute(this, this.getAttribute("disabled"))
    );
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppButton.observedAttributesMap[name];
    callback(this, newValue);
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  public styleCSS(): string
  {
    return css;
  }

  public static define(): void
  {
    if (customElements.get("app-button"))
      return;
    customElements.define("app-button", AppButton);
  }
}

AppButton.define()
