import {AppInput} from "../app-input/app-input";
import css from "./app-number-input.css" with {type: "inline"};
import {AttributeValue, setOrRemoveAttribute} from "../common";
import {unsafeObjectKeys} from "../../../unsafe-object-keys";

const numberInputTag = "app-number-input" as const;
export type NumberInputTag = typeof numberInputTag;

export class AppNumberInput extends AppInput
{
  protected static override readonly observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "min": minAttribute,
    "max": maxAttribute,
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static override readonly observedAttributes = unsafeObjectKeys(AppNumberInput.observedAttributesMap);

  public constructor()
  {
    super();
    this.elements.input.type = "number";
  }

  public override styleCSS(): string
  {
    return css;
  }

  public override get value(): number | null | undefined
  {
    const {input} = this.elements;
    const value = input.value || null;
    let numberValue: number | null = null;
    if (value)
      numberValue = Number(value);
    if (numberValue && isNaN(numberValue))
      return null;
    return numberValue;
  }

  public override set value(value: number | null | undefined)
  {
    const {input} = this.elements;
    input.value = value?.toString() ?? "";
  }

  public static override define(): void
  {
    if (customElements.get(numberInputTag))
      return;
    customElements.define(numberInputTag, AppNumberInput);
  }
}

AppNumberInput.define();

function minAttribute(element: AppNumberInput, value: AttributeValue): void
{
  const {input} = element["elements"];
  setOrRemoveAttribute(input, "min", value);
}

function maxAttribute(element: AppNumberInput, value: AttributeValue): void
{
  const {input} = element["elements"];
  setOrRemoveAttribute(input, "max", value);
}
