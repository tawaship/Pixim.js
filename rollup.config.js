import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const version = require('./package.json').version;
const banner = [
	'/*!',
	` * @tawaship/pixim.js - v${version}`,
	' * ',
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

const intro = `window.console.log("%c pixim.js%cv${version} %c","color: #FFF; background: #03F; padding: 5px; border-radius:12px 0 0 12px; margin-top: 5px; margin-bottom: 5px;","color: #FFF; background: #F33; padding: 5px;  border-radius:0 12px 12px 0;","padding: 5px;");`

export default (async () => {
	if (process.env.PROD) {
		await del(['./docs', './types', './dist']);
	}
	
	return [
		{
			input: 'src/index.ts',
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
			external: ['pixi.js', '@tawaship/emitter'],
			watch: {
				clearScreen: false
			},
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript()
			]
		},
		{
			input: 'src/index.ts',
			output: [
				{
					banner,
					intro,
					file: 'dist/Pixim.js',
					format: 'iife',
					name: 'Pixim',
					sourcemap: true,
					globals: {
						'pixi.js': 'PIXI'
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
			input: 'src/index.ts',
			output: [
				{
					banner,
					intro,
					file: 'dist/Pixim.min.js',
					format: 'iife',
					name: 'Pixim',
					globals: {
						'pixi.js': 'PIXI'
					},
					compact: true
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