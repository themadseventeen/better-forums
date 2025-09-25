import ReactDOM from "react-dom";
import { SettingsButton } from "./settings";

export default function NavSettings() {
    const nav = document.querySelector('[role="navigation"] ul');
    return nav ? ReactDOM.createPortal(<li><SettingsButton /></li>, nav) : null;
}