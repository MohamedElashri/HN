// ==UserScript==
// @name         Hacker News - Highlight Submission Author
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Highlights the submission author on Hacker News
// @author       melashri
// @grant        GM_addStyle
// @match        https://news.ycombinator.com/*
// @license     MIT
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-highlight-submission-author.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-highlight-submission-author.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Highlight the submission author
    function highlightSubmissionAuthor() {
        // Check if the current page is a submission page and not running on iOS
        if (window.location.href.includes('item?id=') && !/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            let originalPoster = document.querySelector('.hnuser');
            if (originalPoster) {
                originalPoster = originalPoster.innerText;

                GM_addStyle(`
                    a[href='user?id=${originalPoster}'] {
                        background: #e0f7fa !important;
                        color: #c40707 !important;
                        padding: 5px 10px !important;
                        border-radius: 10px !important;
                        font-weight: bold !important;
                        font-size: 12px !important;                    }
                `);
            }
        }
    }

    // Highlight the submission author
    highlightSubmissionAuthor();
})();