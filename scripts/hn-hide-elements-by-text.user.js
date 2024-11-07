// ==UserScript==
// @name         Hacker News - Advanced Content Filter
// @namespace    https://github.com/MohamedElashri/HN
// @version      2.1.0
// @description  Enhanced filtering of elements on Hacker News based on topics, sites, and users.
// @author
// @match        https://news.ycombinator.com/*
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG_URL = 'https://raw.githubusercontent.com/MohamedElashri/HN/main/scripts/utils/lists.json';

    function fetchConfig() {
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: CONFIG_URL,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const config = JSON.parse(response.responseText);
                            resolve(config);
                        } catch (error) {
                            console.error('Failed to parse configuration JSON:', error);
                            reject(error);
                        }
                    } else {
                        console.error(`Failed to fetch configuration. Status: ${response.status}`);
                        reject(new Error(`HTTP status ${response.status}`));
                    }
                },
                onerror: function(error) {
                    console.error('Network error while fetching configuration:', error);
                    reject(error);
                }
            });
        });
    }

    function isListPage() {
        return /^(\/(news|newest|best|ask|show|front|jobs)\/?)?$/.test(window.location.pathname);
    }

    function isSubmissionPage() {
        return document.querySelector('.fatitem') !== null;
    }

    function isDirectCommentPage() {
        return window.location.pathname.includes('item') && !isSubmissionPage();
    }

    function isUserThreadsPage() {
        return window.location.pathname.startsWith('/threads');
    }

    function hideElement(el) {
        if (el) el.style.display = 'none';
    }

    function hideFullThread(el) {
        const row = el.closest('tr');
        if (row) {
            hideElement(row);
            hideElement(row.nextElementSibling);
            const spacerRow = row.nextElementSibling?.nextElementSibling;
            if (spacerRow && spacerRow.classList.contains('spacer')) {
                hideElement(spacerRow);
            }
        }
    }

    function hideElements(selector, matcher, excludeURLs = false) {
        document.querySelectorAll(selector).forEach(el => {
            let textContent = el.textContent;
            if (excludeURLs) {
                const match = textContent.match(/^(.*)\s+\(\w+:\/\/\S+\)$/);
                if (match) textContent = match[1];
            }
            let shouldHide = false;
            if (matcher instanceof RegExp) {
                shouldHide = matcher.test(textContent);
            } else if (matcher instanceof Set) {
                shouldHide = matcher.has(textContent.trim());
            }
            if (shouldHide) hideFullThread(el);
        });
    }

    function handleComments(blockedUsersSet) {
        // Select all top-level comments
        const commentRows = document.querySelectorAll('tr.comtr');
        commentRows.forEach(commentRow => {
            const indentImg = commentRow.querySelector('.ind img');
            const indentLevel = indentImg ? parseInt(indentImg.getAttribute('width'), 10) : 0;
            if (indentLevel === 0) {
                processCommentAndReplies(commentRow, blockedUsersSet);
            }
        });
    }

    function processCommentAndReplies(commentElement, blockedUsersSet) {
        if (!commentElement) return;

        const userElement = commentElement.querySelector('.hnuser');
        const isBlockedUser = userElement && blockedUsersSet.has(userElement.textContent.trim());

        if (isBlockedUser) {
            hideCommentSubtree(commentElement);
        } else {
            // Process child comments
            let nextRow = commentElement.nextElementSibling;
            const indentImg = commentElement.querySelector('.ind img');
            const currentIndent = indentImg ? parseInt(indentImg.getAttribute('width'), 10) : 0;

            while (nextRow) {
                const nextIndentImg = nextRow.querySelector('.ind img');
                const nextIndent = nextIndentImg ? parseInt(nextIndentImg.getAttribute('width'), 10) : 0;

                if (nextIndent > currentIndent) {
                    processCommentAndReplies(nextRow, blockedUsersSet);
                } else if (nextIndent <= currentIndent) {
                    break;
                }

                nextRow = nextRow.nextElementSibling;
            }
        }
    }

    function hideCommentSubtree(commentElement) {
        // Hide the comment row
        hideElement(commentElement);

        // Hide all descendant comments
        let nextRow = commentElement.nextElementSibling;
        const indentImg = commentElement.querySelector('.ind img');
        const currentIndent = indentImg ? parseInt(indentImg.getAttribute('width'), 10) : 0;

        while (nextRow) {
            const nextIndentImg = nextRow.querySelector('.ind img');
            const nextIndent = nextIndentImg ? parseInt(nextIndentImg.getAttribute('width'), 10) : 0;

            if (nextIndent > currentIndent) {
                hideElement(nextRow);
            } else if (nextIndent <= currentIndent) {
                break;
            }

            nextRow = nextRow.nextElementSibling;
        }
    }

    function handleSubmissionPage(config) {
        const { topicsRegex, sitesRegex, usersSet } = config;
        const titleElement = document.querySelector('.fatitem .title a');
        const siteElement = document.querySelector('.fatitem .title .sitebit');
        const submitterElement = document.querySelector('.fatitem .hnuser');

        let shouldHide = false;

        if (titleElement && topicsRegex.test(titleElement.textContent)) shouldHide = true;
        if (siteElement && sitesRegex.test(siteElement.textContent)) shouldHide = true;
        if (submitterElement && usersSet.has(submitterElement.textContent.trim())) shouldHide = true;

        if (shouldHide) {
            const fatItem = document.querySelector('.fatitem');
            if (fatItem) {
                hideElement(fatItem);
                const commentSection = fatItem.nextElementSibling;
                if (commentSection) hideElement(commentSection);
            }
        } else {
            handleComments(usersSet);
        }
    }

    function redirectToHome() {
        window.location.href = 'https://news.ycombinator.com';
    }

    async function applyFilters(config) {
        if (!config) return;

        const { topics, sites, users } = config;
        const escapedTopics = topics.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const escapedSites = sites.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        const topicsRegex = new RegExp(`\\b(${escapedTopics.join('|')})\\b`, 'i');
        const sitesRegex = new RegExp(`\\b(${escapedSites.join('|')})\\b`, 'i');
        const usersSet = new Set(users);

        const compiledConfig = { topicsRegex, sitesRegex, usersSet };

        try {
            if (window.location.pathname.startsWith('/user')) {
                const urlParams = new URLSearchParams(window.location.search);
                const user = urlParams.get('id');
                if (usersSet.has(user)) {
                    redirectToHome();
                    return;
                }
            }

            if (isListPage()) {
                hideElements('.title a', topicsRegex, true);
                hideElements('.title .sitebit', sitesRegex);
                hideElements('.subtext > a[href^="user?"]', usersSet);
            } else if (isSubmissionPage()) {
                handleSubmissionPage(compiledConfig);
            } else if (isDirectCommentPage() || isUserThreadsPage()) {
                handleComments(usersSet);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    function main() {
        fetchConfig().then(config => {
            applyFilters(config);

            const observer = new MutationObserver(() => {
                applyFilters(config);
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }).catch(error => {
            console.error('Failed to initialize script:', error);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
