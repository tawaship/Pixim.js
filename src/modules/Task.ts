import { Emitter } from './Emitter';
import { Task as _Task, TTaskDelegate }  from '@tawaship/task';

namespace Pixim {
	/**
	 * @since 1.7.0
	 */
	export interface ITaskData {
		/**
		 * @deprecated 1.7.0
		 */
		emitter: Emitter,
		id: number
	}
	
	export interface ITaskTickerData {
		delta: number
	}
	
	/**
	 * @private
	 */
	type TTasks = { [name: number]: Task };
	
	/**
	 * @private
	 */
	interface ITaskStaticData {
		tasks: TTasks,
		currentID: number
	}
	
	/**
	 * @see https://tawaship.github.io/Task/index.html
	 */
	export class Task extends _Task {
		private _piximData: ITaskData;
		private static _piximData: ITaskStaticData = {
			tasks: {},
			currentID: 0
		};
		
		constructor(tasks: TTaskDelegate | TTaskDelegate[], context: any ) {
			super(tasks, context);
			this.enabled = true;
			this._piximData = {
				emitter: new Emitter(),
				id: -1
			};
		}
		
		/**
		 * @since 1.7.0
		 */
		static add(task: Task) {
			const id = this._piximData.currentID++;
			
			this._piximData.tasks[id] = task;
			task._piximData.id = id;
		}
		
		/**
		 * @since 1.7.0
		 */
		static remove(task: Task) {
			delete(this._piximData.tasks[task._piximData.id]);
		}
		
		/**
		 * @since 1.7.0
		 */
		static update(e: ITaskTickerData) {
			const tasks: TTasks = this._piximData.tasks;
			
			for (let i in tasks) {
				tasks[i].update(e);
			}
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
		 * @since 1.7.0
		 */
		get id() {
			return this._piximData.id;
		}
		
		/**
		 * @since 1.7.0
		 */
		reset() {
			this._taskData.tasks = [];
			this._taskData.current = null;
			this._taskData.index = 0;
			
			return this;
		}
		
		/**
		 * @since 1.7.0
		 */
		add(funcs: TTaskDelegate | TTaskDelegate[]) {
			if (funcs instanceof Function) {
				funcs = [funcs];
			}
			
			const tasks: TTaskDelegate[] = this._taskData.tasks;
			const f = tasks.length === 0;
			
			for (let i = 0; i < funcs.length; i++) {
				tasks.push(funcs[i]);
			}
 			
 			if (f) {
	 			this.first();
 			}
 			
 			return this;
		}
		
		/**
		 * @since 1.7.0
		 */
		replace(funcs: TTaskDelegate | TTaskDelegate[]) {
			if (funcs instanceof Function) {
				funcs = [funcs];
			}
			
			this.reset();
			
			const tasks: TTaskDelegate[] = this._taskData.tasks;
			
			this._taskData.tasks = funcs;
 			
 			this.first();
 			
 			return this;
		}
		
		update(e: ITaskTickerData) {
			if (!this._taskData.enabled) {
				return this;
			}
			
			this.done(e);
			
			const eventNames: string[] = this._piximData.emitter.eventNames;
			const context: any = this._taskData.context;
			
			for (let i: number = 0; i < eventNames.length; i++) {
				this.cemit(eventNames[i], context, e);
			}
		}
		
		destroy(): void {
			super.destroy();
			Task.remove(this);
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
export import ITaskData = Pixim.ITaskData;

/**
 * @ignore
 */
export import Task = Pixim.Task;