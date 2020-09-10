import * as PIXI from 'pixi.js';
import { Task } from './Task';
import { TaskManager } from './TaskManager';
import { ITickerData } from './Application';

namespace Pixim {
	/**
	 * @since 1.7.0
	 */
	export interface IContainerData {
		task: Task,
		taskEnabledChildren: boolean
	}
	
	/**
	 * @ignore
	 */
	let _lastObserverID = 0;
	
	/**
	 * @see http://pixijs.download/release/docs/PIXI.Container.html
	 */
	export class Container extends PIXI.Container {
		/**
		 * @since 1.6.2
		 */
		protected _piximData: IContainerData;
		
		constructor(...args: any[]) {
			super();
			
			this._piximData = {
				task: new Task([], this),
				taskEnabledChildren: true
			};
			
			const _observerID = _lastObserverID++;
			
			this.on('added', () => {
				TaskManager.addObserver(_observerID, this);
			});
			
			this.on('removed', () => {
				TaskManager.removeObserver(_observerID);
			});
		}
		
		/**
		 * @since 1.7.3
		 */
		updateTask(e: ITickerData) {
			const task: Task = this._piximData.task;
			
			if (!this.taskEnabled) {
				return;
			}
			
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
			
			task.done(e);
			
			const eventNames: string[] = task.eventNames;
			const context: any = this;
			
			for (let i: number = 0; i < eventNames.length; i++) {
				task.cemit(eventNames[i], this, e);
			}
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
		destroy(...args: any[]): void {
			super.destroy(...args);
			this._piximData.task.destroy();
		}
	}
}

/**
 * @ignore
 */
export import IContainerData = Pixim.IContainerData;

/**
 * @ignore
 */
export import Container = Pixim.Container;