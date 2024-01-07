import {Input} from "./input.js";

export class DateInput extends Input
{
  constructor()
  {
    super();
    this.shadowRoot.querySelector("input").type = "date";
  }
}

customElements.define("app-date-input", DateInput);
