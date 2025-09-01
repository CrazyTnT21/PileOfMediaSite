import {AppPasswordInput} from "../../components/inputs/app-password-input/app-password-input";
import {AppHeader} from "../../components/app-header/app-header";
import {apiClient} from "../../openapi/client";
import {AppEmailInput} from "../../components/inputs/app-email-input/app-email-input";
import {mapSelectors} from "../../dom";
import {AppButton} from "../../components/app-button/app-button";

type Elements = {
  email: AppEmailInput
  password: AppPasswordInput,
  fieldset: HTMLFieldSetElement,
  form: HTMLFormElement,
  header: AppHeader,
  successfulLogin: HTMLDivElement,
  returnLink: HTMLAnchorElement,
  loginSubmit: AppButton
}
const elementSelectors = {
  email: "#email",
  password: "#password",
  fieldset: "#input-fieldset",
  form: "form",
  header: "app-header",
  successfulLogin: "#successful-login",
  returnLink: "#return-link",
  loginSubmit: "#login-submit"
}


const elements = mapSelectors<Elements>(document, elementSelectors);
elements.returnLink.href = document.referrer;

elements.form.addEventListener("submit", async e =>
{
  e.preventDefault();
  const {fieldset, email, password, loginSubmit} = elements;

  loginSubmit.disabled = true;

  const response = await apiClient.POST("/accounts/login", {
    body: {
      email: email.value,
      password: password.value
    }
  });

  loginSubmit.disabled = false;

  if (response.error != undefined)
  {
    let errorMessage = response.error;
    if (errorMessage == "" || isServerError(response.response))
      errorMessage = response.error || "Fetch error"; //TODO translation/alternative message
    password.setCustomValidity("customError", errorMessage);
  }

  if (!elements.form.reportValidity())
    return;

  fieldset.disabled = true;
  password.value = null;

  elements.successfulLogin.hidden = false;

  elements.header.account = response.data!;
});

function isServerError(response: { status: number }): boolean
{
  return response.status >= 500 && response.status < 600;
}
