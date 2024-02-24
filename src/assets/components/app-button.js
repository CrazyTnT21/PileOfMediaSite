export class AppButton extends HTMLElement
{
  get value()
  {
    return this.getAttribute("data-value");
  }

  set value(value)
  {
    this.setAttribute("data-value", value);
    this.shadowRoot.querySelector("button").innerText = this.value;
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});
    this.render();
  }

  render()
  {
    const content = this.innerHTML;
    this.innerHTML = "";
    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <button>${this.value ?? content}</button>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
        button {
            min-width: 4rem;
            min-height: 2rem;
            border: 0;
            background-color: var(--clickable);
            color: var(--primary_text);
        }

        button:hover {
            background-color: var(--hover);
        }

        button:active {
            background-color: var(--feedback);
        }
    `;
  }
}

customElements.define("app-button", AppButton);
