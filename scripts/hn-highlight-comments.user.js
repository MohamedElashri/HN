// ==UserScript==
// @name         Hacker News - Highlight Comments
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Highlights the number of comments in bold on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Highlight number of comments in bold
    function highlightComments() {
        let commentLinks = document.querySelectorAll("td.subtext > span.subline > a[href^='item?id']");
        for (let i = 0; i < commentLinks.length; i++) {
            let commentMatch = commentLinks[i].innerHTML.match(/^([0-9]+)/);
            if (commentMatch) {
                let numComments = commentMatch[0];
                let plural = numComments > 1 ? "s" : "";

                commentLinks[i].innerHTML = `<span style="font-weight: bold; color: #f1fa8c;">${numComments}</span> comment${plural}`;
            }
        }
    }

    // Highlight comments
    highlightComments();
})();