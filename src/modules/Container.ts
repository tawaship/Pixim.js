import { Container as PixiContainer } from 'pixi.js';
import { Task } from './Task';
import { ITickerData } from './Application';

export interface IContainerData {
	task: Task,
	taskEnabledChildren: boolean
}

/**
 * @ignore
 */
let _lastObserverID = 0;

/**
 * {@link https://pixijs.download/v5.3.2/docs/docs/PIXI.Container.html}
 */
export class Container extends PixiContainer {
	protected _piximData: IContainerData;
	
	constructor(...args: any[]) {
		super();
		
		this._piximData = {
			task: new Task([], this),
			taskEnabledChildren: true
		};
		
		this._piximData.task.first();
		
		const _observerID = _lastObserverID++;
		/*
		this.on('added', () => {
			TaskManager.addObserver(_observerID, this);
		});
		
		this.on('removed', () => {
			TaskManager.removeObserver(_observerID);
		});
		*/
	}
	
	updateTask(e: ITickerData) {
		const task: Task = this._piximData.task;
		
		if (!this._piximData.task.enabled) {
			return;
		}
		
		/*
		let p: PIXI.DisplayObject = this;
		let f = true;
		
		while (p) {
			if (p instanceof Container && !p.taskEnabledChildren) {
				f = false;
				break;
			}
			
			p = p.parent;
		}
		
		if (!f) {
			return;
		}
		*/
		
		task.done(e);
		
		task.cemitAll(this, e);
	}
	
	/**
	 * Whether the task works.
	 */
	get taskEnabled(): boolean {
		return this._piximData.task.enabled;
	}
	
	set taskEnabled(enabled) {
		this._piximData.task.enabled = enabled;
	}
	
	/**
	 * Whether the children and subsequent tasks work.
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
	destroy(...args: any[]): void {
		super.destroy(...args);
		this._piximData.task.destroy();
	}
}