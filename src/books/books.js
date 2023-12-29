/*
import {get, server_Url} from "/assets/scripts/http.js";

import {Alignment} from "/assets/classes/alignment.js";

function columns()
{
    return [
        {
            key: "rank",
            display: "Rank",
            minWidth: "1000px",
            alignment: Alignment.Center
        },
        {
            key: "title",
            display: "Title",
            width: 15,
        },
        {
            key: "pages",
            display: "Pages",
        },
        {
            key: "published",
            display: "Published",
        },
        {
            key: "score",
            display: "Score",
            alignment: Alignment.Center
        },
        {
            key: "cover.uri",
            display: "Cover",
            type: "image",
            width: 10,
        },
    ];
}

const table = document.querySelector("app-table");

const items = await get(server_Url + "books");

if (items.length > 0)
{
    table.classList.add("test");
    table.columns = columns();
    table.total = items.length;
    table.items = items;
}
*/
