// const express = require('express')

module.exports = middleWare = {
    adminCheck : (req , res , next) => {
        if(req.session.isLoggedIn){
            if(req.session.isAdmin){
                console.log('first')
                next()
            }else{
                res.redirect('/user/home')
            }
        }else{
            res.redirect('/login')
        }
    },
    userCheck : (req , res , next) =>{
        if(req.session.isLoggedIn){
            // console.log('is logged in :' , req.session.isLoggedIn )
            if(req.session?.isAdmin){
                console.log('is admin' , req.session.isAdmin)
                res.redirect('/admin/showProducts')
            }else{
                next()
            }
        }else{
            res.redirect('/login')
        }
    },
    loggedInCheck : (req , res , next) => {
        if(req.session.isLoggedIn){
            if(req.session.isAdmin){
                res.redirect('/admin/showProducts')
            }else{
                res.redirect('/user/home')
            }
        }else{
            next()
        }
    },
    loggedInFalse : (req , res , next) =>{
        req.session.isLoggedIn = false
        req.session.isAdmin = false
        next()
    },
    setCacheControl : (req , res , next ) => {
        res.set('Cache-Control', 'no-store');
        next()
    }
} 
