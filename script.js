// ==UserScript==
// @name         Better Forums
// @namespace    https://forum.warthunder.com
// @version      1.0
// @description  Small improvements to the War Thunder forums
// @author       themadseventeen
// @match        https://forum.warthunder.com/*
// @grant        GM_addStyle
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
    }

    function forAllPosts() {
        document.querySelectorAll('.topic-post').forEach(post => {
            markReplies(post);
            markQuotes(post);
            markMentions(post);
        });

    }

    forAllPosts();
    observePage();

    const postObserver = new MutationObserver(forAllPosts);
    const pageObserver = new MutationObserver(observePage);
    postObserver.observe(document.body, { childList: true, subtree: true });
    pageObserver.observe(document.body, {childList: true, subtree: true});

})();