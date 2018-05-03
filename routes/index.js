const express = require('express')

const dashboard = require('routes/dashboard')
const api = require('routes/api')
const display = require('routes/display')

const router = express.Router()

router.use('/dashboard|/display', (req, res, next) => {
  const userAgent = req.get('User-Agent')
  // log.debug('USER_AGENT', userAgent)

  const browserRegEx = RegExp('Chrome|Firefox')
  const edgeRegEx = RegExp('Edge')
  const isSupportedBrowser = browserRegEx.test(userAgent) && !edgeRegEx.test(userAgent)

  // log.debug('SUPPORTED_BROWSER', isSupportedBrowser)

  if (!isSupportedBrowser) {
    res.send("<script>alert('Dieser Browser wird nicht unterstützt.')</script>")
    return
  }

  next()
})

// Define routes
router.use('/dashboard', dashboard)
router.use('/assets', express.static('routes/assets'))
router.use('/riot', express.static('routes/riot'))
router.use('/api', api)
router.use('/display', display)

// Root path listener
router.get('/', (req, res) => {
  res.redirect('/dashboard/')
})

module.exports = router
