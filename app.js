const adminRouter = require('./routers/adminRouter')
const userRouter = require('./routers/userRouter')

const session = require('express-session')
const path = require('path')
const express = require('express')
const multer = require('multer')


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: "this is secret",
    resave: true,
    saveUninitialized: true
}))

const dotenv = require('dotenv')
const { default: mongoose } = require('mongoose');
const exp = require('constants');
dotenv.config({ path: '.env' })

const MongoURL = process.env.MongoURL
const port = process.env.PORT || 3001

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')


//! mongo db connecting

mongoose.connect(MongoURL)
    .then(() => { console.log(`monogodb connected succesfully..`) })
    .catch(err => { console.log(`error connecting database ${err.message}`) })



app.use('/admin', adminRouter)
app.use('/user', userRouter)
// app.use('/' , )


app.listen(port, () => {
    console.log(`server is running in http://localhost:${port}/addProduct`)
})