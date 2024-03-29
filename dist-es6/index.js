/*! Copyright 2016 - 2023 Ayogo Health Inc. */
import { MenuManager } from './manager';
import { MenuButtonBehaviour } from './button';
const MENU_STYLES = `
menu[type="context"]:not([popover]),
menu[data-owner="button"]:not([popover]) {
    display: none;
}

menu[type="context"],
menu[data-owner="button"] {
    padding: 0.125em;
    margin: 0;
    border: 1px solid;
    background: Menu;
    will-change: transform;
    transform-origin: top center;
    transition: transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

menu[type="context"][data-dir="up"]:not([popover]),
menu[data-owner="button"][data-dir="up"]:not([popover]) {
    transform-origin: bottom center;
}

menuitem {
    display: list-item;
    list-style-type: none;
    background: Menu;
    font: menu;
    padding: 0.25em 0.5em;
    cursor: default;
}

menuitem::after {
    content: attr(label);
}

menuitem[disabled] {
    color: GrayText;
}

menuitem:not([disabled]):hover,
menuitem:not([disabled]):focus {
    background: Highlight;
    color: HighlightText;
}

button[type="menu"]::after,
button[data-type="menu"]:after { content: ' ▾'; }

button[type="menu"]:empty::after,
button[data-type="menu"]:empty:after { content: '▾'; } /* No space character */

button[type="menu"][data-dir="up"]::after,
button[data-type="menu"][data-dir="up"]:after { content: ' ▴'; }

button[type="menu"][data-dir="up"]:empty::after,
button[data-type="menu"][data-dir="up"]:empty:after { content: '▴'; } /* No space character */
`;
const PREFIX_STYLES = `
menu[type="context"],
menu[data-owner="button"] {
    -webkit-transform-origin: top center;
    -webkit-transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
    transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

menu[type="context"][data-dir="up"]:not([popover]),
menu[data-owner="button"][data-dir="up"]:not([popover]) {
    -webkit-transform-origin: bottom center;
}
`;
let mnuStyle = document.createElement('style');
mnuStyle.appendChild(document.createTextNode(MENU_STYLES));
if (!('transform' in document.createElement('div').style)) {
    mnuStyle.appendChild(document.createTextNode(PREFIX_STYLES));
}
let insertPoint;
if (insertPoint = document.querySelector('link')) {
    insertPoint.parentNode.insertBefore(mnuStyle, insertPoint);
}
else if (insertPoint = document.querySelector('style')) {
    insertPoint.parentNode.insertBefore(mnuStyle, insertPoint);
}
else if (insertPoint = document.querySelector('head')) {
    insertPoint.appendChild(mnuStyle);
}
else {
    document.appendChild(mnuStyle);
}
let gcCache = null;
if ('WeakMap' in window) {
    gcCache = new WeakMap();
}
export default function MenuButton(el) {
    if (!el.hasAttribute('menu')) {
        throw new Error('Cannot construct a menu button without a menu attribute');
    }
    const menu = document.getElementById(el.getAttribute('menu'));
    if (!menu) {
        throw new Error(`Could not find menu element #${el.getAttribute('menu')} for button`);
    }
    if (MenuManager.usePopover) {
        menu.setAttribute('popover', 'manual');
    }
    let behaviour = new MenuButtonBehaviour(el);
    if (gcCache) {
        gcCache.set(el, behaviour);
    }
    return behaviour;
}
//# sourceMappingURL=index.js.map