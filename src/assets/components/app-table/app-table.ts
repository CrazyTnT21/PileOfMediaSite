import {attach, applyStyleSheet} from "../defaults";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import html from "./app-table.html" with {type: "inline"};
import css from "./app-table.css" with {type: "inline"};

export class AppTable<T> extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  override shadowRoot: ShadowRoot;

  get caption(): string
  {
    return this.dataset["caption"] ?? "";
  }

  set caption(value: string)
  {
    this.dataset["caption"] = value;
    this.shadowRoot.querySelector("caption")!.innerText = value;
  }

  set total(value: number)
  {
    const tfoot = this.shadowRoot.querySelector("tfoot")!;

    const tr = <HTMLTableRowElement>tfoot.firstElementChild;
    tr.hidden = value === 0;
    (<HTMLTableCellElement>tr.children[1])!.innerText = value.toString();
  }

  private _items: T[] = [];
  set items(items: T[])
  {
    this._items = items;
    this.total = this._items.length;
    const rows = this.shadowRoot.querySelector("tbody")!;
    rows.innerHTML = ``;
    for (let i = 0; i < items.length; i++)
    {
      const row = this.createRow(items[i]!);
      rows.append(row);
    }
  }

  createRow(item: T): HTMLTableRowElement
  {
    const row = document.createElement("tr");
    for (const column of this._columns)
    {
      const data = this.createRowElement(column, item);
      row.append(data);
    }
    return row;
  }

  getValue(item: T, keys: string[]): string | null
  {
    let result: any = item;
    for (const key of keys)
    {
      if (result[key] == null)
        return null;
      result = result[key];
    }
    return result;
  }

  createRowElement(column: Column<T>, item: T): HTMLTableCellElement
  {
    const element = column.type === ColumnType.Image
      ? document.createElement("img")
      : document.createElement("div");

    this.setInnerHTML(column, element, item);

    const data = document.createElement("td");
    data.classList.add("pad");

    if (column.width)
      data.style.width = column.width;

    if (column.height)
      data.style.height = column.height;

    data.append(element);
    return data;
  }

  setInnerHTML(column: Column<T>, element: HTMLImageElement | HTMLDivElement, item: T): void
  {
    if (column.formatFn)
    {
      element.innerText = column.formatFn(item);
      return;
    }
    const value = this.getValue(item, column.key.split("."));
    if (value == null)
    {
      element.innerText = "";
      return;
    }
    if (column.type == ColumnType.Image)
    {
      (<HTMLImageElement>element).src = value;
      return;
    }
    element.innerText = value;
  }

  set nextDisabled(value: boolean)
  {
    (<HTMLButtonElement>this.shadowRoot.querySelector("#next")).disabled = value;
  }

  set backDisabled(value: boolean)
  {
    (<HTMLButtonElement>this.shadowRoot.querySelector("#back")).disabled = value;
  }

  _columns: Column<T>[] = [];
  set columns(columns: Column<T>[])
  {
    this._columns = columns;

    const theadElement = this.shadowRoot.querySelector("thead")!.firstElementChild!;
    theadElement.innerHTML = ``;
    for (const column of columns)
    {
      const columnElement = document.createElement("th");
      columnElement.classList.add("pad");
      columnElement.scope = "col";
      columnElement.innerText = column.display;

      if (column.width)
        columnElement.style.width = column.width;

      theadElement.append(columnElement);
    }
    this.items = this._items;
  }

  readonly #nextEvent = new Event("next", {composed: true});
  readonly #backEvent = new Event("back", {composed: true});

  connectedCallback(): void
  {
    this.shadowRoot.querySelector("#next")!.addEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#nextEvent));

    this.shadowRoot.querySelector("#back")!.addEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#backEvent));

    this.shadowRoot.querySelector("caption")!.innerText = this.caption;
  }

  constructor()
  {
    super();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;

  render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  styleCSS(): string
  {
    return css;
  }
}

export enum Alignment
{
  Left,
  Center,
  Right,
}

export enum ColumnType
{
  Text,
  Image
}

export type Column<T> = {
  key: string,
  display: string,
  type: ColumnType,
  width?: string,
  height?: string,
  formatFn?: (item: T) => string,
}

customElements.define("app-table", AppTable);
