import * as PIXI from 'pixi.js';
import Task from './Task';

/**
 * @class
 * @memberof Container~
 */
class ContainerData {
	tickEnabled: boolean = true;
	
	private _task: Task;
	
	constructor(container) {
		this._task = new Task(container);
	}
}

/**
 * @class
 * @memberof Pixim
 */
export default class Container extends PIXI.Container {
	private _piximData: ContainerData;
	
	/**
	 * @constructor
	 */
	constructor() {
		super();
		
		this._piximData = new ContainerData(this);
		
		this.on('added', () => {
			Task.add(this._piximData.task);
		});
		
		this.on('removed', () => {
			Task.remove(this._piximData.task);
		});
	}
}
