/*! Copyright 2016 Ayogo Health Inc. */
export declare class MenuManager {
    private static curMenu;
    private static curButton;
    private static isOpen;
    private static focusCount;
    private static transitionEndHandler;
    private static scrollJack;
    static get open(): boolean;
    static openMenu(btn: HTMLButtonElement, focus?: boolean): void;
    static closeMenu(): void;
    static toggleMenu(btn: HTMLButtonElement): void;
    static focusMenu(offset?: number): void;
    private static clickMenuItem;
    private static addMenuStyle;
    private static clickListener;
    private static menuClickListener;
    private static handleBlur;
    private static menuKeypressListener;
    private static getScrollOffset;
    private static blockScrolling;
}
