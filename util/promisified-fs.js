const fs = require('fs')
const { promisify } = require('util')

const PromisifiedFs = {
  unlink: promisify(fs.unlink),
  mkdir: promisify(fs.mkdir),
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
}

module.exports = PromisifiedFs
