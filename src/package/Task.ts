import Emitter from './Emitter';
import Container from './Container';
import TickerData from './TickerData';

type Tasks = Task[];

/**
 * @class
 * @memberof Pixim
 * @extends Pixim.Emitter
 */
export default class Task extends Emitter {
	/**
	 * @member {Tasks[]}
	 * @static
	 * @private
	 */
	private static _tasks: Tasks = [];
	
	/**
	 * @member {Pixim.Container}
	 * @private
	 */
	private _target: Container;
	
	/**
	 * @constructor
	 * @param {Pixim.Container} target
	 */
	constructor(target: Container) {
		super();
		
		this._target = target;
	}
	
	private static _has(task: Task): boolean {
		return this._tasks.indexOf(task) > -1;
	}
	
	static add(task: Task): void {
		if (this._has(task)) {
			return;
		}
		
		Task._tasks.push(task);
	}
	
	static remove(task: Task): void {
		if (!this._has(task)) {
			return;
		}
		
		this._tasks.splice(idx, 1);
	}
	
	static done(e: TickerData): void {
		const tasks: Tasks = this._tasks;
		
		for (let i: number = 0; i < tasks.length; i++) {
			tasks[i].update(e);
		}
	}
	
	update(e: TickerData): void {
		const eventNames: string[] = this.eventNames;
		const target: Container = this._target;
		
		for (let i: number = 0; i < eventNames.length; i++) {
			this.cemit(eventNames[i], target, e);
		}
	}
	
	destroy(): void {
		Task.remove(this);
		this.clear();
		this._target = null;
	}
}