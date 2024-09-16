import {StyleCSS} from "./style-css.js";

export function attach(this: HTMLElement)
{
  this.attachShadow({
    mode: "open",
  });
}

export function attach_delegates(this: HTMLElement)
{
  this.attachShadow({
    mode: "open",
    delegatesFocus: true,
  });
}

export function applyStyleSheet(this: StyleCSS & HTMLElement)
{
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(this.styleCSS());
  if (!this.shadowRoot)
    throw Error("No ShadowRoot defined")
  this.shadowRoot!.adoptedStyleSheets = [styleSheet];
}


