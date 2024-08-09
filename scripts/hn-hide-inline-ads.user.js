// ==UserScript==
// @name         Hacker News - Hide Inline Ads
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.2
// @description  Hides inline ads on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-inline-ads.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-inline-ads.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove inline ads
    function hideInlineAdsOnHN() {
        // Select all posts (rows with class "athing")
        const things = document.querySelectorAll("tr.athing");

        // Iterate over each post
        things.forEach(thing => {
            const subtextRow = thing.nextSibling;
            const subtext = subtextRow ? subtextRow.querySelector("td.subtext") : null;

            // Check if the subtext row has exactly two child elements
            if (subtext && subtext.childElementCount === 2) {
                // Hide the post row
                thing.style.display = "none";
                // Hide the subtext row
                subtextRow.style.display = "none";

                // Check and hide the additional related element, which could be spacing or further details
                const possibleAdDetailsRow = subtextRow.nextSibling;
                if (possibleAdDetailsRow && possibleAdDetailsRow.style) {
                    possibleAdDetailsRow.style.display = "none";
                }
            }
        });
    }

    // Remove inline ads
    hideInlineAdsOnHN();
})();
