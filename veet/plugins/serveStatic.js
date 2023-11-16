const path = require('path')

function serveStatic({app, root}){
	app.use(require('koa-static')(root))
	app.use(require('koa-static')(path.join(root, 'public')))
}

module.exports = serveStatic