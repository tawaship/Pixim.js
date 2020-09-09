import * as PIXI from 'pixi.js';
import { Task } from './Task';

namespace Pixim {
	/**
	 * @since 1.6.2
	 */
	export interface IContainerData {
		task: Task,
		taskEnabledChildren: boolean
	}
	
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
		destroy(...args: any[]): void {
			super.destroy(...args);
			this._piximData.task.destroy();
		}
	}
}

/**
 * @ignore
 */
export import Container = Pixim.Container;