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

  get title()
  {
    return this.getAttribute("title") ?? "Date";
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
      <link rel="stylesheet" href="/assets/css/columns.css">
      <link rel="stylesheet" href="/assets/css/main.css">
      <label class="col-12">
        ${this.titleText(this.title)}
        <input class="mar-right">
        <img src="/assets/img/Comments_Placeholder.png" alt="Date chooser" width="25px">
      </label>
      <div id="error" style="visibility: hidden">
        <div class="error-arrow"></div>
        <div class="error fix-7"></div>
      </div>
    `;

    this.shadowRoot.append(select);
  }

  titleText(value)
  {
    return `<div class="col-12">${value}</div>`;
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
