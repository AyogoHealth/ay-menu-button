/*! Copyright 2016 Ayogo Health Inc. */


import { MenuButtonBehaviour } from './button';

const MENU_STYLES = `
menu[type="context"],
menu[data-owner="button"] {
    display: none;
    padding: 0;
    margin: 0;
    border: 1px solid;
    will-change: transform;
    transform: scaleY(0);
    transform-origin: top center;
    transition: transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
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
`;


const PREFIX_STYLES = `
menu[type="context"],
menu[data-owner="button"] {
    -webkit-transform: scaleY(0);
    -webkit-transform-origin: top center;
    -webkit-transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
    transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
`


// Inject default styling

let mnuStyle = document.createElement('style');
mnuStyle.appendChild(document.createTextNode(MENU_STYLES));

// Add old prefixed styles for older iOS and Android devices
if (!('transform' in document.createElement('div').style)) {
    mnuStyle.appendChild(document.createTextNode(PREFIX_STYLES));
}


let insertPoint : HTMLElement | null;
if (insertPoint = document.querySelector('link')) {
    insertPoint.parentNode.insertBefore(mnuStyle, insertPoint);
} else
if (insertPoint = document.querySelector('style')) {
    insertPoint.parentNode.insertBefore(mnuStyle, insertPoint);
} else
if (insertPoint = document.querySelector('head')) {
    insertPoint.appendChild(mnuStyle);
} else {
    document.appendChild(mnuStyle);
}

export default MenuButtonBehaviour;
