import { useEffect } from 'react';
import { GM_deleteValue, GM_deleteValues, GM_getValue, GM_setValue } from '$';

function lightenDarkenColor(hex: string, amount: number) {
    let col = parseInt(hex.slice(1), 16);
    let r = (col >> 16) + amount;
    let g = ((col >> 8) & 0x00FF) + amount;
    let b = (col & 0x0000FF) + amount;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function defaultColors() {
    GM_deleteValues(["mainColorLight", "mainColorDark", "replyColorLight", "replyColorDark", "mainBorderLight", "mainBorderDark", "replyBorderLight", "replyBorderDark"]);
}

export function calculateColors() {
    const mainColorLight = GM_getValue("mainColorLight", "#bff5a4");
    const mainColorDark = GM_getValue("mainColorDark", "#005e40");
    const replyColorLight = GM_getValue("replyColorLight", "#ffbe7e");
    const replyColorDark = GM_getValue("replyColorDark", "#633e1a");

    const mainBorderLight = lightenDarkenColor(mainColorLight, -20);
    const mainBorderDark = lightenDarkenColor(mainColorDark, 20);

    const replyBorderLight = lightenDarkenColor(replyColorLight, -20);
    const replyBorderDark = lightenDarkenColor(replyColorDark, 20);

    GM_setValue("mainColorLight", mainColorLight);
    GM_setValue("mainColorDark", mainColorDark);
    GM_setValue("mainBorderLight", mainBorderLight);
    GM_setValue("mainBorderDark", mainBorderDark);
    GM_setValue("replyColorLight", replyColorLight);
    GM_setValue("replyColorDark", replyColorDark);
    GM_setValue("replyBorderLight", replyBorderLight);
    GM_setValue("replyBorderDark", replyBorderDark);

    const theme = getForumTheme();

    var r: any = document.querySelector(':root');
    if (theme === "light") {
        r.style.setProperty('--mainColor', mainColorLight);
        r.style.setProperty('--replyColor', replyColorLight);
        r.style.setProperty('--mainBorder', mainBorderLight);
        r.style.setProperty('--replyBorder', replyBorderLight);
    }
    else {
        r.style.setProperty('--mainColor', mainColorDark);
        r.style.setProperty('--replyColor', replyColorDark);
        r.style.setProperty('--mainBorder', mainBorderDark);
        r.style.setProperty('--replyBorder', replyBorderDark);
    }
}

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
    const followTheme: Boolean = GM_getValue("followTheme", false);
    if (!followTheme) return;
    const browserTheme = getBrowserTheme();
    GM_setValue("currentTheme", browserTheme);

    if (GM_getValue('followTheme', true) === true) {
        if (browserTheme !== getForumTheme()) {
            switchTheme();
        }
    }
    calculateColors();
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