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

export function observeNavigation(
    onNavigate: (url: URL) => void,
): () => void {
    let lastUrl = window.location.href;

    const checkUrl = () => {
        const currentUrl = window.location.href;

        if (currentUrl === lastUrl) {
            return;
        }

        lastUrl = currentUrl;
        onNavigate(new URL(currentUrl));
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (
        data: any,
        unused: string,
        url?: string | URL | null,
    ) {
        const result = originalPushState.call(this, data, unused, url);

        checkUrl();

        return result;
    };

    window.history.replaceState = function (
        data: any,
        unused: string,
        url?: string | URL | null,
    ) {
        const result = originalReplaceState.call(this, data, unused, url);

        checkUrl();

        return result;
    };

    window.addEventListener('popstate', checkUrl);

    return () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', checkUrl);
    };
}

export default function Tweaks() {
  usePageObserve();

  useEffect(() => {
      return observeNavigation((url) => {
          console.log('Navigation:', url.href);

          if (GM_getValue("sortOrder", false) && /\/c\/.*\/.*$/.test(url.pathname)) {
            console.log('Matched!');
            url.searchParams.set('order', 'created');

            window.history.replaceState(
                window.history.state,
                '',
                url,
            );
          }
      });
  }, []);


  return null;
}
