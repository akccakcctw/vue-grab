import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export type VueGrabVitePluginOptions = {
  enabled?: boolean
  rootDir?: string
  include?: RegExp
  exclude?: RegExp
}

const LOC_ATTR = 'data-vue-grab-loc'

function createLocAttributeTransform() {
  const transform = (node: any) => {
    if (node?.type !== 1 || node?.tagType !== 0) return
    const loc = node.loc?.start
    if (!loc) return
    if (!Array.isArray(node.props)) node.props = []
    const hasLoc = node.props.some(
      (prop: any) => prop?.type === 6 && prop?.name === LOC_ATTR
    )
    if (hasLoc) return
    node.props.push({
      type: 6,
      name: LOC_ATTR,
      value: {
        type: 2,
        content: `${loc.line}:${loc.column}`,
        loc: node.loc
      },
      loc: node.loc
    })
  }
  ;(transform as any).__vueGrabLocTransform = true
  return transform
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
  const lastLine = lines[lines.length - 1] ?? ''
  const column = lastLine.length + 1
  return { line, column }
}

function normalizeScriptStart(source: string, index: number) {
  if (source[index] === '\r' && source[index + 1] === '\n') return index + 2
  if (source[index] === '\n') return index + 1
  return index
}

function getComponentLocationFromSource(source: string) {
  const scriptSetupMatch = source.match(/<script\b[^>]*\bsetup\b[^>]*>/i)
  if (scriptSetupMatch && scriptSetupMatch.index !== undefined) {
    const scriptStart = normalizeScriptStart(source, scriptSetupMatch.index + scriptSetupMatch[0].length)
    return getLineCol(source, scriptStart)
  }

  const scriptMatch = source.match(/<script\b[^>]*>/i)
  if (scriptMatch && scriptMatch.index !== undefined) {
    const scriptStart = normalizeScriptStart(source, scriptMatch.index + scriptMatch[0].length)
    const scriptEnd = source.indexOf('</script>', scriptStart)
    const scriptContent =
      scriptEnd === -1 ? source.slice(scriptStart) : source.slice(scriptStart, scriptEnd)
    const exportMatch = scriptContent.match(/export default/)
    if (exportMatch && exportMatch.index !== undefined) {
      return getLineCol(source, scriptStart + exportMatch.index)
    }
    const defineMatch = scriptContent.match(/defineComponent\s*\(/)
    if (defineMatch && defineMatch.index !== undefined) {
      return getLineCol(source, scriptStart + defineMatch.index)
    }
    return getLineCol(source, scriptStart)
  }

  return { line: 1, column: 1 }
}

function createInjectedCode(name: string, file: string, line: number, column: number) {
  return `\n${name}.__file = ${JSON.stringify(file)};\n${name}.__line = ${line};\n${name}.__column = ${column};\n`
}

function injectComponentMetadata(code: string, file: string, source?: string) {
  const sourceLocation = source ? getComponentLocationFromSource(source) : null

  const matchExportSfc = code.match(
    /export default\s+(?:\/\*.*?\*\/\s*)*_export_sfc\s*\(\s*([a-zA-Z0-9_$]+)\s*,/
  )
  if (matchExportSfc && matchExportSfc.index !== undefined) {
    const name = matchExportSfc[1]
    if (!name) return null
    const location = sourceLocation ?? getLineCol(code, matchExportSfc.index)
    const inject = createInjectedCode(name, file, location.line, location.column)
    return {
      code: code.replace(matchExportSfc[0], inject + matchExportSfc[0]),
      map: null
    }
  }

  const matchVar = code.match(/export default\s+([a-zA-Z0-9_$]+)/)
  if (matchVar && matchVar.index !== undefined) {
    const name = matchVar[1]
    if (!name) return null
    const varMatch = code.match(
      new RegExp(`(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=`)
    )
    const location =
      sourceLocation ??
      (varMatch?.index !== undefined ? getLineCol(code, varMatch.index) : { line: 1, column: 1 })
    const inject = createInjectedCode(name, file, location.line, location.column)
    return {
      code: code.replace(matchVar[0], inject + matchVar[0]),
      map: null
    }
  }

  const matchObj = code.match(/export default\s*\{/)
  if (matchObj && matchObj.index !== undefined) {
    const { line, column } = sourceLocation ?? getLineCol(code, matchObj.index)
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
    const { line, column } = sourceLocation ?? getLineCol(code, matchDef.index)
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
      if (!enabled) return
      const vuePlugin = config.plugins.find(
        (plugin) => plugin.name === 'vite:vue' && (plugin as any).api?.options
      ) as any
      if (!vuePlugin) return
      const vueOptions = vuePlugin.api.options
      const templateOptions = vueOptions.template ?? {}
      const compilerOptions = templateOptions.compilerOptions ?? {}
      const nodeTransforms = compilerOptions.nodeTransforms ?? []
      const hasTransform = nodeTransforms.some(
        (transform: any) => transform?.__vueGrabLocTransform
      )
      if (hasTransform) return
      vuePlugin.api.options = {
        ...vueOptions,
        template: {
          ...templateOptions,
          compilerOptions: {
            ...compilerOptions,
            nodeTransforms: [...nodeTransforms, createLocAttributeTransform()]
          }
        }
      }
    },
    transform(code, id) {
      if (!enabled) return
      if (!shouldTransform(id, resolvedInclude, resolvedExclude)) return

      const [filename] = id.split('?')
      if (!filename) return

      const file = resolveFilePath(filename, resolvedRoot)
      let source: string | undefined
      try {
        source = fs.readFileSync(filename, 'utf8')
      } catch {
        source = undefined
      }
      return injectComponentMetadata(code, file, source)
    }
  }
}
