/*! Copyright 2016 Ayogo Health Inc. */
export class MenuManager {
    static get open() {
        return this.isOpen;
    }
    static openMenu(btn, mnu, focus = false) {
        if (this.transitionEndHandler !== null) {
            this.transitionEndHandler();
        }
        this.curButton = btn;
        this.curMenu = mnu;
        this.isOpen = true;
        this.curButton.setAttribute('aria-expanded', 'true');
        this.curButton.ownerDocument.documentElement.addEventListener('click', this.clickListener);
        this.curButton.addEventListener('blur', this.handleBlur);
        this.curButton.parentNode.insertBefore(this.curMenu, this.curButton.nextSibling);
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
            oldMenu.removeEventListener('transitionend', this.transitionEndHandler);
            oldMenu.removeEventListener('webkittransitionend', this.transitionEndHandler);
            this.transitionEndHandler = null;
        };
        if ('transitionDuration' in oldMenu.style) {
            oldMenu.style.transitionDuration = '192ms';
        }
        else {
            oldMenu.style.webkitTransitionDuration = '192ms';
        }
        if ('transform' in oldMenu.style) {
            oldMenu.style.transform = 'scaleY(0)';
        }
        else {
            oldMenu.style.webkitTransform = 'scaleY(0)';
        }
        oldMenu.addEventListener('transitionend', this.transitionEndHandler);
        oldMenu.addEventListener('webkittransitionend', this.transitionEndHandler);
        this.isOpen = false;
        this.curButton = null;
        this.curMenu = null;
        this.focusCount = null;
    }
    static toggleMenu(btn, mnu) {
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
        let mi = this.curMenu.children[this.focusCount % length];
        mi.focus();
    }
    static clickMenuItem() {
        if (!this.curMenu) {
            return;
        }
        let length = this.curMenu.children.length;
        let mi = this.curMenu.children[this.focusCount % length];
        if (!mi.hasAttribute('disabled')) {
            mi.click();
        }
    }
    static addMenuStyle() {
        if (!this.curMenu || !this.curButton) {
            return;
        }
        let menu = this.curMenu;
        let btn = this.curButton;
        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('data-owner', 'button');
        menu.setAttribute('type', '');
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
            }
            else {
                menu.style.top = btnSize.bottom + 'px';
            }
            if (menuSize.width > btnSize.right) {
                menu.style.left = btnSize.left + 'px';
            }
            else {
                menu.style.left = (btnSize.right - menuSize.width) + 'px';
            }
            if ('transform' in menu.style) {
                menu.style.transform = 'scaleY(1)';
            }
            else {
                menu.style.webkitTransform = 'scaleY(1)';
            }
        });
    }
    static clickListener(e) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }
        if (MenuManager.curMenu.contains(e.target)) {
            return;
        }
        if (MenuManager.curButton.contains(e.target)) {
            return;
        }
        MenuManager.curButton.focus();
        MenuManager.closeMenu();
    }
    static menuClickListener(e) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }
        let mi = e.target;
        if (!MenuManager.curMenu.contains(mi)) {
            return;
        }
        if (mi.hasAttribute('disabled')) {
            return;
        }
        MenuManager.curButton.focus();
        MenuManager.closeMenu();
    }
    static handleBlur(e) {
        if (!MenuManager.curButton) {
            return;
        }
        let activeEl = e.relatedTarget;
        if (!activeEl) {
            return;
        }
        if (MenuManager.curButton === activeEl) {
            return;
        }
        if (MenuManager.curMenu && MenuManager.curMenu.contains(activeEl)) {
            return;
        }
        setTimeout(() => {
            if (MenuManager.isOpen) {
                MenuManager.closeMenu();
            }
        }, 0);
    }
    static menuKeypressListener(e) {
        if (!MenuManager.isOpen) {
            return;
        }
        if (e.keyCode === 27) {
            if (MenuManager.curButton) {
                MenuManager.curButton.focus();
            }
            MenuManager.closeMenu();
        }
        if (e.keyCode === 38) {
            e.preventDefault();
            e.stopPropagation();
            MenuManager.focusCount--;
            MenuManager.focusMenu();
        }
        if (e.keyCode === 40) {
            e.preventDefault();
            e.stopPropagation();
            MenuManager.focusCount++;
            MenuManager.focusMenu();
        }
        if (e.keyCode === 32 || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            MenuManager.clickMenuItem();
        }
    }
}
MenuManager.curMenu = null;
MenuManager.curButton = null;
MenuManager.isOpen = false;
MenuManager.focusCount = null;
MenuManager.transitionEndHandler = null;
//# sourceMappingURL=manager.js.map