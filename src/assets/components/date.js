export class Date extends HTMLElement
{
  get isValid()
  {
    return true;
  }

  get value()
  {
    return this.shadowRoot.querySelector("input").value.trim();
  }

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
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("blur", (e) => this.validate(e));
  }

  disconnectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.removeEventListener("blur", (e) => this.validate(e));
  }

  constructor()
  {
    super();
    this.attachShadow({mode: "open"});

    const select = document.createElement("div");

    //language=HTML
    select.innerHTML = `
      <label for="input">${this.titleText(this.label)}</label>
      <input id="input" type="date">
    `;

    this.shadowRoot.append(select);
  }

  validate(e)
  {
    const value = e.target.value;

    if (!value || value.trim().length === 0)
    {
      this.showErrorMessage(e.target, false);
    }
    else
      this.showErrorMessage(e.target, true);

  }

  showErrorMessage(input, show)
  {
    const errorElement = this.shadowRoot.querySelector("#error");
    if (show)
    {
      input.style.borderColor = "red";
      errorElement.style.visibility = "";
      errorElement.children[0].style.marginLeft = input.offsetWidth / 2 + "px";

      //TODO: Change behaviour
      errorElement.children[1].innerHTML = `Invalid Value`;

    }
    else
    {
      input.style.borderColor = "";
      errorElement.style.visibility = "hidden";
      errorElement.children[1].innerHTML = "";
    }
  }
}

customElements.define("app-date", Date);
