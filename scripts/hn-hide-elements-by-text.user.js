// ==UserScript==
// @name         Hacker News - Hide Elements by Text with Warnings
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.7.0
// @description  Enhanced hiding of elements on Hacker News based on specific topics, sites, and users with warning messages.
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
                        //console.log('Raw response:', response.responseText);
                        try {
                            const config = JSON.parse(response.responseText);
                            resolve(config);
                        } catch (error) {
                            console.error('JSON parse error:', error);
                            reject(new Error('Failed to parse configuration JSON'));
                        }
                    } else {
                        reject(new Error(`Failed to fetch configuration. Status: ${response.status}`));
                    }
                },
                onerror: function(error) {
                    console.error('Network error:', error);
                    reject(new Error('Network error while fetching configuration'));
                }
            });
        });
    }

    function isListPage() {
        return /news|newest|best|ask|show|front|jobs/.test(window.location.pathname);
    }

    function isUserPage() {
        return /user\?id=/.test(window.location.href);
    }

    function isDirectLink() {
        return /item\?id=\d+$/.test(window.location.href);
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

    function blockCommentContent(selector, text) {
        // console.log(`Searching for user: ${text}`);
        const elements = document.querySelectorAll(selector);
        const regex = new RegExp(`\\b${text}\\b`, 'i');
        elements.forEach(el => {
            if (regex.test(el.textContent)) {
                // console.log(`Found user ${text} in element:`, el);
                el.innerHTML = `<span style="color: red; font-weight: bold;">Warning: Blocked user <${text}></span>`;

                // Try to find the closest parent with class 'comtr' or 'athing'
                const parentComment = el.closest('.comtr') || el.closest('.athing');

                if (parentComment) {
                    // console.log(`Found parent for user ${text}:`, parentComment);
                    const commentBody = parentComment.querySelector('.comment') || parentComment.querySelector('.commtext');
                    if (commentBody) {
                        commentBody.innerHTML = '<div style="color: red; font-weight: bold;">You don\'t want to read this comment content.</div>';
                    } else {
                        console.log(`Could not find comment body for user ${text}`);
                    }
                } else {
                    console.log(`Could not find parent comment/post for user ${text}. Element structure:`, el.parentElement);
                }
            }
        });
    }

    async function applyFilters(config) {
        const { topics, sites, users } = config;

        try {
            // console.log('Applying filters...');
            if (isListPage()) {
                // console.log('Processing list page');
                topics.forEach(topic => hideElements('.title a', topic, true));
                sites.forEach(site => hideElements('.title .sitebit', site));
                users.forEach(user => hideElements('.comhead > a[href^="user?"]', user));
            } else if (isDirectLink()) {
                // console.log('Processing direct link page');
                topics.forEach(topic => {
                    modifyWithWarning('.title a', topic, `This post relates to a blocked topic: ${topic}`);
                });
                sites.forEach(site => {
                    modifyWithWarning('.title .sitebit', site, `This post is from a blocked site: ${site}`);
                });
            }

            // console.log('Processing users...');
            users.forEach(user => {
                blockCommentContent('.comhead > a[href^="user?"], .hnuser', user);
            });

            if (isUserPage()) {
                // console.log('Processing user page');
                const user = getUserFromUrl();
                if (users.includes(user)) {
                    showUserWarning(user);
                }
            }

            console.log('Filters applied successfully');
        } catch (error) {
            console.error('Error in applyFilters:', error);
        }
    }


    function main() {
        // console.log('Main function started');
        fetchConfig().then(config => {
            // console.log('Configuration fetched successfully');
            applyFilters(config);
        }).catch(error => {
            console.error('Error in main function:', error);
        });
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

    main();
})();
