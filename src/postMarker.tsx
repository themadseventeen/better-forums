import { useEffect } from 'react';
import { getGaijinID } from './utils';
import { GM_getValue } from '$';

function usePostObserver() {
    useEffect(() => {
        function forAllPosts() {
            document.querySelectorAll<HTMLElement>('.topic-post').forEach(post => {
                markReplies(post);
                markQuotes(post);
                markMentions(post);
                addButton(post);
            });
        }

        forAllPosts();

        const postObserver = new MutationObserver(forAllPosts);
        postObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => postObserver.disconnect();
    }, []);
}

export default function PostMarker() {
    usePostObserver();
    return null;
}

function getMyUsername(): string {
    return (
        document
            .querySelector<HTMLImageElement>(
                '#current-user > button:nth-child(1) > div:nth-child(1) > img:nth-child(1)'
            )
            ?.title ?? ''
    );
}

function markReplies(post: HTMLElement) {
    const replyingToSpan = post.querySelector('.reply-to-tab span');
    if (replyingToSpan) {
        const replyingTo = replyingToSpan.textContent;
        const myUsername = getMyUsername();
        if (replyingTo === myUsername) {
            post.classList.add("mark-reply");
        }
    }
}

function markQuotes(post: any) {
    post.querySelectorAll('.topic-body .cooked aside.quote').forEach((quote: { dataset: { username: string; }; classList: { add: (arg0: string) => void; }; }) => {
        if (quote.dataset.username === getMyUsername()) {
            quote.classList.add('mark-quote');
        }
    });
}

function markMentions(post: any) {
    post.querySelectorAll('a.mention').forEach((mention: { href: { split: (arg0: string) => { (): any; new(): any; at: { (arg0: number): string; new(): any; }; }; }; classList: { add: (arg0: string) => void; }; }) => {
        if (mention.href.split('/').at(-1) === getMyUsername()) {
            mention.classList.add('mark-mention');
        }
    });
}

export async function addButton(post: HTMLElement) {
    const addLinks = GM_getValue("statshark", false);
    if (!addLinks) return;
    if (post.querySelector(".statshark-button")) return;

    const btn = document.createElement("button");
    btn.className = "statshark-button widget-button btn-flat reply create fade-out btn-icon-text";
    btn.textContent = "Statshark";

    btn.addEventListener("click", async () => {
        const id = await getGaijinID(post);
        console.log(id);
        window.open("https://statshark.net/player/" + id, "_blank");
    });

    const footer = post.querySelector(".post-controls .actions") || post;
    footer.appendChild(btn);
}