import {AppInput} from "../app-input/app-input";

export class AppDateInput extends AppInput
{
  constructor()
  {
    super();
    this.elements.input.type = "date";
  }

  override get value(): Date | null | undefined
  {
    const value = this.elements.input.value;
    let dateValue: Date | null = null;

    if (value)
      dateValue = new Date(value);

    return dateValue;
  }

  override set value(value: Date | null | undefined)
  {
    const {input} = this.elements;
    input.value = value?.toISOString() ?? "";
  }

  public static override define(): void
  {
    if (customElements.get("app-date-input"))
      return;
    customElements.define("app-date-input", AppDateInput);
  }
}

AppDateInput.define();
