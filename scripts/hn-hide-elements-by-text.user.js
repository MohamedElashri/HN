// ==UserScript==
// @name         Hacker News - Advanced Content Filter
// @namespace    https://github.com/MohamedElashri/HN
// @version      2.2.0
// @description  Enhanced filtering of elements on Hacker News based on topics, sites, and users.
// @match        https://news.ycombinator.com/*
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG_URL = 'https://raw.githubusercontent.com/MohamedElashri/HN/main/scripts/utils/lists.json';

    function hideElement(el) {
        if (el) {
            const commentContainer = el.closest('.comtr');
            if (commentContainer) {
                commentContainer.style.display = 'none';
                return true;
            } else {
                el.style.display = 'none';
                return true;
            }
        }
        return false;
    }

    function hideStoryItem(element) {
        let athingRow = element;
        while (athingRow && !athingRow.classList.contains('athing')) {
            athingRow = athingRow.parentElement;
            if (!athingRow) break;
        }

        if (athingRow) {
            hideElement(athingRow);
            let nextRow = athingRow.nextElementSibling;
            if (nextRow) {
                hideElement(nextRow);
                let spacer = nextRow.nextElementSibling;
                if (spacer && spacer.classList.contains('spacer')) {
                    hideElement(spacer);
                }
            }
        }
    }

    function getCommentIndentLevel(commentRow) {
        const indentCell = commentRow.querySelector('td.ind img');
        return indentCell ? parseInt(indentCell.width) / 40 : 0;
    }

    function hideCommentAndReplies(commentRow, blockedLevel) {
        if (!commentRow) return;

        let currentRow = commentRow;
        let count = 0;

        hideElement(commentRow);
        count++;

        currentRow = commentRow.nextElementSibling;

        while (currentRow && currentRow.classList.contains('comtr')) {
            const level = getCommentIndentLevel(currentRow);
            if (level <= blockedLevel) break;

            hideElement(currentRow);
            count++;
            currentRow = currentRow.nextElementSibling;
        }
    }

    function processComments(config) {
        const usersSet = new Set(config.users);
        const commentRows = document.querySelectorAll('.comtr');

        commentRows.forEach(row => {
            const userElement = row.querySelector('.hnuser');
            if (!userElement) return;

            const username = userElement.textContent.trim();
            if (usersSet.has(username)) {
                const level = getCommentIndentLevel(row);
                hideCommentAndReplies(row, level);
            }
        });
    }

    function isListPage() {
        const validPaths = ['/', '/news', '/newest', '/best', '/ask', '/show', '/front', '/jobs'];
        return validPaths.includes(window.location.pathname);
    }

    function isUserProfilePage() {
        return window.location.pathname === '/user';
    }

    function isSubmissionPage() {
        return window.location.pathname === '/item';
    }

    function processListPage(config) {
        const storyItems = document.querySelectorAll('.athing');

        storyItems.forEach(storyItem => {
            const details = {
                title: storyItem.querySelector('.titleline a')?.textContent.trim() || '',
                user: storyItem.nextElementSibling?.querySelector('.hnuser')?.textContent.trim() || '',
                site: storyItem.querySelector('.sitestr')?.textContent.trim() || ''
            };

            if (shouldBlockSubmission(config, details)) {
                hideStoryItem(storyItem);
            }
        });
    }

    function getSubmissionDetails() {
        if (!isSubmissionPage()) return null;

        const titleElement = document.querySelector('.titleline a');
        const userElement = document.querySelector('.hnuser');
        const siteElement = document.querySelector('.sitestr');

        return {
            title: titleElement ? titleElement.textContent.trim() : '',
            user: userElement ? userElement.textContent.trim() : '',
            site: siteElement ? siteElement.textContent.trim() : ''
        };
    }

    function shouldBlockSubmission(config, details) {
        if (!details) return false;

        const { topics, sites, users } = config;

        if (users.includes(details.user)) return true;
        if (sites.some(site => details.site.includes(site))) return true;

        const escapedTopics = topics.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const topicsRegex = new RegExp(`\\b(${escapedTopics.join('|')})\\b`, 'i');
        if (topicsRegex.test(details.title)) return true;

        return false;
    }

    function redirectToFrontPage() {
        window.location.replace('https://news.ycombinator.com');
    }

    function getProfileUsername() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function applyFilters(config) {
        if (!config) return;

        if (isSubmissionPage()) {
            const details = getSubmissionDetails();
            if (shouldBlockSubmission(config, details)) {
                redirectToFrontPage();
                return;
            }
            processComments(config);
        }
        else if (isUserProfilePage()) {
            const profileUsername = getProfileUsername();
            if (profileUsername && config.users.includes(profileUsername)) {
                redirectToFrontPage();
                return;
            }
        }
        else if (isListPage()) {
            processListPage(config);
        }
    }

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
                            reject(error);
                        }
                    } else {
                        reject(new Error(`HTTP status ${response.status}`));
                    }
                },
                onerror: reject
            });
        });
    }

    function main() {
        fetchConfig().then(config => {
            applyFilters(config);
            const observer = new MutationObserver(() => applyFilters(config));
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
