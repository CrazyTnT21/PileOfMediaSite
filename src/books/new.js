document.querySelector("app-button").addEventListener("click", (i) => console.log(i));

document.querySelector("app-image-input").addEventListener("upload", (value) => console.log(value.detail));

setTimeout(() => {

  console.log(document.querySelector("app-image-input").src);
},5000)
