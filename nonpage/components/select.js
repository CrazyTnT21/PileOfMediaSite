export class Select extends HTMLElement
{
  get title()
  {
    return this.getAttribute("title") ?? "";
  }

  set title(value)
  {
    this.shadowRoot.querySelector("label").innerHTML = this.titleText(value);
  }

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
    if (this.children)
    {
      const items = [...this.children];

      for (let i = this.children.length - 1; i >= 0; i--)
      {
        this.children[i].remove();
      }

      const datalist = this.shadowRoot.querySelector("#items");
      for (let i = 0; i < items.length; i++)
        datalist.appendChild(items[i]);
    }

    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("input", (e) => this.validate(e));
  }

  disconnectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.removeEventListener("input", (e) => this.validate(e));
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});

    const select = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const datalist = document.createElement("datalist");
    label.innerHTML = this.titleText(this.title);
    select.innerHTML = `<link rel="stylesheet" href="/MyCollectionSite/nonpage/styles/columns.css"><link rel="stylesheet" href="/MyCollectionSite/nonpage/styles/styles.css">`;

    input.setAttribute("list", "items");
    datalist.id = "items";

    label.append(input);
    select.append(label);
    select.append(datalist);

    this.shadowRoot.append(select);

    this.createOptions();
  }

  titleText(value)
  {
    return `<div>${value}</div>`;
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
