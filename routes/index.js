const express = require('express')

const dashboard = require('routes/dashboard')
const api = require('routes/api')
const display = require('routes/display')

const router = express.Router()

// Define routes
router.use('/dashboard/*', dashboard)
router.use('/assets', express.static('routes/assets'))
router.use('/riot', express.static('routes/riot'))
router.use('/api', api)
router.use('/display', display)

// Root path listener
router.get('/', (req, res) => {
  res.redirect('/dashboard/')
})

module.exports = router
