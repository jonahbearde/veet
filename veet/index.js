const Koa = require('koa')
const serveStatic = require('./plugins/serveStatic')
const rewriteImports = require('./plugins/rewriteImports')
const {resolveModule} = require('./plugins/resolveModule')
const addEnv = require('./plugins/addEnv')
const compileVue = require('./plugins/compileVue')

function createServer() {
	const app = new Koa()
	const root = process.cwd()

	console.log(`root: ${root}`)

	const context = {
		app,
		root
	}

	const resolvedPlugins = [
		addEnv,
		rewriteImports,
		compileVue,
		resolveModule,
		serveStatic, 
	]

	resolvedPlugins.forEach(plugin => plugin(context))
	return app
}

module.exports = createServer