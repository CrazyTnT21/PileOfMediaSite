'use strict';

class column {
    value;
    type;
}

class List extends HTMLElement {
    thisitems

    set columns(value) {
        this.setAttribute("columns", value)
    }

    get columns() {
        return this.getAttribute("columns") || [];
    }

    get items() {
        return this.getAttribute("items") || [];
    }

    set items(value) {
        this.thisitems = value;
        this.refresh()
    }

    listContainer

    refresh() {
        if (!this.thisitems)
            return
        this.listContainer.innerHTML = "";
        for (let i = 0; i < this.thisitems.length; i++) {
            this.listContainer.innerHTML += `
                <li class="header-item">
                <img src=" " width="60" height="80">
                <h2 id="title">${this.thisitems[i].name}</h2>
                <div id="description">${this.thisitems[i].chapters}</div>
                <div id="rating">
                    Rating ${this.thisitems[i].id} out of ${this.thisitems.length}
                </div>
                <div>${this.thisitems[i].publishStart}</div>
                <div>${this.thisitems[i].publishEnd}</div>
                </li>
            `;
        }
    }

    constructor() {
        // establish prototype chain
        super();
        this.listContainer = document.createElement('ul');
        this.listContainer.classList.add("header")
        // attaches shadow tree and returns shadow root reference
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
        const shadow = this.attachShadow({mode: 'open'});

        // creating the inner HTML of the editable list element
        document.body.append(this.listContainer);

        // appending the container to the shadow DOM
        shadow.appendChild(this.listContainer);
    }

}

// let the browser know about the custom element
customElements.define('app-list', List);