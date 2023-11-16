const fs = require("fs").promises
const path = require("path")

const moduleReg = /^\/@modules\//

function resolveModule({ app, root }) {
  app.use(async (ctx, next) => {
    // the requested path
    // because modules like 'vue' is rewritten to '@modules/vue', so its gonna send a request with the rewritten path
    if (!moduleReg.test(ctx.path)) {
      return next()
    }

    const id = ctx.path.replace(moduleReg, "") // vue
    ctx.type = "js" // the imports in the response will be transformed(if there're module imports)

		const paths = getVuePaths(root)

		// fetch vue packages from node_modules
    const res = await fs.readFile(paths[id], "utf8")
    ctx.body = res
  })
}

function getVuePaths(root) {
  // get compiler-sfc
  const compilerPkgPath = path.join(
    root,
    "node_modules",
    "@vue/compiler-sfc/package.json"
  )
  const compilerPkg = require(compilerPkgPath) // get package.json
  const compilerPath = path.join(
    path.dirname(compilerPkgPath),
    compilerPkg.main
  )

	const getPath = name => path.resolve(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`)

	const runtimeDomPath = getPath('runtime-dom')
	const runtimeCorePath = getPath('runtime-core')
	const reactivityPath = getPath('reactivity')
	const sharedPath = getPath('shared')

  return {
    compiler: compilerPath,
		"@vue/runtime-dom": runtimeDomPath,
		"@vue/runtime-core": runtimeCorePath,
		"@vue/reactivity": reactivityPath,
		"@vue/shared": sharedPath,
		vue: runtimeDomPath
  }
}

module.exports = {
	resolveModule, getVuePaths
}
