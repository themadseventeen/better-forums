import React from 'react';
import ReactDOM from 'react-dom/client';
import PostMarker from './postMarker'
import Theme, { calculateColors } from './theme';
import Tweaks from './tweaks';

import css from './index.css?inline';
import { GM_addStyle } from '$';
import NavSettings from './navSettings';
GM_addStyle(css);

console.log("Loaded!");

calculateColors();

ReactDOM.createRoot(
    (() => {
        const app = document.createElement('div');
        document.body.append(app);
        return app;
    })(),
).render(
    <React.StrictMode>
        <PostMarker />
        <Theme />
        <Tweaks />
        <NavSettings />
    </React.StrictMode>,
);
