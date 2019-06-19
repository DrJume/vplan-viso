const express = require('express')

const router = express.Router()

const auth = require('basic-auth')

function check(name, pass) {
  let valid = false

  valid = name === Config.auth.user && pass === Config.auth.password

  return valid
}


router.use('/*', (req, res, next) => {
  const credentials = auth(req)

  setTimeout(() => {
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="Big brother is watching you."')
      res.end('Big brother is watching you.')
    } else {
      next()
    }
  }, 1000)
})


router.get('/*', (req, res) => { // wildcard route: client side router
  res.render('dashboard')
})

module.exports = router
