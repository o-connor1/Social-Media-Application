const mongoose = require("mongoose")

exports.connect=()=>{
    mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true ,
    useUnifiedTopology:true
}).then(
    console.log("db connected")
).catch( (error)=>{
    console.log('db connection failed')
    process.exit(1)
});
}

