import Emitter from './Emitter';
declare type ApplicationOption = {
    autoAdjust?: boolean;
};
/**
 * @typedef Roots {Object<string, Pixim.Container>}
 * @memberof Pixim.Application~
 */
/**
 * @typedef ApplicationOption {Object}
 * @memberof Pixim.Application~
 * @property [autoAdjust=false] {boolean} Whether to adjust canvas size automatically.
 */
/**
 * @interface ApplicationData
 * @memberof Pixim.Application~
 * @property {boolean} isRun
 * @property {PIXI.Application} app
 * @property {HTMLElement} container
 * @property {HTMLDivElement} frame
 * @property {HTMLCanvasElement} view
 * @property [PIXI.Container[]} layers
 * @property {boolean} fullScreen
 */
/**
 * @class ApplicationA
 * @extends Emitter
 */
export default class Application extends Emitter {
    private static _contentRoots;
    private _piximData;
    /**
     * @constructor
     * @param {HTMLElement} [container=document.body] The parent element of the canvas that displays the content.
     * @param {object} [pixiOptions] Optional data when call 'new PIXI.Application'.
     * @param {Pixim.Application~ApplicationOption} [piximOptions] Optional data for Pixim.
     * @see http://pixijs.download/v5.2.1/docs/PIXI.Application.html
     */
    constructor(container?: HTMLElement, pixiOptions?: Object, piximOptions?: ApplicationOption);
    /**
     * Play application.
     *
     * @return {Pixim.Application} Returns itself for the method chaining.
     */
    play(): Application;
    /**
     * Stop application.
     *
     * @return {Pixim.Application} Returns itself for the method chaining.
     */
    stop(): this;
    /**
     * Pause (or restart) application.
     *
     * @param {boolean} paused
     * @return {Pixim.Application} Returns itself for the method chaining.
     */
    pause(paused: boolean): this;
    resizeFrame(width: number, height: number): void;
    adjust(width: number, height: number): Application;
    /**
     * Adjust canvas width.
     *
     * @param {number} width
     * @return {Pixim.Application} Returns itself for the method chaining.
     */
    adjustWidth(width: number): Application;
    /**
     * Adjust canvas height.
     *
     * @param {number} height
     * @return {Pixim.Application} Returns itself for the method chaining.
     */
    adjustHeight(height: number): Application;
}
export {};
