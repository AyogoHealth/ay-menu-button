/*! Copyright 2016 Ayogo Health Inc. */
export declare class MenuManager {
    private static curMenu;
    private static curButton;
    private static isOpen;
    private static focusCount;
    private static transitionEndHandler;
    private static scrollJack;
    static readonly open: boolean;
    static openMenu(btn: HTMLButtonElement, mnu: HTMLMenuElement, focus?: boolean): void;
    static closeMenu(): void;
    static toggleMenu(btn: HTMLButtonElement, mnu: HTMLMenuElement): void;
    static focusMenu(): void;
    private static clickMenuItem();
    private static addMenuStyle();
    private static clickListener(e);
    private static menuClickListener(e);
    private static handleBlur(e);
    private static menuKeypressListener(e);
    private static getScrollOffset();
    private static blockScrolling(offset);
}
