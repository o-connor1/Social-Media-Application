const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fileupload = require('express-fileupload')
const multer = require('multer')
const cookieparser = require('cookie-parser')
const wss = require('ws')

require("dotenv").config();

const { register } = require('./controllers/auth.js')
const authRoutes = require('./Routes/authRoutes')
const UserRoutes = require('./Routes/UserRoutes')
const postRoutes = require('./Routes/postRoutes')
const {authaccess} = require('./middleware/authaccess')
const {createpost} = require('./controllers/post')




const User = require("./model/user.js");
//connect db
require('./config/database').connect();




//configuration 

const corsoptions ={
    credentials:true,
    origin: 'http://www.localhost:3000'
}

const app = express();
app.use(express.json())
app.use(cors(corsoptions))
app.use(cookieparser())
app.use(express.static('profilePics'))


// file storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "profilePics");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + ".jpeg");
    },
});

const upload = multer({ storage: storage })




// APIs


app.get('/', (req, res) => {
    res.send('<h1>this is registration page</h1>')
})


//route involving upload
app.post('/auth/register', upload.single('profilepic'), register)

app.post('/post/createnew',authaccess, upload.single('file'),createpost)


//for testing image uploads

// app.post('/testform',upload.single('file'),(req,res)=>{
// console.log(req.body)
// const path= req.body.picturepath
// return res.send(path)
// })


//routes
app.use('/auth', authRoutes)
app.use('/users', UserRoutes)
app.use('/post',postRoutes)
//when the user create a path then



app.listen(process.env.PORT, () => { console.log(`server is running in port ${process.env.PORT}`) })


