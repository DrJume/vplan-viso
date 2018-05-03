const fs = require('fs')
const childProcess = require('child_process')
const { promisify } = require('util')

const Promisified = {
  fs: {
    unlink: promisify(fs.unlink),
    mkdir: promisify(fs.mkdir),
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
  },
  child_process: {
    exec: promisify(childProcess.exec),
  },
}

module.exports = Promisified
