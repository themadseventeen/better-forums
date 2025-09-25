import { GM_getValue } from '$';
import { useEffect } from 'react';

export function removePlayButton() {
    const remove = GM_getValue("removeButton", false);
    if (!remove) return;
    const playButton = document.querySelector('._btn');
    if (playButton) playButton.remove();
}

function fixTopicMap() {
    const topicMap: any = document.querySelector('.topic-map');
    if (topicMap) {
        topicMap.style.margin = '20px 0 20px 11px';
    }
}

function observePage() {
    removePlayButton();
    fixTopicMap();
}

export function usePageObserve() {
    useEffect(() => {
        observePage();

        const observer = new MutationObserver(() => {
            observePage();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);
}

export default function Tweaks() {
    usePageObserve();
    return null;
}
