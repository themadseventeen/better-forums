import { GM_xmlhttpRequest } from "$";

function getThreadLink() {
    const baseUrl = window.location.origin;
    const pathParts = window.location.pathname.split('/');

    const len = pathParts.length;
    if (len > 3 && !isNaN(parseInt(pathParts[len - 1])) && !isNaN(parseInt(pathParts[len - 2]))) {
        pathParts.pop();
    }

    return baseUrl + pathParts.join('/');
}


function fetchHiddenPost(url: string, post: any) {
    var postElement = post.querySelector('.topic-body');
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        onload: function (response) {
            post.classList.remove('post-hidden')
            const ogDescription = response.responseText.match(/<meta property="og:description" content="(.*?)"/);
            if (ogDescription) {
                console.log(ogDescription);
                let textArea = postElement.querySelector('div.regular.contents div.cooked p');
                textArea.textContent = ogDescription[1];
            } else {
                alert('No preview found.');
            }
        },
        onerror: function () {
            alert('Failed to fetch post.');
        }
    });
}

function createRevealButton() {
    const button = document.createElement('button');
    button.className = 'reveal-hidden-post widget-button btn-flat share no-text btn-icon';
    button.title = "Reveal post";

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('class', 'fa d-icon');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 4.5c-4.97 0-9 5.5-9 7.5s4.03 7.5 9 7.5 9-5.5 9-7.5-4.03-7.5-9-7.5zm0 13c-3.31 0-6-3.58-6-5.5s2.69-5.5 6-5.5 6 3.58 6 5.5-2.69 5.5-6 5.5zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z');

    svg.appendChild(path);

    button.appendChild(svg);

    return button;
}

export function revealHidden(post: any) {
    const body = post.querySelector('.topic-body');

    if (!post || !post.classList.contains('post-hidden')) return;

    const actionsDiv = body.querySelector('.post-controls .actions');
    if (!actionsDiv || actionsDiv.querySelector('.reveal-hidden-post')) return;

    const button = createRevealButton();

    button.addEventListener('click', () => {
        const postElement = body.closest('.topic-post');

        const articleElement = postElement?.querySelector('article');

        const postId = articleElement?.id.match(/post_(\d+)/)?.[1];

        const baseUrl = postElement?.baseURI;

        if (postId && baseUrl) {
            var threadLink = getThreadLink();
            const postLink = `${threadLink}/${postId}`;
            fetchHiddenPost(postLink, post);

        } else {
            alert('Could not find post link.');
        }
        // event.target.blur();
        // event.target.classList.remove('active');

    });

    actionsDiv.appendChild(button);
}
