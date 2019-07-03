const promiseFs = require('util/promisified').fs

try_(() => { throw new Error('test') }, 'HELLO@hidden@test')

// process.exit()
