

const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const User = require('../model/user')



async function getLogin(req, res) {
    res.render('user/login', { title: 'login' })
}
async function getSignup(req, res) {
    res.render('user/signup')
}

async function validateSignup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        if (!req.session?.isMailVerified) {
            return res.status(200).json({ success: false, message: 'Verify mail to continue' })
        }
        const dupeMail = await User.findOne({ email })
        if (dupeMail) {
            return res.status(200).json({ success: false, message: 'E-mail already exists.' })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await new User({
            name, email, password: hashedPassword
        }).save()
        // await createUser({ name, email, password });
        res.status(200).json({ success: true, message: 'Signup successful' });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function validateLogin(req, res) {
    try {
        const { password, userCred } = req.body
        const dupUser = await User.findOne({ $or: [{ name: userCred }, { email: userCred }] })
        if (!dupUser) {
            return res.status(200).json({ success: false, message: `User doesn't exists` })
        }
        const userPass = dupUser.password
        const passCheck = await bcrypt.compare(password, userPass)
        if (passCheck) {
            req.session.isLoggedIn = true
            req.session.userId = dupUser._id
            if (dupUser.isAdmin) { req.session.isAdmin = true }
            // console.log(req.session)
            req.session.save()
            res.status(200).json({ success: true, message: `Verification success.`, isAdmin: req.session.isAdmin })
            return
        }
        return res.status(200).json({ success: false, message: 'Password incorrect' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}
module.exports = {
    getSignup,
    getLogin,
    validateLogin,
    validateSignup
}