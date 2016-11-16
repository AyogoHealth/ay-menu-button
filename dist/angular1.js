/*! Copyright 2016 Ayogo Health Inc. */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('angular')) :
    typeof define === 'function' && define.amd ? define(['angular'], factory) :
    (global.ayMenuButton = factory(global.angular));
}(this, (function (angular) { 'use strict';

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

var modName = 'ayMenuButton';
angular.module(modName, [])
    .directive('button', function () {
    return {
        restrict: 'E',
        link: function (_$scope, $element) {
            var el = $element[0];
            if (el.getAttribute('type') === 'menu' || el.getAttribute('data-type') === 'menu') {
                var behaviour_1 = MenuButton(el);
                $element.on('$destroy', function () {
                    behaviour_1.destroy();
                });
            }
        }
    };
});

return modName;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL3NyYy9tYW5hZ2VyLnRzIiwiLi4vc3JjL2J1dHRvbi50cyIsIi4uL3NyYy9pbmRleC50cyIsIi4uL3NyYy9hbmd1bGFyMS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29weXJpZ2h0IDIwMTYgQXlvZ28gSGVhbHRoIEluYy4gKi9cblxuZXhwb3J0IGNsYXNzIE1lbnVNYW5hZ2VyIHtcbiAgICBwcml2YXRlIHN0YXRpYyBjdXJNZW51IDogSFRNTE1lbnVFbGVtZW50IHwgbnVsbCAgICAgICAgICAgICA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGF0aWMgY3VyQnV0dG9uIDogSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsICAgICAgICAgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIGlzT3BlbiA6IGJvb2xlYW4gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzdGF0aWMgZm9jdXNDb3VudCA6IG51bWJlciB8IG51bGwgICAgICAgICAgICAgICAgICAgPSBudWxsO1xuICAgIHByaXZhdGUgc3RhdGljIHRyYW5zaXRpb25FbmRIYW5kbGVyIDogKCgpID0+IHZvaWQpIHwgbnVsbCAgID0gbnVsbDtcblxuXG4gICAgc3RhdGljIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc09wZW47XG4gICAgfVxuXG4gICAgc3RhdGljIG9wZW5NZW51KGJ0biA6IEhUTUxCdXR0b25FbGVtZW50LCBtbnUgOiBIVE1MTWVudUVsZW1lbnQsIGZvY3VzIDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJCdXR0b24gPSBidG47XG4gICAgICAgIHRoaXMuY3VyTWVudSA9IG1udTtcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0xpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuaGFuZGxlQmx1cik7XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIG9wZW4gdGhlIG1lbnUsIHdlIG5lZWQgdG8gbW92ZSBpdCBpbiB0aGUgRE9NIHNvIHRoYXQgaXNcbiAgICAgICAgLy8gaXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGJ1dHRvbiBlbGVtZW50IGZvciB0YWIgb3JkZXJpbmdcbiAgICAgICAgdGhpcy5jdXJCdXR0b24ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5jdXJNZW51LCB0aGlzLmN1ckJ1dHRvbi5uZXh0U2libGluZyk7XG5cbiAgICAgICAgdGhpcy5hZGRNZW51U3R5bGUoKTtcblxuICAgICAgICBpZiAoZm9jdXMpIHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNNZW51KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMubWVudUtleXByZXNzTGlzdGVuZXIpO1xuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICAgICB0aGlzLmN1ck1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm1lbnVDbGlja0xpc3RlbmVyKTtcbiAgICB9XG5cblxuICAgIHN0YXRpYyBjbG9zZU1lbnUoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW4gfHwgIXRoaXMuY3VyQnV0dG9uIHx8ICF0aGlzLmN1ck1lbnUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0xpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgICAgIHRoaXMuY3VyQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5tZW51S2V5cHJlc3NMaXN0ZW5lcik7XG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgICAgIHRoaXMuY3VyTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMubWVudUNsaWNrTGlzdGVuZXIpO1xuXG4gICAgICAgIGxldCBvbGRNZW51ID0gdGhpcy5jdXJNZW51O1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgb2xkTWVudS5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgICAgICAgICBvbGRNZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG4gICAgICAgICAgICBvbGRNZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdHRyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJ3RyYW5zaXRpb25EdXJhdGlvbicgaW4gb2xkTWVudS5zdHlsZSkge1xuICAgICAgICAgICAgb2xkTWVudS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMTkybXMnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2xkTWVudS5zdHlsZS53ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24gPSAnMTkybXMnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd0cmFuc2Zvcm0nIGluIG9sZE1lbnUuc3R5bGUpIHtcbiAgICAgICAgICAgIG9sZE1lbnUuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlWSgwKSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvbGRNZW51LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZVkoMCknO1xuICAgICAgICB9XG5cbiAgICAgICAgb2xkTWVudS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgdGhpcy50cmFuc2l0aW9uRW5kSGFuZGxlciEpO1xuICAgICAgICBvbGRNZW51LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdHRyYW5zaXRpb25lbmQnLCB0aGlzLnRyYW5zaXRpb25FbmRIYW5kbGVyISk7XG5cbiAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jdXJCdXR0b24gPSBudWxsO1xuICAgICAgICB0aGlzLmN1ck1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLmZvY3VzQ291bnQgPSBudWxsO1xuICAgIH1cblxuXG4gICAgc3RhdGljIHRvZ2dsZU1lbnUoYnRuIDogSFRNTEJ1dHRvbkVsZW1lbnQsIG1udSA6IEhUTUxNZW51RWxlbWVudCkge1xuICAgICAgICBsZXQgb3Blbk1udSA9IHRoaXMuY3VyTWVudTtcblxuICAgICAgICBpZiAodGhpcy5pc09wZW4gJiYgYnRuID09PSB0aGlzLmN1ckJ1dHRvbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcGVuTW51ICE9PSBtbnUpIHtcbiAgICAgICAgICAgIHRoaXMub3Blbk1lbnUoYnRuLCBtbnUpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBzdGF0aWMgZm9jdXNNZW51KCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VyTWVudSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZm9jdXNDb3VudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5mb2N1c0NvdW50ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmN1ck1lbnUuY2hpbGRyZW4ubGVuZ3RoO1xuXG4gICAgICAgIGlmICh0aGlzLmZvY3VzQ291bnQgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzQ291bnQgKz0gbGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1pID0gdGhpcy5jdXJNZW51LmNoaWxkcmVuW3RoaXMuZm9jdXNDb3VudCAlIGxlbmd0aF0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIG1pLmZvY3VzKCk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHN0YXRpYyBjbGlja01lbnVJdGVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VyTWVudSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuY3VyTWVudS5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIGxldCBtaSA9IHRoaXMuY3VyTWVudS5jaGlsZHJlblt0aGlzLmZvY3VzQ291bnQgJSBsZW5ndGhdIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGlmICghbWkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICBtaS5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHN0YXRpYyBhZGRNZW51U3R5bGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJNZW51IHx8ICF0aGlzLmN1ckJ1dHRvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLmN1ck1lbnUhO1xuICAgICAgICBsZXQgYnRuID0gdGhpcy5jdXJCdXR0b24hO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgbWVudSB0byB0aGUgRE9NIGZvciBtZWFzdXJpbmdcbiAgICAgICAgbWVudS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgbWVudS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ21lbnUnKTtcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3duZXInLCAnYnV0dG9uJyk7XG5cbiAgICAgICAgLy8gVHJ5IHRvIHVuc2V0IHRoZSB0eXBlIHNvIEZpcmVmb3ggY2FuIG1ha2UgaXQgdmlzaWJsZSA6JyhcbiAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnJyk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBjaGlsZHJlbiBhcmUgZm9jdXNhYmxlXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVudS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWVudS5jaGlsZHJlbltpXS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgICAgICBtZW51LmNoaWxkcmVuW2ldLnNldEF0dHJpYnV0ZSgncm9sZScsICdtZW51aXRlbScpO1xuXG4gICAgICAgICAgICBtZW51LmNoaWxkcmVuW2ldLnNldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcsIG1lbnUuY2hpbGRyZW5baV0uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBidG5TaXplID0gYnRuLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgbGV0IG1lbnVTaXplID0gbWVudS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGxldCB3bmRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChidG5TaXplLmJvdHRvbSArIG1lbnVTaXplLmhlaWdodCA+IHduZEhlaWdodCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUuYm90dG9tID0gYnRuU2l6ZS50b3AgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLnRvcCA9IGJ0blNpemUuYm90dG9tICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1lbnVTaXplLndpZHRoID4gYnRuU2l6ZS5yaWdodCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IGJ0blNpemUubGVmdCArICdweCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnUuc3R5bGUubGVmdCA9IChidG5TaXplLnJpZ2h0IC0gbWVudVNpemUud2lkdGgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCd0cmFuc2Zvcm0nIGluIG1lbnUuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZVkoMSknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW51LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZVkoMSknO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIGNsaWNrTGlzdGVuZXIoZSA6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKCFNZW51TWFuYWdlci5jdXJCdXR0b24gfHwgIU1lbnVNYW5hZ2VyLmN1ck1lbnUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNZW51TWFuYWdlci5jdXJNZW51LmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWVudU1hbmFnZXIuY3VyQnV0dG9uLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIG1lbnVDbGlja0xpc3RlbmVyKGUgOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICghTWVudU1hbmFnZXIuY3VyQnV0dG9uIHx8ICFNZW51TWFuYWdlci5jdXJNZW51KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWkgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBpZiAoIU1lbnVNYW5hZ2VyLmN1ck1lbnUuY29udGFpbnMobWkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIGhhbmRsZUJsdXIoZSA6IEZvY3VzRXZlbnQpIHtcbiAgICAgICAgaWYgKCFNZW51TWFuYWdlci5jdXJCdXR0b24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVsZW1lbnQgdGhhdCBmb2N1cyBpcyBtb3ZpbmcgdG9cbiAgICAgICAgbGV0IGFjdGl2ZUVsID0gZS5yZWxhdGVkVGFyZ2V0IGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoIWFjdGl2ZUVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWVudU1hbmFnZXIuY3VyQnV0dG9uID09PSBhY3RpdmVFbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLmN1ck1lbnUgJiYgTWVudU1hbmFnZXIuY3VyTWVudS5jb250YWlucyhhY3RpdmVFbCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdhaXQgdW50aWwgYWZ0ZXIgZm9jdXMgaGFzIG1vdmVkIGJlZm9yZSBjbG9zaW5nIHRoZSBtZW51XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLmlzT3Blbikge1xuICAgICAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc3RhdGljIG1lbnVLZXlwcmVzc0xpc3RlbmVyKGUgOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmICghTWVudU1hbmFnZXIuaXNPcGVuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFc2NhcGVcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXAgQXJyb3dcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmZvY3VzQ291bnQtLTtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmZvY3VzTWVudSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG93biBBcnJvd1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA0MCkge1xuICAgICAgICAgICAgTWVudU1hbmFnZXIuZm9jdXNDb3VudCsrO1xuICAgICAgICAgICAgTWVudU1hbmFnZXIuZm9jdXNNZW51KCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIEVudGVyIGFuZCBTcGFjZWJhclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCBlLmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICBNZW51TWFuYWdlci5jbGlja01lbnVJdGVtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKiEgQ29weXJpZ2h0IDIwMTYgQXlvZ28gSGVhbHRoIEluYy4gKi9cblxuaW1wb3J0IHsgTWVudU1hbmFnZXIgfSBmcm9tICcuL21hbmFnZXInO1xuXG5leHBvcnQgY2xhc3MgTWVudUJ1dHRvbkJlaGF2aW91ciB7XG4gICAgcHJpdmF0ZSBlbDogbnVsbCB8IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIHByaXZhdGUgbWVudSA6IG51bGwgfCBIVE1MTWVudUVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIGNsaWNrSGFuZGxlciA6IG51bGwgfCAoKCkgPT4gdm9pZCk7XG4gICAgcHJpdmF0ZSBrZXlIYW5kbGVyIDogbnVsbCB8ICgoZSA6IEtleWJvYXJkRXZlbnQpID0+IHZvaWQpO1xuICAgIHByaXZhdGUgcmVzaXplSGFuZGxlciA6IG51bGwgfCAoKCkgPT4gdm9pZCk7XG5cbiAgICBjb25zdHJ1Y3RvcihidG4gOiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsID0gYnRuO1xuXG4gICAgICAgIGxldCBtZW51SUQgPSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnbWVudScpO1xuICAgICAgICBpZiAoIW1lbnVJRCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lbnUgPSBidG4ub3duZXJEb2N1bWVudC5nZXRFbGVtZW50QnlJZChtZW51SUQpIGFzIEhUTUxNZW51RWxlbWVudDtcbiAgICAgICAgaWYgKCFtZW51KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1lbnUgPSBtZW51O1xuXG4gICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhhc3BvcHVwJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLnRvZ2dsZU1lbnUodGhpcy5lbCEsIHRoaXMubWVudSEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5SGFuZGxlciA9IChlIDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5idXR0b25LZXlwcmVzc0xpc3RlbmVyKGUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVzaXplSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIE1lbnVNYW5hZ2VyLmNsb3NlTWVudSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlciEpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleUhhbmRsZXIhKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlciEpO1xuICAgIH1cblxuXG4gICAgLy8gQ2xlYW51cCBmdW5jdGlvblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmVsKSB7XG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIhKTtcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5SGFuZGxlciEpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplSGFuZGxlciEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGlja0hhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmtleUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2l6ZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLmVsID0gbnVsbDtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgYnV0dG9uS2V5cHJlc3NMaXN0ZW5lcihlIDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvLyBFc2NhcGVcbiAgICAgICAgaWYgKE1lbnVNYW5hZ2VyLm9wZW4gJiYgZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICAgICAgICBNZW51TWFuYWdlci5jbG9zZU1lbnUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERPV04gQVJST1dcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCkge1xuICAgICAgICAgICAgaWYgKCFNZW51TWFuYWdlci5vcGVuKSB7XG4gICAgICAgICAgICAgICAgTWVudU1hbmFnZXIub3Blbk1lbnUodGhpcy5lbCEsIHRoaXMubWVudSEsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBNZW51TWFuYWdlci5mb2N1c01lbnUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qISBDb3B5cmlnaHQgMjAxNiBBeW9nbyBIZWFsdGggSW5jLiAqL1xuXG5cbmltcG9ydCB7IE1lbnVCdXR0b25CZWhhdmlvdXIgfSBmcm9tICcuL2J1dHRvbic7XG5cbmNvbnN0IE1FTlVfU1RZTEVTID0gYFxubWVudVt0eXBlPVwiY29udGV4dFwiXSxcbm1lbnVbZGF0YS1vd25lcj1cImJ1dHRvblwiXSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgICBwYWRkaW5nOiAwO1xuICAgIG1hcmdpbjogMDtcbiAgICBib3JkZXI6IDFweCBzb2xpZDtcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuICAgIHRyYW5zZm9ybTogc2NhbGVZKDApO1xuICAgIHRyYW5zZm9ybS1vcmlnaW46IHRvcCBjZW50ZXI7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDIyNW1zIGN1YmljLWJlemllcigwLjQsIDAuMCwgMC4yLCAxKTtcbn1cblxubWVudWl0ZW0ge1xuICAgIGRpc3BsYXk6IGxpc3QtaXRlbTtcbiAgICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XG4gICAgYmFja2dyb3VuZDogTWVudTtcbiAgICBmb250OiBtZW51O1xuICAgIHBhZGRpbmc6IDAuMjVlbSAwLjVlbTtcbiAgICBjdXJzb3I6IGRlZmF1bHQ7XG59XG5cbm1lbnVpdGVtOjphZnRlciB7XG4gICAgY29udGVudDogYXR0cihsYWJlbCk7XG59XG5cbm1lbnVpdGVtW2Rpc2FibGVkXSB7XG4gICAgY29sb3I6IEdyYXlUZXh0O1xufVxuXG5tZW51aXRlbTpub3QoW2Rpc2FibGVkXSk6aG92ZXIsXG5tZW51aXRlbTpub3QoW2Rpc2FibGVkXSk6Zm9jdXMge1xuICAgIGJhY2tncm91bmQ6IEhpZ2hsaWdodDtcbiAgICBjb2xvcjogSGlnaGxpZ2h0VGV4dDtcbn1cblxuYnV0dG9uW3R5cGU9XCJtZW51XCJdOjphZnRlcixcbmJ1dHRvbltkYXRhLXR5cGU9XCJtZW51XCJdOmFmdGVyIHsgY29udGVudDogJyDDosKWwr4nOyB9XG5cbmJ1dHRvblt0eXBlPVwibWVudVwiXTplbXB0eTo6YWZ0ZXIsXG5idXR0b25bZGF0YS10eXBlPVwibWVudVwiXTplbXB0eTphZnRlciB7IGNvbnRlbnQ6ICfDosKWwr4nOyB9IC8qIE5vIHNwYWNlIGNoYXJhY3RlciAqL1xuYDtcblxuXG5jb25zdCBQUkVGSVhfU1RZTEVTID0gYFxubWVudVt0eXBlPVwiY29udGV4dFwiXSxcbm1lbnVbZGF0YS1vd25lcj1cImJ1dHRvblwiXSB7XG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlWSgwKTtcbiAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IHRvcCBjZW50ZXI7XG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiAtd2Via2l0LXRyYW5zZm9ybSAyMjVtcyBjdWJpYy1iZXppZXIoMC40LCAwLjAsIDAuMiwgMSk7XG4gICAgdHJhbnNpdGlvbjogLXdlYmtpdC10cmFuc2Zvcm0gMjI1bXMgY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpO1xufVxuYFxuXG5cbi8vIEluamVjdCBkZWZhdWx0IHN0eWxpbmdcblxubGV0IG1udVN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbm1udVN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKE1FTlVfU1RZTEVTKSk7XG5cbi8vIEFkZCBvbGQgcHJlZml4ZWQgc3R5bGVzIGZvciBvbGRlciBpT1MgYW5kIEFuZHJvaWQgZGV2aWNlc1xuaWYgKCEoJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jykuc3R5bGUpKSB7XG4gICAgbW51U3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoUFJFRklYX1NUWUxFUykpO1xufVxuXG5cbmxldCBpbnNlcnRQb2ludCA6IEhUTUxFbGVtZW50IHwgbnVsbDtcbmlmIChpbnNlcnRQb2ludCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmsnKSkge1xuICAgIGluc2VydFBvaW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1udVN0eWxlLCBpbnNlcnRQb2ludCk7XG59IGVsc2VcbmlmIChpbnNlcnRQb2ludCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlJykpIHtcbiAgICBpbnNlcnRQb2ludC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtbnVTdHlsZSwgaW5zZXJ0UG9pbnQpO1xufSBlbHNlXG5pZiAoaW5zZXJ0UG9pbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykpIHtcbiAgICBpbnNlcnRQb2ludC5hcHBlbmRDaGlsZChtbnVTdHlsZSk7XG59IGVsc2Uge1xuICAgIGRvY3VtZW50LmFwcGVuZENoaWxkKG1udVN0eWxlKTtcbn1cblxuXG5sZXQgZ2NDYWNoZSA6IFdlYWtNYXA8SFRNTEJ1dHRvbkVsZW1lbnQsIE1lbnVCdXR0b25CZWhhdmlvdXI+IHwgbnVsbCA9IG51bGw7XG5pZiAoJ1dlYWtNYXAnIGluIHdpbmRvdykge1xuICAgIGdjQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1lbnVCdXR0b24oZWwgOiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgIGxldCBiZWhhdmlvdXIgPSBuZXcgTWVudUJ1dHRvbkJlaGF2aW91cihlbCk7XG5cbiAgICBpZiAoZ2NDYWNoZSkge1xuICAgICAgICBnY0NhY2hlLnNldChlbCwgYmVoYXZpb3VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmVoYXZpb3VyO1xufVxuIiwiLyohIENvcHlyaWdodCAyMDE2IEF5b2dvIEhlYWx0aCBJbmMuICovXG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgTWVudUJ1dHRvbiBmcm9tICcuL2luZGV4JztcblxuY29uc3QgbW9kTmFtZSA9ICdheU1lbnVCdXR0b24nO1xuXG5hbmd1bGFyLm1vZHVsZShtb2ROYW1lLCBbXSlcbi5kaXJlY3RpdmUoJ2J1dHRvbicsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKF8kc2NvcGUsICRlbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgZWwgPSAkZWxlbWVudFswXSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgICAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgndHlwZScpID09PSAnbWVudScgfHwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSA9PT0gJ21lbnUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJlaGF2aW91ciA9IE1lbnVCdXR0b24oZWwpO1xuXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQub24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBiZWhhdmlvdXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBtb2ROYW1lO1xuIl0sIm5hbWVzIjpbImFuZ3VsYXIubW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUVBO0tBbVJDO0lBM1FHLHNCQUFXLG1CQUFJO2FBQWY7WUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDdEI7OztPQUFBO0lBRU0sb0JBQVEsR0FBZixVQUFnQixHQUF1QixFQUFFLEdBQXFCLEVBQUUsS0FBdUI7UUFBdkIsc0JBQUEsRUFBQSxhQUF1QjtRQUNuRixJQUFJLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxJQUFJLEVBQUU7WUFDcEMsSUFBSSxDQUFDLG9CQUFxQixFQUFFLENBQUM7U0FDaEM7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUs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
