// ==UserScript==
// @name         Hacker News - Custom Quote Styling
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Applies custom styling to quotes on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-custom-quote-styling.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-custom-quote-styling.user.js

// ==/UserScript==

(function() {
    'use strict';

    // Function to find elements containing text starting with '>'
    function findElementContentsStartingWithQuoteChar(elementNames) {
        let nodes = [];
        elementNames.forEach(elementName => {
            const es = document.evaluate(`//${elementName}[contains(text(), '>')]`, document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < es.snapshotLength; i++) {
                nodes.push(es.snapshotItem(i));
            }
        });
        return nodes;
    }

    // Function to apply custom styling to quotes
    function applyCustomStylingToQuotes(nodes) {
        nodes.forEach((n, index) => {
            const textNode = Array.from(n.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().startsWith('>'));
            if (textNode) {
                const p = document.createElement('p');
                p.classList.add('quote');
                if (textNode.textContent.trim() === ">") {
                    const quotedContent = textNode.nextSibling;
                    p.innerHTML = quotedContent.innerHTML.trim();
                    quotedContent.remove();
                } else {
                    p.innerHTML = textNode.textContent.replace(">", "").trim();
                }
                n.replaceChild(p, textNode);
            }
        });
    }

    // Apply custom styling to quotes
    const commentNodes = findElementContentsStartingWithQuoteChar(['span', 'p']);
    applyCustomStylingToQuotes(commentNodes);
})();