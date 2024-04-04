// ==UserScript==
// @name         Hacker News - Vote Arrow Click Event
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Adds a click event to toggle the voted class on vote arrows on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        no// ==/UserScript==
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-vote-arrow-click-event.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-vote-arrow-click-event.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Add click event to toggle the voted class on vote arrows
    function addVoteArrowClickEvent() {
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('votearrow')) {
                event.target.classList.toggle('vo            }
        }, false);
    }

    // Add event listeners and other initialization code
    addVoteArrowClickEvent();
})();