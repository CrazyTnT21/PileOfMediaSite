class AppFooter extends HTMLElement {
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

customElements.define('app-footer', AppFooter);
'use strict';
