// ==UserScript==
// @name         Hacker News - Advanced Content Filter
// @namespace    https://github.com/MohamedElashri/HN
// @version      2.1.3
// @description  Enhanced filtering of elements on Hacker News based on topics, sites, and users.
// @match        https://news.ycombinator.com/*
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG_URL = 'https://raw.githubusercontent.com/MohamedElashri/HN/main/scripts/utils/lists.json';

    function hideElement(el) {
        if (el) {
            el.style.display = 'none';
        }
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

    function findParentStoryByUser(userElement) {
        let subtextRow = userElement.closest('tr');
        if (!subtextRow) return null;
        return subtextRow.previousElementSibling;
    }

    function hideUserContent(userElement, usersSet) {
        const username = userElement.textContent.trim();
        if (usersSet.has(username)) {
            const storyItem = findParentStoryByUser(userElement);
            if (storyItem) {
                hideStoryItem(storyItem);
            }
        }
    }

    function processListPage(config) {
        const { topics, sites, users } = config;
        const usersSet = new Set(users);

        const userElements = document.querySelectorAll('.hnuser');
        userElements.forEach(userElement => {
            hideUserContent(userElement, usersSet);
        });

        if (topics.length > 0 || sites.length > 0) {
            const escapedTopics = topics.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const escapedSites = sites.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

            if (topics.length > 0) {
                const topicsRegex = new RegExp(`\\b(${escapedTopics.join('|')})\\b`, 'i');
                document.querySelectorAll('.titleline a').forEach(titleElement => {
                    if (topicsRegex.test(titleElement.textContent)) {
                        hideStoryItem(titleElement);
                    }
                });
            }

            if (sites.length > 0) {
                const sitesRegex = new RegExp(`\\b(${escapedSites.join('|')})\\b`, 'i');
                document.querySelectorAll('.sitestr').forEach(siteElement => {
                    if (sitesRegex.test(siteElement.textContent)) {
                        hideStoryItem(siteElement);
                    }
                });
            }
        }
    }

    function isListPage() {
        return /^(\/(news|newest|best|ask|show|front|jobs)\/?)?$/.test(window.location.pathname);
    }

    async function applyFilters(config) {
        if (!config) return;
        if (isListPage()) {
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
            const observer = new MutationObserver(() => {
                applyFilters(config);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
