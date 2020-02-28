import * as PIXI from 'pixi.js';
import Task from './Task';
/**
 * @interface ContainerData
 * @memberof Pixim.Container~
 * @property {Pixim~Task} task
 */
/**
 * @class
 * @extends HOGOE
 * @see http://pixijs.download/v5.2.1/docs/PIXI.Container.html
 */
export default class Container extends PIXI.Container {
    /**
     * @member {Pixim.Container~ContainerData}
     * @private
     */
    private _piximData;
    /**
     * @constructor
     */
    constructor();
    /**
     * @member {Pixim~Task}
     * @readonly
     */
    get task(): Task;
    /**
     * Destroy instance
     *
     * @override
     * @return {void}
     */
    destroy(): void;
}
