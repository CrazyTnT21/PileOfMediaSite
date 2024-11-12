import {AppInput} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import {SearchEvent} from "./search-event";

export class AppSearchInput extends AppInput implements StyleCSS
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Search";
    await super.connectedCallback();
    const input = this.shadowRoot.querySelector("input")!;
    this.shadowRoot.querySelector("app-button")!.addEventListener("click", () =>
    {
      input.focus();
      this.shadowRoot.dispatchEvent(new SearchEvent({composed: true, detail: input.value}));
    });
    input.addEventListener("search", () => this.shadowRoot.dispatchEvent(new SearchEvent({
      composed: true,
      detail: input.value
    })));
    input.addEventListener("keyup", (e) =>
    {
      if (e.key == "Enter")
        this.shadowRoot.dispatchEvent(new SearchEvent({composed: true, detail: input.value}));
    });
  }

  constructor()
  {
    super();
    this.shadowRoot.querySelector("input")!.type = "search";
  }

  override render(): void
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
      <span class="input parent" part="outline" id="outline">
      <label part="label" for="input"></label>
        <input class="control" part="inner-input" id="input"/>
        <app-button exportparts="button: icon-button" aria-label="Search">
          <slot name="icon-button">
            <span id="icon" class="icon" part="icon"></span>
          </slot>
        </app-button>
      </span>
    `;
  }

  override styleCSS(): string
  {
    //language=CSS
    return super.styleCSS() + `
      .icon::before {
        display: flex;
        content: "search";
        font-family: "Material Symbols Outlined", serif;
        font-size: 22px;
        color: var(--input-label-color--);
      }

      .parent {
        min-width: 0;
      }

      input {
        display: inline-flex;
        flex: 1 1 100%;
        min-width: 0;
        outline: none;
        border: none
      }

      .parent {
        flex: 1;
      }

      #outline:has(input:focus) {
        outline: solid 2px var(--input-outline-color--);
      }

      #outline:hover {
        transition: border-color ease 50ms;
      }

      app-button {
        --button-outline-color: var(--input-outline-color--);
        --button-background-color: none;
        --button-background-color-hover: none;
        display: inline-flex;
        align-self: center;
        align-items: center;
      }

      ::part(button) {
        display: inline-flex;
        padding: 0 5px 0 5px;
        border: none;
        cursor: pointer;
      }

      #outline:has(input[data-invalid]) {
        border-color: var(--input-invalid-color--);
      }
    `;
  }

  public static define(): void
  {
    if (customElements.get("app-search-input"))
      return;
    customElements.define("app-search-input", AppSearchInput);
  }
}

AppSearchInput.define()
