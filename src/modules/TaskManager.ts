import * as PIXI from 'pixi.js';
import { Task } from './Task';
import { ITickerData } from './Application';
import { Container } from './Container';

namespace Pixim {
	/**
	 * @ignore
	 */
	interface IObserverDictionary {
		[name: number]: Container;
	}
	
	/**
	 * @ignore
	 */
	const _observers: IObserverDictionary = {};
	
	/**
	 * @ignore
	 */
	let _lastTickerData: ITickerData = { delta: 1 };
	
	/**
	 * @private
	 */
	export class TaskManager {
		constructor() {
			throw new Error('This class can not instantiate.');
		}
		
		static addObserver(id: number, observer: Container) {
			_observers[id] = observer;
			observer.updateTask(_lastTickerData);
		}
		
		static removeObserver(id: number) {
			delete(_observers[id]);
		}
		
		static done(e: ITickerData) {
			_lastTickerData = e;
			
			for (let i in _observers) {
				_observers[i].updateTask(e);
			}
		}
	}
}

/**
 * @ignore
 */
export import TaskManager = Pixim.TaskManager;