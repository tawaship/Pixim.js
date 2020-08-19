import { Emitter } from './Emitter';
import { Container }  from './Container';

namespace Pixim {
	export interface ITaskTickerData {
		delta: number
	}
	
	/**
	 * @private
	 */
	interface ITaskData {
		context: Container,
		enabled: boolean
	}
	
	export class Task extends Emitter {
		private _piximData: ITaskData;
		
		constructor(context: Container) {
			super();
			
			this._piximData = {
				context,
				enabled: true
			};
		}
		
		/**
		 * Whether the task works.
		 */
		get enabled(): boolean {
			return this._piximData.enabled;
		}
		
		set enabled(enabled) {
			this._piximData.enabled = enabled;
		}
		
		/**
		 * Execute task.
		 */
		update(e: ITaskTickerData): void {
			if (!this._piximData.enabled) {
				return;
			}
			
			const eventNames: string[] = this.eventNames;
			const context: Container = this._piximData.context;
			
			for (let i: number = 0; i < eventNames.length; i++) {
				this.cemit(eventNames[i], context, e);
			}
		}
		
		/**
		 * Destroy instance.
		 */
		destroy(): void {
			//Task.remove(this);
			this.clear();
		}
	}
}

/**
 * @ignore
 */
export import ITaskTickerData = Pixim.ITaskTickerData;

/**
 * @ignore
 */
export import Task = Pixim.Task;