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
	
	on(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.on(type, callback);
		
		return this;
	}
	
	once(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.once(type, callback);
		
		return this;
	}
	
	off(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.off(type, callback);
		
		return this;
	}
	
	emit(type: string, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.emit(type, ...args);
		
		return this;
	}
	
	cemit(type: string, context: any, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.cemit(type, context, ...args);
		
		return this;
	}
	
	emitAll(...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.emitAll(...args);
		
		return this;
	}
	
	cemitAll(context: any, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.cemitAll(context, ...args);
		
		return this;
	}
	
	clear(type: string = '') {
		this._piximData.emitter.clear(type);
		
		return this;
	}
	
	destroy() {
		super.destroy();
		this.clear();
	}
}