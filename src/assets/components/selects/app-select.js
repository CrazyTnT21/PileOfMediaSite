import {AppInput, logNoValueError} from "../inputs/app-input.js";

export class AppSelect extends AppInput
{
  get items()
  {
    return [];
  }

  set items(value)
  {
    this.createOptions(value);
  }

  connectedCallback()
  {
    super.connectedCallback();
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("input", (e) =>
    {
      this.validate(e);
      if (this.valid(e.target))
        this.shadowRoot.dispatchEvent(new CustomEvent("change", {composed: true, detail: e.target.value}));
    });
    const value = this.dataset.value;
    if (value !== undefined)
    {
      input.value = value;
    }
    this.createOptions();

    const datalist = this.shadowRoot.querySelector("#items");
    for (let i = 0; i < this.children.length; i++)
    {
      datalist.appendChild(this.children[i]);
    }
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);
    this.shadowRoot.querySelector("label").innerText = label;

  }

  disconnectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.removeEventListener("input", (e) => this.validate(e));
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

  createOptions()
  {
    const datalist = this.shadowRoot.querySelector("#items");

    datalist.innerHTML = "";

    for (let i = 0; i < this.items.length; i++)
    {
      const option = document.createElement("option");
      option.innerHTML = this.items[i].text ?? this.items[i].value;
      option.value = this.items[i].value;
      datalist.append(option);
    }
  }

  validate(e)
  {
    const input = e.target;
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
}

customElements.define("app-select", AppSelect);
