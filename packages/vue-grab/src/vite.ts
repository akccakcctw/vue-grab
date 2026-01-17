import path from 'node:path'
import type { Plugin } from 'vite'

export type VueGrabVitePluginOptions = {
  enabled?: boolean
  rootDir?: string
  include?: RegExp
  exclude?: RegExp
}

function normalizePath(value: string) {
  return value.split(path.sep).join('/')
}

function resolveFilePath(filename: string, rootDir?: string) {
  if (!rootDir) return filename
  const resolvedRoot = path.resolve(rootDir)
  const resolvedFile = path.resolve(filename)
  const relative = path.relative(resolvedRoot, resolvedFile)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return filename
  }
  return `/${normalizePath(relative)}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getLineCol(code: string, index: number) {
  const pre = code.slice(0, index)
  const lines = pre.split('\n')
  const line = lines.length
  const column = lines[lines.length - 1].length + 1
  return { line, column }
}

function createInjectedCode(name: string, file: string, line: number, column: number) {
  return `\n${name}.__file = ${JSON.stringify(file)};\n${name}.__line = ${line};\n${name}.__column = ${column};\n`
}

function injectComponentMetadata(code: string, file: string) {
  const matchVar = code.match(/export default\s+([a-zA-Z0-9_$]+)/)
  if (matchVar && matchVar.index !== undefined) {
    const name = matchVar[1]
    const varMatch = code.match(
      new RegExp(`(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=`)
    )
    const location = varMatch?.index !== undefined ? getLineCol(code, varMatch.index) : { line: 1, column: 1 }
    const inject = createInjectedCode(name, file, location.line, location.column)
    return {
      code: code.replace(matchVar[0], inject + matchVar[0]),
      map: null
    }
  }

  const matchObj = code.match(/export default\s*\{/)
  if (matchObj && matchObj.index !== undefined) {
    const { line, column } = getLineCol(code, matchObj.index)
    return {
      code: code.replace(
        /export default\s*\{/, 
        `export default { __file: ${JSON.stringify(file)}, __line: ${line}, __column: ${column},`
      ),
      map: null
    }
  }

  const matchDef = code.match(/export default\s+defineComponent\s*\(\s*\{/)
  if (matchDef && matchDef.index !== undefined) {
    const { line, column } = getLineCol(code, matchDef.index)
    return {
      code: code.replace(
        /export default\s+defineComponent\s*\(\s*\{/, 
        `export default defineComponent({ __file: ${JSON.stringify(file)}, __line: ${line}, __column: ${column},`
      ),
      map: null
    }
  }

  return null
}

function shouldTransform(id: string, include?: RegExp, exclude?: RegExp) {
  if (!id.match(/\.vue($|\?)/)) return false
  if (id.includes('node_modules')) return false
  if (exclude?.test(id)) return false
  if (include && !include.test(id)) return false
  return true
}

export function createVueGrabVitePlugin(options: VueGrabVitePluginOptions = {}): Plugin {
  let enabled = false
  let resolvedRoot: string | undefined
  let resolvedInclude = options.include
  let resolvedExclude = options.exclude

  return {
    name: 'vite-plugin-vue-grab-injector',
    enforce: 'post',
    configResolved(config) {
      enabled = options.enabled ?? config.command === 'serve'
      resolvedRoot = options.rootDir ?? config.root
    },
    transform(code, id) {
      if (!enabled) return
      if (!shouldTransform(id, resolvedInclude, resolvedExclude)) return

      const [filename] = id.split('?')
      if (!filename) return

      const file = resolveFilePath(filename, resolvedRoot)
      return injectComponentMetadata(code, file)
    }
  }
}
