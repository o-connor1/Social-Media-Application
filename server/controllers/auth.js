const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../model/user')

exports.register = async (req, res) => {

    const { firstname, lastname, email, password } = req.body;

  
    //this is the code to varify that we are getting all the mendatory fields to register the user

    if (!(firstname && lastname && email)) {
        res.status(400).send(req);
    };


    // here we are requestingn the mongoose that search the email whether this email exist in our server or not

    try {
        const existingUser = await User.findOne({ email });


        if (existingUser) {

            return res.status(401).send('user already existed')
        }


        //password managment
        
        const hashedpass = await bcrypt.hash(password, 10);

        const picturepath= `http://localhost:4000/${req.file.filename}`

        //storing it to the database
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedpass,
            picturepath
        })


        //generating the token
    

        //if we wanted the user to login after regitering in then we can save the token to the database but here we want that 
        //the user will sign in after he done with the registration
        // thats why we are only assigning the user token in here not updating it in the database
   
        return res.json(user)



    } catch(err) {
        res.send(`error found in registration - ${err} `)
    }
}


exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const ExistingUser = await User.findOne({ email })
        
        if (!ExistingUser) {
            return res.status(401).send('user not exist')
        }

        if (!(await bcrypt.compare(password, ExistingUser.password))) {
            return res.status(401).send('incorrect username or password')
        }

        //generating token

        const token = jwt.sign(
            { user_id: ExistingUser._id, email },   
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        )


        const option = {
            expires: new Date(Date.now()+ 3*24*60*60*1000 ),
            httpOnly: false,
            secure:false,
            path:'/',
        };

        return  res.cookie("token",token,option).send("login successfull")
       

        //here i havent saved the token in the model
     
    //  return res.send("login successfull")
    
    }
    catch (err) {
        return res.status(400).send("failed to login")
    }
}
