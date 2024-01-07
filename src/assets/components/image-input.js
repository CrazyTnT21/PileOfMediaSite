import {logNoValueError} from "./inputs/input.js";

export class ImageInput extends HTMLElement
{
  get alt()
  {
    return this.getAttribute("data-alt");
  }

  set alt(value)
  {
    if (!value)
    {
      logNoValueError("alt", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-alt", value);
    this.shadowRoot.querySelector("img").alt = value;
  }

  get title()
  {
    return this.getAttribute("data-title");
  }

  set title(value)
  {
    this.setAttribute("data-title", value);
    this.shadowRoot.querySelector("img").title = value;
  }

  #src;
  get src()
  {
    return this.#src;
  }

  set src(value)
  {
    if (!value)
    {
      logNoValueError("src", this.outerHTML);
      value = this.#defaultSrc;
    }
    else
    {
      this.#src = value;
    }
    this.shadowRoot.querySelector("img").src = value;
  }

  connectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("change", event => this.setCover(event));
    this.shadowRoot.querySelector("img").addEventListener("click", () => input.click());
  }

  disconnectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.removeEventListener("change", event => this.setCover(event));
    this.shadowRoot.querySelector("img").removeEventListener("click", () => input.click());
  }

  #defaultSrc = "/assets/img/Image_Input_Placeholder.svg";

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});
    this.render();
  }

  render()
  {
    const alt = this.alt ?? "";
    const title = this.title;
    if (!alt)
      console.error(`image-input '${this.outerHTML}' has no alt. Images should always have an alt.`);

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <img src="${this.#defaultSrc}" alt="${alt}" ${title ? `title="${title}"` : ""}>
      <input id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      img {
        aspect-ratio: 1 / 1.41421;
        width: 100%;
        object-fit: contain;
      }

      img:hover {
        filter: opacity(50%);
      }
    `;
  }

  setCover(event)
  {
    const url = URL.createObjectURL(event.target.files[0]);
    this.#src = url;
    this.shadowRoot.querySelector("img").src = url;
    this.shadowRoot.dispatchEvent(new CustomEvent("upload", {composed: true, detail: url}));
  }
}

customElements.define("app-image-input", ImageInput);

