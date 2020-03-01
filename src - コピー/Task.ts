import Emitter from './Emitter';
import Container from './Container';
import TickerData from './TickerData';

interface TaskData {
	context: Container,
	tickEnabled: boolean
}

//export namespace Pixim {
	export default class Task extends Emitter {
		private static _tasks: Task[] = [];
		
		private _piximData: TaskData;
		
		constructor(context: Container) {
			super();
			
			this._piximData = {
				context,
				tickEnabled: true
			};
		}
		
		/**
		 * Get registration index of task.
		 */
		private static _getIndex(task: Task): number {
			return this._tasks.indexOf(task);
		}
		
		/**
		 * Register task.
		 */
		static add(task: Task): void {
			if (this._getIndex(task) > -1) {
				return;
			}
			
			this._tasks.push(task);
		}
		
		/**
		 * Unregister task.
		 */
		static remove(task: Task): void {
			const index = this._getIndex(task);
			
			if (index === -1) {
				return;
			}
			
			this._tasks.splice(index, 1);
		}
		
		/**
		 * Execute all task.
		 */
		static done(e: TickerData): void {
			const tasks: Task[] = this._tasks;
			
			for (let i: number = 0; i < tasks.length; i++) {
				tasks[i]._update(e);
			}
		}
		
		get tickEnabled(): boolean {
			return this._piximData.tickEnabled;
		}
		
		set tickEnabled(enabled) {
			this._piximData.tickEnabled = enabled;
		}
		
		/**
		 * Execute task.
		 */
		_update(e: TickerData): void {
			if (!this.tickEnabled) {
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
			Task.remove(this);
			this.clear();
		}
	}
//}