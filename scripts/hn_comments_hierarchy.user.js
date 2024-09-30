// ==UserScript==
// @name         HN Comments Hierarchy
// @namespace    https://github.com/MohamedElashri/hn
// @version      1.2
// @description  Adds collapsible vertical bars with improved visibility to indicate comment hierarchy on Hacker News mobile site.
// @author       melashri
// @match        https://news.ycombinator.com/item*
// @grant        none
// ==/UserScript==

//--------------- Settings -----------------

const autoCollapse = false;
const numberOfRoots = 5;
const numberOfReplies = 3;
const numberOfRepliesOfReplies = 1;

//------------------------------------------

const fadeOnHoverStyle = document.createElement("style");
fadeOnHoverStyle.innerHTML = `
  .verticalBar {
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    border-radius: 5px;
    background: linear-gradient(180deg, #c0c0c0, #dcdcdc); /* Darker gradient */
  }
  .verticalBar:hover {
    background: linear-gradient(180deg, #a0a0a0, #c0c0c0);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3); /* Slightly darker shadow */
    width: 7px; /* Slightly wider on hover */
  }
`;
document.body.appendChild(fadeOnHoverStyle);

const spacingImgs = document.querySelectorAll(".ind img[height='1']:not([width='14'])");

let root = 0;
let index = spacingImgs.length - 1;
let commentHier = [];

if (autoCollapse) {
  var collapseAll = setInterval(function() { main(index, collapseAll); }, 1);
} else {
  for (let j = 0; j < spacingImgs.length; j++) {
    main(j);
  }
}

function main(i, collapseAll) {
  let commentContainer = spacingImgs[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
  commentContainer.firstChild.style = "border-top: 5px transparent solid";
  spacingImgs[i].parentElement.style = "position: relative";

  const clicky = commentContainer.querySelectorAll(".clicky:not(.togg)");
  for (let j = 0; j < clicky.length; j++) {
    clicky[j].className = clicky[j].className.replace("clicky", "");
  }

  if (autoCollapse && !commentContainer.classList.contains("coll")) {
    commentContainer.querySelector(".togg").click();
  }

  index--;
  i--;

  if (i == -1 || i == spacingImgs.length - 1) {
    clearInterval(collapseAll);

    for (let i = 0; i < spacingImgs.length; i++) {
      const level = spacingImgs[i].width / 40;
      commentContainer = spacingImgs[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
      var commentToggle = commentContainer.querySelector(".togg");

      commentHier[level] = commentToggle;

      let divs = [];
      for (let j = spacingImgs[i].width; j >= 0; j -= 40) {
        const div = document.createElement("div");
        div.className = "verticalBar";
        div.commentHier = commentHier[j / 40];
        div.onclick = function(e) {
          e.target.commentHier.click();

          if (e.target.commentHier.getBoundingClientRect().y < 0) {
            e.target.commentHier.previousElementSibling.lastChild.click();
          }
        };

        let style = `left: ${0 + (level * 20)}px; width: 5px; position: absolute; z-index: 99; transition: 0.15s; border-radius: 5px; background: linear-gradient(180deg, #c0c0c0, #dcdcdc);`;

        if (j == spacingImgs[i].width && spacingImgs[i - 1] != null && spacingImgs[i].width <= spacingImgs[i - 1].width) {
          style += "top: 5px; height: calc(100% + 3px); ";
        } else {
          style += "top: 0px; height: calc(100% + 8px); ";
        }

        div.style = style;

        divs.push(div);
      }

      spacingImgs[i].parentElement.appendChild(divs[divs.length - 1]);
    }

    if (autoCollapse) {
      let sub40, sub80;

      for (i = 0; i < spacingImgs.length; i++) {
        commentToggle = spacingImgs[i].parentElement.parentElement.querySelector(".togg");

        if (spacingImgs[i].width == 0) {
          root++;
          if (root == numberOfRoots + 1) {
            break;
          }

          commentToggle.click();
          sub40 = 0;
          sub80 = 0;
        } else if (spacingImgs[i].width == 40 && sub40 < numberOfReplies) {
          commentToggle.click();
          sub40++;
          sub80 = 0;
        } else if (spacingImgs[i].width == 80 && sub80 < numberOfRepliesOfReplies) {
          commentToggle.click();
          sub80++;
        }
      }
    }
  }
}
