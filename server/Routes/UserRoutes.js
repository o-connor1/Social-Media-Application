const express = require( "express");
const {getuser,getfriends,updatefriends}= require('../controllers/users.js')
const {authaccess} = require('../middleware/authaccess')
const router = express.Router();

//READ
router.get("/my",authaccess,getuser);
router.get('/:id/friends',authaccess, getfriends)

//patch
router.patch('/:id/:friendid',authaccess,updatefriends)

module.exports = router