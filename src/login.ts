import {API_URL} from "./modules.js";
import {AppInput} from "./assets/components/inputs/app-input.js";
import {AppPasswordInput} from "./assets/components/inputs/app-password-input.js";
import {AppHeader} from "./assets/components/app-header.js";
import createClient from "openapi-fetch";
import {paths} from "mycollection-openapi";
document.querySelector("form")!.addEventListener("submit", async e =>
{
  e.preventDefault();
  const fieldset: HTMLFieldSetElement = document.querySelector("#input-fieldset")!;
  fieldset.disabled = true;
  const emailInput: AppInput = document.querySelector("#email")!;
  const passwordInput: AppPasswordInput = document.querySelector("#password")!;
  const client = createClient<paths>({baseUrl: API_URL});

  const response = await client.POST("/accounts/login", {
    body: {
      email: emailInput.value,
      password: passwordInput.value
    }
  });
  passwordInput.value = null;
  if (response.error != undefined)
  {
    fieldset.disabled = false;
    const oldError = emailInput.setCustomError;
    let input: AppInput;
    //TODO: Replace with enum error
    if (response.error.includes("password"))
      input = passwordInput;
    else
      input = emailInput;

    input.setCustomError = (_) =>
    {
      input.errors.set("customError", () => response.error);
    };

    await input.validateAndReport();
    input.setCustomError = oldError;

    return;
  }
  (<AppHeader>document.querySelector("app-header")).account = response.data!;
  const successLoginDiv = document.createElement("div");
  successLoginDiv.innerHTML = `<div class="pad">Successfully logged in! <a href="${document.referrer}">Return to previous page</a></div>`;
  document.querySelector("form")!.append(successLoginDiv)
});
