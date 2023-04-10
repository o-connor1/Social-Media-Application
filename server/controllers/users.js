const User = require('../model/user')
const { login } = require('./auth')



//READ

exports.getuser = async (req, res) => {

    try {
        const user = await User.findOne({ email: req.useremail })

        if (!user) {
            return res.status(400).send("user not found")
        }

        return res.send(user)
    }
    catch (err) {
        return res.status(400).send("error in accessing the user")
    }
}

exports.getfriends = async (req, res) => {
    
    const {id} = req.params;
    
    try{
        const user = await User.findById(id)
        if(user){
            const friendsid = user.friends;
            const friends = await Promise.all(
                friendsid.map((id)=>{ return User.findById(id)})
                )
            const formattedfriends= friends.map(({_id,firstname,lastname,picturepath})=>{return {_id,firstname,lastname,picturepath} })
            return res.json(formattedfriends)
        }
        return res.status(404).send("user id doesnt exist")

    }
    catch(err){
        console.log(err);
        return res.status(404).send("unable to get users friends")
    }

}



//PATCH

exports.updatefriends = async (req, res) => {

    const { id, friendid } = req.params


    try {
        const user = await User.findById(id);
        const friend = await User.findById(friendid)

        if (user.friends.includes(friendid)) {
            user.friends = user.friends.filter((id) => { id !== friendid })
            friend.friends = friend.friends.filter((ids) => { ids !== id })
            
        }
        else {
            user.friends.push(friendid);
            friend.friends.push(id);
        }

        await user.save()
        await friend.save()

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );

        const formettedfriends = friends.map(({ _id, firstname, lastname, picturepath }) => { return { _id, firstname, lastname, picturepath } })

        res.json(formettedfriends)
    }
    catch (err) {
        console.log(err)
        res.status(404).send("unable to add or remove friend")
    }

}