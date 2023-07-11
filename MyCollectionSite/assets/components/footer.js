class Footer extends HTMLElement {
    constructor() {
        super();
        this.classList.add("footer");
        //language=HTML
        this.innerHTML += `
            <ul>
                <li class="pad col">
                    <a href="test">About</a>
                </li>
                <li class="pad col">
                    <a href="test">Placeholder 1</a>
                </li>
                <li class="pad col">
                    <a href="test">Placeholder 2</a>
                </li>
                <li class="pad col">
                    <a href="test">Copyright</a>
                </li>
            </ul>
        `;
    }
}

// let the browser know about the custom element
customElements.define('app-footer', Footer);
'use strict';