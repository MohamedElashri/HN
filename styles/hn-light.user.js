// ==UserScript==
// @name         Hacker News Light Theme
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.1
// @description  A Light custom theme for Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        GM_addStyle
// @updateURL    https://github.com/MohamedElashri/HN/raw/main/styles/hn-light.user.js
// @downloadURL  https://github.com/MohamedElashri/HN/raw/main/styles/hn-light.user.js
// ==/UserScript==

(function() {
    'use strict';

    const css = `
        /* Global Styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background: #bfcddb !important; /* Light blue background */
        }
        /* Main Container Styles */
        #hnmain {
            background: #fcfcfc !important; /* White background */
            max-width: 95% !important; /* Use max-width for scalability */
            box-shadow: 0px 0px 30px 3px rgba(7, 43, 132, .2) !important; /* Box shadow for depth */
            border-left: 1px solid #fff !important;
            border-right: 1px solid #fff !important;
            margin: 0 auto; /* Center the container */
        }
         /* Enhance Comments */
           
        .comment-tree .comment {
          position: relative;
          padding-left: 20px;
        
        
          
        }
            
            .comment::before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: #ccc;
            }
        
        .comment.reply::before {
          top: 20px; /* Adjust to align with the start of the child comment */
        }
        .comment-tree .comment::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #ccc;
        }
            
        .comment:hover {
          background-color: #e6f7ff;
        }            
        /* Responsive design for smaller screens */
        @media screen and (max-width: 600px) {
            #hnmain {
                width: 100% !important; /* Full width on small screens */
                box-shadow: none !important; /* Optional: remove shadow on small screens */
            }
        }
        /* Text and Link Styles */
        td {
            color: #c40707 !important; /* Red text color for table data */
        }
        /* Dead Links Styling */
        .dead a:link, .dead a:visited {
            background: #0d0d0d !important; /* Dark background for dead links */
            color: #fff !important; /* White text color for contrast */
        }
        .dead a:link::before {
            content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAMAAAAR8Wy4AAAATlBMVEX///9NTU38/PxjY2OVlZX5+fny8vLDw8Nzc3P29vbh4eHLy8uysrKmpqaKioqDg4Pm5uZVVVXV1dW8vLyPj495eXlra2ve3t7b29taWlqwMuwSAAAAk0lEQVQI1z2OVw7EMAhEsXHBvcROuf9FlzjZzAcSTwN6cEenXYg9Sngjp1jJfxDEmxNgtSI+O24g3Q0sPYCsNAxUrRkzUcbh+tDQGx3KyKKgJr+3E7oqNEtBHDNjUR3AGbM1EaO4tlMuK57cbSOYz8zbampIx6MdbEFrvVcBsw0ajktEqRNNtuI/nj0S+xm37pPSP4ZHBjEu/RG/AAAAAElFTkSuQmCC) !important;
            background: #fff !important;
            color: #fff !important;
            padding: 3px 3px 2px 3px !important;
            margin-right: 3px !important;
            border: 1px solid #000 !important;
        }
        .dead a:link::after {
            content: "[DEAD LINK]";
            background: #939090 !important;
            color: #fff !important;
            padding: 0 4px !important;
        }
        /* Header Styling */
        #hnmain td[bgcolor="#ff6600"] {
            background: linear-gradient(to top, rgba(232,228,221,1) 0%, rgba(243,239,237,1) 100%) !important;
            padding: 3px 4px !important;
            box-shadow: 0px 1px 1px 0px rgba(33, 33, 33, 0.2);
        }
        .pagetop a[href="news"] {
            font-size: 133% !important;
            text-shadow: -1px -1px 0 #fffbf3, 1px -1px 0 #fffbf3, -1px 1px 0 #fffbf3, 1px 1px 0 #fffbf3 !important;
        }
        /* Various Header Link Styles */
        .topsel a {
            color: #f60 !important;
            font-weight: bold !important;
        }
        .pagetop a:not(:first-child):hover {
            text-decoration: underline !important;
        }
        .pagetop {
            color: #620303 !important;
        }
        #hnmain td[bgcolor="#ffffaa"] * {
            color: #000 !important;
        }
        /* Front Page News Listing Styles */
        .title:first-child {
            padding-right: 8px !important;
            padding-left: 8px !important;
            color: #f60 !important;
            font-size: 11px !important;
        }
        .title:not(:first-child) {
            font-size: 16px !important;
            font-family: "Verdana", "Lucida Grande", "Open Sans", "Bitstream Vera Sans", sans-serif !important;
            padding-left: 8px !important;
        }
        .title:not(:first-child) > a {
            border-bottom: 1px solid #620303 !important;
        }
        .title:not(:first-child) > a:hover {
            text-decoration: underline !important;
            border: none !important;
        }
        .title > a:visited {
            color: #44010b !important;
        }
        .title .sitebit {
            color: #44010b !important;
        }
        .subtext {
            font-size: 11px !important;
            color: #f60 !important;
            padding-left: 8px !important;
        }
        tr[style="height:5px"] {
            height: 16px !important;
        }
        .title > a[href^="news?p="] {
            color: #7c500d !important;
        }
        /* Comment Section Styles */
        #hnmain > tbody > tr:first-child + tr + tr > td > table + br + br + table {
            padding-right: 10px !important;
        }
        #hnmain > tbody > tr:first-child + tr + tr > td > table > tbody > tr:first-child > .title > a {
            color: #c67d0f !important;
        }
        .comment {
            font-family: "Lucida Grande", "Open Sans", "Bitstream Vera Sans", "Verdana", sans-serif !important;
            font-size: 105% !important;
            line-height: 1.5 !important;
        }
        .default {
            padding: 10px 0 !important;
        }
        .default p {
            margin-bottom: 6px !important;
        }
        .comment a {
            text-decoration: none !important;
            border-bottom: 1px solid #c40707 !important;
        }
        a[href^="reply"] {
            background: linear-gradient(to top, rgba(232,228,221,1) 0%, rgba(243,239,237,1) 100%) !important;
            padding: 2px 6px 3px 6px !important;
            border-radius: 5px !important;
            border: 2px solid #a07a42 !important;
            text-shadow: 0px 1px 0px #ffffff;
        }
        a[href^="reply"]:hover {
            background: linear-gradient(to bottom, rgba(232,228,221,1) 0%, rgba(243,239,237,1) 100%) !important;
            padding: 2px 6px 3px 6px !important;
            border-radius: 5px !important;
            border: 2px solid #c67d0f !important;
            text-shadow: 0px -1px 0px #ffffff;
        }
        .default .comhead {
            opacity: 1 !important;
            color: #f60 !important;
        }
        .default .comhead:hover {
            opacity: 1 !important;
        }
        .comhead a[href^="user?"] {
            font-weight: bold !important;
            color: #f90 !important;
        }
        .comment pre {
            max-width: 750px !important;
            font-size: 12px !important;
        }
        #hnmain > tbody > tr:first-child + tr + tr > td > table + br + br + table .votearrow {
            margin-top: 11px !important;
        }
        /* Dimmed Comment Styling */
        .c5a, .c73, .c82, .c88, .c9c,
        .cae, .cbe, .cce, .cdd {
            transition: color 0.5s !important;
        }
        .c5a:hover, .c73:hover, .c82:hover, .c88:hover, .c9c:hover,
        .cae:hover, .cbe:hover, .cce:hover, .cdd:hover {
            color: #000 !important;
        }
        /* Footer Styles */
        #hnmain > tbody > tr:last-child {
            background: linear-gradient(to bottom, #fff 0%, #b9b2a7 100%) !important;
        }

        .quote {
            border-left: 3px solid #ff6600; /* Hacker News orange color */
            padding: 6px 6px 6px 9px;
            font-style: italic;
            background-color: #fff3e0; /* Light orange background */
            border-radius: 5px;
        }

        :root {
            --colour-hn-orange: #ff6600;
            --colour-hn-orange-pale: rgba(255, 102, 0, 0.05);
            --colour-voted: #cccccc; /* Colour for voted arrows */
            --border-radius: 8px;
        }
        .votelinks {
            min-width: 32px;
        }
        .votearrow {
            background: var(--colour-hn-orange-pale);
            border-radius: var(--border-radius);
            color: var(--colour-hn-orange);
            display: block;
            width: 24px;
            height: 24px;
            font-size: 16px;
            position: relative;
            top: 2px;
            cursor: pointer; /* Makes it clear that it's clickable */
        }
        .votearrow:hover, .votearrow.voted {
            background: var(--colour-hn-orange);
            color: white;
        }
        .votearrow.voted {
            background: var(--colour-voted);
            color: var(--colour-hn-orange);
        }
        .votearrow:after {
            content: "⇧";
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(css);
    } else {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);
    }
})();
