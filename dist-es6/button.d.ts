/*! Copyright 2016 Ayogo Health Inc. */
export declare class MenuButtonBehaviour {
    private el;
    private clickHandler;
    private keyHandler;
    private resizeHandler;
    constructor(btn: HTMLButtonElement);
    destroy(): void;
    private buttonKeypressListener;
}
