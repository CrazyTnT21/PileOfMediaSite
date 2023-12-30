import {loadColorScheme} from "../classes/color-scheme.js";

//TODO: Prevent flash of unstyled content
loadColorScheme();

const title = document.querySelector("title");
if (!title.innerText.includes("MyCollection"))
{
  console.warn(`The website title is missing for site '${window.location}'`);
}
