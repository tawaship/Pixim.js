import { Emitter } from './Emitter';
import { Container }  from './Container';

/**
 * @private
 */
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

/**
 * @private
 */
export class Task extends Emitter {
	private _piximData: ITaskData;
	
	constructor(context: Container) {
		super();
		
		this._piximData = {
			context,
			enabled: true
		};
	}
	
	/*
	 * Get registration index of task.
	 */
	/*
	private static _getIndex(task: Task): number {
		return _tasks.indexOf(task);
	}
	*/
	
	/*
	 * Register task.
	 */
	/*
	static add(task: Task): void {
		if (this._getIndex(task) > -1) {
			return;
		}
		
		_tasks.push(task);
	}
	*/
	
	/*
	 * Unregister task.
	 */
	/*
	static remove(task: Task): void {
		const index = this._getIndex(task);
		
		if (index === -1) {
			return;
		}
		
		_tasks.splice(index, 1);
	}
	*/
	
	/*
	 * Execute all task.
	 */
	/*
	static done(e: ITickerData): void {
		for (let i: number = 0; i < _tasks.length; i++) {
			_tasks[i]._update(e);
		}
	}
	*/
	
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