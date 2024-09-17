// noinspection ES6UnusedImports

import {attach, applyStyleSheet} from "./defaults.js";
import {AppButton} from "./app-button.js";
import {ApplyStyleSheet} from "./apply-style-sheet.js";
import {StyleCSS} from "./style-css.js";

export class AppTable<T> extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  get caption(): string
  {
    return this.dataset["caption"] ?? "";
  }

  set caption(value: string)
  {
    this.dataset["caption"] = value;
    this.shadowRoot!.querySelector("caption")!.innerText = value;
  }

  set total(value: number)
  {
    const tfoot = this.shadowRoot!.querySelector("tfoot")!;

    const tr = <HTMLTableRowElement>tfoot.firstElementChild;
    tr.hidden = value === 0;
    (<HTMLTableCellElement>tr.children[1])!.innerText = value.toString();
  }

  private _items: any[] = [];
  set items(items: any[])
  {
    this._items = items;
    this.total = this._items.length;
    const rows = this.shadowRoot!.querySelector("tbody")!;
    rows.innerHTML = ``;
    for (let i = 0; i < items.length; i++)
    {
      const row = this.createRow(items[i]);
      row.part.add("tbody-tr");
      for (const x of row.children)
      {
        x.part.add("tbody-td");
      }
      rows.append(row);
    }
    for (let i = 1; i < rows.children.length; i += 2)
    {
      rows.children[i]!.part.add("tr-even");
    }
  }

  createRow(item: any)
  {
    const row = document.createElement("tr");
    row.part.add("tr");
    for (const column of this._columns)
    {
      const data = this.createRowElement(column, item);
      row.append(data);
    }
    return row;
  }

  getValue(item: any, keys: string[]): string | null
  {
    for (const key of keys)
    {
      if (item[key] == null)
        return null;
      item = item[key];
    }
    return item;
  }

  createRowElement(column: Column<T>, item: T)
  {
    const element = column.type === ColumnType.Image
      ? document.createElement("img")
      : document.createElement("div");

    this.setInnerHTML(column, element, item);

    const data = document.createElement("td");
    data.part.add("td");
    data.classList.add("pad");

    if (column.width)
      data.style.width = column.width;

    data.append(element);
    return data;
  }

  setInnerHTML(column: Column<T>, element: HTMLImageElement | HTMLDivElement, item: T)
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
    (<HTMLButtonElement>this.shadowRoot!.querySelector("#next")).disabled = value;
  }

  set backDisabled(value: boolean)
  {
    (<HTMLButtonElement>this.shadowRoot!.querySelector("#back")).disabled = value;
  }

  _columns: Column<T>[] = [];
  set columns(columns: Column<T>[])
  {
    this._columns = columns;

    const theadElement = this.shadowRoot!.querySelector("thead")!.firstElementChild!;
    theadElement.innerHTML = ``;
    for (const column of columns)
    {
      const columnElement = document.createElement("th");
      columnElement.part.add("th", "thead-th");
      columnElement.classList.add("pad");
      columnElement.scope = "col";
      columnElement.innerHTML = column.display;

      if (column.width)
        columnElement.style.width = column.width;

      theadElement.append(columnElement);
    }
    this.items = this._items;
  }

  #nextEvent = new Event("next", {composed: true});
  #backEvent = new Event("back", {composed: true});

  connectedCallback()
  {
    this.shadowRoot!.querySelector("#next")!.addEventListener("click", () =>
      this.shadowRoot!.dispatchEvent(this.#nextEvent));

    this.shadowRoot!.querySelector("#back")!.addEventListener("click", () =>
      this.shadowRoot!.dispatchEvent(this.#backEvent));

    this.shadowRoot!.querySelector("caption")!.innerHTML = this.caption;
  }

  constructor()
  {
    super();
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;

  render()
  {
    //language=HTML
    this.shadowRoot!.innerHTML = `
      <table part="table">
        <caption part="caption"></caption>
        <thead part="thead">
        <tr part="thead-tr tr">

        </tr>
        </thead>
        <tbody part="tbody">

        </tbody>
        <tfoot part="tfoot">
        <tr part="tfoot-tr tr" hidden>
          <th part="tfoot-th th" scope="row" colspan="2">Total</th>
          <td part="tfoot-td td" colspan="2"></td>
          <td part="tfoot-td td">
            <app-button exportparts="button, button: back-button" id="back">Back</app-button>
          </td>
          <td part="tfoot-td td">
            <app-button exportparts="button, button: next-button" id="next">Next</app-button>
          </td>
        </tr>
        </tfoot>
      </table>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      img {
        width: 100%;
      }

      .pad {
        padding: 5px;
      }

      table {
        border-radius: 5px;
        background-color: #f0f0f0;
        width: 100%;
        border-collapse: collapse;
      }

      tbody {
        background-color: #DADADAFF;
      }

      thead > tr > th:first-child {
        border-radius: 5px 0 0 0;
      }

      thead > tr > th:last-child {
        border-radius: 0 5px 0 0;
      }

      tfoot > tr > th:first-child {
        border-radius: 0 0 0 5px;
      }

      tr:nth-of-type(even) {
        background-color: #f0f0f0;
      }

      ::part(button) {
        min-width: 4rem;
        min-height: 2rem;
        border: 0;
      }
    `;
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
  formatFn?: (item: T) => string,
}

customElements.define("app-table", AppTable);
