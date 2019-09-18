const fs = require('fs')
const promiseFs = require('util/promisified').fs

const { isObject } = require('util/object-tools')

const Paths = {
  get base() {
    return 'share'
  },
  get uploadDir() {
    return `${this.base}/upload`
  },
  get dataDir() {
    return `${this.base}/display`
  },
  vplan({ type, queue }) {
    return `${this.dataDir}/${type}/vplan${queue ? `/${queue}.json` : ''}`
  },
  parseVplanPath(path) {
    return path.match(/(?<type>\w+)\/vplan\/(?<queue>\w+).json/).groups
  },
  // ticker(target) {
  //   return `${this.dataDir}/${target}/ticker.json`
  // },
}

const DataFileStructure = {
  share: {
    upload: {},

    display: {
      students: {
        vplan: {
          current: '',
          next: '',
        },
        ticker: '',
      },
      teachers: {
        vplan: {
          current: '',
          next: '',
        },
        ticker: '',
      },
    },

    logs: {},
  },
}

function getAvailableVPlans() {
  return Object.entries(DataFileStructure[Paths.base].display)
    .reduce((acc, [type, data]) => {
      acc[type] = Object.entries(data.vplan).filter(([, vplan]) => vplan).map(([queue]) => queue)

      return acc
    }, {})
}

function initDirectoryTree() {
  log.info('INIT_DIR_TREE')

  const goDeeper = (dirTree, parentPath = '') => {
    if (Object.keys(dirTree).length === 0) return

    Object.entries(dirTree)
      .filter(([, type]) => isObject(type))
      .forEach(([dir]) => {
        const newPath = `${parentPath}${parentPath ? '/' : ''}${dir}`
        const [err] = try_(() => fs.mkdirSync(newPath), 'silenced:MAKE_DIR_ERR')

        if (err && err.code !== 'EEXIST') {
          log.err('MAKE_DIR_ERR', err)
          return
        }

        goDeeper(dirTree[dir], newPath)
      })
  }

  goDeeper(DataFileStructure)
}

async function init() {
  initDirectoryTree()
}

async function readVPlan({ type, queue }) {
  const storedVal = DataFileStructure[Paths.base].display[type].vplan[queue]
  if (storedVal) return storedVal

  const vplan = await promiseFs.readFile(Paths.vplan({ type, queue }), { encoding: 'utf-8' })
  DataFileStructure[Paths.base].display[type].vplan[queue] = vplan

  return vplan
}

async function writeVPlan({ type, queue }, data) {
  DataFileStructure[Paths.base].display[type].vplan[queue] = data

  return promiseFs.writeFile(Paths.vplan({ type, queue }), data)
}

async function deleteVPlan({ type, queue }) {
  DataFileStructure[Paths.base].display[type].vplan[queue] = ''

  return promiseFs.unlink(Paths.vplan({ type, queue }))
}

module.exports.Paths = Paths
module.exports.init = init
module.exports.getAvailableVPlans = getAvailableVPlans
module.exports.readVPlan = readVPlan
module.exports.writeVPlan = writeVPlan
module.exports.deleteVPlan = deleteVPlan
