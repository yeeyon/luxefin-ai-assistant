const assert = require("node:assert/strict")
const fs = require("node:fs")
const Module = require("node:module")
const path = require("node:path")
const ts = require("typescript")

function loadTypeScriptModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filePath,
  })

  const mod = new Module(filePath, module)
  mod.filename = filePath
  mod.paths = Module._nodeModulePaths(path.dirname(filePath))
  mod._compile(outputText, filePath)
  return mod.exports
}

const { sanitizeAssistantHtml } = loadTypeScriptModule(
  path.join(process.cwd(), "lib", "utils", "sanitize-html.ts")
)

const mixedHtmlResponse = `First of all, we are not <b>ChatGPT or Gemini</b>, but rather a trainable AI Chatbot.

<i><b>Can you replace human?</b></i>

<i><b>Tell more about the AI Chatbot</b></i>`

const mixedResult = sanitizeAssistantHtml(mixedHtmlResponse)
assert.ok(mixedResult, "mixed plain text and assistant HTML should render on the sanitized HTML path")
assert.match(mixedResult, /<b>ChatGPT or Gemini<\/b>/)
assert.match(mixedResult, /<i><b>Can you replace human\?<\/b><\/i>/)
assert.match(mixedResult, /<br>/)

assert.equal(
  sanitizeAssistantHtml("Use < and > as plain text, not as markup."),
  null,
  "plain text without a valid HTML tag pair should stay on React's escaped text path"
)

const unsafeResult = sanitizeAssistantHtml(
  '<b onclick="alert(1)">Safe</b><script>alert(1)</script><a href="javascript:alert(1)">bad link</a>'
)
assert.ok(unsafeResult, "safe allowed tags should survive sanitization")
assert.match(unsafeResult, /<b>Safe<\/b>/)
assert.doesNotMatch(unsafeResult, /onclick|<script|javascript:/i)

console.log("sanitizeAssistantHtml verification passed")
