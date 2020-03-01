const assert = require('assert');

//const Emitter = require('../dist/Pixim.cjs.js');
/*
describe('Emitter', () => {
	it('basic', () => {
		let total = 0;
		
		const f = a => {
			total += a;
		};
		
		new Emitter()
			.on('ev', f)
			.emit('ev', 1)
			.off('ev', f)
			.emit('ev', 1);
		
		assert.equal(total, 1);
	});
	
	it('basic once', () => {
		let total = 0;
		
		new Emitter()
			.once('ev', a => {
				total += a;
			})
			.emit('ev', 1)
			.emit('ev', 1);
		
		assert.equal(total, 1);
	});
	
	it('repeatable', () => {
		let total = 0;
		
		new Emitter()
			.on('ev', (...args) => {
				total += args.reduce((a, b) => a + b);
			})
			.emit('ev', 1, 2, 3, 4, 5, 6, 7);
		
		assert.equal(total, [1, 2, 3, 4, 5, 6, 7].reduce((a, b) => a + b));
	});
	
	it('context in function', () => {
		const emitter = new Emitter();
		
		emitter.on('ev', function() {
				assert.equal(this, emitter);
			})
			.emit('ev');
	});
	
	it('context in arrow function', () => {
		const emitter = new Emitter();
		const self = this;
		
		emitter.on('ev', () => {
				assert.equal(this, self);
			})
			.emit('ev');
	});
	
	it('clear group', () => {
		let total = 0;
		
		new Emitter()
			.on('ev', a => {
				total += a;
			})
			.on('ev', a => {
				total += a;
			})
			.on('ev2', a => {
				total += a;
			})
			.on('ev2', a => {
				total += a;
			})
			.clear('ev')
			.emit('ev', 1)
			.emit('ev2', 1);
		
		assert.equal(total, 2);
	});
	
	it('clear all', () => {
		let total = 0;
		
		new Emitter()
			.on('ev', a => {
				total += a;
			})
			.on('ev2', a => {
				total += a;
			})
			.on('ev3', a => {
				total += a;
			})
			.on('ev4', a => {
				total += a;
			})
			.clear()
			.emit('ev', 1)
			.emit('ev2', 1)
			.emit('ev3', 1)
			.emit('ev4', 1);
		
		assert.equal(total, 0);
	});
	
	it('emit all events', () => {
		let total = 0;
		
		const emitter = new Emitter()
			.on('ev', a => {
				total += a;
			})
			.on('ev2', a => {
				total += a;
			})
			.on('ev3', a => {
				total += a;
			})
			.on('ev4', a => {
				total += a;
			})
			.clear('ev4');
		
		const eventNames = emitter.eventNames;
		for (let i = 0; i < eventNames.length; i++) {
			emitter.emit(eventNames[i], 1);
		}
		
		assert.equal(total, 3);
	});
});
*/