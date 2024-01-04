export class Table extends HTMLTableElement
{
  set caption(value)
  {
    this.shadowRoot.querySelector("caption").innerHTML = value;
  }

  set total(value)
  {
    const tfoot = this.shadowRoot.querySelector("tfoot");

    const tr = tfoot.children[0];
    tr.hidden = value === 0;
    tr.children[1].innerHTML = value;
  }

  _items = [];
  set items(items)
  {
    this._items = items;
    this.total = this._items.length;
    const rows = this.shadowRoot.querySelector("tbody");

    rows.innerHTML = ``;
    for (let i = 0; i < items.length; i++)
    {
      const row = this.createRow(items[i]);
      rows.append(row);
    }
  }

  createRow(item)
  {
    const row = document.createElement("tr");
    for (let j = 0; j < this._columns.length; j++)
    {
      const data = this.createRowElement(this._columns[j], item);
      row.append(data);
    }
    return row;
  }

  getValue(item, keys)
  {
    for (let i = 0; i < keys.length; i++)
    {
      if (item[keys[i]] === undefined)
        return item;
      item = item[keys[i]];
    }
    return item;
  }

  createRowElement(column, item)
  {
    const element = column.type === ColumnType.Image
      ? document.createElement("img")
      : document.createElement("div");

    this.setInnerHTML(column, element, item);

    const data = document.createElement("td");
    data.classList.add("pad");

    if (column.width)
      data.style.width = column.width;

    data.append(element);
    return data;
  }

  setInnerHTML(column, element, item)
  {
    const value = this.getValue(item, column.key.split("."));
    if (value === undefined)
    {
      element.innerText = "";
      return;
    }
    if (column.type === ColumnType.Image)
    {
      element.src = value;
      return;
    }
    if (column.formatFn)
    {
      element.innerText = column.formatFn(item);
      return;
    }
    element.innerText = value;
  }

  set nextDisabled(value)
  {
    this.shadowRoot.querySelector("#next").disabled = value;
  }

  set backDisabled(value)
  {
    this.shadowRoot.querySelector("#back").disabled = value;
  }

  _columns = [];
  set columns(columns)
  {
    this._columns = columns;

    const columnElement = this.shadowRoot.querySelector("thead").children[0];
    columnElement.innerHTML = ``;

    for (let i = 0; i < columns.length; i++)
    {
      const column = document.createElement("th");
      column.classList.add("pad");
      column.scope = "col";
      column.innerHTML = columns[i].display;

      if (columns[i].width)
        column.style.width = columns[i].width;

      columnElement.append(column);
    }
    this.items = this._items;
  }

  #nextEvent = new Event("next", {composed: true});
  #backEvent = new Event("back", {composed: true});

  connectedCallback()
  {
    this.shadowRoot.querySelector("#next").addEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#nextEvent));

    this.shadowRoot.querySelector("#back").addEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#backEvent));

    const caption = this.getAttribute("caption");
    if (caption)
      this.shadowRoot.querySelector("caption").innerHTML = caption;
  }

  disconnectedCallback()
  {
    this.shadowRoot.querySelector("#next").removeEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#nextEvent));

    this.shadowRoot.querySelector("#back").removeEventListener("click", () =>
      this.shadowRoot.dispatchEvent(this.#backEvent));
  }


  constructor()
  {
    super();
    this.attachShadow({mode: "open"});
    //language=HTML
    this.shadowRoot.innerHTML = `
      ${this.styleHTML()}
      <table>
        <caption></caption>
        <thead>
        <tr>

        </tr>
        </thead>
        <tbody>

        </tbody>
        <tfoot>
        <tr hidden>
          <th scope="row" colspan="2">Total</th>
          <td colspan="2"></td>
          <td>
            <button id="back">Back</button>
          </td>
          <td>
            <button id="next">Next</button>
          </td>
        </tr>
        </tfoot>
      </table>
    `;
  }

  styleHTML()
  {
    //language=HTML
    return `
      <style>
        img {
          width: 100%;
        }

        .pad {
          padding: 5px;
        }

        table {
          border-radius: 5px;
          background-color: var(--primary_background);
          width: 100%;
          border-collapse: collapse;
        }

        tbody {
          background-color: var(--secondary_background);
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
          background-color: var(--primary_background);
        }

        button {
          min-width: 4rem;
          min-height: 2rem;
          border: 0;
          background-color: var(--clickable);
          color: var(--primary_text);
        }

        button:hover {
          background-color: var(--hover);
        }

        button:active {
          background-color: var(--feedback);
        }

      </style>
    `;
  }
}

export const Alignment = {
  Left: 0,
  Center: 1,
  Right: 2,
};
export const ColumnType = {
  Text: 0,
  Image: 1,
};

customElements.define("app-table", Table, {extends: "table"});
