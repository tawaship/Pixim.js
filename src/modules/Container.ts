import * as PIXI from 'pixi.js';
import { Task } from './Task';
import { ContentDeliver } from './ContentDeliver';

/**
 * @private
 */
interface IContainerData {
	task: Task
}

export class Container extends PIXI.Container {
	private _piximData: IContainerData;
	
	constructor(...args: any[]) {
		super();
		
		this._piximData = {
			task: new Task(this)
		};
		
		this.on('added', () => {
			Task.add(this._piximData.task);
		});
		
		this.on('removed', () => {
			console.log(1)
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
