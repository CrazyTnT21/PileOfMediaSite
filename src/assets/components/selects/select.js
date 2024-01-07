import {Input, logNoValueError} from "../inputs/input.js";

export class Select extends Input
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
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("input", (e) => this.validate(e));

    this.createOptions();

    const datalist = this.shadowRoot.querySelector("#items");
    for (let i = 0; i < this.children.length; i++)
    {
      datalist.appendChild(this.children[i]);
    }
  }

  disconnectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.removeEventListener("input", (e) => this.validate(e));
  }

  render()
  {
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <div>
        <label for="input">${label}</label>
      </div>
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

    input.style.borderColor = "";

    if (!input.value || !this.items || this.items.length < 1)
      return true;
    const value = input.value.toLowerCase().trim();
    for (let i = 0; i < this.items.length; i++)
    {
      const itemValue = (this.items[i].text ?? this.items[i].value).toString().toLowerCase();
      if (itemValue === value)
        return true;
    }
    input.style.borderColor = "red";
    return false;
  }
}

customElements.define("app-select", Select);
