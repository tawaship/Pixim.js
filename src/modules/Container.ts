import * as PIXI from 'pixi.js';
import { Task } from './Task';
import { ContentDeliver } from './ContentDeliver';

/**
 * @private
 */
interface IContainerData {
	task: Task,
	taskEnabledChildren: boolean
}

export class Container extends PIXI.Container {
	private _piximData: IContainerData;
	
	constructor(...args: any[]) {
		super();
		
		this._piximData = {
			task: new Task(this),
			taskEnabledChildren: true
		};
		
		/*
		this.on('added', () => {
			Task.add(this._piximData.task);
		});
		
		this.on('removed', () => {
			Task.remove(this._piximData.task);
		});
		*/
	}
	
	/**
	 * Whether the task works.
	 * 
	 * @since 1.4.0
	 */
	get taskEnabled(): boolean {
		return this._piximData.task.enabled;
	}
	
	set taskEnabled(enabled) {
		this._piximData.task.enabled = enabled;
	}
	
	/**
	 * Whether the children and subsequent tasks work.
	 * 
	 * @since 1.4.0
	 */
	get taskEnabledChildren(): boolean {
		return this._piximData.taskEnabledChildren;
	}
	
	set taskEnabledChildren(enabled) {
		this._piximData.taskEnabledChildren = enabled;
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
