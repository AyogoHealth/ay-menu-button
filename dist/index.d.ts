/*! Copyright 2016 Ayogo Health Inc. */

declare class MenuButtonBehaviour {
    constructor(btn: HTMLButtonElement);
    destroy(): void;
}

declare function MenuButton(el: HTMLButtonElement): MenuButtonBehaviour;

export = MenuButton;
