import {AppInput} from "../../components/inputs/app-input/app-input";
import {AppPasswordInput} from "../../components/inputs/app-password-input/app-password-input";
import {AppHeader} from "../../components/app-header/app-header";
import {formData} from "../../components/inputs/common";
import {apiClient} from "../../openapi/client";
import {mapSelectors} from "../../dom";
import {AppEmailInput} from "../../components/inputs/app-email-input/app-email-input";
import {AppButton} from "../../components/app-button/app-button";

type Elements = {
  username: AppInput
  email: AppEmailInput
  password: AppPasswordInput,
  fieldset: HTMLFieldSetElement,
  form: HTMLFormElement,
  header: AppHeader,
  successfulSignup: HTMLDivElement,
  returnLink: HTMLAnchorElement,
  signupSubmit: AppButton
}
const elementSelectors = {
  username: "#username",
  email: "#email",
  password: "#password",
  fieldset: "#input-fieldset",
  form: "form",
  header: "app-header",
  successfulSignup: "#successful-signup",
  returnLink: "#return-link",
  signupSubmit: "#signup-submit"
}
const elements = mapSelectors<Elements>(document, elementSelectors);

elements.returnLink.href = document.referrer;

elements.form.addEventListener("submit", async e =>
{
  e.preventDefault();
  const {fieldset, username, email, password, signupSubmit} = elements;

  signupSubmit.disabled = true;
  const response = await apiClient.POST("/accounts/register", {
    body: {
      account: {
        email: email.value,
        password: password.value,
        user: {
          name: username.value
        }
      }
    },
    bodySerializer: formData({account: "serialize"})
  });

  signupSubmit.disabled = false;

  if (response.error != undefined)
  {
    let errorMessage = response.error;
    if (errorMessage == "" || isServerError(response.response))
      errorMessage = response.error || "Fetch error"; //TODO translation/alternative message
    email.setCustomValidity("customError", errorMessage);
  }

  //TODO username and email error
  if (!elements.form.reportValidity())
    return;

  fieldset.disabled = true;
  password.value = null;
  elements.successfulSignup.hidden = false;

  elements.header.account = response.data!;
});

function isServerError(response: { status: number }): boolean
{
  return response.status >= 500 && response.status < 600;
}
