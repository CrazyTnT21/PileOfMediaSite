const title = document.querySelector("title")!;
if (!title.innerText.includes("PileOfMedia"))
{
  console.warn(`The website title is missing for site '${window.location}'`);
}
