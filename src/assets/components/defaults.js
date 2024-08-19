export function attach()
{
  this.attachShadow({
    mode: "open",
  });
}

export function attach_delegates()
{
  this.attachShadow({
    mode: "open",
    delegatesFocus: true,
  });
}

export function applyStyleSheet()
{
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(this.styleCSS());
  this.shadowRoot.adoptedStyleSheets = [styleSheet];
}