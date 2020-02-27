import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const banner = [
	'/*!',
	` * @tawaship/pixim.js - v${require('./package.json').version}`,
	' * ',
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

export default (async () => {
	if (process.env.PROD) {
		await del(['./docs', './types', './dist']);
	}
	
	return [
		{
			input: 'src/Pixim.ts',
			output: [
				{
					banner,
					file: 'dist/Pixim.cjs.js',
					format: 'cjs',
					sourcemap: true
				},
				{
					banner,
					file: 'dist/Pixim.esm.js',
					format: 'esm',
					sourcemap: true
				}
			],
			external: ['pixi.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript()
			]
		},
		{
			input: 'src/Pixim.ts',
			output: [
				{
					banner,
					file: 'dist/Pixim.js',
					format: 'iife',
					name: 'Pixim',
					sourcemap: true,
					globals: {
					//	'pixi.js': 'PIXI'
					}
				}
			],
			external: ['pixi.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						defaults: false,
						drop_console: true
					},
					mangle: false,
					output: {
						beautify: true,
						braces: true
					}
				})
			]
		},
		{
			input: 'src/Pixim.ts',
			output: [
				{
					banner,
					file: 'dist/Pixim.min.js',
					format: 'iife',
					name: 'Pixim',
					globals: {
					//	'pixi.js': 'PIXI'
					}
				}
			],
			external: ['pixi.js'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						drop_console: true
					}
				})
			]
		}
	]
})();