const router = require('express').Router();
const { response } = require('express');
const sequelize = require("../config/connection");
const {Post, User, Comment} = require('../models')
const withAuth=require("../utils/auth")
router.get('/', withAuth,(req,res)=>{
        res.render('add-new-post',{loggedIn: true})
})

module.exports= router;