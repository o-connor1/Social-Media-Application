const jwt = require('jsonwebtoken');


exports.authaccess=(req,res,next)=>{

    const token = req.cookies.token;

    if(!token){
       return res.status(400).send("token is not present")
    }


    try{

    const decode = jwt.verify(token,process.env.SECRET_KEY)

    req.useremail=decode.email;
    req.user_id = decode.user_id;
     

    }
    catch(err){
        return res.status(400).send("failed to varify")
    }
    
    next()
}