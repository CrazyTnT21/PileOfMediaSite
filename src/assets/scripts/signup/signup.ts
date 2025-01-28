import {API_URL} from "../modules";
import {AppInput} from "../../components/inputs/app-input/app-input";
import {AppPasswordInput} from "../../components/inputs/app-password-input/app-password-input";
import {AppHeader} from "../../components/app-header/app-header";
import createClient from "openapi-fetch";
import {paths} from "pileofmedia-openapi";
import {formData} from "../../components/inputs/common";

document.querySelector("form")!.addEventListener("submit", async e =>
{
  e.preventDefault();
  const fieldset: HTMLFieldSetElement = document.querySelector("#input-fieldset")!;
  fieldset.disabled = true;
  const userNameInput: AppInput = document.querySelector("#username")!;
  const emailInput: AppInput = document.querySelector("#email")!;
  const passwordInput: AppPasswordInput = document.querySelector("#password")!;
  const client = createClient<paths>({baseUrl: API_URL});

  const response = await client.POST("/accounts/register", {
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
  if (response.error != undefined)
  {
    fieldset.disabled = false;
    const oldError = emailInput.setCustomError;
    const input = emailInput;

    input.setCustomError = (): void =>
    {
      input.errors.set("customError", () => response.error);
    };

    await input.validateAndReport();
    input.setCustomError = oldError;

    return;
  }
  (<AppHeader>document.querySelector("app-header")).account = response.data!;
  const successLoginDiv = document.createElement("div");
  successLoginDiv.innerHTML = `<div class="pad">Successfully signed up! <a href="${document.referrer}">Return to previous page</a></div>`;
  document.querySelector("form")!.append(successLoginDiv)
});
