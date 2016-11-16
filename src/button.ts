/*! Copyright 2016 Ayogo Health Inc. */

import { MenuManager } from './manager';

export class MenuButtonBehaviour {
    private el: null | HTMLButtonElement;
    private menu : null | HTMLMenuElement;

    private clickHandler : null | (() => void);
    private keyHandler : null | ((e : KeyboardEvent) => void);
    private resizeHandler : null | (() => void);

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

        this.clickHandler = () => {
            MenuManager.toggleMenu(this.el!, this.menu!);
        };

        this.keyHandler = (e : KeyboardEvent) => {
            this.buttonKeypressListener(e);
        };

        this.resizeHandler = () => {
            MenuManager.closeMenu();
        };

        this.el.addEventListener('click', this.clickHandler!);
        this.el.addEventListener('keydown', this.keyHandler!);
        window.addEventListener('resize', this.resizeHandler!);
    }


    // Cleanup function
    destroy() {
        if (this.el) {
            this.el.removeEventListener('click', this.clickHandler!);
            this.el.removeEventListener('keydown', this.keyHandler!);
            window.removeEventListener('resize', this.resizeHandler!);
        }

        this.clickHandler = null;
        this.keyHandler = null;
        this.resizeHandler = null;
        this.menu = null;
        this.el = null;
    }


    private buttonKeypressListener(e : KeyboardEvent) {
        // Escape
        if (MenuManager.open && e.keyCode == 27) {
            MenuManager.closeMenu();
        }

        // DOWN ARROW
        if (e.keyCode == 40) {
            if (!MenuManager.open) {
                MenuManager.openMenu(this.el!, this.menu!, true);
            } else {
                MenuManager.focusMenu();
            }
        }
    }
}
