import {AppInput} from "../../components/inputs/app-input/app-input";
import {AppPasswordInput} from "../../components/inputs/app-password-input/app-password-input";
import {AppHeader} from "../../components/app-header/app-header";
import {apiClient} from "../../openapi/client";

document.querySelector("form")!.addEventListener("submit", async e =>
{
  e.preventDefault();
  const fieldset: HTMLFieldSetElement = document.querySelector("#input-fieldset")!;
  fieldset.disabled = true;
  const emailInput: AppInput = document.querySelector("#email")!;
  const passwordInput: AppPasswordInput = document.querySelector("#password")!;

  const response = await apiClient.POST("/accounts/login", {
    body: {
      email: emailInput.value,
      password: passwordInput.value
    }
  });
  passwordInput.value = null;
  //TODO
  if (response.error != undefined)
  {
    fieldset.disabled = false;
    return;
  }
  //TODO: mapSelectors
  (<AppHeader>document.querySelector("app-header")).account = response.data!;
  //TODO: replace with pre existing element that has [hidden] toggled
  const successLoginDiv = document.createElement("div");
  successLoginDiv.innerHTML = `<div class="pad">Successfully logged in! <a href="${document.referrer}">Return to previous page</a></div>`;
  document.querySelector("form")!.append(successLoginDiv)
});
