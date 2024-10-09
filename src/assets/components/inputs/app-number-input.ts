import {AppInput} from "./app-input/app-input.js";

export class AppNumberInput extends AppInput
{
  constructor()
  {
    super();
    this.shadowRoot!.querySelector("input")!.type = "number";
  }

  override styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
      input[type=number] {
        -moz-appearance: textfield;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    `;
  }
}

customElements.define("app-number-input", AppNumberInput);
