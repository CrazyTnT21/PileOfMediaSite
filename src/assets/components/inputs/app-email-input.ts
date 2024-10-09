import {AppInput} from "./app-input/app-input.js";

export class AppEmailInput extends AppInput
{
  constructor()
  {
    super();
    this.shadowRoot!.querySelector("input")!.type = "email";
  }
}

customElements.define("app-email-input", AppEmailInput);
