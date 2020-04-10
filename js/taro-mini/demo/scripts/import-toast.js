const fs = require('fs')
const path = require('path')
const getAbsPath = (...p) => path.resolve(__dirname, '../', ...p)

const outputDir = 'dist/'
const appJson = 'app.json'
let initPages = []
// let watchers = []

start()

async function start() {
  initPages = await getInjectPages()
  await injectAll(initPages)
}

async function injectAll(pages) {
  const injectPromises = pages.map(p => {
    return new Promise((resolve, reject) => {
      fs.appendFileSync(p, getInjectStr(p), 'utf8')
      resolve()
    })
  })

  try {
    await Promise.all(injectPromises)
    console.log('inject toast to all pages')
  } catch (err) {
    console.log(err)
  }
}

function getInjectPages(jsonName = appJson) {
  const appJsonPath = getAbsPath(outputDir, jsonName)
  const suffix = '.wxml'

  return new Promise((resolve, reject) => {
    // check app.json
    if (fs.existsSync(appJsonPath)) {
      const pageJson = require(appJsonPath)
      const pages = (pageJson.pages || []).map(p => outputDir + p + suffix)

      // check all pages
      if (!pages.some(p => !fs.existsSync(p))) {
        resolve(pages)
      } else {
        reject('did not find all pages')
      }
    }
  })
}

function getInjectStr(pageIndex) {
  // dist/pages/a/index.wxml
  // dist/pages/b/c/index.wxml
  const depth = pageIndex.split('/').length - 2
  const depthStr = Array.from({ length: depth }).reduce(str => str + '../', '')
  return `<import src="${depthStr}components/toast/index.wxml" /><template is="toast" data="{{__toast__}}" /><import src="${depthStr}components/loading/index.wxml" /><template is="loading" data="{{__toast__}}" />`
}
