// ==UserScript==
// @name         Hacker News - Advanced Content Filter
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.8.0
// @description  Enhanced filtering of elements on Hacker News based on topics, sites, and users.
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        GM.xmlHttpRequest
// @connect      github.com
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG_URL = 'https://github.com/MohamedElashri/HN/raw/main/scripts/utils/lists.json';

    async function fetchConfig() {
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
                            // console.error('JSON parse error:', error);
                            reject(new Error('Failed to parse configuration JSON'));
                        }
                    } else {
                        reject(new Error(`Failed to fetch configuration. Status: ${response.status}`));
                    }
                },
                onerror: function(error) {
                    // console.error('Network error:', error);
                    reject(new Error('Network error while fetching configuration'));
                }
            });
        });
    }

    function isListPage() {
        return /news|newest|best|ask|show|front|jobs/.test(window.location.pathname);
    }

    function isSubmissionPage() {
        return document.querySelector('.fatitem') !== null;
    }

    function isDirectCommentPage() {
        return window.location.pathname.includes('item') && document.querySelector('.fatitem') === null;
    }

    function getUserFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    function showUserWarning(user) {
        const warningMessage = `Warning: You are viewing the profile of a blocked user: ${user}`;
        const userTable = document.querySelector('table');

        if (userTable) {
            const userRow = userTable.querySelector('tr');
            if (userRow) {
                const userNameCell = userRow.querySelector('td');
                if (userNameCell) {
                    userNameCell.innerHTML += ` <span style="color: red; font-weight: bold;">(${warningMessage})</span>`;
                }
            }
        }
    }

    function hideElementAndAdjust(el) {
        el.style.display = 'none';
    }

    function hideElements(selector, text, excludeURLs = false) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            let textContent = el.textContent;
            if (excludeURLs) {
                const match = textContent.match(/^(.*)\s+\(\w+:\/\/\S+\)$/);
                if (match) {
                    textContent = match[1];
                }
            }
            const regex = new RegExp(`\\b${text}\\b`, 'i');
            if (regex.test(textContent)) {
                const row = el.closest('tr');
                if (row) {
                    hideElementAndAdjust(row.nextElementSibling);
                    hideElementAndAdjust(row);
                }
            }
        });
    }

    function modifyWithWarning(selector, text, message) {
        const elements = document.querySelectorAll(selector);
        const regex = new RegExp(`\\b${text}\\b`, 'i');
        elements.forEach(el => {
            if (regex.test(el.textContent)) {
                if (!el.dataset.warningAdded) {
                    el.insertAdjacentHTML('afterend', `<div style="color: red; font-weight: bold;">Warning: ${message}</div>`);
                    el.dataset.warningAdded = true;
                }
            }
        });
    }

    function handleComments(blockedUsers) {
        const allComments = document.querySelectorAll('.comtr');
        allComments.forEach(comment => {
            processComment(comment, blockedUsers);
        });
    }

    function processComment(commentElement, blockedUsers) {
        const userElement = commentElement.querySelector('.hnuser');
        if (userElement && blockedUsers.includes(userElement.textContent.trim())) {
            hideCommentThread(commentElement);
        } else {
            const directReplies = getDirectReplies(commentElement);
            directReplies.forEach(reply => processComment(reply, blockedUsers));
        }
    }

    function getDirectReplies(commentElement) {
        const replyContainer = commentElement.nextElementSibling;
        if (replyContainer && replyContainer.classList.contains('reply')) {
            return replyContainer.querySelectorAll(':scope > .comtr');
        }
        return [];
    }

    function hideCommentThread(commentElement) {
        commentElement.style.display = 'none';
        const replyContainer = commentElement.nextElementSibling;
        if (replyContainer && replyContainer.classList.contains('reply')) {
            replyContainer.style.display = 'none';
        }
    }

    async function applyFilters(config) {
        const { topics, sites, users } = config;

        try {
            // console.log('Applying filters...');
            if (isListPage()) {
                topics.forEach(topic => hideElements('.title a', topic, true));
                sites.forEach(site => hideElements('.title .sitebit', site));
                users.forEach(user => hideElements('.comhead > a[href^="user?"]', user));
            } else if (isSubmissionPage() || isDirectCommentPage()) {
                handleComments(users);
            }

            if (isSubmissionPage()) {
                topics.forEach(topic => {
                    modifyWithWarning('.title a', topic, `This post relates to a blocked topic: ${topic}`);
                });
                sites.forEach(site => {
                    modifyWithWarning('.title .sitebit', site, `This post is from a blocked site: ${site}`);
                });
            }

            if (window.location.pathname.startsWith('/user')) {
                const user = getUserFromUrl();
                if (users.includes(user)) {
                    showUserWarning(user);
                }
            }

            // console.log('Filters applied successfully');
        } catch (error) {
            // console.error('Error in applyFilters:', error);
        }
    }

    function main() {
        // console.log('Main function started');
        fetchConfig().then(config => {
            // console.log('Configuration fetched successfully');
            applyFilters(config);
        }).catch(error => {
            // console.error('Error in main function:', error);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
