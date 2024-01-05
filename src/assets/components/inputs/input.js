export class Input extends HTMLElement
{
  get label()
  {
    return this.getAttribute("label");
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

  get value()
  {
    this.shadowRoot.querySelector("input").value;
  }

  set value(value)
  {
    this.shadowRoot.querySelector("input").value = value;
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

    const label = this.label ?? "";
    if (!label)
      console.error(`Input '${this.outerHTML}' has no label. Inputs should always be associated with a label.`);

    //language=HTML
    this.shadowRoot.innerHTML = `
      ${this.styleHTML()}
      <div>
        <label for="input">${label}</label>
      </div>
      <input id="input"/>
    `;
  }

  styleHTML()
  {
    //language=HTML
    return `
      <style>
        input {
          border-width: 1px;
          border-style: solid;
          border-color: var(--border);
          background-color: var(--input_background);
          color: var(--primary_text);
        }

        input:hover {
          border-color: var(--hover);
          transition: border-color ease 50ms;
        }
      </style>
    `;
  }
}

customElements.define("app-input", Input);
