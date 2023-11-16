const readBody = require("./utils.js")

function addEnv({ root, app }) {
  const envScript = `
	<script>
		window.process = {}
		process.env = {
			"NODE_ENV": 'development'
		}
	</script>
	`

  app.use(async (ctx, next) => {
    await next()
    if (ctx.response.is("html")) {
			const html = await readBody(ctx.body)
			// add 
			ctx.body = html.replace(/<head>/, `$&${envScript}`)
    }
  })
}

module.exports = addEnv
