// ==UserScript==
// @name         Hacker News - Toggle Comment Visibility
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Adds functionality to toggle the visibility of comments and their sub-comments on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @license     MIT
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-toggle-comment-visibility.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-toggle-comment-visibility.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to toggle comment visibility
    const toggleComment = (comment, collapse) => {
        const text = comment.querySelector('.comment');
        const displayStyle = text.style.display === '' ? 'none' : '';
        text.style.display = displayStyle;

        // Update collapse button text
        collapse.textContent = displayStyle === '' ? '[-]' : '[+]';
    };

    // Pre-calculate and cache the comments length to avoid recalculating
    const comments = document.querySelectorAll('.athing');
    const commentsLength = comments.length;

    // Optimize by avoiding repeated DOM queries for the same elements
    for (let i = 0; i < commentsLength; i++) {
        const comment = comments[i];
        const indentImg = comment.querySelector('td.ind img');

        // Skip OP and comments without indentation
        if (indentImg === null) continue;

        const collapse = document.createElement('a');
        Object.assign(collapse.style, { cursor: 'pointer', marginRight: '5px', fontFamily: 'monospace' });
        collapse.className = 'addon-comment-collapse';
        collapse.textContent = '[-]';

        collapse.onclick = () => {
            const originIndent = indentImg.width;
            let minIgnoreIndent = Number.MAX_SAFE_INTEGER;

            toggleComment(comment, collapse); // Toggle the clicked comment

            for (let j = i + 1; j < commentsLength; j++) {
                const nextComment = comments[j];
                const nextIndentImg = nextComment.querySelector('td.ind img');
                const indent = nextIndentImg ? nextIndentImg.width : 0;

                if (indent <= originIndent) break;
                if (indent >= minIgnoreIndent) continue;

                nextComment.style.display = comment.querySelector('.comment').style.display;

                const subCollapse = nextComment.querySelector('.addon-comment-collapse');
                if (subCollapse && subCollapse.textContent == '[+]') {
                    minIgnoreIndent = indent + 1;
                } else {
                    minIgnoreIndent = Number.MAX_SAFE_INTEGER;
                }
            }
        };

        const commentHead = comment.querySelector('.comhead');
        commentHead.insertBefore(collapse, commentHead.firstChild);
    }
})();