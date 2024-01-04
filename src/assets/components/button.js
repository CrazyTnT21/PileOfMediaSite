export class Button extends HTMLButtonElement
{
  get value()
  {
    return this.getAttribute("value");
  }

  set value(value)
  {
    this.setAttribute("value", value);
    this.shadowRoot.querySelector("button").innerText = this.value;
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

    const content = this.innerHTML;
    this.innerHTML = "";
    //language=HTML
    this.shadowRoot.innerHTML = `
      ${this.styleHTML()}
      <button>${this.getAttribute("value") ?? content}</button>
    `;
  }

  styleHTML()
  {
    //language=HTML
    return `
      <style>
        button {
          min-width: 4rem;
          min-height: 2rem;
          border: 0;
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

customElements.define("app-button", Button, {extends: "button"});
