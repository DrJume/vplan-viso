const express = require('express')

const router = express.Router()

router.get('/students', (req, res) => {
  res.render('display/students')
})

router.get('/teachers', (req, res) => {
  res.render('display/teachers')
})

module.exports = router
