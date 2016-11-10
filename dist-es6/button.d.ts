/*! Copyright 2016 Ayogo Health Inc. */
export declare class MenuButtonBehaviour {
    private el;
    private menu;
    private clickHandler;
    private keyHandler;
    constructor(btn: HTMLButtonElement);
    destroy(): void;
    private buttonKeypressListener(e);
}
