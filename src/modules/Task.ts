import { Emitter } from './Emitter';
import { Task as _Task, ITaskDelegate } from '@tawaship/task';

export interface ITaskData {
	emitter: Emitter
}

/**
 * [[https://tawaship.github.io/Task/index.html | @tawaship/task]]
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
	 * @deprecated 1.7.0
	 */
	on(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.on(type, callback);
		
		return this;
	}
	
	/**
	 * @deprecated 1.7.0
	 */
	once(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.once(type, callback);
		
		return this;
	}
	
	/**
	 * @deprecated 1.7.0
	 */
	off(type: string, callback: ITaskDelegate) {
		this._piximData.emitter.off(type, callback);
		
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
	 * @deprecated 1.9.0
	 */
	emitAll(...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.emitAll(...args);
		
		return this;
	}
	
	/**
	 * @deprecated 1.9.0
	 */
	cemitAll(context: any, ...args: any[]) {
		if (!this._taskData.enabled) {
			return this;
		}
		
		this._piximData.emitter.cemitAll(context, ...args);
		
		return this;
	}
	
	/**
	 * @deprecated 1.7.0
	 */
	clear(type: string = '') {
		this._piximData.emitter.clear(type);
		
		return this;
	}
	
	destroy() {
		super.destroy();
		this.clear();
	}
}