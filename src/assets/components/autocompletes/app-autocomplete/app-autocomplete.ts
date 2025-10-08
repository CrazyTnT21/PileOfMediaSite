import {AppInput, AppInputElements, appInputTexts} from "../../inputs/app-input/app-input";
import {ValueChangeEvent} from "./value-change-event";
import {SelectedAddedEvent} from "./selected-added-event";
import {SelectedRemovedEvent} from "./selected-removed-event";
import html from "./app-autocomplete.html" with {type: "inline"};
import css from "./app-autocomplete.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {Observer} from "../../../observer";
import {AttributeValue} from "../../inputs/common";
import {templateString, IncludesString} from "../../inputs/common";
import {applyStyleSheet} from "../../defaults";
import {mapBooleanAttribute} from "../../inputs/map-boolean-attribute";
import {multiple} from "./attributes";
import {Err, Ok} from "../../../result/result";
import {ErrorResult} from "../../../validation";

export type AppAutoCompleteElements = AppInputElements & { selected: HTMLUListElement, items: HTMLDataListElement };
export const appAutocompleteTexts = {
  ...appInputTexts,
  itemNotFound: templateString<IncludesString<"{value}">>(`Item '{value}' was not found`),
  itemAlreadySelected: templateString<IncludesString<"{value}">>(`'{value}' has already been selected`)
}
type AttributeKey = keyof typeof AppAutocomplete["observedAttributesMap"];

const autocompleteTag = "app-autocomplete" as const;
export type AutocompleteTag = typeof autocompleteTag;

export class AppAutocomplete<T = { value: any, label?: string }> extends AppInput
{
  private readonly itemsGenerator: AsyncGenerator<T[], T[], T[]>;
  private readonly cachedSearch: Map<string, T[]> = new Map();
  private internalItems: T[] = [];
  private internalItem: T | undefined | null;
  private selectedItems: T[] = [];
  public override readonly elements: AppAutoCompleteElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    selected: "#selected",
    items: "#items"
  }
  //TODO: as conversion
  protected static override readonly observedAttributesMap = {
    ...AppInput.observedAttributesMap,
    "multiple": (element: AppInput, v: AttributeValue): void => multiple(element as AppAutocomplete, v),
  };

  public override readonly texts = new Observer(appAutocompleteTexts);

  protected internalSearch: T[] = [];

  @mapBooleanAttribute("multiple")
  public accessor multiple: boolean = null!;

  public override get value(): T | undefined | null
  {
    return this.internalItem;
  }

  public override set value(value: T | undefined | null)
  {
    this.internalItem = value;
    if (value == null)
    {
      super.value = null;
      return;
    }
    super.value = this.itemLabel(value) ?? this.itemValue(value);
  }

  public get items(): T[]
  {
    return this.internalItems;
  }

  public set items(items: T[])
  {
    this.internalItems = items;
    this.createOptions(this.internalItems);
  }

  public get selected(): T[]
  {
    return this.selectedItems;
  }

  public set selected(items: T[])
  {
    this.selectedItems = items;

    const {selected} = this.elements;
    selected.innerHTML = "";
    this.pushSelected(selected, items);
  }

  public constructor()
  {
    super();
    this.elements = mapSelectors<AppAutoCompleteElements>(this.shadowRoot, AppAutocomplete.elementSelectors);
    this.itemsGenerator = this.loadItems();
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected override async connectedCallback(): Promise<void>
  {
    await super.connectedCallback();
    const {input} = this.elements;
    // TODO Initial value, single item loading
    // const value = this.getAttribute("value");

    input.addEventListener("input", (e) => this.onInputInput(<InputEvent>e));
    input.addEventListener("focus", (e) => this.onInputFocus(e), {once: true})
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected override async attributeChangedCallback(name: AttributeKey, _oldValue: AttributeValue, newValue: AttributeValue): Promise<void>
  {
    //TODO as conversion
    return super.attributeChangedCallback(name as keyof typeof AppInput["observedAttributesMap"], _oldValue, newValue);
  }

  public findValue(value: string): T | undefined
  {
    return this.findSameValue(value, this.items);
  }

  public addItem(item: T): void
  {
    this.items.push(item);
    this.addOptions([item]);
  }

  public removeItem(item: T): void
  {
    const value = this.itemValue(item);
    const index = this.items.findIndex(x => this.itemValue(x) === value);
    this.items.splice(index, 1);
  }

  public findItem(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.items.find(x => this.itemValue(x) === id);
  }

  public addSelected(value: T): void
  {
    const {selected} = this.elements;
    this.pushSelected(selected, [value]);
    this.shadowRoot.dispatchEvent(new SelectedAddedEvent<T>({composed: true, detail: value}));
  }

  public removeSelected(item: T): void
  {
    const id = this.itemValue(item);

    const index = this.selectedItems.findIndex(x => this.itemValue(x) === id);
    this.selectedItems.splice(index, 1);
    const {selected} = this.elements;
    const children = selected.children;
    for (let i = children.length - 1; i >= 0; i--)
    {
      const item = children[i]!;
      const child = <HTMLDataElement>item.firstElementChild;
      if (Number(child.value) != id)
      {
        continue;
      }
      selected.removeChild(item);
      if (i < selected.children.length)
      {
        const button = <HTMLButtonElement>child.firstElementChild;
        button.focus();
      }
      else if (i > 0)
      {
        const previousData = <HTMLDataElement>children[i - 1]!.firstElementChild;
        const button = <HTMLButtonElement>previousData.firstElementChild;
        button.focus();
      }
      return;
    }
    console.error(`Item with the id '${id}' could not be removed. Item not found`);
  }

  private pushSelected(selected: HTMLUListElement, items: T[]): void
  {
    this.selectedItems.push(...items);
    for (const item of items)
    {
      const li = document.createElement("li");
      const data = document.createElement("data");
      li.append(data);
      data.value = this.itemValue(item).toString();
      selected.append(li);
      const button = document.createElement("button");
      data.append(button);

      button.innerText = this.itemLabel(item) ?? this.itemValue(item);
      button.addEventListener("click", async () =>
      {
        this.removeSelected(item);
        const {input} = this.elements;
        await this.search(input.value);
        this.shadowRoot.dispatchEvent(new SelectedRemovedEvent({composed: true, detail: item}));
      });
    }
  }

  public findSelected(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.selected.find(x => this.itemValue(x) === id);
  }

  public findSelectedValue(value: string): T | undefined
  {
    return this.findSameValue(value, this.selected);
  }

  public findSearch(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.internalSearch.find(x => this.itemValue(x) === id);
  }

  public findSearchValue(value: string): T | undefined
  {
    return this.findSameValue(value, this.internalSearch);
  }

  private findSameValue(value: string, items: T[]): T | undefined
  {
    const trimAndLowercase = (x: any): string => x.toString().trim().toLowerCase();
    value = trimAndLowercase(value);
    return items.find(x =>
    {
      if (trimAndLowercase(this.itemValue(x)) === value)
        return true;
      const label = this.itemLabel(x);
      if (!label)
        return false;

      return trimAndLowercase(label) === value;
    });
  }

  protected override async onInputChange(event: Event): Promise<void>
  {
    const input = <HTMLInputElement>event.target;
    await super.onInputChange(event);
    await this.valueChange(input);
  }

  protected override async onValueSet(event: Event): Promise<void>
  {
    const {input} = this.elements;
    await this.search(input.value);
    await super.onValueSet(event);
    await this.valueChange(input);
  }

  protected async valueChange(input: HTMLInputElement): Promise<void>
  {
    if (!this.internals.checkValidity())
      return;

    const value = input.value;
    if (!value)
    {
      this.shadowRoot.dispatchEvent(new ValueChangeEvent<T>({composed: true}));
      this.internalItem = null;
      return;
    }
    const item = this.findValue(value) ?? this.findSearchValue(value);
    this.internalItem = item;

    if (this.multiple && item)
    {
      if (!this.findSelected(item))
        this.addSelected(item);
      input.value = "";
      await this.search("");
    }
    const eventInitDict: CustomEventInit = {composed: true};
    if (item)
      eventInitDict.detail = item
    this.shadowRoot.dispatchEvent(new ValueChangeEvent<T>(eventInitDict));
  }

  protected async onInputInput(event: InputEvent): Promise<void>
  {
    if (event.inputType !== "insertReplacementText")
      await this.search((<HTMLInputElement>event.target).value);
  }

  protected async onInputFocus(_event: FocusEvent): Promise<void>
  {
    await this.firstOpen();
  }

  protected override render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  protected createOptions(items: T[]): void
  {
    const {items: datalist} = this.elements;

    datalist.innerHTML = "";

    this.pushOptions(datalist, items);
  }

  protected addOptions(items: T[]): void
  {
    const {items: datalist} = this.elements;
    this.pushOptions(datalist, items);
  }

  protected pushOptions(datalist: HTMLDataListElement, items: T[]): void
  {
    for (const item of items)
    {
      const option = document.createElement("option");
      const data = document.createElement("data");
      data.value = this.itemValue(item).toString();
      data.innerText = this.itemLabel(item) ?? this.itemValue(item);
      option.append(data);
      datalist.append(option);
    }
  }

  protected override setupValidation(): void
  {
    super.setupValidation();
    this.addCustomError(() => this.validateAlreadySelected());
    this.addCustomError(() => this.validateNotFound());
  }

  private validateNotFound(): ErrorResult
  {
    const value = this.elements.input.value.toLowerCase().trim();
    if (value == "")
      return new Ok(undefined);

    if (!this.findValue(value) && !this.findSearchValue(value))
      return new Err({state: "customError", userMessage: this.texts.get("itemNotFound").replace("{value}", value)});

    return new Ok(undefined);
  }

  private validateAlreadySelected(): ErrorResult
  {
    const value = this.elements.input.value.toLowerCase().trim();

    if (!this.multiple)
      return new Ok(undefined);

    const found = this.findSelectedValue(value);
    if (!found)
      return new Ok(undefined);

    return new Err({
      state: "customError",
      userMessage: this.texts.get("itemAlreadySelected").replace("{value}", value)
    });
  }

  protected async firstOpen(): Promise<void>
  {
    this.items.push(...(await this.itemsGenerator.next()).value);
    this.createOptions(this.items.filter((x) => !this.findSelected(x)));
  }

  public async search(value: string): Promise<void>
  {
    if (value === "")
    {
      this.createOptions(this.items.filter((x) => !this.findSelected(x)));
      return;
    }
    if (this.cachedSearch.has(value))
    {
      this.createOptions(this.cachedSearch.get(value)!.filter((x: T) => !this.findSelected(x)));
      return;
    }

    const search: T[] = (await this.searchItems(value).next()).value;
    this.internalSearch = search;
    this.cachedSearch.set(value, search);
    this.createOptions(search.filter((x) => !this.findSelected(x)));
  }

  protected async* loadItems(): AsyncGenerator<T[]>
  {
    yield [...this.children].map(x =>
    {
      const element = <HTMLOptionElement>x;
      return {
        value: element.value || element.innerText,
        label: element.label || null
      }
    }) as T[];
  }

  public async* searchItems(_value: string): AsyncGenerator<T[]>
  {
    yield this.items;
  }

  public override styleCSS(): string
  {
    return css;
  }

  public itemLabel(item: T): string | null
  {
    return (<any>item)["label"];
  }

  public itemValue(item: T): any
  {
    return (<any>item)["value"];
  }

  public static override define(): void
  {
    if (customElements.get(autocompleteTag))
      return;
    customElements.define(autocompleteTag, AppAutocomplete);
  }
}

AppAutocomplete.define();
