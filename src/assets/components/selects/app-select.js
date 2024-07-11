import {AppInput} from "../inputs/app-input.js";

export class AppSelect extends AppInput
{
  #cachedSearch = new Map();
  #items = [];
  #search = [];
  #selected = [];
  #itemsGenerator;

  get items()
  {
    return this.#items;
  }

  set items(value)
  {
    this.#items = value;
    this.createOptions(this.#items);
  }

  get selected()
  {
    return this.#selected;
  }

  async onInputChange(event)
  {
    const input = event.target;
    const value = input.value.toLowerCase().trim();
    const item = this.#search.find(x => x.value.toLowerCase() === value) ?? this.#items.find(x => x.value.toLowerCase() === value);
    this.validate(input);
    if (!this.valid(input))
      return;

    if (this.dataset.multi === "" && item)
    {
      const selected = this.shadowRoot.querySelector("#selected");
      const li = document.createElement("li");
      const button = document.createElement("button");
      li.append(button);
      button.innerText = item.label ?? item.value;
      button.addEventListener("click", () =>
      {
        const index = this.#selected.findIndex(x => x.value === item.value);
        selected.removeChild(li);
        this.#selected.splice(index, 1);
        this.search(input.value);
      });
      this.#selected.push(item);
      input.value = "";
      await this.search(input.value);
      selected.append(li);
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

  connectedCallback()
  {
    super.connectedCallback();
    const input = this.shadowRoot.querySelector("input");
    const value = this.dataset.value;
    if (value !== undefined)
      input.value = value;

    input.addEventListener("input", (e) => this.onInputInput(e));
    input.addEventListener("change", (e) => this.onInputChange(e));
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

  addOptions(items)
  {
    const datalist = this.shadowRoot.querySelector("#items");
    this.#pushOptions(datalist, items);
  }

  #pushOptions(datalist, items)
  {
    for (const item of items)
    {
      const option = document.createElement("option");
      option.innerText = item.label ?? item.value;
      option.value = item.value;
      datalist.append(option);
    }
  }

  validate(input)
  {
    input.style.borderColor = this.valid(input) ? "" : "red";
  }

  valid(input)
  {
    if (!input.value)
      return true;

    const value = input.value.toLowerCase().trim();

    if (this.dataset.multi === "" && this.#selected.find(x => x.value.toLowerCase() === value))
      return false;

    for (const item of this.items)
    {
      if (this.hasValue(value, this.items) || this.hasValue(value, this.#search))
        return true;
    }

    return false;
  }

  hasValue(value, items)
  {
    for (const item of items)
    {
      const itemValue = item.value.toString().toLowerCase();
      const itemLabel = item.label?.toString().toLowerCase();

      if (itemValue === value || itemLabel === value)
        return true;
    }
    return false;
  }

  async firstOpen()
  {
    this.#itemsGenerator = await this.loadItems();
    this.items = (await this.#itemsGenerator.next()).value;
    this.createOptions(this.items);
  }

  async search(value)
  {
    const filterSelected = (x) => !this.#selected.find(y => y.value === x.value);
    if (value === "")
    {
      this.createOptions(this.items.filter(filterSelected));
      return;
    }
    if (this.#cachedSearch.has(value))
    {
      this.createOptions(this.#cachedSearch.get(value).filter(filterSelected));
      return;
    }

    const search = (await this.searchItems(value).next()).value;
    this.#search = search;
    this.#cachedSearch.set(value, search);
    this.createOptions(search.filter(filterSelected));
  }

  async* loadItems()
  {
    return [...this.children].map(x => ({value: x.value, label: x.label}));
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

        li > button {
            font-size: .75em;
            border-radius: 10px;
            border: var(--border) 1px solid;
            background-color: var(--primary_background);
            color: var(--primary_text);
        }

        li > button::after {
            content: " x"
        }
    `;
  }
}

customElements.define("app-select", AppSelect);

function triggerOnce(element, type, listener)
{
  const remove = (event) =>
  {
    element.removeEventListener(type, remove);
    listener(event);
  };
  element.addEventListener(type, remove);
}