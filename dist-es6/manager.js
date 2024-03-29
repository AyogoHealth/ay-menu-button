/*! Copyright 2016 - 2023 Ayogo Health Inc. */
export class MenuManager {
    static get open() {
        return this.isOpen;
    }
    static get usePopover() {
        if (this.supportsPopover === null) {
            this.supportsPopover = HTMLElement.prototype.hasOwnProperty('popover');
        }
        return this.supportsPopover;
    }
    static openMenu(btn, focus = false) {
        if (this.transitionEndHandler !== null) {
            this.transitionEndHandler();
        }
        let mnuID = btn.getAttribute('menu');
        if (!mnuID) {
            return;
        }
        let mnu = btn.ownerDocument.getElementById(mnuID);
        if (!mnu) {
            return;
        }
        this.curButton = btn;
        this.curMenu = mnu;
        this.isOpen = true;
        this.curButton.setAttribute('aria-expanded', 'true');
        this.curButton.ownerDocument.documentElement.addEventListener('click', this.clickListener);
        this.curButton.addEventListener('blur', this.handleBlur);
        if (this.usePopover) {
            this.curMenu.showPopover();
        }
        else {
            this.curButton.parentNode.insertBefore(this.curMenu, this.curButton.nextSibling);
        }
        let offset = this.getScrollOffset();
        this.addMenuStyle();
        this.scrollJack = this.blockScrolling(offset);
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
        this.curButton.setAttribute('data-dir', 'down');
        this.curMenu.removeEventListener('keydown', this.menuKeypressListener);
        this.curMenu.removeEventListener('focusout', this.handleBlur);
        this.curMenu.removeEventListener('click', this.menuClickListener);
        if (this.scrollJack) {
            this.scrollJack();
        }
        let oldMenu = this.curMenu;
        this.transitionEndHandler = () => {
            if (this.usePopover) {
                oldMenu.hidePopover();
            }
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
    static toggleMenu(btn) {
        let openMnu = this.curMenu;
        if (this.isOpen) {
            this.closeMenu();
        }
        if (!openMnu || openMnu.getAttribute('id') !== btn.getAttribute('menu')) {
            this.openMenu(btn);
        }
    }
    static focusMenu(offset = 1) {
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
        const role = mi.getAttribute('role');
        if (role === 'presentation' || role === 'separator' || role === 'none') {
            this.focusCount += offset;
            this.focusMenu(offset);
        }
        else {
            mi.focus();
        }
    }
    static clickMenuItem() {
        if (!this.curMenu) {
            return;
        }
        let length = this.curMenu.children.length;
        let mi = this.curMenu.children[(this.focusCount || 0) % length];
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
        let btnSize = btn.getBoundingClientRect();
        if (!this.usePopover) {
            menu.style.display = 'block';
            menu.style.position = 'fixed';
        }
        menu.setAttribute('role', 'menu');
        menu.setAttribute('data-owner', 'button');
        menu.setAttribute('type', '');
        for (let i = 0; i < menu.children.length; i++) {
            if (menu.children[i].tagName === 'HR') {
                menu.children[i].setAttribute('role', 'separator');
            }
            if (menu.children[i].hasAttribute('role') && menu.children[i].getAttribute('role') !== 'menuitem') {
                continue;
            }
            menu.children[i].setAttribute('tabindex', '-1');
            menu.children[i].setAttribute('role', 'menuitem');
            menu.children[i].setAttribute('aria-disabled', menu.children[i].hasAttribute('disabled').toString());
        }
        requestAnimationFrame(() => {
            let menuSize = menu.getBoundingClientRect();
            let wndHeight = window.innerHeight;
            if (btnSize.bottom + menuSize.height > wndHeight) {
                menu.style.top = (btnSize.top - menuSize.height) + 'px';
                btn.setAttribute('data-dir', 'up');
                menu.setAttribute('data-dir', 'up');
            }
            else {
                menu.style.top = btnSize.bottom + 'px';
                btn.setAttribute('data-dir', 'down');
                menu.setAttribute('data-dir', 'down');
            }
            if (menuSize.width > btnSize.right) {
                menu.style.left = btnSize.left + 'px';
            }
            else {
                menu.style.left = (btnSize.right - menuSize.width) + 'px';
            }
            if ('transform' in menu.style) {
                menu.style.transform = 'scaleY(0)';
                requestAnimationFrame(() => {
                    menu.style.transform = 'scaleY(1)';
                });
            }
            else {
                menu.style.webkitTransform = 'scaleY(0)';
                requestAnimationFrame(() => {
                    menu.style.webkitTransform = 'scaleY(1)';
                });
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
            if (MenuManager.focusCount !== null) {
                MenuManager.focusCount--;
            }
            MenuManager.focusMenu(-1);
        }
        if (e.keyCode === 40) {
            e.preventDefault();
            e.stopPropagation();
            if (MenuManager.focusCount !== null) {
                MenuManager.focusCount++;
            }
            MenuManager.focusMenu(1);
        }
        if (e.keyCode === 32 || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            MenuManager.clickMenuItem();
        }
    }
    static getScrollOffset() {
        let doc = this.curButton.ownerDocument;
        if (doc.body.style.top) {
            return Math.abs(parseInt(doc.body.style.top, 10));
        }
        if (doc.scrollingElement) {
            return doc.scrollingElement.scrollTop;
        }
        else {
            return doc.documentElement.scrollTop + doc.body.scrollTop;
        }
    }
    static blockScrolling(offset) {
        let doc = this.curButton.ownerDocument;
        let htmlNode = doc.documentElement;
        let clientWidth = doc.body.clientWidth;
        if (doc.body.scrollHeight > htmlNode.clientHeight) {
            doc.body.style.position = 'fixed';
            doc.body.style.left = '0';
            doc.body.style.right = '0';
            doc.body.style.top = -offset + 'px';
            htmlNode.style.minHeight = '100vh';
            htmlNode.style.overflowY = 'scroll';
        }
        if (doc.body.clientWidth < clientWidth) {
            doc.body.style.overflow = 'hidden';
        }
        let scrollables = [];
        let currentEl = this.curButton.parentNode;
        while (currentEl && currentEl !== doc.body) {
            let overflow = getComputedStyle(currentEl, null).getPropertyValue('overflow');
            if (overflow.indexOf('scroll') !== -1 || overflow.indexOf('auto') !== -1) {
                scrollables.push(currentEl);
                currentEl.style.overflow = 'hidden';
            }
            currentEl = currentEl.parentNode;
        }
        return function () {
            doc.body.style.removeProperty('position');
            doc.body.style.removeProperty('left');
            doc.body.style.removeProperty('right');
            doc.body.style.removeProperty('top');
            doc.body.style.removeProperty('overflow');
            htmlNode.style.removeProperty('overflow-y');
            htmlNode.style.removeProperty('min-height');
            scrollables.forEach(function (el) {
                el.style.removeProperty('overflow');
            });
            if (doc.scrollingElement) {
                doc.scrollingElement.scrollTop = offset;
            }
            else {
                scrollTo(0, offset);
            }
        };
    }
}
MenuManager.supportsPopover = null;
MenuManager.curMenu = null;
MenuManager.curButton = null;
MenuManager.isOpen = false;
MenuManager.focusCount = null;
MenuManager.transitionEndHandler = null;
MenuManager.scrollJack = null;
//# sourceMappingURL=manager.js.map