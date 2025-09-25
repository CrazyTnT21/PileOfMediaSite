import {AppInput} from "../app-input/app-input";

const emailInputTag = "app-email-input" as const;
export type EmailInputTag = typeof emailInputTag;

//TODO email max length 254 characters
export class AppEmailInput extends AppInput
{
  public constructor()
  {
    super();
    this.elements.input.type = "email";
  }

  public static override define(): void
  {
    if (customElements.get(emailInputTag))
      return;
    customElements.define(emailInputTag, AppEmailInput);
  }
}

AppEmailInput.define();
