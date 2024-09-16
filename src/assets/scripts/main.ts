const title = document.querySelector("title")!;
if (!title.innerText.includes("MyCollection"))
{
  console.warn(`The website title is missing for site '${window.location}'`);
}
