import {AppInput} from "../../components/inputs/app-input/app-input";
import {AppPasswordInput} from "../../components/inputs/app-password-input/app-password-input";
import {AppHeader} from "../../components/app-header/app-header";
import {formData} from "../../components/inputs/common";
import {apiClient} from "../../openapi/client";

document.querySelector("form")!.addEventListener("submit", async e =>
{
  e.preventDefault();
  const fieldset: HTMLFieldSetElement = document.querySelector("#input-fieldset")!;
  fieldset.disabled = true;
  const userNameInput: AppInput = document.querySelector("#username")!;
  const emailInput: AppInput = document.querySelector("#email")!;
  const passwordInput: AppPasswordInput = document.querySelector("#password")!;


  const response = await apiClient.POST("/accounts/register", {
    body: {
      account: {
        email: emailInput.value,
        password: passwordInput.value,
        user: {
          name: userNameInput.value
        }
      }
    },
    bodySerializer: formData(["account", "serialize"])
  });
  passwordInput.value = null;
  //TODO
  if (response.error != undefined)
  {
    fieldset.disabled = false;

    return;
  }
  (<AppHeader>document.querySelector("app-header")).account = response.data!;
  const successLoginDiv = document.createElement("div");
  successLoginDiv.innerHTML = `<div class="pad">Successfully signed up! <a href="${document.referrer}">Return to previous page</a></div>`;
  document.querySelector("form")!.append(successLoginDiv)
});
