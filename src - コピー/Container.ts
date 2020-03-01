import * as PIXI from 'pixi.js';
import Task from './Task';

interface ContainerData {
	task: Task
}

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
	private _piximData: ContainerData;
	
	/**
	 * @constructor
	 */
	constructor() {
		super();
		
		this._piximData = {
			task: new Task(this)
		};
		
		this.on('added', () => {
			Task.add(this._piximData.task);
		});
		
		this.on('removed', () => {
			Task.remove(this._piximData.task);
		});
	}
	
	/**
	 * @member {Pixim~Task}
	 * @readonly
	 */
	get task(): Task {
		return this._piximData.task;
	}
	
	/**
	 * Destroy instance
	 * 
	 * @override
	 * @return {void}
	 */
	destroy(): void {
		super.destroy();
		this._piximData.task.destroy();
	}
}
