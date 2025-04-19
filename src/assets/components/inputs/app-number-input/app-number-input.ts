import {AppInput} from "../app-input/app-input";
import css from "./app-number-input.css" with {type: "inline"};
import {setOrRemoveAttribute} from "../common";

export class AppNumberInput extends AppInput
{
  protected static override readonly observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "min": minAttr,
    "max": maxAttr,
  }
  static override readonly observedAttributes = Object.keys(AppNumberInput.observedAttributesMap);

  constructor()
  {
    super();
    this.elements.input.type = "number";
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }

  override get value(): number | null | undefined
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

  override set value(value: number | null | undefined)
  {
    const {input} = this.elements;
    input.value = value?.toString() ?? "";
  }

  public static override define(): void
  {
    if (customElements.get("app-number-input"))
      return;
    customElements.define("app-number-input", AppNumberInput);
  }
}

AppNumberInput.define();


function minAttr(element: AppNumberInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "min", value);
}

function maxAttr(element: AppNumberInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "max", value);
}
