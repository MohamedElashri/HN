// ==UserScript==
// @name         Hacker News - Paywall Bypass
// @namespace    https://github.com/MohamedElashri/HN
// @version      1.0
// @description  Bypasses paywalls and adds redirection links for certain sites on Hacker News
// @author       melashri
// @match        https://news.ycombinator.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const paywalls = [
        "adweek.com",
        "ad.nl",
        "ambito.com",
        "americanbanker.com",
        "baltimoresun.com",
        "barrons.com",
        "bloomberg.com",
        "bloombergquint.com",
        "bndestem.nl",
        "bostonglobe.com",
        "bd.nl",
        "brisbanetimes.com.au",
        "businessinsider.com",
        "caixinglobal.com",
        "centralwesterndaily.com.au",
        "cen.acs.org",
        "chicagotribune.com",
        "corriere.it",
        "chicagobusiness.com",
        "dailypress.com",
        "gelderlander.nl",
        "groene.nl",
        "demorgen.be",
        "denverpost.com",
        "speld.nl",
        "destentor.nl",
        "tijd.be",
        "volkskrant.nl",
        "df.cl",
        "editorialedomani.it",
        "dynamed.com",
        "ed.nl",
        "elmercurio.com",
        "elmundo.es",
        "elpais.com",
        "elperiodico.com",
        "elu24.ee",
        "britannica.com",
        "estadao.com.br",
        "examiner.com.au",
        "expansion.com",
        "fnlondon.com",
        "financialpost.com",
        "ft.com",
        "firstthings.com",
        "foreignpolicy.com",
        "fortune.com",
        "genomeweb.com",
        "glassdoor.com",
        "globes.co.il",
        "grubstreet.com",
        "haaretz.com",
        "haaretz.co.il",
        "harpers.org",
        "courant.com",
        "hbr.org",
        "hbrchina.org",
        "heraldsun.com.au",
        "fd.nl",
        "historyextra.com",
        "humo.be",
        "ilmanifesto.it",
        "inc.com",
        "interest.co.nz",
        "investorschronicle.co.uk",
        "lanacion.com.ar",
        "repubblica.it",
        "lastampa.it",
        "latercera.com",
        "lavoixdunord.fr",
        "lecho.be",
        "ledevoir.com",
        "leparisien.fr",
        "lesechos.fr",
        "loebclassics.com",
        "lrb.co.uk",
        "labusinessjournal.com",
        "latimes.com",
        "medium.com",
        "medscape.com",
        "mexiconewsdaily.com",
        "sloanreview.mit.edu",
        "technologyreview.com",
        "mv-voice.com",
        "nationalgeographic.com",
        "nationalpost.com",
        "nzz.ch",
        "newstatesman.com",
        "nydailynews.com",
        "nymag.com",
        "nzherald.co.nz",
        "nrc.nl",
        "ntnews.com.au",
        "ocregister.com",
        "orlandosentinel.com",
        "paloaltoonline.com",
        "parool.nl",
        "postimees.ee",
        "pzc.nl",
        "qz.com",
        "quora.com",
        "gelocal.it",
        "republic.ru",
        "reuters.com",
        "sandiegouniontribune.com",
        "sfchronicle.com",
        "scientificamerican.com",
        "seekingalpha.com",
        "slate.com",
        "sofrep.com",
        "startribune.com",
        "statista.com",
        "stuff.co.nz",
        "\"sueddeutsche.de\"",
        "sun-sentinel.com",
        "techinasia.com",
        "telegraaf.nl",
        "time.com",
        "adelaidenow.com.au",
        "theadvocate.com.au",
        "theage.com.au",
        "the-american-interest.com",
        "theathletic.com",
        "theathletic.co.uk",
        "theatlantic.com",
        "afr.com",
        "theaustralian.com.au",
        "bizjournals.com",
        "canberratimes.com.au",
        "thecourier.com.au",
        "couriermail.com.au",
        "thecut.com",
        "dailytelegraph.com.au",
        "thediplomat.com",
        "economist.com",
        "theglobeandmail.com",
        "theherald.com.au",
        "thehindu.com",
        "irishtimes.com",
        "japantimes.co.jp",
        "kansascity.com",
        "themarker.com",
        "mercurynews.com",
        "themercury.com.au",
        "mcall.com",
        "thenation.com",
        "thenational.scot",
        "news-gazette.com",
        "newyorker.com",
        "nytimes.com",
        "theolivepress.es",
        "inquirer.com",
        "thesaturdaypaper.com.au",
        "seattletimes.com",
        "spectator.com.au",
        "spectator.co.uk",
        "spectator.us",
        "smh.com.au",
        "telegraph.co.uk",
        "thestar.com",
        "wsj.com",
        "washingtonpost.com",
        "thewrap.com",
        "the-tls.co.uk",
        "towardsdatascience.com",
        "trouw.nl",
        "tubantia.nl",
        "vanityfair.com",
        "vn.nl",
        "vulture.com",
        "journalnow.com",
        "wired.com",
        "zeit.de"
    ];

    const projects = [
        {
            name: "Archive.is",
            url: "https://archive.is/",
        },
        {
            name: "12ft.io",
            url: "https://12ft.io/",
        },
        {
            name: "Archive.org",
            url: "https://web.archive.org/web/",
        },
    ];

    // Function to bypass paywalls and add redirection
    function passTheButter(node, paywalls, projects) {
        // Check if node.nextSibling is an element and has querySelector
        if (node.nextSibling && node.nextSibling.nodeType === Node.ELEMENT_NODE) {
            let meta = node.nextSibling.querySelector(".subtext");
            // Additional check for meta existence
            if (meta) {
                let link = node.querySelector(".titleline a").href;
                let domain = node.querySelector("span.sitestr") ? node.querySelector("span.sitestr").innerText : "";
                let paywall = paywalls.find((paywall) => domain.includes(paywall));

                if (paywall) {
                    let paywallSpan = document.createElement("span");
                    paywallSpan.appendChild(document.createTextNode(" | 💰"));

                    projects.forEach((project) => {
                        const anchor = document.createElement("a");
                        const line = document.createElement("span");
                        line.textContent = " | ";
                        anchor.setAttribute("href", `${project.url}${link}`);
                        anchor.setAttribute("target", "_blank");
                        anchor.setAttribute("rel", "noopener noreferrer");
                        anchor.textContent = project.name;
                        paywallSpan.appendChild(line);
                        paywallSpan.appendChild(anchor);
                    });

                    meta.appendChild(paywallSpan);
                }
            } else {
                console.log("Meta element not found for node: ", node);
            }
        } else {
            console.log("Unexpected node type or null nextSibling for node: ", node);
        }
    }

    // Add bypass to submissions and links
    let titles = document.querySelectorAll("table tr.athing");
    let postTitle = document.querySelector("tbody table.fatitem tr.athing");

    postTitle ? passTheButter(postTitle, paywalls, projects) : titles.forEach((title) => {
        passTheButter(title, paywalls, projects);
    });
})();