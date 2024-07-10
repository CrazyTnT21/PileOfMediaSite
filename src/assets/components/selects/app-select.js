import {AppInput} from "../inputs/app-input.js";

export class AppSelect extends AppInput
{
  #cachedSearch = new Map();
  #items = [];

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

  async onInputChange(event)
  {
    const input = event.target;

    this.validate(input);
    if (!this.valid(input))
      return;

    this.shadowRoot.dispatchEvent(new CustomEvent("valueChange", {composed: true, detail: input.value}));
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
        <style>${this.styleCSS()}</style>
        <label for="input"></label>
        <input id="input" list="items"/>
        <datalist id="items"></datalist>
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
      option.innerText = item.text ?? item.value;
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
    if (!input.value || !this.items || this.items.length < 1)
      return true;

    const value = input.value.toLowerCase().trim();
    for (let i = 0; i < this.items.length; i++)
    {
      const itemValue = (this.items[i].text ?? this.items[i].value).toString().toLowerCase();
      if (itemValue === value)
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
    if (value === "")
    {
      this.createOptions(this.items);
      return;
    }
    if (this.#cachedSearch.has(value))
    {
      this.createOptions(this.#cachedSearch.get(value));
      return;
    }

    const search = (await this.searchItems(value).next()).value;
    this.#cachedSearch.set(value, search);
    this.createOptions(search);
  }

  async* loadItems()
  {
    return [...this.children].map(x => ({value: x.value}));
  }

  async* searchItems(value)
  {
    return this.items;
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