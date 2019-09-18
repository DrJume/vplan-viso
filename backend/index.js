const express = require('express')
const path = require('path')

const api = require('backend/api')

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
router.use(express.static('frontend/dist'))
router.use('/api', api)

// Serve SPA with frontend router in history mode
router.get('*', (req, res) => {
  res.sendFile(path.resolve(process.env.NODE_PATH, 'frontend/dist/index.html'))
})

module.exports = router
