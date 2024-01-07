export class Input extends HTMLElement
{
  get label()
  {
    return this.getAttribute("data-label");
  }

  set label(value)
  {
    if (!value)
    {
      logNoValueError("data-label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value()
  {
    this.shadowRoot.querySelector("input").value;
  }

  set value(value)
  {
    this.shadowRoot.querySelector("input").value = value;
  }

  get placeholder()
  {
    return this.getAttribute("data-placeholder");
  }

  set placeholder(value)
  {
    this.setAttribute("data-placeholder", value);
    this.shadowRoot.querySelector("input").placeholder = value;
  }

  connectedCallback()
  {
  }

  disconnectedCallback()
  {
  }


  constructor()
  {
    super();
    this.attachShadow({mode: "open"});

    this.render();
  }

  render()
  {
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    const placeholder = this.placeholder;

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>
        ${this.styleCSS()}
      </style>
      <div>
        <label for="input">${label}</label>
      </div>
      <input id="input" ${placeholder ? `placeholder="${placeholder}"` : ""}/>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      input {
        border-width: 1px;
        border-style: solid;
        border-color: var(--border);
        background-color: var(--input_background);
        color: var(--primary_text);
        padding: 5px;
        font-family: "Fira Sans", sans-serif;
      }

      input:hover {
        border-color: var(--hover);
        transition: border-color ease 50ms;
      }
    `;
  }
}

export function logNoValueError(property, outerHtml)
{
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

customElements.define("app-input", Input);
