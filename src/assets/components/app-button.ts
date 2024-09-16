import {applyStyleSheet, attach_delegates} from "./defaults.js";
import {StyleCSS} from "./style-css.js";
import {ApplyStyleSheet} from "./apply-style-sheet.js";

export class AppButton extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static formAssociated = true;
  static observedAttributes = ["type"];

  private internals: ElementInternals;

  get type(): "button" | "submit" | "reset"
  {
    return this.shadowRoot!.querySelector("button")!.type;
  }

  set type(value: "button" | "submit" | "reset")
  {
    this.setAttribute("type", value);
    const button = this.shadowRoot!.querySelector("button")!;
    button.type = value;
  }

  get value(): string | undefined
  {
    return this.dataset["value"]
  }

  set value(value: string | undefined)
  {
    if (!value)
      delete this.dataset["value"]
    else
      this.dataset["value"] = value;
    this.shadowRoot!.querySelector("button")!.innerText = this.value ?? "";
  }

  connectedCallback()
  {
    const button = this.shadowRoot!.querySelector("button")!;

    if (this.value)
      button.innerText = this.value;
    else
      button.innerHTML = this.innerHTML;

    button.type = this.type;

    button.addEventListener("click", e =>
    {
      const button = <HTMLButtonElement>e.target;
      if (button.type == "submit" && this.internals.form)
      {
        if (this.internals.form.reportValidity())
          this.internals.form.requestSubmit();
      }
    });
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.role = "button";
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  render()
  {
    //language=HTML
    this.shadowRoot!.innerHTML = `
      <button part="button"></button>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      button {
        display: flex;
        flex: 1 1 100%;
        padding: 10px;
        justify-content: center;
        border: 0;
        background-color: #d6d6d6;
      }

      button:hover, button:focus {
        background-color: #c1bfbf;
      }

      button:active {
        background-color: #c5c5c5;
      }
    `;
  }
}

customElements.define("app-button", AppButton);
