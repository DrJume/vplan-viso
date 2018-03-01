const log = require('helpers/logger')
const path = require('path')

log.info('__dirname', __dirname)
log.info('__basedir', __basedir)
log.info('process.cwd()', process.cwd())
log.info('path.resolve(.)', path.resolve('.'))

process.exit()
