import {AppInput} from "./app-Input.js";

export class AppDateInput extends AppInput
{
  constructor()
  {
    super();
    this.shadowRoot.querySelector("input").type = "date";
  }
}

customElements.define("app-date-input", AppDateInput);
