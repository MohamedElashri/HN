// ==UserScript==
// @name         Hacker News - Hide Elements by Text
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.4
// @description  Hides elements on Hacker News based on specific topics, sites, and users
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/scripts/hn-hide-elements-by-text.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ---------------------------
    // Lists
    // ---------------------------
    const topics = [
        "Trump", "Governments", "Israel", "Biden", "Congress", "Sex", "Housing" ,
        "Court","Courts","Israeli","Elite", "Musk", "Military", "Iran", "Iranian", "Boeing",
        "artist", "artists", "emacs", "twitter", "antisemitism", "antisemite", "ukraine",
        "north korea", "Tesla", "SpaceX", "DoD", "pantagon", "Matlab", "union", "unions",
        "cats", "cat", "facebook", "tiktok", "snapchat","Java", "government","veto",
        "germany","Fedral","twitter",
    ];

    const sites = [
        "foxnews.com", "bbc.co.uk", "bbc.com", "cnn.com", "economist.com","nbcnews.com",
    ];

    const users = [
        // **sanity**
        "usehackernews", "rewmie", "kaba0", "Natsu",
        "dijit", "Aloisius", "josephcsible", "iddan", "deadbabe",
        "Ferret7446", "johnwheeler",
        // **Islamphopia**
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
        "exe34","candiodari","dlubarov","genman","ourmandave","dakom","rendall", "philwelch", "nsguy", "blackeyeblitzar"
        

    ];

    // Helper function to determine if a row is a spacer
    function isSpacerRow(row) {
        // Implement logic to determine if a row is used as a spacer
        return row.style.height === "5px"; // To be fine tuned
    }

    // Helper function to determine if a row is a metadata row
    function isMetadataRow(row) {
        // Implement logic to determine if a row contains metadata
        // This can be based on the presence of certain classes or specific text
        return row.querySelector('.subtext') !== null;
    }

    // Function to hide elements containing specific text
    function hideElementsByText(selector, text, includeParent = false) {
        const elements = document.querySelectorAll(selector);
        const lowerCaseText = text.toLowerCase(); // Convert the text to lowercase
        elements.forEach(el => {
            if (el.textContent.toLowerCase().includes(lowerCaseText)) {
                let elementToHide = includeParent ? el.closest('tr') : el;
                if (elementToHide) {
                    // Hide the parent <tr>
                    let parentRow = elementToHide.closest('tr');
                    if (parentRow) {
                        parentRow.style.display = 'none';

                        // Hide the next sibling if it's a spacer or metadata row
                        let nextSiblingRow = parentRow.nextElementSibling;
                        if (nextSiblingRow && nextSiblingRow.tagName === "TR") {
                            if (isSpacerRow(nextSiblingRow) || isMetadataRow(nextSiblingRow)) {
                                nextSiblingRow.style.display = 'none';
                            }
                        }

                        // Additionally, check for and hide a previous spacer if present
                        let previousSiblingRow = parentRow.previousElementSibling;
                        if (previousSiblingRow && previousSiblingRow.tagName === "TR") {
                            if (isSpacerRow(previousSiblingRow)) {
                                previousSiblingRow.style.display = 'none';
                            }
                        }
                    }
                }
            }
        });
    }

    // Function to apply filters based on topics, sites, and users
    function applyFilters() {
        topics.forEach(topic => {
            hideElementsByText('.title a', topic, true);
        });
        sites.forEach(site => {
            hideElementsByText('.title .sitebit', site, true);
        });
        users.forEach(user => {
            hideElementsByText('.comhead > a[href^="user?"]', user, true);
        });
    }

    // Run the filter function on page load
    applyFilters();
})();
