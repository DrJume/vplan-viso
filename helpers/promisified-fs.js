const fs = require('fs')
const { promisify } = require('util')

module.exports.unlink = promisify(fs.unlink)
module.exports.mkdir = promisify(fs.mkdir)
