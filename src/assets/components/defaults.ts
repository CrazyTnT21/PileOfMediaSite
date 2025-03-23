import {StyleCSS} from "./style-css";

export function attach(this: HTMLElement): ShadowRoot
{
  return this.attachShadow({
    mode: "open",
  });
}

export function attach_delegates(this: HTMLElement): ShadowRoot
{
  return this.attachShadow({
    mode: "open",
    delegatesFocus: true,
  });
}

export function applyStyleSheet(this: StyleCSS & HTMLElement & {shadowRoot: ShadowRoot}): void
{
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(this.styleCSS());
  this.shadowRoot.adoptedStyleSheets = [styleSheet];
}

