import {AppInput, AppInputElements} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import {SearchEvent} from "./search-event";
import html from "./app-search-input.html" with {type: "inline"};
import css from "./app-search-input.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {AppButton} from "../../app-button/app-button";

export type AppSearchInputElements = AppInputElements & { searchButton: AppButton };

export class AppSearchInput extends AppInput implements StyleCSS
{
  override readonly elements: AppSearchInputElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    searchButton: "app-button",
  }

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Search";
    await super.connectedCallback();
    const {searchButton, input} = this.elements;
    searchButton.addEventListener("click", () =>
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
    this.elements = mapSelectors<AppSearchInputElements>(this.shadowRoot, AppSearchInput.elementSelectors);
    this.elements.input.type = "search";
  }

  override render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }

  public static override define(): void
  {
    if (customElements.get("app-search-input"))
      return;
    customElements.define("app-search-input", AppSearchInput);
  }
}

AppSearchInput.define()
