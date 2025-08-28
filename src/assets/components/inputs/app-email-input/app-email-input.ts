import {AppInput} from "../app-input/app-input";

//TODO email max length 254 characters
export class AppEmailInput extends AppInput
{
  constructor()
  {
    super();
    this.elements.input.type = "email";
  }

  public static override define(): void
  {
    if (customElements.get("app-email-input"))
      return;
    customElements.define("app-email-input", AppEmailInput);
  }
}

AppEmailInput.define();
