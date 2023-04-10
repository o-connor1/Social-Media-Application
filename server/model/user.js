const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            min:2,
            max:50,
        },
        lastname: {
            type: String,
            required: true,
            min:2,
            max:50,
        },
        email: {
            type: String,
            required: true,
            max:50, 
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min:5,
        },
        picturepath:{
            type:String,
        },
        friends:{
            type:[String], // ids of friends
            default:[]
        },
        // token:{
        //     type: String
        // },
        posts:{
            type: [{
                postid: mongoose.ObjectId,
                time: Number
            }],  //post ids and time of posting
            default:[]
        }


    }
);


module.exports= mongoose.model("User",userSchema);  


