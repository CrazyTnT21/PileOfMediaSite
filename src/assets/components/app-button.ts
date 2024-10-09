import {applyStyleSheet, attach_delegates} from "./defaults.js";
import {StyleCSS} from "./style-css.js";
import {ApplyStyleSheet} from "./apply-style-sheet.js";
import {handleFieldset} from "./inputs/common.js";

export class AppButton extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static formAssociated = true;
  static observedAttributes = ["type"];

  private internals: ElementInternals;

  get type(): "button" | "submit" | "reset"
  {
    return this.getAttribute("type") as "button" | "reset" | "submit";
  }

  set type(value: "button" | "submit" | "reset")
  {
    this.setAttribute("type", value);
    const button = this.shadowRoot!.querySelector("button")!;
    button.type = value;
  }

  disabledValue: boolean = false;
  hasDisabledFieldset: boolean = false;

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "";
  }

  set disabled(value: boolean)
  {
    this.disabledValue = value;
    value = this.disabledValue || this.hasDisabledFieldset;
    if (value)
      this.setAttribute("disabled", "");
    else
      this.removeAttribute("disabled");
    this.shadowRoot!.querySelector("button")!.disabled = value;
  }

  connectedCallback()
  {
    const button = this.shadowRoot!.querySelector("button")!;
    const type = this.getAttribute("type");
    if (type && ["submit", "button", "reset"].includes(type))
      this.type = type as "submit" | "button" | "reset";
    else
      this.type = "submit";
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
    handleFieldset(this);
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
      <button part="button">
        <slot></slot>
      </button>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      button {
        border-radius: 5px;
        display: inline-flex;
        flex: 1 1 100%;
        padding: 8px;
        justify-content: center;
        border: 0;
        background-color: #d6d6d6;
        align-items: center;
      }

      :host {
        display: inline-flex;
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
