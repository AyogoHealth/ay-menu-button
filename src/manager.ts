/*! Copyright 2016 Ayogo Health Inc. */

export class MenuManager {
    private static curMenu : HTMLMenuElement | null             = null;
    private static curButton : HTMLButtonElement | null         = null;
    private static isOpen : boolean                             = false;
    private static focusCount : number | null                   = null;
    private static transitionEndHandler : (() => void) | null   = null;


    static get open() {
        return this.isOpen;
    }

    static openMenu(btn : HTMLButtonElement, mnu : HTMLMenuElement, focus : boolean = false) {
        if (this.transitionEndHandler !== null) {
            this.transitionEndHandler!();
        }

        this.curButton = btn;
        this.curMenu = mnu;
        this.isOpen = true;

        this.curButton.setAttribute('aria-expanded', 'true');
        this.curButton.ownerDocument.documentElement.addEventListener('click', this.clickListener);
        this.curButton.addEventListener('blur', this.handleBlur);

        // Before we open the menu, we need to move it in the DOM so that is
        // is directly after the button element for tab ordering
        this.curButton.parentNode!.insertBefore(this.curMenu, this.curButton.nextSibling);

        this.addMenuStyle();

        if (focus) {
            this.focusMenu();
        }

        this.curMenu.addEventListener('keydown', this.menuKeypressListener);
        this.curMenu.addEventListener('focusout', this.handleBlur);
        this.curMenu.addEventListener('click', this.menuClickListener);
    }


    static closeMenu() {
        if (!this.isOpen || !this.curButton || !this.curMenu) {
            return;
        }

        this.curButton.ownerDocument.documentElement.removeEventListener('click', this.clickListener);
        this.curButton.removeEventListener('blur', this.handleBlur);
        this.curButton.setAttribute('aria-expanded', 'false');

        this.curMenu.removeEventListener('keydown', this.menuKeypressListener);
        this.curMenu.removeEventListener('focusout', this.handleBlur);
        this.curMenu.removeEventListener('click', this.menuClickListener);

        let oldMenu = this.curMenu;
        this.transitionEndHandler = () => {
            oldMenu.removeAttribute('style');
            oldMenu.removeEventListener('transitionend', this.transitionEndHandler!);
            oldMenu.removeEventListener('webkittransitionend', this.transitionEndHandler!);
            this.transitionEndHandler = null;
        };

        if ('transitionDuration' in oldMenu.style) {
            oldMenu.style.transitionDuration = '192ms';
        } else {
            oldMenu.style.webkitTransitionDuration = '192ms';
        }

        if ('transform' in oldMenu.style) {
            oldMenu.style.transform = 'scaleY(0)';
        } else {
            oldMenu.style.webkitTransform = 'scaleY(0)';
        }

        oldMenu.addEventListener('transitionend', this.transitionEndHandler!);
        oldMenu.addEventListener('webkittransitionend', this.transitionEndHandler!);

        this.isOpen = false;
        this.curButton = null;
        this.curMenu = null;
        this.focusCount = null;
    }


    static toggleMenu(btn : HTMLButtonElement, mnu : HTMLMenuElement) {
        let openMnu = this.curMenu;

        if (this.isOpen && btn === this.curButton) {
            this.closeMenu();
        }

        if (openMnu !== mnu) {
            this.openMenu(btn, mnu);
        }
    }


    static focusMenu() {
        if (!this.curMenu) {
            return;
        }

        if (this.focusCount === null) {
            this.focusCount = 0;
        }

        let length = this.curMenu.children.length;

        if (this.focusCount < 0) {
            this.focusCount += length;
        }

        let mi = this.curMenu.children[this.focusCount % length] as HTMLElement;
        mi.focus();
    }


    private static clickMenuItem() {
        if (!this.curMenu) {
            return;
        }

        let length = this.curMenu.children.length;
        let mi = this.curMenu.children[this.focusCount % length] as HTMLElement;

        if (!mi.hasAttribute('disabled')) {
            mi.click();
        }
    }


    private static addMenuStyle() {
        if (!this.curMenu || !this.curButton) {
            return;
        }

        let menu = this.curMenu!;
        let btn = this.curButton!;

        // Add the menu to the DOM for measuring
        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('data-owner', 'button');

        // Try to unset the type so Firefox can make it visible :'(
        menu.setAttribute('type', '');

        // Ensure the children are focusable
        for (let i = 0; i < menu.children.length; i++) {
            menu.children[i].setAttribute('tabindex', '-1');
            menu.children[i].setAttribute('role', 'menuitem');

            menu.children[i].setAttribute('aria-disabled', menu.children[i].hasAttribute('disabled').toString());
        }

        requestAnimationFrame(() => {
            let btnSize = btn.getBoundingClientRect();
            let menuSize = menu.getBoundingClientRect();
            let wndHeight = window.innerHeight;

            if (btnSize.bottom + menuSize.height > wndHeight) {
                menu.style.bottom = btnSize.top + 'px';
            } else {
                menu.style.top = btnSize.bottom + 'px';
            }

            if (menuSize.width > btnSize.right) {
                menu.style.left = btnSize.left + 'px';
            } else {
                menu.style.left = (btnSize.right - menuSize.width) + 'px';
            }

            if ('transform' in menu.style) {
                menu.style.transform = 'scaleY(1)';
            } else {
                menu.style.webkitTransform = 'scaleY(1)';
            }
        });
    }


    private static clickListener(e : MouseEvent) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }

        if (MenuManager.curMenu.contains(e.target as Node)) {
            return;
        }

        if (MenuManager.curButton.contains(e.target as Node)) {
            return;
        }

        MenuManager.closeMenu();
    }


    private static menuClickListener(e : MouseEvent) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }

        let mi = e.target as HTMLElement;

        if (!MenuManager.curMenu.contains(mi)) {
            return;
        }

        if (mi.hasAttribute('disabled')) {
            return;
        }

        MenuManager.closeMenu();
    }


    private static handleBlur(e : FocusEvent) {
        if (!MenuManager.curButton) {
            return;
        }

        // Element that focus is moving to
        let activeEl = e.relatedTarget as HTMLElement | null;

        if (!activeEl) {
            return;
        }

        if (MenuManager.curButton === activeEl) {
            return;
        }

        if (MenuManager.curMenu && MenuManager.curMenu.contains(activeEl)) {
            return;
        }

        // Wait until after focus has moved before closing the menu
        setTimeout(() => {
            if (MenuManager.isOpen) {
                MenuManager.closeMenu();
            }
        }, 0);
    }


    private static menuKeypressListener(e : KeyboardEvent) {
        if (!MenuManager.isOpen) {
            return;
        }

        // Escape
        if (e.keyCode === 27) {
            MenuManager.closeMenu();
        }

        // Up Arrow
        if (e.keyCode === 38) {
            MenuManager.focusCount--;
            MenuManager.focusMenu();
        }

        // Down Arrow
        if (e.keyCode === 40) {
            MenuManager.focusCount++;
            MenuManager.focusMenu();
        }


        // Enter and Spacebar
        if (e.keyCode === 32 || e.keyCode === 13) {
            MenuManager.clickMenuItem();
        }
    }
}
