import {AppInput} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import {SearchEvent} from "./search-event";
import html from "./app-search-input.html" with {type: "inline"};
import css from "./app-search-input.css" with {type: "inline"};

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
    this.shadowRoot.innerHTML = html;
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }

  public static define(): void
  {
    if (customElements.get("app-search-input"))
      return;
    customElements.define("app-search-input", AppSearchInput);
  }
}

AppSearchInput.define()
