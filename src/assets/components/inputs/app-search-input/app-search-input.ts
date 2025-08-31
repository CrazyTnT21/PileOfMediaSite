import {AppInput, AppInputElements, appInputTexts} from "../app-input/app-input";
import {StyleCSS} from "../../style-css";
import {SearchEvent} from "./search-event";
import html from "./app-search-input.html" with {type: "inline"};
import css from "./app-search-input.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {AppButton} from "../../app-button/app-button";
import {Observer} from "../../../observer";
import {AttributeValue} from "../common";
import {labelAttribute, disabledAttribute} from "./attributes";
import {applyStyleSheet} from "../../defaults";

export type AppSearchInputElements = AppInputElements & { searchButton: AppButton };
export const appSearchInputTexts = {
  ...appInputTexts,
  search: "Search"
}

export class AppSearchInput extends AppInput implements StyleCSS
{
  public override readonly texts = new Observer(appSearchInputTexts);

  public override readonly elements: AppSearchInputElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    searchButton: "app-button",
  }
  //TODO: as conversion
  protected static override observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "label": (element: AppInput, v: AttributeValue): void => labelAttribute(element as AppSearchInput, v),
    "disabled": (element: AppInput, value: AttributeValue): void =>
        disabledAttribute(element as AppSearchInput, value, (element as AppSearchInput).internals, (element as AppSearchInput).hasDisabledFieldset),
  };

  protected override async connectedCallback(): Promise<void>
  {
    await super.connectedCallback();
    const {searchButton, input} = this.elements;
    searchButton.addEventListener("click", () =>
    {
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

  public constructor()
  {
    super();
    this.elements = mapSelectors<AppSearchInputElements>(this.shadowRoot, AppSearchInput.elementSelectors);
    this.elements.input.type = "search";
    this.texts.addListener("search", () =>
    {
      if (!this.getAttribute("label"))
        this.label = "";
    });
  }

  protected override render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  //TODO: Private
  public override styleCSS(): string
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
