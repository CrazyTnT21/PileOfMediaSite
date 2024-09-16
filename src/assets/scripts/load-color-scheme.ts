const jsonScheme = localStorage.getItem("color-scheme");

if (jsonScheme && jsonScheme != "{}")
{
  const colorScheme = JSON.parse(jsonScheme);
  const colorStyle = colorScheme.style;
  const keys = Object.keys(colorScheme.style);
  for (const key of keys)
    document.documentElement.style.setProperty("--" + key, colorStyle[key] ? colorStyle[key] : null);
}
