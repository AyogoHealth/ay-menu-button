/*! Copyright 2016 Ayogo Health Inc. */
import { MenuManager } from './manager';
export class MenuButtonBehaviour {
    constructor(btn) {
        this.el = btn;
        this.el.setAttribute('aria-haspopup', 'true');
        this.el.setAttribute('aria-expanded', 'false');
        this.clickHandler = () => {
            MenuManager.toggleMenu(this.el);
        };
        this.keyHandler = (e) => {
            this.buttonKeypressListener(e);
        };
        this.resizeHandler = () => {
            MenuManager.closeMenu();
        };
        this.el.addEventListener('click', this.clickHandler);
        this.el.addEventListener('keydown', this.keyHandler);
        window.addEventListener('resize', this.resizeHandler);
    }
    destroy() {
        if (this.el) {
            this.el.removeEventListener('click', this.clickHandler);
            this.el.removeEventListener('keydown', this.keyHandler);
            window.removeEventListener('resize', this.resizeHandler);
        }
        this.clickHandler = null;
        this.keyHandler = null;
        this.resizeHandler = null;
        this.el = null;
    }
    buttonKeypressListener(e) {
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
    }
}
//# sourceMappingURL=button.js.map