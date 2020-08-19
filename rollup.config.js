import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import del from 'del';

const conf = require('./package.json');
const version = conf.version;
const pixi = conf.dependencies['pixi.js'].replace('^', '');
const howler = conf.dependencies['howler'].replace('^', '');

const banner = [
	'/*!',
	` * @tawaship/pixim.js - v${version}`,
	' * ',
	` * @require pixi.js v${pixi}`,
	` * @require howler.js v${howler} (If use sound)`,
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
			external: ['pixi.js', '@tawaship/emitter', 'howler'],
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
					extend: true,
					globals: {
						howler: '{ Howl: typeof Howl === "undefined" ? null : Howl }',
						'pixi.js': 'PIXI',
						'exports': 'Pixim || {}'
					}
				}
			],
			external: ['pixi.js', 'howler'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true
						//pure_funcs: ['console.log']
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
					extend: true,
					globals: {
						howler: '{ Howl: typeof Howl === "undefined" ? null : Howl }',
						'pixi.js': 'PIXI'
					},
					compact: true
				}
			],
			external: ['pixi.js', 'howler'],
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript(),
				buble(),
				terser({
					compress: {
						//drop_console: true,
						pure_funcs: ['console.log']
					}
				})
			]
		}
	]
})();