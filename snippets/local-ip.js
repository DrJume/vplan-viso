// source: https://gist.github.com/szalishchuk/9054346
const { networkInterfaces } = require('os')

const getLanIP = () => [].concat(...Object.values(networkInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address

module.exports = getLanIP()
