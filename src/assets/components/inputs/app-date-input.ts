import {AppInput} from "./app-input/app-input.js";

export class AppDateInput extends AppInput
{
  constructor()
  {
    super();
    this.shadowRoot.querySelector("input")!.type = "date";
  }
}

customElements.define("app-date-input", AppDateInput);
