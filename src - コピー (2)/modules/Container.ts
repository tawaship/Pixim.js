import * as PIXI from 'pixi.js';
import { Task } from './Task';

/**
 * @private
 */
interface ContainerData {
	task: Task
}

export class Container extends PIXI.Container {
	private _piximData: ContainerData;
	
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
	 * Task object that works only while it is being displayed.
	 */
	get task(): Task {
		return this._piximData.task;
	}
	
	/**
	 * Destroy instance.
	 * 
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this._piximData.task.destroy();
	}
}
