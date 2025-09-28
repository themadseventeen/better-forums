import React from 'react';
import ReactDOM from 'react-dom/client';
import PostMarker from './postMarker'
import Theme, { calculateColors } from './theme';
import Tweaks from './tweaks';

import css from './index.css?inline';
import { GM_addStyle } from '$';
import NavSettings from './navSettings';
GM_addStyle(css);
GM_addStyle(`
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=open_in_new');
`);

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
