const path = require("path")
const fs = require("fs").promises
const { getVuePaths } = require("./resolveModule")

const exportDefaultRE = /((?:^|\n|;)\s*)export default/

function compileVue({ app, root }) {
  app.use(async (ctx, next) => {
    // transform vue files
    if (!ctx.path.endsWith(".vue")) {
      return next()
    }

    // get vue file content
    const filePath = path.join(root, ctx.path)

    const content = await fs.readFile(filePath, "utf8")

    // compile .vue
    const { parse, compileTemplate } = require(getVuePaths(root).compiler)
    let { descriptor } = parse(content)
    // console.log(descriptor);
    if (!ctx.query.type) {
      let code = ""
      if (descriptor.script) {
        // get script content
        let content = descriptor.script.content
        code += content.replace(exportDefaultRE, "$1const __script=")
        // console.log(code);
      }

      if (descriptor.template) {
        const path = ctx.path + `?type=template`
        console.log(`path ${path}`)
        code += `\nimport { render as __render} from "${path}"`
        code += `\n__script.render = __render`
      }

      code += `\nexport default __script`
      ctx.type = "js"
      // console.log('code',code)
      ctx.body = code
    }

    // __script is the root component and it has a render function
    // this script will send another request to compile the template at line "import... from ... ?type=template" so __script can have a render function

    // 		import { ref } from "/@modules/vue"
    // const __script= {
    //   setup() {
    //     const foo = ref("bar")
    //     return {
    //       foo,
    //     }
    //   },
    // }

    // import { render as __render} from "/src/App.vue?type=template"
    // __script.render = __render
    // export default __script

    if (ctx.query.type === "template") {
      // console.log('got template');
      ctx.type = "js"

      const content = descriptor.template.content
      // compile template
      const { code } = compileTemplate({ source: content })
      // console.log("code", code)
      ctx.body = code
    }

    // App.vue?type=template looks like below:
		
    // import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "/@modules/vue"

    // export function render(_ctx, _cache) {
    //   return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.foo), 1 /* TEXT */))
    // }
  })
}

module.exports = compileVue
