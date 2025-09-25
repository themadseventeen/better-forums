import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { SettingsButton } from './settings';

export default function NavSettings() {
  const [nav, setNav] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Try to find nav initially
    const navEl = document.querySelector<HTMLElement>('[role="navigation"] ul');
    if (navEl) setNav(navEl);

    // Observe the DOM for nav changes
    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>('[role="navigation"] ul');
      if (el && el !== nav) {
        setNav(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [nav]);

  if (!nav) return null;

  return ReactDOM.createPortal(<li><SettingsButton /></li>, nav);
}