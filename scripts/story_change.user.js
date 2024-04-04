// ==UserScript==
// @name        Story Rank Changes for HN
// @namespace   https://github.com/MohamedElashri/HN
// @version     0.0.1
// @description Enhance Hacker News experience with real-time story rank changes and new story icon for quick, visual navigation
// @author      melashri
// @match       https://news.ycombinator.com/
// @match       https://news.ycombinator.com/news
// @match       https://news.ycombinator.com/news?p=*
// @match       https://news.ycombinator.com/?p=*
// @grant       none
// @license     MIT
// ==/UserScript==

(function() {
   'use strict';

   var KEY_LAST_CLEAR = 'hackernews-rank-notifier-clear-time';
   var KEY_RANK_STORE = 'hackernews-rank-notifier';
   var MAX_STORIES = 3000;

   var oldRanks = JSON.parse(localStorage.getItem(KEY_RANK_STORE)) || {};

   var stories = Array.from(document.getElementsByClassName('athing'));

   stories.forEach(function(story) {
       var id = story.id;
       var rank = story.querySelector('span.rank').innerText;
       rank = parseInt(rank.slice(0, -1)); // removing the dot at the end
       var title = story.querySelector('.title a');
       var changeIndicator = document.createElement('span');
       var svgContainer = document.createElement('span'); // Container for SVG icon

       if (id in oldRanks) {
           var change = oldRanks[id] - rank;
           if (change !== 0) {
               // the story has moved
               changeIndicator.textContent = ' (' + (change > 0 ? '+' : '-') + Math.abs(change) + ') ';
               changeIndicator.style.color = change > 0 ? '#2605f2' : '#008e48';
               title.parentNode.insertBefore(changeIndicator, title);
           }
       } else {
           // the story is new, use SVG icon instead of text
           svgContainer.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.6667 5.33333H16L12 8.66667L14.6667 14L8 10.6667L1.33333 14L4 8.66667L0 5.33333H5.33333L8 0Z" fill="#7d3c98"/></svg>'; 
           svgContainer.style.marginRight = '5px';
           title.parentNode.insertBefore(svgContainer, title);
       }
       // update the rank in memory
       oldRanks[id] = rank;
   });

   // Get the top 3000 story ids
   var topStoryIds = Object.keys(oldRanks).sort((a, b) => b - a).slice(0, MAX_STORIES);

   // Create a new object with only the top 3000 latest story rankings
   var newRanks = {};
   topStoryIds.forEach(id => {
       newRanks[id] = oldRanks[id];
   });

   localStorage.setItem(KEY_RANK_STORE, JSON.stringify(oldRanks));
})();
