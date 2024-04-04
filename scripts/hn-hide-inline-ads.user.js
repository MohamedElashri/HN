// ==UserScript==
// @name         Hacker News - Hide Inline Ads
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Hides inline ads on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-inline-ads.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-inline-ads.user.js
// ==/UserScript==

(function() {
    'use strict';

    // function to remove inline ads
    function hideInlineAdsOnHN() {
        // Select all posts (rows with class "athing")
        let things = document.querySelectorAll("tr.athing");

        // Iterate over each post
        for(let i = 0; i < things.length; i++) {
            // Ensure the nextSibling exists and is the expected subtext row
            if(things[i].nextSibling && things[i].nextSibling.querySelector("td.subtext")) {
                // Check if the subtext row has exactly two child elements
                if(things[i].nextSibling.querySelector("td.subtext").childElementCount == 2) {
                    // Hide the post row
                    things[i].style.display = "none";
                    // Hide the subtext row
                    things[i].nextSibling.style.display = "none";

                    // Check and hide the additional related element, which could be spacing or further details
                    // Make sure to safely check for the existence of next siblings to avoid errors
                    let possibleAdDetailsRow = things[i].nextSibling.nextSibling;
                    if(possibleAdDetailsRow && possibleAdDetailsRow.nextSibling) {
                        possibleAdDetailsRow.nextSibling.style.display = "none";
                    }
                }
            }
        }
    }

    // Remove inline ads
    hideInlineAdsOnHN();
})();