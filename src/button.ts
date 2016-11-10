/*! Copyright 2016 Ayogo Health Inc. */

import { MenuManager } from './manager';

export class MenuButtonBehaviour {
    private el: HTMLButtonElement;
    private menu : HTMLMenuElement;

    constructor(btn : HTMLButtonElement) {
        this.el = btn;

        let menuID = this.el.getAttribute('menu');
        if (!menuID) {
            return;
        }

        let menu = btn.ownerDocument.getElementById(menuID) as HTMLMenuElement;
        if (!menu) {
            return;
        }

        this.menu = menu;

        this.el.setAttribute('aria-haspopup', 'true');
        this.el.setAttribute('aria-expanded', 'false');

        this.el.addEventListener('click', () => {
            MenuManager.toggleMenu(this.el, this.menu);
        });

        this.el.addEventListener('keydown', (e : KeyboardEvent) => {
            this.buttonKeypressListener(e);
        });
    }


    private buttonKeypressListener(e : KeyboardEvent) {
        // Escape
        if (MenuManager.open && e.keyCode == 27) {
            MenuManager.closeMenu();
        }

        // DOWN ARROW
        if (e.keyCode == 40) {
            if (!MenuManager.open) {
                MenuManager.openMenu(this.el, this.menu, true);
            } else {
                MenuManager.focusMenu();
            }
        }
    }
}
