const express = require('express')
const User = require('../model/user')
const {authaccess} = require('../middleware/authaccess')
const {getposts, getfeed, getnextfeed} =require('../controllers/post')


const router = express.Router()

router.get('/user/:id',authaccess, getposts)
router.get('/feed',authaccess,getfeed )
router.get('/feed/next',authaccess,getnextfeed )

module.exports = router