// ==UserScript==
// @name         Hacker News - Hide Elements by Text with Warnings
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.6.5
// @description  Enhanced hiding of elements on Hacker News based on specific topics, sites, and users with warning messages for direct links.
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// ==/UserScript==

(function() {
    'use strict';

    const topics = [
        "Trump", "Governments", "Israel", "Biden", "Congress", "Sex", "Housing",
        "Court","Courts","Israeli", "israel", "Elite", "Musk", "Military", "Iran", "Iranian", "Boeing",
        "artist", "artists", "emacs", "twitter", "antisemitism", "antisemite", "ukraine",
        "north korea", "Tesla", "SpaceX", "DoD", "pantagon", "Matlab", "unions",
        "cats", "cat", "facebook", "tiktok", "snapchat","Java", "government","veto",
        "germany","Fedral","musk", "nunobrito", "avmich", 
    ];

    const sites = [
        "foxnews.com", "bbc.co.uk", "bbc.com", "cnn.com", "economist.com","nbcnews.com",
    ];

    const users = [
        // **sanity**
        "usehackernews", "rewmie", "kaba0", "Natsu",
        "dijit", "Aloisius", "josephcsible", "iddan", "deadbabe",
        "Ferret7446", "johnwheeler","zeroonetwothree",
        // **Islamphobia**
        "YZF", "throwaway5959", "rottencupcakes", "riku_iki",
        "llimos", "physicles", "coryrc", "motoxpro", "hirako2000",
        "richardfeynman", "vasilipupkin", "tptacek", "wonderwonder", "ericfrazier",
        "weatherlite", "rrook", "wslh", "rythmshifter", "GuB-42", "elromulous", "AnimalMuppet",
        "prmph", "readthenotes1","gruez", "me_me_me", "prmph", "slibhb", "xpl", "ekianjo",
        "tekknik", "dijit", "sheff_ne", "Always_Anon", "llm_trw", "samsin", "numpad0", "screye",
        "brink", "mschuster91", "GardenLetter27","xdennis","JumpCrisscross","tguvot","rickydroll",
        "megaman821", "RoyTyrell", "bryanlarsen", "myth_drannon", "ftyhbhyjnjk", "nsguy",
        "pvg","candiodari","NovemberWhiskey","machina_ex_deus","snird","shepherdjerred","bawolff",
        "elfbargpt","kjkjadksj","ido","	zeroonetwothree","mhb","collegeburner","bamboozled","speedylight",
        "trimethylpurine","wkat4242","burrish","mikrotikker","cooloo","workaccount2","shrimp_emoji","shitlord",
        "nolongerthere","dralley","invalidname","edanm","Protostome","jolj","noduerme","dotanochen","inemesitaffia",
        "exe34","candiodari","dlubarov","genman","ourmandave","dakom","rendall", "philwelch", "nsguy",
        "blackeyeblitzar", "romwell", "golergka", "JanSt", "JanSt", "ChumpGPT", "EasyMark","qntmfred","stewx",
        "addicted","shermand89","WereAllMadHere","js212","halflife","dmbche","oldpersonintx","desi_ninja",
        "halflife","davesque","leoh","anonfordays","eynsham","firesteelrain","tharne","dingnuts","Log_out_",
        "jlawson","thriftwy","dotancohen","daninus14","surfingdino","BunsanSpace","aen1","blackhawkC17","Pidaymou",
        "emchammer","boxed","inglor_cz","dheera","infotainment","angra_mainyu","ActorNightly","Shekelphile",
        "tomohawk","racional","Ajay-p","klipt","sshine","BlackJack","indoordin0saur","dark-star","sensanaty",
        "kypro", "saltymug76","bityard","blackeyeblitzar","sensanary","dark-star","indoordin0saur","UIUC_06","EugeneOZ",
        "dns_snek","rayiner","solumunus","weatherlite","libretine","graemep","anovikov","Trasmatta","rramadass","fsckboy",
        "renewiltord","gryzzly",

    ];

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
        // Hide the element and adjust the surrounding space
        el.style.display = 'none';
    }

    function hideElements(selector, text, excludeURLs = false) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            let textContent = el.textContent;
            if (excludeURLs) {
                // Attempt to exclude URL if present in the element
                const match = textContent.match(/^(.*)\s+\(\w+:\/\/\S+\)$/);
                if (match) {
                    textContent = match[1];
                }
            }
            const regex = new RegExp(`\\b${text}\\b`, 'i'); // Create a regex with word boundaries
            if (regex.test(textContent)) {
                const row = el.closest('tr');
                if (row) {
                    hideElementAndAdjust(row.nextElementSibling); // Hide metadata
                    hideElementAndAdjust(row); // Hide main element
                }
            }
        });
    }

    function modifyWithWarning(selector, text, message) {
        const elements = document.querySelectorAll(selector);
        const regex = new RegExp(`\\b${text}\\b`, 'i');
        elements.forEach(el => {
            if (regex.test(el.textContent)) {
                // Check if a warning has already been added
                if (!el.dataset.warningAdded) {
                    el.insertAdjacentHTML('afterend', `<div style="color: red; font-weight: bold;">Warning: ${message}</div>`);
                    el.dataset.warningAdded = true; // Mark this element as having a warning added
                }
            }
        });
    }

    function blockCommentContent(selector, text) {
        const elements = document.querySelectorAll(selector);
        const regex = new RegExp(`\\b${text}\\b`, 'i');
        elements.forEach(el => {
            if (regex.test(el.textContent)) {
                // Update the header to include a concise warning message
                el.innerHTML = `<span style="color: red; font-weight: bold;">Warning: Blocked user <${text}></span>`;

                // Find the comment content element and replace its content with a generic message
                const commentBody = el.closest('.comtr').querySelector('.comment');
                if (commentBody) {
                    commentBody.innerHTML = '<div style="color: red; font-weight: bold;">You don\'t want to read this comment content.</div>';
                }
            }
        });
    }

    function applyFilters() {
        if (isListPage()) {
            topics.forEach(topic => hideElements('.title a', topic, true)); // Exclude URLs in title checks
            sites.forEach(site => hideElements('.title .sitebit', site));
            users.forEach(user => hideElements('.comhead > a[href^="user?"]', user));
        } else if (isDirectLink()) {
            topics.forEach(topic => {
                modifyWithWarning('.title a', topic, `This post relates to a blocked topic: ${topic}`);
            });
            sites.forEach(site => {
                modifyWithWarning('.title .sitebit', site, `This post is from a blocked site: ${site}`);
            });
        }

        // Apply user blocking across all contexts in comments
        users.forEach(user => {
            blockCommentContent('.comhead > a[href^="user?"]', user);
        });

        // Check for user profile pages
        if (isUserPage()) {
            const user = getUserFromUrl();
            if (users.includes(user)) {
                showUserWarning(user);
            }
        }
    }
    applyFilters();
})();
