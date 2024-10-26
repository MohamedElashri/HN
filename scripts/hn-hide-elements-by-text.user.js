// ==UserScript==
// @name         Hacker News - Advanced Content Filter
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.9.0
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
                            reject(new Error('Failed to parse configuration JSON'));
                        }
                    } else {
                        reject(new Error(`Failed to fetch configuration. Status: ${response.status}`));
                    }
                },
                onerror: function(error) {
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

    function hideElement(el) {
        if (el) {
            el.style.display = 'none';
        }
    }

    function hideFullThread(el) {
        const row = el.closest('tr');
        if (row) {
            // Hide the current row
            hideElement(row);
            // Hide the next row (usually contains content)
            hideElement(row.nextElementSibling);
            // If there's a spacer row, hide it too
            const spacerRow = row.nextElementSibling?.nextElementSibling;
            if (spacerRow && spacerRow.classList.contains('spacer')) {
                hideElement(spacerRow);
            }
        }
    }

    function shouldBlockContent(text, blockedTerms) {
        return blockedTerms.some(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            return regex.test(text);
        });
    }

    function hideElements(selector, blockedTerms, excludeURLs = false) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            let textContent = el.textContent;
            if (excludeURLs) {
                const match = textContent.match(/^(.*)\s+\(\w+:\/\/\S+\)$/);
                if (match) {
                    textContent = match[1];
                }
            }
            
            if (shouldBlockContent(textContent, blockedTerms)) {
                hideFullThread(el);
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
            // Process replies recursively
            const replyContainer = commentElement.nextElementSibling;
            if (replyContainer && replyContainer.classList.contains('reply')) {
                const replies = replyContainer.querySelectorAll('.comtr');
                replies.forEach(reply => processComment(reply, blockedUsers));
            }
        }
    }

    function hideCommentThread(commentElement) {
        hideElement(commentElement);
        // Hide all nested replies
        const replyContainer = commentElement.nextElementSibling;
        if (replyContainer && replyContainer.classList.contains('reply')) {
            hideElement(replyContainer);
        }
    }

    function handleSubmissionPage(config) {
        const { topics, sites, users } = config;
        
        // Check main submission
        const titleElement = document.querySelector('.fatitem .title a');
        const siteElement = document.querySelector('.fatitem .title .sitebit');
        const submitterElement = document.querySelector('.fatitem .hnuser');
        
        let shouldHide = false;
        
        if (titleElement && shouldBlockContent(titleElement.textContent, topics)) {
            shouldHide = true;
        }
        
        if (siteElement && shouldBlockContent(siteElement.textContent, sites)) {
            shouldHide = true;
        }
        
        if (submitterElement && users.includes(submitterElement.textContent.trim())) {
            shouldHide = true;
        }
        
        if (shouldHide) {
            // Hide the entire submission and its comments
            const fatItem = document.querySelector('.fatitem');
            if (fatItem) {
                hideElement(fatItem);
                // Hide all comments
                const commentSection = fatItem.nextElementSibling;
                if (commentSection) {
                    hideElement(commentSection);
                }
            }
        } else {
            // If submission is allowed, still filter comments
            handleComments(users);
        }
    }

    function redirectToHome() {
        window.location.href = 'https://news.ycombinator.com';
    }

    async function applyFilters(config) {
        const { topics, sites, users } = config;

        try {
            // Handle user profile pages - redirect if blocked
            if (window.location.pathname.startsWith('/user')) {
                const urlParams = new URLSearchParams(window.location.search);
                const user = urlParams.get('id');
                if (users.includes(user)) {
                    redirectToHome();
                    return;
                }
            }

            // Handle list pages
            if (isListPage()) {
                topics.forEach(topic => hideElements('.title a', [topic], true));
                sites.forEach(site => hideElements('.title .sitebit', [site]));
                users.forEach(user => hideElements('.subtext > a[href^="user?"]', [user]));
            }
            
            // Handle submission pages
            else if (isSubmissionPage()) {
                handleSubmissionPage(config);
            }
            
            // Handle direct comment pages
            else if (isDirectCommentPage()) {
                handleComments(users);
            }
        } catch (error) {
            // Fail silently
        }
    }

    function main() {
        fetchConfig().then(config => {
            applyFilters(config);
            
            // Add mutation observer to handle dynamically loaded content
            const observer = new MutationObserver(() => {
                applyFilters(config);
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }).catch(() => {
            // Fail silently
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
