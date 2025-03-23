import {AppInput} from "../app-input/app-input";
import css from "./app-number-input.css" with {type: "inline"};

export class AppNumberInput extends AppInput
{
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
