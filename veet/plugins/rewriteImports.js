const readBody = require("./utils")
const { parse } = require("es-module-lexer")
const MagicString = require("magic-string")

function rewrite(res) {
  const imports = parse(res)[0]

  const magicStr = new MagicString(res)

  if (imports.length) {
    for (const iprt of imports) {
      const { s, e } = iprt

      let id = res.substring(s, e)
      // if it's a dependency
      if (/^[^\/\.]/.test(id)) {
        id = `/@modules/${id}`
        magicStr.overwrite(s, e, id)
      }
    }
  }

  return magicStr.toString()
}

function rewriteImports({ app, root }) {
  app.use(async (ctx, next) => {
    await next()
		// if a js file(main.js, [vue-things].js, etc.) has module imports then transform the imports to '@modules/[smth]'
    if (ctx.body && ctx.response.is("js")) {
      const content = await readBody(ctx.body)
      const res = rewrite(content)
			ctx.body = res
    }
  })
}

module.exports = rewriteImports
