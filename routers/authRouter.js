const express = require('express')
const authController = require('../controllers/authController')
const { check, validationResult } = require('express-validator')
const authRouter = express.Router()
const auth = require('../middlewares/auth')



const signupValidate = [
    check('name').trim().notEmpty().isLength({ min: 3 }).withMessage('Name is required'),
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').isLength({ min: 8, max: 20 }).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
]


authRouter.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

authRouter.post('/validateSignup', signupValidate, authController.validateSignup)


authRouter.post('/validateLogin',  authController.validateLogin)

authRouter.use(auth.loggedInCheck, auth.setCacheControl)

authRouter.get('/signup', authController.getSignup)
    .get('/login', authController.getLogin)



module.exports = authRouter