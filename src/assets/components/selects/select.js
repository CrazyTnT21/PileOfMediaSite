export class Select extends HTMLElement
{
  get label()
  {
    return this.getAttribute("data-label");
  }

  set label(value)
  {
    if (!value)
    {
      console.error(`No value was given for the label in Input '${this.outerHTML}'. Inputs should always be associated with a label.`);
      value = "";
    }
    this.setAttribute("label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
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

    this.render();

    this.createOptions();
  }

  render()
  {
    //language=HTML
    this.shadowRoot.innerHTML += `
      <div>
        <label for="input">${this.label}</label>
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
