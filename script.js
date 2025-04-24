// ==UserScript==
// @name         Better Forums
// @namespace    https://forum.warthunder.com
// @version      1.1.3
// @description  Small improvements to the War Thunder forums
// @author       themadseventeen
// @match        https://forum.warthunder.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


(function () {
    'use strict';

    GM_addStyle(`
        html.dark {
            .current-user-post>article .row {
                background-color: #331a1a;
                border-color: #DF0E0E;
            }
            .mark-reply>article .row {
                background-color: #422e1a;
                border-color: #af7615;
            }
            article .row .topic-body aside.quote.mark-quote{
                background-color: #422e1a;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            }
            article .row .topic-body a.mark-mention {
                color: #af7615;
                transition: color ease .3s,fill ease .3s,background-color ease .3s;
            }
            a.mention.mark-mention, a.mention-group {
                background: #422e1a;
            }
        }

        html.light {
            .current-user-post>article .row {
                background-color: #e1a2a2;
                border-color: #DF0E0E;
            }
            .mark-reply>article .row {
                background-color: #ffbe7e;
                border-color: #af7615;
            }
            article .row .topic-body aside.quote.mark-quote{
                background-color: #ffbe7e;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            }
            article .row .topic-body a.mark-mention {
                color: #af7615;
                transition: color ease .3s,fill ease .3s,background-color ease .3s;
            }
            a.mention.mark-mention, a.mention-group {
                background: #ffbe7e;
            }
        }
    `)

    function getMyUsername() {
        return document.querySelector('#current-user > button:nth-child(1) > div:nth-child(1) > img:nth-child(1)').title;
    }

    function get_user_json(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: {
                    "Accept": "application/json"
                },
                onload: function (response) {
                    try {
                        const json = JSON.parse(response.responseText);
                        resolve(json);
                    } catch (e) {
                        reject("JSON parse error: " + e);
                    }
                },
                onerror: function (err) {
                    reject("Request failed: " + err);
                }
            });
        });
    };

    async function get_op_id(post) {
        const op_name = post.querySelector('.trigger-user-card').href.split('/').lastObject;

        if (!(op_name in nick_id_map)) {
            const op_link = post.querySelector('.trigger-user-card').href + ".json";
            const op_json = await get_user_json(op_link);
            const op_id = op_json["user"]["custom_fields"]["gaijin_id"];
            console.log("Getting ID for " + op_name);
            nick_id_map[op_name] = op_id;
            GM_setValue("nick_id_map", nick_id_map);
        }
        // console.log(op_name + " : " + op_id);
        return nick_id_map[op_name];
    }

    function create_performance_button() {
        const button = document.createElement('button');
        button.className = 'performance-mark widget-button btn-flat share no-text btn-icon'; // Matches Discourse button styles
        button.title = "Get performance";

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24'); // Standard Discourse icon size
        svg.setAttribute('width', '20');  // Adjust as needed
        svg.setAttribute('height', '20');
        svg.setAttribute('class', 'fa d-icon'); // Matches Discourse icon styling

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 4.5c-4.97 0-9 5.5-9 7.5s4.03 7.5 9 7.5 9-5.5 9-7.5-4.03-7.5-9-7.5zm0 13c-3.31 0-6-3.58-6-5.5s2.69-5.5 6-5.5 6 3.58 6 5.5-2.69 5.5-6 5.5zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z');

        svg.appendChild(path);

        button.appendChild(svg);

        return button;
    }


    function add_performance_button(post) {
        // get_op_id(post);
        const body = post.querySelector('.topic-body');

        const actionsDiv = body.querySelector('.post-controls .actions');
        if (!actionsDiv || actionsDiv.querySelector('.performance-mark')) return; // Avoid duplicate buttons

        const button = create_performance_button();

        button.addEventListener('click', async () => {
            const id = await get_op_id(post);

            // post.querySelector(".username").children[0].innerText += " " + id;
            // post.classList.add("performance-mark");
            await add_performance(post);

            if (event) {
                event.target.blur();
                event.target.classList.remove('active');
            }

        });

        actionsDiv.appendChild(button);
    }

    async function add_performance(post) {
        if (post.classList.contains("performance-mark"))
            return;
        const op_name = post.querySelector('.trigger-user-card').href.split('/').lastObject;
        if (op_name in nick_id_map) {
            post.classList.add("performance-mark");
            const id = await get_op_id(post);

            post.querySelector(".username").children[0].innerText += " " + id;
        }
    }

    function markReplies(post) {
        const replyingToSpan = post.querySelector('.reply-to-tab span');
        if (replyingToSpan) {
            const replyingTo = replyingToSpan.textContent;
            const myUsername = getMyUsername();
            if (replyingTo === myUsername) {
                post.classList.add("mark-reply");
            }
        }
    }

    function markQuotes(post) {
        post.querySelectorAll('.topic-body .cooked aside.quote').forEach(quote => {
            if (quote.dataset.username === getMyUsername()) {
                quote.classList.add('mark-quote');
            }
        });
    }

    function markMentions(post) {
        post.querySelectorAll('a.mention').forEach(mention => {
            if (mention.href.split('/').at(-1) === getMyUsername()) {
                mention.classList.add('mark-mention');
            }
        });
    }

    function removePlayButton() {
        const playButton = document.querySelector('._btn');
        if (playButton) {
            playButton.remove();
        }
    }

    function fixTopicMap() {
        const topicMap = document.querySelector('.topic-map');
        if (topicMap) {
            topicMap.style.margin = '20px 0 20px 11px';
        }
    }

    function observePage() {
        fixTopicMap();
        removePlayButton();
        headerButtonsReady();
    }

    function forAllPosts() {
        document.querySelectorAll('.topic-post').forEach(post => {
            markReplies(post);
            markQuotes(post);
            markMentions(post);
            add_performance(post);
            add_performance_button(post); // statshark integration
        });

    }

    function forumTheme() {
        if(document.querySelector('html').classList.contains("dark"))
            return "dark";
        if(document.querySelector('html').classList.contains("light"))
            return "light"
    }

    function browserTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return "dark";
        }
        else {
            return "light";
        }
    }

    function switchTheme() {
        const _button = document.querySelector('.color-scheme-toggler');
        if (_button) {
          _button.click();
        }
    }

    function createThemeOverrideButton() {
        const buttonLI = document.createElement("li");
        buttonLI.classList.add("theme-override");

        const overrideButton = document.createElement("button");
        overrideButton.classList.add("icon", "btn-flat");
        if (GM_getValue("followTheme", true)) {
            overrideButton.textContent = "A";
        }
        else {
            overrideButton.textContent = "M";
        }

        overrideButton.addEventListener("click", function() {
            let followTheme = GM_getValue("followTheme", true);
            followTheme = !followTheme;
            if (followTheme) {
                this.textContent = "A";
            }
            else {
                this.textContent = "M";
            }
            GM_setValue("followTheme", followTheme);
        });

        buttonLI.appendChild(overrideButton);

        return buttonLI;
    }

    function headerButtonsReady() {
        const header = document.querySelector(".d-header-icons");
        if(!header) return;
        var children = header.children;
        for (var i = 0; i < children.length; i++) {
            if(children[i].classList.contains("theme-override"))
                return;
        }
        header.appendChild(createThemeOverrideButton());
    }

    function syncTheme() {
        if (GM_getValue("followTheme", true) === true) {
            if (browserTheme() !== forumTheme()) {
                switchTheme();
            }
        }

    }


    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    forAllPosts();
    observePage();

    waitForElm('.color-scheme-toggler').then((elm) => {
        syncTheme();
    });

    waitForElm('.d-header-icons').then(() => {
        headerButtonsReady();
    });

    let nick_id_map = GM_getValue("nick_id_map", Object.create(null));

    const postObserver = new MutationObserver(forAllPosts);
    const pageObserver = new MutationObserver(observePage);
    postObserver.observe(document.body, { childList: true, subtree: true });
    pageObserver.observe(document.body, {childList: true, subtree: true});

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => syncTheme());

})();