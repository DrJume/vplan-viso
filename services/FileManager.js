const fs = require('fs')
const promiseFs = require('util/promisified').fs

const Paths = {
  get baseDir() {
    return 'share'
  },
  get uploadDir() {
    return `${this.baseDir}/upload`
  },
  get dataDir() {
    return `${this.baseDir}/display`
  },
  get config() {
    return `${this.baseDir}/config.json`
  },
  vplan({ type, queue }) {
    return `${this.dataDir}/${type}/vplan/${queue}.json`
  },
  ticker(target) {
    return `${this.dataDir}/${target}/ticker.json`
  },
}

const DirTree = {
  share: {
    upload: {},

    display: {
      students: {
        vplan: {},
      },
      teachers: {
        vplan: {},
      },
    },

    logs: {},
  },
}

function initDirectoryTree() {
  log.info('INIT_DIR_TREE')

  const goDeeper = (dirTree, parentPath = '') => {
    if (Object.keys(dirTree).length === 0) return

    /* eslint-disable-next-line array-callback-return */
    Object.keys(dirTree).map(dir => {
      const newPath = `${parentPath}${parentPath ? '/' : ''}${dir}`
      const [err] = try_(() => fs.mkdirSync(newPath), 'silenced:MAKE_DIR_ERR')

      if (err && err.code !== 'EEXIST') {
        log.err('MAKE_DIR_ERR', err)
        return
      }

      goDeeper(dirTree[dir], newPath)
    })
  }

  goDeeper(DirTree)
}

function readFile(path) {
  return promiseFs.readFile(path)
}

function writeFile(path, data) {
  return promiseFs.writeFile(path, data)
}

function deleteFile(path) {
  return promiseFs.unlink(path)
}

module.exports.Paths = Paths
module.exports.initDirectoryTree = initDirectoryTree
module.exports.read = readFile
module.exports.write = writeFile
module.exports.delete = deleteFile
