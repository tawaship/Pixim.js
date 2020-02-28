import Emitter from './Emitter';
import Container from './Container';
import TickerData from './TickerData';
export default class Task extends Emitter {
    private static _tasks;
    private _piximData;
    constructor(context: Container);
    /**
     * Get registration index of task.
     */
    private static _getIndex;
    /**
     * Register task.
     */
    static add(task: Task): void;
    /**
     * Unregister task.
     */
    static remove(task: Task): void;
    /**
     * Execute all task.
     */
    static done(e: TickerData): void;
    get tickEnabled(): boolean;
    set tickEnabled(enabled: boolean);
    /**
     * Execute task.
     */
    _update(e: TickerData): void;
    /**
     * Destroy instance.
     */
    destroy(): void;
}
