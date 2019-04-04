import Vue from 'vue';

/*! Copyright 2016 Ayogo Health Inc. */
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
    MenuManager.openMenu = function (btn, focus) {
        if (focus === void 0) { focus = false; }
        if (this.transitionEndHandler !== null) {
            this.transitionEndHandler();
        }
        var mnuID = btn.getAttribute('menu');
        if (!mnuID) {
            return;
        }
        var mnu = btn.ownerDocument.getElementById(mnuID);
        if (!mnu) {
            return;
        }
        this.curButton = btn;
        this.curMenu = mnu;
        this.isOpen = true;
        this.curButton.setAttribute('aria-expanded', 'true');
        this.curButton.ownerDocument.documentElement.addEventListener('click', this.clickListener);
        this.curButton.addEventListener('blur', this.handleBlur);
        this.curButton.parentNode.insertBefore(this.curMenu, this.curButton.nextSibling);
        var offset = this.getScrollOffset();
        this.addMenuStyle();
        this.scrollJack = this.blockScrolling(offset);
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
        this.curButton.setAttribute('data-dir', 'down');
        this.curMenu.removeEventListener('keydown', this.menuKeypressListener);
        this.curMenu.removeEventListener('focusout', this.handleBlur);
        this.curMenu.removeEventListener('click', this.menuClickListener);
        if (this.scrollJack) {
            this.scrollJack();
        }
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
    MenuManager.toggleMenu = function (btn) {
        var openMnu = this.curMenu;
        if (this.isOpen) {
            this.closeMenu();
        }
        if (!openMnu || openMnu.getAttribute('id') !== btn.getAttribute('menu')) {
            this.openMenu(btn);
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
        var mi = this.curMenu.children[(this.focusCount || 0) % length];
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
        var btnSize = btn.getBoundingClientRect();
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
            var menuSize = menu.getBoundingClientRect();
            var wndHeight = window.innerHeight;
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
                requestAnimationFrame(function () {
                    menu.style.transform = 'scaleY(1)';
                });
            }
            else {
                menu.style.webkitTransform = 'scaleY(0)';
                requestAnimationFrame(function () {
                    menu.style.webkitTransform = 'scaleY(1)';
                });
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
        MenuManager.curButton.focus();
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
        MenuManager.curButton.focus();
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
            MenuManager.focusMenu();
        }
        if (e.keyCode === 40) {
            e.preventDefault();
            e.stopPropagation();
            if (MenuManager.focusCount !== null) {
                MenuManager.focusCount++;
            }
            MenuManager.focusMenu();
        }
        if (e.keyCode === 32 || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            MenuManager.clickMenuItem();
        }
    };
    MenuManager.getScrollOffset = function () {
        var doc = this.curButton.ownerDocument;
        if (doc.body.style.top) {
            return Math.abs(parseInt(doc.body.style.top, 10));
        }
        if (doc.scrollingElement) {
            return doc.scrollingElement.scrollTop;
        }
        else {
            return doc.documentElement.scrollTop + doc.body.scrollTop;
        }
    };
    MenuManager.blockScrolling = function (offset) {
        var doc = this.curButton.ownerDocument;
        var htmlNode = doc.documentElement;
        var clientWidth = doc.body.clientWidth;
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
        return function () {
            doc.body.style.removeProperty('position');
            doc.body.style.removeProperty('left');
            doc.body.style.removeProperty('right');
            doc.body.style.removeProperty('top');
            doc.body.style.removeProperty('overflow');
            htmlNode.style.removeProperty('overflow-y');
            htmlNode.style.removeProperty('min-height');
            if (doc.scrollingElement) {
                doc.scrollingElement.scrollTop = offset;
            }
            else {
                scrollTo(0, offset);
            }
        };
    };
    MenuManager.curMenu = null;
    MenuManager.curButton = null;
    MenuManager.isOpen = false;
    MenuManager.focusCount = null;
    MenuManager.transitionEndHandler = null;
    MenuManager.scrollJack = null;
    return MenuManager;
}());

/*! Copyright 2016 Ayogo Health Inc. */
var MenuButtonBehaviour = (function () {
    function MenuButtonBehaviour(btn) {
        var _this = this;
        this.el = btn;
        this.el.setAttribute('aria-haspopup', 'true');
        this.el.setAttribute('aria-expanded', 'false');
        this.clickHandler = function () {
            MenuManager.toggleMenu(_this.el);
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
        this.el = null;
    };
    MenuButtonBehaviour.prototype.buttonKeypressListener = function (e) {
        if (MenuManager.open && e.keyCode == 27) {
            MenuManager.closeMenu();
        }
        if (e.keyCode == 40) {
            if (!MenuManager.open) {
                MenuManager.openMenu(this.el, true);
            }
            else {
                MenuManager.focusMenu();
            }
        }
    };
    return MenuButtonBehaviour;
}());

/*! Copyright 2016 Ayogo Health Inc. */
var MENU_STYLES = "\nmenu[type=\"context\"],\nmenu[data-owner=\"button\"] {\n    display: none;\n    padding: 0;\n    margin: 0;\n    border: 1px solid;\n    will-change: transform;\n    transform-origin: top center;\n    transition: transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n}\n\nmenu[type=\"context\"][data-dir=\"up\"],\nmenu[data-owner=\"button\"][data-dir=\"up\"] {\n    transform-origin: bottom center;\n}\n\nmenuitem {\n    display: list-item;\n    list-style-type: none;\n    background: Menu;\n    font: menu;\n    padding: 0.25em 0.5em;\n    cursor: default;\n}\n\nmenuitem::after {\n    content: attr(label);\n}\n\nmenuitem[disabled] {\n    color: GrayText;\n}\n\nmenuitem:not([disabled]):hover,\nmenuitem:not([disabled]):focus {\n    background: Highlight;\n    color: HighlightText;\n}\n\nbutton[type=\"menu\"]::after,\nbutton[data-type=\"menu\"]:after { content: ' \u25BE'; }\n\nbutton[type=\"menu\"]:empty::after,\nbutton[data-type=\"menu\"]:empty:after { content: '\u25BE'; } /* No space character */\n\nbutton[type=\"menu\"][data-dir=\"up\"]::after,\nbutton[data-type=\"menu\"][data-dir=\"up\"]:after { content: ' \u25B4'; }\n\nbutton[type=\"menu\"][data-dir=\"up\"]:empty::after,\nbutton[data-type=\"menu\"][data-dir=\"up\"]:empty:after { content: '\u25B4'; } /* No space character */\n";
var PREFIX_STYLES = "\nmenu[type=\"context\"],\nmenu[data-owner=\"button\"] {\n    -webkit-transform-origin: top center;\n    -webkit-transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n    transition: -webkit-transform 225ms cubic-bezier(0.4, 0.0, 0.2, 1);\n}\n\nmenu[type=\"context\"][data-dir=\"up\"],\nmenu[data-owner=\"button\"][data-dir=\"up\"] {\n    -webkit-transform-origin: bottom center;\n}\n";
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

var script = Vue.extend({
    name: "menu-button",
    data: function () {
        return {
            behaviour: null
        };
    },
    mounted: function () {
        if (this.$el.getAttribute('type') === 'menu' || this.$el.getAttribute('data-type') === 'menu') {
            this.behaviour = MenuButton(this.$el);
        }
    },
    beforeDestroy: function () {
        this.behaviour.destroy();
        this.behaviour = null;
    }
});

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("button", { attrs: { type: "menu" } }, [_vm._t("default")], 2)
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var component = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

export default component;
