const router = require('express').Router()
const facebookRouter = require("./facebook")

//Facebook router
router.use('/facebook', facebookRouter)

module.exports = router