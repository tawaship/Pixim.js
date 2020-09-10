import { Emitter } from './Emitter';
import { Task as _Task, TTaskDelegate } from '@tawaship/task';

namespace Pixim {
	/**
	 * @since 1.7.0
	 */
	export interface ITaskData {
		emitter: Emitter
	}
	
	/**
	 * @see https://tawaship.github.io/Task/index.html
	 */
	export class Task extends _Task {
		private _piximData: ITaskData;
		
		constructor(tasks: TTaskDelegate | TTaskDelegate[], context: any ) {
			super(tasks, context);
			
			this.enabled = true;
			this._piximData = {
				emitter: new Emitter()
			};
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		on(type: string, func: TTaskDelegate) {
			this._piximData.emitter.on(type, func);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		once(type: string, func: TTaskDelegate) {
			this._piximData.emitter.once(type, func);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		off(type: string, func: TTaskDelegate) {
			this._piximData.emitter.off(type, func);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		emit(type: string, ...args: any[]) {
			if (!this._taskData.enabled) {
				return this;
			}
			
			this._piximData.emitter.emit(type, ...args);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		cemit(type: string, context: any, ...args: any[]) {
			if (!this._taskData.enabled) {
				return this;
			}
			
			this._piximData.emitter.cemit(type, context, ...args);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.0
		 */
		clear(type: string=''): this {
			this._piximData.emitter.clear(type);
			
			return this;
		}
		
		/**
		 * @deprecated 1.7.3
		 */
		get eventNames() {
			return this._piximData.emitter.eventNames;
		}
		
		destroy(): void {
			super.destroy();
			this.clear();
		}
	}
}

/**
 * @ignore
 */
export import ITaskData = Pixim.ITaskData;

/**
 * @ignore
 */
export import Task = Pixim.Task;