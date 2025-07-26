export function attach(element: HTMLElement): ShadowRoot
{
  return element.attachShadow({
    mode: "open",
  });
}

export function attachDelegates(element: HTMLElement): ShadowRoot
{
  return element.attachShadow({
    mode: "open",
    delegatesFocus: true,
  });
}

export function applyStyleSheet(document: { adoptedStyleSheets: CSSStyleSheet[] }, css: string): void
{
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(css);
  document.adoptedStyleSheets = [styleSheet];
}

