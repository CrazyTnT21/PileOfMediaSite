import {AppInput} from "../inputs/app-input.js";

export class AppAutocomplete extends AppInput
{
  #cachedSearch = new Map();
  #items = [];
  #search = [];
  #selected = [];
  #itemsGenerator;

  #item;

  get value()
  {
    return this.#item;
  }

  set value(value)
  {
    this.#item = value;
    if (value === undefined || value === null)
    {
      super.value = null;
      return;
    }
    super.value = this.itemLabel(value) ?? this.itemValue(value);
  }

  findValue(value)
  {
    return this.#findSameValue(value, this.items);
  }

  get items()
  {
    return this.#items;
  }

  set items(items)
  {
    this.#items = items;
    this.createOptions(this.#items);
  }

  addItem(item)
  {
    this.items.push(item);
    this.#addOptions([item]);
  }

  removeItem(item)
  {
    const index = this.items.findIndex(x => this.itemId(x) === this.itemId(item));
    this.items.splice(index, 1);
  }

  findItem(item)
  {
    const id = this.itemId(item);
    return this.items.find(x => this.itemId(x) === id);
  }

  get selected()
  {
    return this.#selected;
  }

  set selected(items)
  {
    this.#selected = items;

    const selected = this.shadowRoot.querySelector("#selected");
    selected.innerHTML = "";
    this.#pushSelected(selected, items);
  }

  addSelected(value)
  {
    const selected = this.shadowRoot.querySelector("#selected");
    this.#pushSelected(selected, [value]);
    this.shadowRoot.dispatchEvent(new CustomEvent("selectedAdded", {composed: true, detail: value}));
  }

  removeSelected(item)
  {
    const id = this.itemId(item);

    const index = this.#selected.findIndex(x => this.itemId(x) === id);
    this.#selected.splice(index, 1);
    const selected = this.shadowRoot.querySelector("#selected");
    for (const x of selected.children)
    {
      if (Number(x.children[0].value) === id)
      {
        selected.removeChild(x);
        return;
      }
    }
    console.error(`Item with the id '${id}' could not be removed. Item not found`);
  }

  #pushSelected(selected, items)
  {
    this.#selected.push(...items);
    for (const item of items)
    {
      const li = document.createElement("li");
      const data = document.createElement("data");
      li.append(data);
      data.value = this.itemId(item);
      selected.append(li);
      const button = document.createElement("button");
      data.append(button);

      button.innerText = this.itemLabel(item) ?? this.itemValue(item);
      button.addEventListener("click", async () =>
      {
        this.removeSelected(item);
        const input = this.shadowRoot.querySelector("input");
        await this.search(input.value);
        this.shadowRoot.dispatchEvent(new CustomEvent("selectedRemoved", {composed: true, detail: item}));
      });
    }
  }

  findSelected(item)
  {
    const id = this.itemId(item);
    return this.selected.find(x => this.itemId(x) === id);
  }

  findSelectedValue(value)
  {
    return this.#findSameValue(value, this.selected);
  }

  findSearch(item)
  {
    const id = this.itemId(item);
    return this.#search.find(x => this.itemId(x) === id);
  }

  findSearchValue(value)
  {
    return this.#findSameValue(value, this.#search);
  }

  #findSameValue(value, items)
  {
    const trimAndLowercase = (x) => x.toString().trim().toLowerCase();
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

  async onInputChange(event)
  {
    const input = event.target;
    await super.onInputChange(event);
    await this.valueChange(input);
  }

  async onValueSet(event)
  {
    const input = this.shadowRoot.querySelector("input");
    await this.search(input.value);
    await super.onValueSet(event);
    await this.valueChange(input);
  }

  async valueChange(input)
  {
    if (!await this.valid())
      return;

    const value = input.value;
    if (!value)
    {
      this.shadowRoot.dispatchEvent(new CustomEvent("valueChange", {composed: true, detail: null}));
      this.#item = null;
      return;
    }
    const item = this.findValue(value) ?? this.findSearchValue(value);
    this.#item = item;

    if (this.isMulti() && item)
    {
      if (!this.findSelected(item))
        this.addSelected(item);
      input.value = "";
      await this.search("");
    }

    this.shadowRoot.dispatchEvent(new CustomEvent("valueChange", {composed: true, detail: item}));
  }

  async onInputInput(event)
  {
    if (event.inputType !== "insertReplacementText")
      await this.search(event.target.value);
  }

  async onInputFocus()
  {
    await this.firstOpen();
  }

  async connectedCallback()
  {
    await super.connectedCallback();
    const input = this.shadowRoot.querySelector("input");
    const value = this.dataset.value;
    if (value !== undefined)
      input.value = value;

    input.addEventListener("input", (e) => this.onInputInput(e));
    triggerOnce(input, "focus", (e) => this.onInputFocus(e));
  }

  render()
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
        <label for="input"></label>
        <input id="input" list="items"/>
        <datalist id="items"></datalist>
        <ul id="selected"></ul>
    `;
  }

  createOptions(items)
  {
    const datalist = this.shadowRoot.querySelector("#items");

    datalist.innerHTML = "";

    this.#pushOptions(datalist, items);
  }

  #addOptions(items)
  {
    const datalist = this.shadowRoot.querySelector("#items");
    this.#pushOptions(datalist, items);
  }

  #pushOptions(datalist, items)
  {
    for (const item of items)
    {
      const data = document.createElement("data");
      data.value = this.itemId(item);
      const option = document.createElement("option");
      data.append(option);
      option.innerText = this.itemLabel(item) ?? this.itemValue(item);
      option.value = this.itemValue(item);
      datalist.append(data);
    }
  }

  async setValidity(input)
  {
    await super.setValidity(input);
    if (!input.value)
      return;

    const value = input.value.toLowerCase().trim();

    if (this.isMulti())
    {
      const found = this.findSelectedValue(value);
      if (found)
      {
        this.errors.set("customError", () => `Item '${value}' has already been selected`);
        return;
      }
    }

    if (!this.findValue(value) && !this.findSearchValue(value))
      this.errors.set("customError", () => `Item '${value}' was not found`);
  }

  isMulti()
  {
    return this.dataset.multi === "";
  }

  async firstOpen()
  {
    this.#itemsGenerator = await this.loadItems();
    this.items.push(...(await this.#itemsGenerator.next()).value);
    this.createOptions(this.items.filter((x) => !this.findSelected(x)));
  }

  async search(value)
  {
    if (value === "")
    {
      this.createOptions(this.items.filter((x) => !this.findSelected(x)));
      return;
    }
    if (this.#cachedSearch.has(value))
    {
      this.createOptions(this.#cachedSearch.get(value).filter((x) => !this.findSelected(x)));
      return;
    }

    const search = (await this.searchItems(value).next()).value;
    this.#search = search;
    this.#cachedSearch.set(value, search);
    this.createOptions(search.filter((x) => !this.findSelected(x)));
  }

  async* loadItems()
  {
    return [...this.children].map(x => ({id: x.dataset.id, value: x.value ?? x.innerText, label: x.label}));
  }

  async* searchItems(value)
  {
    return this.items;
  }

  styleCSS()
  {
    //language=CSS
    return super.styleCSS() + `
        ul {
            margin: 0;
            padding: 0;
        }

        li {
            list-style: none;
        }

        #selected {
            display: flex;
            flex: 1;
            flex-wrap: wrap;
            padding-top: 5px;
        }

        button {
            font-size: .75em;
            border-radius: 10px;
            border: var(--border) 1px solid;
            background-color: var(--primary_background);
            color: var(--primary_text);
        }

        button::after {
            content: " x"
        }
    `;
  }

  itemLabel(item)
  {
    return item.label;
  }

  itemValue(item)
  {
    return item.value;
  }

  itemId(item)
  {
    return item.id;
  }
}

customElements.define("app-autocomplete", AppAutocomplete);

function triggerOnce(element, type, listener)
{
  const remove = (event) =>
  {
    element.removeEventListener(type, remove);
    listener(event);
  };
  element.addEventListener(type, remove);
}