import validator from "../scripts/validator.js";
import {Config, DateStyle} from "../scripts/config.js";

export class Date extends HTMLElement
{

  get isValid()
  {
    const value = this.shadowRoot.querySelector("input").value;

    if (!value || value.trim().length === 0 || validator.date(value.trim()))
      return true;
    return validator.date(value.trim());
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
      <link rel="stylesheet" href="/MyCollectionSite/nonpage/styles/columns.css">
      <link rel="stylesheet" href="/MyCollectionSite/nonpage/styles/styles.css">
      <label class="col-12">
        ${this.titleText(this.title)}
        <input class="mar-right">
        <img src="/MyCollectionSite/nonpage/images/Calender_Placeholder.png" alt="Date chooser">
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

    if (!value || value.trim().length === 0 || validator.date(value))
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
      console.log("not reset");
      input.style.borderColor = "red";
      errorElement.style.visibility = "";
      errorElement.children[0].style.marginLeft = input.offsetWidth / 2 + "px";

      let values = {date: "YYYY-MM-DD",example: "2019-04-12"}
      switch (Config.dateStyle){
        case DateStyle.eu:
          values.date = "DD-MM-YYYY"
          values.example = "12-04-2019"
          break;
        case DateStyle.us:
          values.date = "MM-DD-YYYY"
          values.example = "04-12-2019"
          break;
      }

      errorElement.children[1].innerHTML = `<div>The value '<i>${input.value}</i>' does not match the valid date pattern: <div class="col-12">${values.date}</div>ex. ${values.example}</div><div class="small-text">The pattern can be changed in the settings</div>`;

    }
    else
    {

      console.log("reset");
      input.style.borderColor = "";
      errorElement.style.visibility = "hidden";
      errorElement.children[1].innerHTML = "";
    }
  }
}

customElements.define("app-date", Date);
