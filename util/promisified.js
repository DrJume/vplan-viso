const fs = require('fs')
const childProcess = require('child_process')
const { promisify } = require('util')

const Promisified = {
  fs: {
    unlink: promisify(fs.unlink),
    mkdir: promisify(fs.mkdir),
    rmdir: promisify(fs.rmdir),
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
  },
  child_process: {
    exec: promisify(childProcess.exec),
  },
  time: {
    delay: ms => new Promise(res => setTimeout(res, ms)),
  },
}

module.exports = Promisified
