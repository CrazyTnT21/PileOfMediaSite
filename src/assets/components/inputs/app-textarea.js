import {logNoValueError} from "./app-Input.js";

export class AppTextArea extends HTMLElement
{
  get label()
  {
    return this.getAttribute("data-label");
  }

  set label(value)
  {
    if (!value)
    {
      logNoValueError("label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value()
  {
    this.shadowRoot.querySelector("textarea").innerText;
  }

  set value(value)
  {
    this.shadowRoot.querySelector("textarea").innerText = value;
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
    const label = this.label;
    if (!label)
      logNoValueError("label", this.outerHTML);

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <div>
        <label for="input">${label}</label>
      </div>
      <textarea id="input"></textarea>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      textarea {
        border-width: 1px;
        border-style: solid;
        border-color: var(--border);
        background-color: var(--input_background);
        color: var(--primary_text);
        padding: 5px;
        font-family: "Fira Sans", sans-serif;
      }

      textarea:hover {
        border-color: var(--hover);
        transition: border-color ease 50ms;
      }
    `;
  }
}

customElements.define("app-textarea", AppTextArea);
