/*! Copyright 2016 Ayogo Health Inc. */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.MenuButton = factory());
}(this, (function () { 'use strict';

var MenuManager = (function () {
    function MenuManager() {
    }
    Object.defineProperty(MenuManager, "open", {
        get: function () {
            return this.isOpen;
        },
        enumerable: true,
        configurable: true
    });
    MenuManager.openMenu = function (btn, mnu, focus) {
        if (focus === void 0) { focus = false; }
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
    };
    MenuManager.closeMenu = function () {
        var _this = this;
        if (!this.isOpen || !this.curButton || !this.curMenu) {
            return;
        }
        this.curButton.ownerDocument.documentElement.removeEventListener('click', this.clickListener);
        this.curButton.removeEventListener('blur', this.handleBlur);
        this.curButton.setAttribute('aria-expanded', 'false');
        this.curMenu.removeEventListener('keydown', this.menuKeypressListener);
        this.curMenu.removeEventListener('focusout', this.handleBlur);
        this.curMenu.removeEventListener('click', this.menuClickListener);
        var oldMenu = this.curMenu;
        this.transitionEndHandler = function () {
            oldMenu.removeAttribute('style');
            oldMenu.removeEventListener('transitionend', _this.transitionEndHandler);
            oldMenu.removeEventListener('webkittransitionend', _this.transitionEndHandler);
            _this.transitionEndHandler = null;
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
    };
    MenuManager.toggleMenu = function (btn, mnu) {
        var openMnu = this.curMenu;
        if (this.isOpen && btn === this.curButton) {
            this.closeMenu();
        }
        if (openMnu !== mnu) {
            this.openMenu(btn, mnu);
        }
    };
    MenuManager.focusMenu = function () {
        if (!this.curMenu) {
            return;
        }
        if (this.focusCount === null) {
            this.focusCount = 0;
        }
        var length = this.curMenu.children.length;
        if (this.focusCount < 0) {
            this.focusCount += length;
        }
        var mi = this.curMenu.children[this.focusCount % length];
        mi.focus();
    };
    MenuManager.clickMenuItem = function () {
        if (!this.curMenu) {
            return;
        }
        var length = this.curMenu.children.length;
        var mi = this.curMenu.children[this.focusCount % length];
        if (!mi.hasAttribute('disabled')) {
            mi.click();
        }
    };
    MenuManager.addMenuStyle = function () {
        if (!this.curMenu || !this.curButton) {
            return;
        }
        var menu = this.curMenu;
        var btn = this.curButton;
        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('data-owner', 'button');
        menu.setAttribute('type', '');
        for (var i = 0; i < menu.children.length; i++) {
            menu.children[i].setAttribute('tabindex', '-1');
            menu.children[i].setAttribute('role', 'menuitem');
            menu.children[i].setAttribute('aria-disabled', menu.children[i].hasAttribute('disabled').toString());
        }
        requestAnimationFrame(function () {
            var btnSize = btn.getBoundingClientRect();
            var menuSize = menu.getBoundingClientRect();
            var wndHeight = window.innerHeight;
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
    };
    MenuManager.clickListener = function (e) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }
        if (MenuManager.curMenu.contains(e.target)) {
            return;
        }
        if (MenuManager.curButton.contains(e.target)) {
            return;
        }
        MenuManager.closeMenu();
    };
    MenuManager.menuClickListener = function (e) {
        if (!MenuManager.curButton || !MenuManager.curMenu) {
            return;
        }
        var mi = e.target;
        if (!MenuManager.curMenu.contains(mi)) {
            return;
        }
        if (mi.hasAttribute('disabled')) {
            return;
        }
        MenuManager.closeMenu();
    };
    MenuManager.handleBlur = function (e) {
        if (!MenuManager.curButton) {
            return;
        }
        var activeEl = e.relatedTarget;
        if (!activeEl) {
            return;
        }
        if (MenuManager.curButton === activeEl) {
            return;
        }
        if (MenuManager.curMenu && MenuManager.curMenu.contains(activeEl)) {
            return;
        }
        setTimeout(function () {
            if (MenuManager.isOpen) {
                MenuManager.closeMenu();
            }
        }, 0);
    };
    MenuManager.menuKeypressListener = function (e) {
        if (!MenuManager.isOpen) {
            return;
        }
        if (e.keyCode === 27) {
            MenuManager.closeMenu();
        }
        if (e.keyCode === 38) {
            MenuManager.focusCount--;
            MenuManager.focusMenu();
        }
        if (e.keyCode === 40) {
            MenuManager.focusCount++;
            MenuManager.focusMenu();
        }
        if (e.keyCode === 32 || e.keyCode === 13) {
            MenuManager.clickMenuItem();
        }
    };
    return MenuManager;
}());
MenuManager.curMenu = null;
MenuManager.curButton = null;
MenuManager.isOpen = false;
MenuManager.focusCount = null;
MenuManager.transitionEndHandler = null;

var MenuButtonBehaviour = (function () {
    function MenuButtonBehaviour(btn) {
        var _this = this;
        this.el = btn;
        var menuID = this.el.getAttribute('menu');
        if (!menuID) {
            return;
        }
        var menu = btn.ownerDocument.getElementById(menuID);
        if (!menu) {
            return;
        }
        this.menu = menu;
        this.el.setAttribute('aria-haspopup', 'true');
        this.el.setAttribute('aria-expanded', 'false');
        this.clickHandler = function () {
            MenuManager.toggleMenu(_this.el, _this.menu);
        };
        this.keyHandler = function (e) {
            _this.buttonKeypressListener(e);
        };
        this.resizeHandler = function () {
            MenuManager.closeMenu();
        };
        this.el.addEventListener('click', this.clickHandler);
        this.el.addEventListener('keydown', this.keyHandler);
        window.addEventListener('resize', this.resizeHandler);
    }
    MenuButtonBehaviour.prototype.destroy = function () {
        if (this.el) {
            this.el.removeEventListener('click', this.clickHandler);
            this.el.removeEventListener('keydown', this.keyHandler);
            window.removeEventListener('resize', this.resizeHandler);
        }
        this.clickHandler = null;
        this.keyHandler = null;
        this.resizeHandler = null;
        this.menu = null;
        this.el = null;
    };
    MenuButtonBehaviour.prototype.buttonKeypressListener = function (e) {
        if (MenuManager.open && e.keyCode == 27) {
            MenuManager.closeMenu();
        }
        if (e.keyCode == 40) {
            if (!MenuManager.open) {
                MenuManager.openMenu(this.el, this.menu, true);
            }
            else {
                MenuManager.focusMenu();
            }
        }
    };
    return MenuButtonBehaviour;
}());

var MENU_STYLES = "\nmenu[type=\"context\"],\nmenu[data-owner=\"button\"] {\n    display: none;\n    padding: 0;\n    margin: 0;\n    border: 1px solid;\n    will-change: transform;\n    transform: scaleY(0);\n    transform-origin: top center;\n    transition: transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n}\n\nmenuitem {\n    display: list-item;\n    list-style-type: none;\n    background: Menu;\n    font: menu;\n    padding: 0.25em 0.5em;\n    cursor: default;\n}\n\nmenuitem::after {\n    content: attr(label);\n}\n\nmenuitem[disabled] {\n    color: GrayText;\n}\n\nmenuitem:not([disabled]):hover,\nmenuitem:not([disabled]):focus {\n    background: Highlight;\n    color: HighlightText;\n}\n\nbutton[type=\"menu\"]::after,\nbutton[data-type=\"menu\"]:after { content: ' \u25BE'; }\n\nbutton[type=\"menu\"]:empty::after,\nbutton[data-type=\"menu\"]:empty:after { content: '\u25BE'; } /* No space character */\n";
var PREFIX_STYLES = "\nmenu[type=\"context\"],\nmenu[data-owner=\"button\"] {\n    -webkit-transform: scaleY(0);\n    -webkit-transform-origin: top center;\n    -webkit-transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n    transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n}\n";
var mnuStyle = document.createElement('style');
mnuStyle.appendChild(document.createTextNode(MENU_STYLES));
if (!('transform' in document.createElement('div').style)) {
    mnuStyle.appendChild(document.createTextNode(PREFIX_STYLES));
}
var insertPoint;
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
var gcCache = null;
if ('WeakMap' in window) {
    gcCache = new WeakMap();
}
function MenuButton(el) {
    var behaviour = new MenuButtonBehaviour(el);
    if (gcCache) {
        gcCache.set(el, behaviour);
    }
    return behaviour;
}

return MenuButton;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL3NyYy9tYW5hZ2VyLnRzIiwiLi4vc3JjL2J1dHRvbi50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29weXJpZ2h0IDIwMTYgQXlvZ28gSGVhbHRoIEluYy4gKi9cblxuZXhwb3J0IGNsYXNzIE1lbnVNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBjdXJNZW51IDogSFRNTE1lbnVFbGVtZW50IHwgbnVsbCAgICAgICAgICAgICA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGF0aWMgY3VyQnV0dG9uIDogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsICAgICAgICAgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIGlzT3BlbiA6IGJvb2xlYW4gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzdGF0aWMgZm9jdXNDb3VudCA6IG51bWJlciB8IG51bGwgICAgICAgICAgICAgICAgICAgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIHRyYW5zaXRpb25FbmRIYW5kbGVyIDogKCgpID0+IHZvaWQpIHwgbnVsbCAgID0gbnVsbDtcblxuXG4gICAgc3RhdGljIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc09wZW47XG4gICAgfVxuXG4gICAgc3RhdGljIG9wZW5NZW51KGJ0biA6IEhUTUxCdXR0b25FbGVtZW50LCBtbnUgOiBIVE1MTWVudUVsZW1lbnQsIGZvY3VzIDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJCdXR0b24gPSBidG47XG4gICAgICAgIHRoaXMuY3VyTWVudSA9IG1udTtcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0xpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuaGFuZGxlQmx1cik7XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIG9wZW4gdGhlIG1lbnUsIHdlIG5lZWQgdG8gbW92ZSBpdCBpbiB0aGUgRE9NIHNvIHRoYXQgaXNcbiAgICAgICAgLy8gaXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGJ1dHRvbiBlbGVtZW50IGZvciB0YWIgb3JkZXJpbmdcbiAgICAgICAgdGhpcy5jdXJCdXR0b24ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5jdXJNZW51LCB0aGlzLmN1ckJ1dHRvbi5uZXh0U2libGluZyk7XG5cbiAgICAgICAgdGhpcy5hZGRNZW51U3R5bGUoKTtcblxuICAgICAgICBpZiAoZm9jdXMpIHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNNZW51KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMubWVudUtleXByZXNzTGlzdGVuZXIpO1xuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm1lbnVDbGlja0xpc3RlbmVyKTtcbiAgICB9XG5cblxuICAgIHN0YXRpYyBjbG9zZU1lbnUoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW4gfHwgIXRoaXMuY3VyQnV0dG9uIHx8ICF0aGlzLmN1ck1lbnUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0xpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5tZW51S2V5cHJlc3NMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMubWVudUNsaWNrTGlzdGVuZXIpO1xuXG4gICAgICAgIGxldCBvbGRNZW51ID0gdGhpcy5jdXJNZW51O1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgb2xkTWVudS5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgICAgICAgICBvbGRNZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG4gICAgICAgICAgICBvbGRNZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdHRyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJ3RyYW5zaXRpb25EdXJhdGlvbicgaW4gb2xkTWVudS5zdHlsZSkge1xuICAgICAgICAgICAgb2xkTWVudS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMTkybXMnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2xkTWVudS5zdHlsZS53ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24gPSAnMTkybXMnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd0cmFuc2Zvcm0nIGluIG9sZE1lbnUuc3R5bGUpIHtcbiAgICAgICAgICAgIG9sZE1lbnUuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlWSgwKSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvbGRNZW51LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZVkoMCknO1xuICAgICAgICB9XG5cbiAgICAgICAgb2xkTWVudS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy50cmFuc2l0aW9uRW5kSGFuZGxlciEpO1xuICAgICAgICBvbGRNZW51LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdHRyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG5cbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24gPSBudWxsO1xuICAgICAgICB0aGlzLmN1ck1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLmZvY3VzQ291bnQgPSBudWxsO1xuICAgIH1cblxuXG4gICAgc3RhdGljIHRvZ2dsZU1lbnUoYnRuIDogSFRNTEJ1dHRvbkVsZW1lbnQsIG1udSA6IEhUTUxNZW51RWxlbWVudCkge1xuICAgICAgICBsZXQgb3Blbk1udSA9IHRoaXMuY3VyTWVudTtcblxuICAgICAgICBpZiAodGhpcy5pc09wZW4gJiYgYnRuID09PSB0aGlzLmN1ckJ1dHRvbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcGVuTW51ICE9PSBtbnUpIHtcbiAgICAgICAgICAgIHRoaXMub3Blbk1lbnUoYnRuLCBtbnUpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBzdGF0aWMgZm9jdXNNZW51KCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VyTWVudSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZm9jdXNDb3VudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1c0NvdW50ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmN1ck1lbnUuY2hpbGRyZW4ubGVuZ3RoO1xuXG4gICAgICAgIGlmICh0aGlzLmZvY3VzQ291bnQgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzQ291bnQgKz0gbGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1pID0gdGhpcy5jdXJNZW51LmNoaWxkcmVuW3RoaXMuZm9jdXNDb3VudCAlIGxlbmd0aF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIG1pLmZvY3VzKCk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHN0YXRpYyBjbGlja01lbnVJdGVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VyTWVudSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuY3VyTWVudS5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIGxldCBtaSA9IHRoaXMuY3VyTWVudS5jaGlsZHJlblt0aGlzLmZvY3VzQ291bnQgJSBsZW5ndGhdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGlmICghbWkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICBtaS5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHN0YXRpYyBhZGRNZW51U3R5bGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJNZW51IHx8ICF0aGlzLmN1ckJ1dHRvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLmN1ck1lbnUhO1xuICAgICAgICBsZXQgYnRuID0gdGhpcy5jdXJCdXR0b24hO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgbWVudSB0byB0aGUgRE9NIGZvciBtZWFzdXJpbmdcbiAgICAgICAgbWVudS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgbWVudS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ21lbnUnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3duZXInLCAnYnV0dG9uJyk7XG5cbiAgICAgICAgLy8gVHJ5IHRvIHVuc2V0IHRoZSB0eXBlIHNvIEZpcmVmb3ggY2FuIG1ha2UgaXQgdmlzaWJsZSA6JyhcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnJyk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBjaGlsZHJlbiBhcmUgZm9jdXNhYmxlXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVudS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWVudS5jaGlsZHJlbltpXS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgICBtZW51LmNoaWxkcmVuW2ldLnNldEF0dHJpYnV0ZSgncm9sZScsICdtZW51aXRlbScpO1xuXG4gICAgICAgICAgICBtZW51LmNoaWxkcmVuW2ldLnNldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcsIG1lbnUuY2hpbGRyZW5baV0uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBidG5TaXplID0gYnRuLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgbGV0IG1lbnVTaXplID0gbWVudS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGxldCB3bmRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChidG5TaXplLmJvdHRvbSArIG1lbnVTaXplLmhlaWdodCA+IHduZEhlaWdodCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUuYm90dG9tID0gYnRuU2l6ZS50b3AgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLnRvcCA9IGJ0blNpemUuYm90dG9tICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1lbnVTaXplLndpZHRoID4gYnRuU2l6ZS5yaWdodCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IGJ0blNpemUubGVmdCArICdweCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IChidG5TaXplLnJpZ2h0IC0gbWVudVNpemUud2lkdGgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCd0cmFuc2Zvcm0nIGluIG1lbnUuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZVkoMSknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZVkoMSknO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIGNsaWNrTGlzdGVuZXIoZSA6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKCFNZW51TWFuYWdlci5jdXJCdXR0b24gfHwgIU1lbnVNYW5hZ2VyLmN1ck1lbnUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNZW51TWFuYWdlci5jdXJNZW51LmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWVudU1hbmFnZXIuY3VyQnV0dG9uLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIG1lbnVDbGlja0xpc3RlbmVyKGUgOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICghTWVudU1hbmFnZXIuY3VyQnV0dG9uIHx8ICFNZW51TWFuYWdlci5jdXJNZW51KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWkgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBpZiAoIU1lbnVNYW5hZ2VyLmN1ck1lbnUuY29udGFpbnMobWkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIGhhbmRsZUJsdXIoZSA6IEZvY3VzRXZlbnQpIHtcbiAgICAgICAgaWYgKCFNZW51TWFuYWdlci5jdXJCdXR0b24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVsZW1lbnQgdGhhdCBmb2N1cyBpcyBtb3ZpbmcgdG9cbiAgICAgICAgbGV0IGFjdGl2ZUVsID0gZS5yZWxhdGVkVGFyZ2V0IGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoIWFjdGl2ZUVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWVudU1hbmFnZXIuY3VyQnV0dG9uID09PSBhY3RpdmVFbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLmN1ck1lbnUgJiYgTWVudU1hbmFnZXIuY3VyTWVudS5jb250YWlucyhhY3RpdmVFbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdhaXQgdW50aWwgYWZ0ZXIgZm9jdXMgaGFzIG1vdmVkIGJlZm9yZSBjbG9zaW5nIHRoZSBtZW51XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLmlzT3Blbikge1xuICAgICAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIG1lbnVLZXlwcmVzc0xpc3RlbmVyKGUgOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmICghTWVudU1hbmFnZXIuaXNPcGVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFc2NhcGVcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXAgQXJyb3dcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmZvY3VzQ291bnQtLTtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmZvY3VzTWVudSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG93biBBcnJvd1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA0MCkge1xuICAgICAgICAgICAgTWVudU1hbmFnZXIuZm9jdXNDb3VudCsrO1xuICAgICAgICAgICAgTWVudU1hbmFnZXIuZm9jdXNNZW51KCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIEVudGVyIGFuZCBTcGFjZWJhclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCBlLmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICBNZW51TWFuYWdlci5jbGlja01lbnVJdGVtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKiEgQ29weXJpZ2h0IDIwMTYgQXlvZ28gSGVhbHRoIEluYy4gKi9cblxuaW1wb3J0IHsgTWVudU1hbmFnZXIgfSBmcm9tICcuL21hbmFnZXInO1xuXG5leHBvcnQgY2xhc3MgTWVudUJ1dHRvbkJlaGF2aW91ciB7XG4gICAgcHJpdmF0ZSBlbDogbnVsbCB8IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHByaXZhdGUgbWVudSA6IG51bGwgfCBIVE1MTWVudUVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIGNsaWNrSGFuZGxlciA6IG51bGwgfCAoKCkgPT4gdm9pZCk7XG4gICAgcHJpdmF0ZSBrZXlIYW5kbGVyIDogbnVsbCB8ICgoZSA6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpO1xuICAgIHByaXZhdGUgcmVzaXplSGFuZGxlciA6IG51bGwgfCAoKCkgPT4gdm9pZCk7XG5cbiAgICBjb25zdHJ1Y3RvcihidG4gOiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsID0gYnRuO1xuXG4gICAgICAgIGxldCBtZW51SUQgPSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnbWVudScpO1xuICAgICAgICBpZiAoIW1lbnVJRCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lbnUgPSBidG4ub3duZXJEb2N1bWVudC5nZXRFbGVtZW50QnlJZChtZW51SUQpIGFzIEhUTUxNZW51RWxlbWVudDtcbiAgICAgICAgaWYgKCFtZW51KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1lbnUgPSBtZW51O1xuXG4gICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLnRvZ2dsZU1lbnUodGhpcy5lbCEsIHRoaXMubWVudSEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5SGFuZGxlciA9IChlIDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5idXR0b25LZXlwcmVzc0xpc3RlbmVyKGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVzaXplSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlciEpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleUhhbmRsZXIhKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlciEpO1xuICAgIH1cblxuXG4gICAgLy8gQ2xlYW51cCBmdW5jdGlvblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmVsKSB7XG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIhKTtcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5SGFuZGxlciEpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlciEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGlja0hhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmtleUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2l6ZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLmVsID0gbnVsbDtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgYnV0dG9uS2V5cHJlc3NMaXN0ZW5lcihlIDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvLyBFc2NhcGVcbiAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLm9wZW4gJiYgZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERPV04gQVJST1dcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCkge1xuICAgICAgICAgICAgaWYgKCFNZW51TWFuYWdlci5vcGVuKSB7XG4gICAgICAgICAgICAgICAgTWVudU1hbmFnZXIub3Blbk1lbnUodGhpcy5lbCEsIHRoaXMubWVudSEsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBNZW51TWFuYWdlci5mb2N1c01lbnUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qISBDb3B5cmlnaHQgMjAxNiBBeW9nbyBIZWFsdGggSW5jLiAqL1xuXG5cbmltcG9ydCB7IE1lbnVCdXR0b25CZWhhdmlvdXIgfSBmcm9tICcuL2J1dHRvbic7XG5cbmNvbnN0IE1FTlVfU1RZTEVTID0gYFxubWVudVt0eXBlPVwiY29udGV4dFwiXSxcbm1lbnVbZGF0YS1vd25lcj1cImJ1dHRvblwiXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xuICAgIG1hcmdpbjogMDtcbiAgICBib3JkZXI6IDFweCBzb2xpZDtcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuICAgIHRyYW5zZm9ybTogc2NhbGVZKDApO1xuICAgIHRyYW5zZm9ybS1vcmlnaW46IHRvcCBjZW50ZXI7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDIyNW1zIGN1YmljLWJlemllcigwLjQsIDAuMCwgMC4yLCAxKTtcbn1cblxubWVudWl0ZW0ge1xuICAgIGRpc3BsYXk6IGxpc3QtaXRlbTtcbiAgICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XG4gICAgYmFja2dyb3VuZDogTWVudTtcbiAgICBmb250OiBtZW51O1xuICAgIHBhZGRpbmc6IDAuMjVlbSAwLjVlbTtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbm1lbnVpdGVtOjphZnRlciB7XG4gICAgY29udGVudDogYXR0cihsYWJlbCk7XG59XG5cbm1lbnVpdGVtW2Rpc2FibGVkXSB7XG4gICAgY29sb3I6IEdyYXlUZXh0O1xufVxuXG5tZW51aXRlbTpub3QoW2Rpc2FibGVkXSk6aG92ZXIsXG5tZW51aXRlbTpub3QoW2Rpc2FibGVkXSk6Zm9jdXMge1xuICAgIGJhY2tncm91bmQ6IEhpZ2hsaWdodDtcbiAgICBjb2xvcjogSGlnaGxpZ2h0VGV4dDtcbn1cblxuYnV0dG9uW3R5cGU9XCJtZW51XCJdOjphZnRlcixcbmJ1dHRvbltkYXRhLXR5cGU9XCJtZW51XCJdOmFmdGVyIHsgY29udGVudDogJyDDosKWwr4nOyB9XG5cbmJ1dHRvblt0eXBlPVwibWVudVwiXTplbXB0eTo6YWZ0ZXIsXG5idXR0b25bZGF0YS10eXBlPVwibWVudVwiXTplbXB0eTphZnRlciB7IGNvbnRlbnQ6ICfDosKWwr4nOyB9IC8qIE5vIHNwYWNlIGNoYXJhY3RlciAqL1xuYDtcblxuXG5jb25zdCBQUkVGSVhfU1RZTEVTID0gYFxubWVudVt0eXBlPVwiY29udGV4dFwiXSxcbm1lbnVbZGF0YS1vd25lcj1cImJ1dHRvblwiXSB7XG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlWSgwKTtcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IHRvcCBjZW50ZXI7XG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiAtd2Via2l0LXRyYW5zZm9ybSAyMjVtcyBjdWJpYy1iZXppZXIoMC40LCAwLjAsIDAuMiwgMSk7XG4gICAgdHJhbnNpdGlvbjogLXdlYmtpdC10cmFuc2Zvcm0gMjI1bXMgY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpO1xufVxuYFxuXG5cbi8vIEluamVjdCBkZWZhdWx0IHN0eWxpbmdcblxubGV0IG1udVN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbm1udVN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKE1FTlVfU1RZTEVTKSk7XG5cbi8vIEFkZCBvbGQgcHJlZml4ZWQgc3R5bGVzIGZvciBvbGRlciBpT1MgYW5kIEFuZHJvaWQgZGV2aWNlc1xuaWYgKCEoJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jykuc3R5bGUpKSB7XG4gICAgbW51U3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoUFJFRklYX1NUWUxFUykpO1xufVxuXG5cbmxldCBpbnNlcnRQb2ludCA6IEhUTUxFbGVtZW50IHwgbnVsbDtcbmlmIChpbnNlcnRQb2ludCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmsnKSkge1xuICAgIGluc2VydFBvaW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1udVN0eWxlLCBpbnNlcnRQb2ludCk7XG59IGVsc2VcbmlmIChpbnNlcnRQb2ludCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlJykpIHtcbiAgICBpbnNlcnRQb2ludC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtbnVTdHlsZSwgaW5zZXJ0UG9pbnQpO1xufSBlbHNlXG5pZiAoaW5zZXJ0UG9pbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykpIHtcbiAgICBpbnNlcnRQb2ludC5hcHBlbmRDaGlsZChtbnVTdHlsZSk7XG59IGVsc2Uge1xuICAgIGRvY3VtZW50LmFwcGVuZENoaWxkKG1udVN0eWxlKTtcbn1cblxuXG5sZXQgZ2NDYWNoZSA6IFdlYWtNYXA8SFRNTEJ1dHRvbkVsZW1lbnQsIE1lbnVCdXR0b25CZWhhdmlvdXI+IHwgbnVsbCA9IG51bGw7XG5pZiAoJ1dlYWtNYXAnIGluIHdpbmRvdykge1xuICAgIGdjQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1lbnVCdXR0b24oZWwgOiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgIGxldCBiZWhhdmlvdXIgPSBuZXcgTWVudUJ1dHRvbkJlaGF2aW91cihlbCk7XG5cbiAgICBpZiAoZ2NDYWNoZSkge1xuICAgICAgICBnY0NhY2hlLnNldChlbCwgYmVoYXZpb3VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmVoYXZpb3VyO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBRUE7S0FtUkM7SUEzUUcsc0JBQVcsbUJBQUk7YUFBZjtZQUNJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUN0Qjs7O09BQUE7SUFFTSxvQkFBUSxHQUFmLFVBQWdCLEdBQXVCLEVBQUUsR0FBcUIsRUFBRSxLQUF1QjtRQUF2QixzQkFBQSxFQUFBLGFBQXVCO1FBQ25GLElBQUksSUFBSSxDQUFDLG9CQUFvQixLQUFLLElBQUksRUFBRTtZQUNwQyxJQUFJLENBQUMsb0JBQXFCLEVBQUUsQ0FBQztTQUNoQztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLENBQUMs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
