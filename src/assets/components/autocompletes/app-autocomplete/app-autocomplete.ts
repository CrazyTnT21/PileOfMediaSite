import {AppInput, AppInputElements, appInputTexts} from "../../inputs/app-input/app-input";
import {ValueChangeEvent} from "./value-change-event";
import {SelectedAddedEvent} from "./selected-added-event";
import {SelectedRemovedEvent} from "./selected-removed-event";
import html from "./app-autocomplete.html" with {type: "inline"};
import css from "./app-autocomplete.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {Observer} from "../../../observer";
import {templateString, SurroundedString} from "../../inputs/common";

export type AppAutoCompleteElements = AppInputElements & { selected: HTMLUListElement, items: HTMLDataListElement };
export const appAutocompleteTexts = {
  ...appInputTexts,
  itemNotFound: templateString<SurroundedString<"{value}">>(`Item '{value}' was not found`),
  itemAlreadySelected: templateString<SurroundedString<"{value}">>(`'{value}' has already been selected`)
}

export class AppAutocomplete<T = { value: any, label?: string }> extends AppInput
{
  private readonly itemsGenerator: AsyncGenerator<T[], T[], T[]>;
  private readonly cachedSearch: Map<string, T[]> = new Map();
  private internalItems: T[] = [];
  private internalItem: T | undefined | null;
  private selectedItems: T[] = [];
  override readonly elements: AppAutoCompleteElements;
  protected static override readonly elementSelectors = {
    ...AppInput.elementSelectors,
    selected: "#selected",
    items: "#items"
  }

  override readonly texts = new Observer(appAutocompleteTexts);

  constructor()
  {
    super();
    this.elements = mapSelectors<AppAutoCompleteElements>(this.shadowRoot, AppAutocomplete.elementSelectors);
    this.itemsGenerator = this.loadItems();
  }

  protected internalSearch: T[] = [];

  override get value(): T | undefined | null
  {
    return this.internalItem;
  }

  override set value(value: T | undefined | null)
  {
    this.internalItem = value;
    if (value == null)
    {
      super.value = null;
      return;
    }
    super.value = this.itemLabel(value) ?? this.itemValue(value);
  }

  findValue(value: string): T | undefined
  {
    return this.findSameValue(value, this.items);
  }

  get items(): T[]
  {
    return this.internalItems;
  }

  set items(items: T[])
  {
    this.internalItems = items;
    this.createOptions(this.internalItems);
  }

  addItem(item: T): void
  {
    this.items.push(item);
    this.addOptions([item]);
  }

  removeItem(item: T): void
  {
    const value = this.itemValue(item);
    const index = this.items.findIndex(x => this.itemValue(x) === value);
    this.items.splice(index, 1);
  }

  findItem(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.items.find(x => this.itemValue(x) === id);
  }

  get selected(): T[]
  {
    return this.selectedItems;
  }

  set selected(items: T[])
  {
    this.selectedItems = items;

    const {selected} = this.elements;
    selected.innerHTML = "";
    this.pushSelected(selected, items);
  }

  addSelected(value: T): void
  {
    const {selected} = this.elements;
    this.pushSelected(selected, [value]);
    this.shadowRoot.dispatchEvent(new SelectedAddedEvent<T>({composed: true, detail: value}));
  }

  removeSelected(item: T): void
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

  findSelected(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.selected.find(x => this.itemValue(x) === id);
  }

  findSelectedValue(value: string): T | undefined
  {
    return this.findSameValue(value, this.selected);
  }

  findSearch(item: T): T | undefined
  {
    const id = this.itemValue(item);
    return this.internalSearch.find(x => this.itemValue(x) === id);
  }

  findSearchValue(value: string): T | undefined
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

  override async onInputChange(event: Event): Promise<void>
  {
    const input = <HTMLInputElement>event.target;
    await super.onInputChange(event);
    await this.valueChange(input);
  }

  override async onValueSet(event: Event): Promise<void>
  {
    const {input} = this.elements;
    await this.search(input.value);
    await super.onValueSet(event);
    await this.valueChange(input);
  }

  async valueChange(input: HTMLInputElement): Promise<void>
  {
    if (!await this.valid())
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

    if (this.isMultiple() && item)
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

  async onInputInput(event: InputEvent): Promise<void>
  {
    if (event.inputType !== "insertReplacementText")
      await this.search((<HTMLInputElement>event.target).value);
  }

  async onInputFocus(_event: FocusEvent): Promise<void>
  {
    await this.firstOpen();
  }

  override async connectedCallback(): Promise<void>
  {
    await super.connectedCallback();
    const {input} = this.elements;
    // TODO Initial value, single item loading
    // const value = this.getAttribute("value");

    input.addEventListener("input", (e) => this.onInputInput(<InputEvent>e));
    input.addEventListener("focus", (e) => this.onInputFocus(e), {once: true})
  }

  override render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  createOptions(items: T[]): void
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

  override async setValidity(input: HTMLInputElement): Promise<void>
  {
    await super.setValidity(input);
    if (!input.value)
      return;

    const value = input.value.toLowerCase().trim();

    if (this.isMultiple())
    {
      const found = this.findSelectedValue(value);
      if (found)
      {
        this.errors.set("customError", () => this.texts.get("itemAlreadySelected").replace("{value}", value));
        return;
      }
    }

    if (!this.findValue(value) && !this.findSearchValue(value))
      this.errors.set("customError", () => this.texts.get("itemNotFound").replace("{value}", value));
  }

  isMultiple(): boolean
  {
    return this.getAttribute("data-multiple") == "";
  }

  async firstOpen(): Promise<void>
  {
    this.items.push(...(await this.itemsGenerator.next()).value);
    this.createOptions(this.items.filter((x) => !this.findSelected(x)));
  }

  async search(value: string): Promise<void>
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

  async* loadItems(): AsyncGenerator<T[]>
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

  async* searchItems(_value: string): AsyncGenerator<T[]>
  {
    yield this.items;
  }

  override styleCSS(): string
  {
    return super.styleCSS() + css;
  }

  itemLabel(item: T): string | null
  {
    return (<any>item)["label"];
  }

  itemValue(item: T): any
  {
    return (<any>item)["value"];
  }

  public static override define(): void
  {
    if (customElements.get("app-autocomplete"))
      return;
    customElements.define("app-autocomplete", AppAutocomplete);
  }
}

AppAutocomplete.define();
