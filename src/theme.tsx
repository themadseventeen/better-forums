import { useEffect } from 'react';
import { GM_getValue, GM_setValue } from '$';

function getForumTheme(): 'light' | 'dark' {
    const html = document.querySelector('html');
    if (!html) return 'light';
    if (html.classList.contains('dark')) return 'dark';
    if (html.classList.contains('light')) return 'light';
    return 'light';
}

function getBrowserTheme(): 'light' | 'dark' {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function switchTheme() {
    const button = document.querySelector<HTMLButtonElement>('.color-scheme-toggler');
    button?.click();
}

export function syncTheme() {
    const followTheme: Boolean  = GM_getValue("followTheme", false);
    if (!followTheme) return;
    const browserTheme = getBrowserTheme();
    GM_setValue("currentTheme", browserTheme);
    
    if (GM_getValue('followTheme', true) === true) {
        if (browserTheme !== getForumTheme()) {
            switchTheme();
        }
    }
}

export function useThemeSync() {
    useEffect(() => {
        syncTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => syncTheme();
        mediaQuery.addEventListener('change', listener);

        return () => mediaQuery.removeEventListener('change', listener);
    }, []);
}

export default function Theme() {
    useThemeSync();
    return null;
}