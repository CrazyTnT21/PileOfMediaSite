import {AppInput} from "../app-input/app-input";
import css from "./app-number-input.css" with {type: "inline"};

export class AppNumberInput extends AppInput
{
  constructor()
  {
    super();
    this.shadowRoot.querySelector("input")!.type = "number";
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }
}

customElements.define("app-number-input", AppNumberInput);
