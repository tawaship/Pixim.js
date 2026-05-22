import { ITickerData } from './Application';
import { Emitter } from './Emitter';
import { Task as _Task } from '@tawaship/task';

export interface ITaskData {
	emitter: Emitter
}

export interface ITaskDelegate {
    (e: ITickerData): void;
}

/**
 * {@link https://tawaship.github.io/Task/index.html | @tawaship/task}
 */
export class Task extends _Task {
	private _piximData: ITaskData;
	
	constructor(tasks: ITaskDelegate | ITaskDelegate[], context: any) {
		super(tasks, context);
		
		this.enabled = true;
		this._piximData = {
			emitter: new Emitter()
		};
	}
	
    /**
     * Register task with event type.
     * 
     * @param type Event type.
     * @param callback Callback when the event fires.
     * @returns 
     */
	on(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.on(type, callback);
		
		return this;
	}
	
    /**
     * Register one-time task with event type.
     * 
     * @param type Event type.
     * @param callback Callback when the event fires.
     * @returns 
     */
	once(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.once(type, callback);
		
		return this;
	}
	
    /**
     * Unregister task with event type.
     * 
     * @param type Event type.
     * @param callback Registered callback.
     * @returns 
     */
	off(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.off(type, callback);
		
		return this;
	}
	
    /**
     * Emit task.
     * 
     * @param type Event type to emit.
     * @param args Argument(s) in callback.
     * @returns 
     */
	emit(type: string, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.emit(type, ...args);
		
		return this;
	}
	
    /**
     * Emit task with specifying a context.
     * 
     * @param type Event type to emit.
     * @param context Context to execute the callback.
     * @param args Argument(s) in callback.
     * @returns 
     */
	cemit(type: string, context: any, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.cemit(type, context, ...args);
		
		return this;
	}
	
    /**
     * Emit all task events.
     * 
     * @param args Argument(s) in callback.
     * @returns 
     */
	emitAll(...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.emitAll(...args);
		
		return this;
	}
	
    /**
     * Emit all task events with specifying a context.
     * 
     * @param context Context to execute the callback.
     * @param args Argument(s) in callback.
     * @returns 
     */
	cemitAll(context: any, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.cemitAll(context, ...args);
		
		return this;
	}
	
    /**
     * Remove callbacks grouped task event type.
     * 
     * @param type 
     * @returns 
     */
	clear(type: string = '') {
		this._piximData.emitter.clear(type);
		
		return this;
	}
	
    /**
     * Destroy instance.
     */
	destroy() {
		super.destroy();
		this.clear();
	}
}