// ==UserScript==
// @name         Hacker News - Hide Elements by Text
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Hides elements on Hacker News based on specific topics, sites, and users
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper function to determine if a row is a spacer
    function isSpacerRow(row) {
        // Implement logic to determine if a row is used as a spacer
        return row.style.height === "5px"; // To be fine tuned
    }

    // Helper function to determine if a row is a metadata row
    function isMetadataRow(row) {
        // Implement logic to determine if a row contains metadata
        // This can be based on the presence of certain classes or specific text
        return row.querySelector('.subtext') !== null;
    }

    // Function to hide elements containing specific text
    function hideElementsByText(selector, text, includeParent = false) {
        const elements = document.querySelectorAll(selector);
        const lowerCaseText = text.toLowerCase(); // Convert the text to lowercase
        elements.forEach(el => {
            if (el.textContent.toLowerCase().includes(lowerCaseText)) {
                let elementToHide = includeParent ? el.closest('tr') : el;
                if (elementToHide) {
                    // Hide the parent <tr>
                    let parentRow = elementToHide.closest('tr');
                    if (parentRow) {
                        parentRow.style.display = 'none';

                        // Hide the next sibling if it's a spacer or metadata row
                        let nextSiblingRow = parentRow.nextElementSibling;
                        if (nextSiblingRow && nextSiblingRow.tagName === "TR") {
                            if (isSpacerRow(nextSiblingRow) || isMetadataRow(nextSiblingRow)) {
                                nextSiblingRow.style.display = 'none';
                            }
                        }

                        // Additionally, check for and hide a previous spacer if present
                        let previousSiblingRow = parentRow.previousElementSibling;
                        if (previousSiblingRow && previousSiblingRow.tagName === "TR") {
                            if (isSpacerRow(previousSiblingRow)) {
                                previousSiblingRow.style.display = 'none';
                            }
                        }
                    }
                }
            }
        });
    }

    // Function to apply filters based on topics, sites, and users
    function applyFilters() {
        topics.forEach(topic => {
            hideElementsByText('.title a', topic, true);
        });
        sites.forEach(site => {
            hideElementsByText('.title .sitebit', site, true);
        });
        users.forEach(user => {
            hideElementsByText('.comhead > a[href^="user?"]', user, true);
        });
    }

    // Run the filter function on page load
    applyFilters();
})();