import {Temporal} from "temporal-polyfill";
import {AppInput} from "../app-input/app-input";

export class AppDateInput extends AppInput
{
  public constructor()
  {
    super();
    this.elements.input.type = "date";
  }

  public override get value(): Temporal.PlainDate | null | undefined
  {
    const value = this.elements.input.value;

    if (value)
      return Temporal.PlainDate.from(value);

    return null;
  }

  public override set value(value: Temporal.PlainDate | null | undefined)
  {
    const {input} = this.elements;
    input.value = value?.toString() ?? "";
  }

  public static override define(): void
  {
    if (customElements.get("app-date-input"))
      return;
    customElements.define("app-date-input", AppDateInput);
  }
}

AppDateInput.define();
