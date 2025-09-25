import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { GM_getValue, GM_setValue, GM_addValueChangeListener, GM_removeValueChangeListener } from '$';
import { calculateColors, defaultColors, syncTheme } from "./theme";
import { removePlayButton } from "./tweaks";

function SettingsForm() {
    const [darkMode, setDarkMode] = useState(false);
    const [removeButton, setRemoveButton] = useState(() => GM_getValue("removeButton", false));
    const [theme, setTheme] = useState(() => GM_getValue("currentTheme", "dark"));

    const [mainLight, setMainLight] = useState(() => GM_getValue("mainColorLight"));
    const [mainDark, setMainDark] = useState(() => GM_getValue("mainColorDark"));
    const [replyLight, setReplyLight] = useState(() => GM_getValue("replyColorLight"));
    const [replyDark, setReplyDark] = useState(() => GM_getValue("replyColorDark"));

    const [statshark, setStatshark] = useState(() => GM_getValue("statshark", false));

    useEffect(() => {
        setDarkMode(GM_getValue("followTheme", false));
    }, []);

    useEffect(() => {
        const listenerId = GM_addValueChangeListener(
            "currentTheme",
            (_name, _oldValue, newValue) => {
                setTheme(newValue);
            }
        );
        return () => GM_removeValueChangeListener(listenerId);
    }, []);

    const save = () => {
        GM_setValue("followTheme", darkMode);
        syncTheme();

        GM_setValue("removeButton", removeButton);
        removePlayButton();

        GM_setValue("mainColorLight", mainLight);
        GM_setValue("mainColorDark", mainDark);
        GM_setValue("replyColorLight", replyLight);
        GM_setValue("replyColorDark", replyDark);
        calculateColors();

        GM_setValue("statshark", statshark);
    };

    const resetColors = () => {
        defaultColors();
        calculateColors();
        setMainLight(GM_getValue("mainColorLight"));
        setMainDark(GM_getValue("mainColorDark"));
        setReplyLight(GM_getValue("replyColorLight"));
        setReplyDark(GM_getValue("replyColorDark"));
    }

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: theme === "dark" ? "rgba(29, 38, 42, 1)" : "#fff",
                color: theme === "dark" ? "#CFD8DC" : "#3D3D3D",
                padding: "16px",
                gap: "12px",
            }}
            className={theme}
        >
            <h2>User Settings</h2>

            <label>
                <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={e => setDarkMode(e.target.checked)}
                />{" "}
                Sync Theme
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={removeButton}
                    onChange={e => setRemoveButton(e.target.checked)}
                />{" "}
                Remove "PLAY" button
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={statshark}
                    onChange={e => setStatshark(e.target.checked)}
                />{" "}
                Add a link to Statshark to every post
            </label>


            <label>
                <input
                    type="color"
                    value={mainLight}
                    id="baseColorDark"
                    onChange={e => setMainLight(e.target.value)}
                />{" "}
                Your posts light color
            </label>
            <label>
                <input
                    type="color"
                    value={mainDark}
                    id="replyColorLight"
                    onChange={e => setMainDark(e.target.value)}
                />{" "}
                Your posts dark color
            </label>
            <label>
                <input
                    type="color"
                    value={replyLight}
                    id="replyColorDark"
                    onChange={e => setReplyLight(e.target.value)}
                />{" "}
                Replies/mentions/quotes light color
            </label>
            <label>
                <input
                    type="color"
                    value={replyDark}
                    id="replyColorDark"
                    onChange={e => setReplyDark(e.target.value)}
                />{" "}
                Replies/mentions/quotes dark color
            </label>
            <button
                style={{
                    backgroundColor: theme === "dark" ? "#b30000" : "#ff5454",
                    color: theme === "dark" ? "#b9b9b9ff" : "#383838",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                }}
                onClick={resetColors}
            >
                Reset colors
            </button>
            <button
                style={{
                    backgroundColor: theme === "dark" ? "#546E7A" : "#e9e9e9",
                    color: theme === "dark" ? "#CFD8DC" : "#3D3D3D",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                }}
                onClick={save}
            >
                Save
            </button>
        </div>
    );
}

export function SettingsButton() {
    let settingsPopup: Window | null = null;

    const openPopup = () => {
        if (settingsPopup && !settingsPopup.closed) {
            settingsPopup.focus();
            return;
        }

        settingsPopup = window.open(
            "",
            "userscript-settings",
            "width=360,height=400,resizable=yes,scrollbars=yes"
        );

        if (!settingsPopup) return;

        settingsPopup.document.title = "Settings";
        settingsPopup.document.body.style.margin = "0";

        const container = settingsPopup.document.createElement("div");
        settingsPopup.document.body.appendChild(container);

        ReactDOM.createRoot(container).render(<SettingsForm />);
    };

    return (
        <button
            className="icon btn-flat"
            onClick={openPopup}
            aria-label="Settings"
            style={{
                background: "none",
                border: "none",
                display: "inline-block",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="fa d-icon d-icon-search svg-icon svg-node"
            >
                <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.07 7.07 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.07 7.07 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.09.73 1.69.98l.38 2.65A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .49-.42l.38-2.65c.6-.25 1.17-.58 1.69-.98l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
            </svg>
        </button>
    );
}