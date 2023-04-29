const User = require('../model/user')
const Post = require('../model/post')


//create a post

exports.createpost = async (req, res) => {
    const  bio  = req.body
    const  file  = req.file

    try {
        const user_id = req.user_id

        const user = await User.findById(user_id)



        if (file) {
            const filepath = `http://localhost:4000/${file.filename}`

            const post = await new Post({
                user_id,
                filepath,
                bio,
            })

            await post.save()
            const postid = post._id.toString()
            user.posts.push({ postid, time: Date.now() })
            await user.save()



        }
        else {
            const post = await Post.create({
                user_id,
                bio,
            })

            await post.save((err) => { console.log(err) })
            const postid = post._id.toString()
            user.posts.push({ postid, time: Date.now() })
            await user.save()

        }


        res.send("post creation sucessfull")

    }

    catch (err) {
        res.status(400).send(`post creation unsuccessful- ${err}`)
    }



    //req should have a post 
}

//conroller for fatching the post

exports.getposts = async (req, res) => {

    const { id } = req.params

    try {
        const user = await User.findById(id);

        const posts = await Promise.all(
            user.posts.map((postid) => {
                return Post.findById(postid);
            })
        )

        return res.json(posts)
    }

    catch (err) {
        console.log(err)
        res.send('unable to fatch posts')
    }
}

const heapify_for_insersion = (feedarray) => {
    //min heap
    let latestvalue_index = feedarray.length - 1;
    while (latestvalue_index != 0 && feedarray[latestvalue_index].time < feedarray[Math.floor((latestvalue_index - 1) / 2)].time) {
        let value = feedarray[Math.floor((latestvalue_index - 1) / 2)]
        feedarray[Math.floor((latestvalue_index - 1) / 2)] = feedarray[latestvalue_index]
        feedarray[latestvalue_index] = value
        latestvalue_index = Math.floor((latestvalue_index - 1) / 2)
    }

    return feedarray
}

const heapify_for_swap = (feedarray) => {

    let swappednode_index = 0

    while (feedarray[swappednode_index].time > feedarray[2 * swappednode_index + 1].time || (feedarray[2 * swappednode_index + 2] && feedarray[swappednode_index].time > feedarray[2 * swappednode_index + 2].time)) {
        if (feedarray[2 * swappednode_index + 2]) {
            if (feedarray[2 * (swappednode_index) + 1].time < feedarray[2 * (swappednode_index) + 2].time) {
                 let recoverynode = feedarray[2 * (swappednode_index) + 1]
                feedarray[2 * (swappednode_index) + 1] = feedarray[swappednode_index]
                feedarray[swappednode_index] = recoverynode
                swappednode_index = 2 * (swappednode_index) + 1
  
                if (!feedarray[2 * (swappednode_index) + 1]) return feedarray
            }
            else {
                let recoverynode = feedarray[2 * (swappednode_index) + 2]
                feedarray[2 * (swappednode_index) + 2] = feedarray[swappednode_index]
                feedarray[swappednode_index] = recoverynode
                swappednode_index = 2 * (swappednode_index) + 2
   
                if (!feedarray[2 * (swappednode_index) + 1]) return feedarray
            }
        }
        else {
                  let recoverynode = feedarray[2 * (swappednode_index) + 1]
                feedarray[2 * (swappednode_index) + 1] = feedarray[swappednode_index]
                feedarray[swappednode_index] = recoverynode
                swappednode_index = 2 * (swappednode_index) + 1
  
                if (!feedarray[2 * (swappednode_index) + 1]) return feedarray
        }

    }

     return feedarray
}

//get feeds

exports.getfeed = async (req, res) => {

    try {
        const userid = req.user_id
        const user = await User.findById(userid)
        const friendsIds = user.friends

        const friendsid_map = new Map()
        let friendindex = 0
        const friends = await Promise.all(friendsIds.map((friendid) => { friendsid_map.set(friendid, friendindex); friendindex++; return User.findById(friendid) }))
        const friendsposts = friends.map((friendobj) => { return friendobj.posts })

        let feed = []

        let feedrecords = {
            posts_addedinfeed: {},
            lastpost_time: 0
        }

        let friendposts = null

        let feedlength = 4

        for (let j = 0; j <= friendsposts.length - 1; j++) {

            friendposts = friendsposts[j]

            if (feed.length == 0) {
                if (friendposts.length <= feedlength) {
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: friendposts.length }
                    for (let i = 0; i < friendposts.length; i++) {
                        feed[i] = friendposts[i]
                    }
                    continue
                }
                else {
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: feedlength }
                    for (let i = 0; i < feedlength; i++) {
                        feed[i] = friendposts[friendposts.length - feedlength + feed.length]
                    }
                    continue
                }
            }

            if (feed.length < feedlength) {
                if (feedlength - feed.length >= friendposts.length) {
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: friendposts.length }
                    for (let i = 0; i < friendposts.length; i++) {
                        feed[feed.length] = friendposts[i]
                        heapify_for_insersion(feed)
                    }
                    continue
                }
                else {
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: feedlength - feed.length }
                    for (let i = 0; feed.length < feedlength; i++) {
                        feed[feed.length] = friendposts[friendposts.length - feedlength + feed.length]
                        heapify_for_insersion(feed)

                    }
                }

            }


            if (feedrecords.posts_addedinfeed[j] < friendposts.length) {
                let added = feedrecords.posts_addedinfeed[j]
                let friendpost_index = friendposts.length - added - 1
                while (feed[0].time < friendposts[friendpost_index].time) {
                    const swappedpost_postid = feed[0].postid
                    const swappedpost_user = await Post.findById(swappedpost_postid)
                    const swappedpost_userid = swappedpost_user.user_id
                    const swappedpost_friendindex = friendsid_map.get(swappedpost_userid)
                     feed[0] = friendposts[friendpost_index]
                    heapify_for_swap(feed)
                    friendpost_index = friendpost_index - 1;
                    if (friendpost_index == -1){break}
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: feedrecords.posts_addedinfeed[j] + 1 }
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [swappedpost_friendindex]: feedrecords.posts_addedinfeed[swappedpost_friendindex] - 1 }
                }

                continue
            }

            if (!feedrecords.posts_addedinfeed[j]) {
                feedrecords.posts_addedinfeed[j] = 0
                let friendpost_index = friendposts.length - 1
                while (feed[0].time < friendposts[friendpost_index].time) {
                    const swappedpost_postid = feed[0].postid
                    const swappedpost_user = await Post.findById(swappedpost_postid)
                    const swappedpost_userid = swappedpost_user.user_id
                    const swappedpost_friendindex = friendsid_map.get(swappedpost_userid)

                    feed[0] = friendposts[friendpost_index]
                      heapify_for_swap(feed)
                    friendpost_index = friendpost_index - 1;
                    if (friendpost_index == -1){break}
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [j]: feedrecords.posts_addedinfeed[j] + 1 }
                    feedrecords.posts_addedinfeed = { ...feedrecords.posts_addedinfeed, [swappedpost_friendindex]: feedrecords.posts_addedinfeed[swappedpost_friendindex] - 1 }
                }
                continue
            }

        }

        feedrecords.lastpost_time = feed[0].time

        const feedposts = await Promise.all(feed.map(postobj => Post.findById(postobj.postid)))

          const option = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: false,
            secure: false,
            path: '/',
        };

        console.log(feedrecords)
        return res.cookie("feedrecord", feedrecords, option).json(feedposts)

    }
    catch (err) {
        res.send('err in getting feeds- ' + err)
    }

}

//get next posts
//this api didnt take care of -
//          if the user has unfriended any of his friends (can be done in frontend by refreshing the feeds if any friend got added or removed)
//          if the users friend has uploaded or deleted any of his existing posts

exports.getnextfeed = async (req, res) => {
    try {
        const feedrecord = req.cookies.feedrecord;
        const nextfeed = []
        const nextfeedlength = 4

        const userid = req.user_id
        const user = await User.findById(userid)
        const friendsIds = user.friends

        const friendsid_map = new Map()
        let friendindex = 0
        const friends = await Promise.all(friendsIds.map((friendid) => { friendsid_map.set(friendid, friendindex); friendindex++; return User.findById(friendid) }))
        const friendsposts = friends.map((friendobj) => { return friendobj.posts })


         for (let j = 0; j < friendsposts.length; j++) {

            const friendposts = friendsposts[j]

            if (nextfeed.length == 0) {
                if (feedrecord.posts_addedinfeed[j] < friendposts.length) {
                    if (friendposts.length - feedrecord.posts_addedinfeed[j] >= nextfeedlength) {
                        const addedposts = feedrecord.posts_addedinfeed[j]
                        for (let i = 0; nextfeed.length < nextfeedlength; i++) {
                            nextfeed[i] = friendposts[friendposts.length - addedposts - nextfeedlength + i]
                            feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [j]: feedrecord.posts_addedinfeed[j] + 1 }
                        }
                    }
                    else {
                        const addedposts = feedrecord.posts_addedinfeed[j]
                        for (let i = 0; i < friendposts.length - addedposts; i++) {
                            nextfeed[i] = friendposts[i]
                            feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [j]: feedrecord.posts_addedinfeed[j] + 1 }
                        }
                    }
                }
                continue
            }

            if (nextfeed.length < nextfeedlength) {
                if (feedrecord.posts_addedinfeed[j] < friendposts.length) {

                    if (friendposts.length - feedrecord.posts_addedinfeed[j] >= nextfeedlength - nextfeed.length) {
                        const addedposts = feedrecord.posts_addedinfeed[j]
                        for (let i = 0; nextfeed.length < nextfeedlength; i++) {
                            nextfeed[nextfeed.length] = friendposts[friendposts.length - addedposts - nextfeedlength + nextfeed.length]
                            heapify_for_insersion(nextfeed)
                            feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [j]: feedrecord.posts_addedinfeed[j] + 1 }
                        }
                    }
                    else {
                        for (let i = 0; i < friendposts.length - feedrecord.posts_addedinfeed[j]; i++) {
                            nextfeed[nextfeed.length] = friendposts[i]
                            heapify_for_insersion(nextfeed)
                            feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [j]: feedrecord.posts_addedinfeed[j] + 1 }
                        }
                        continue
                    }
                }
            }


            if (feedrecord.posts_addedinfeed[j] < friendposts.length) {
                let added = feedrecord.posts_addedinfeed[j]
                let friendpost_index = friendposts.length - added - 1
                while (nextfeed[0].time < friendposts[friendpost_index].time) {

                    const swappedpost_postid = nextfeed[0].postid
                    const swappedpost_user = await Post.findById(swappedpost_postid)
                    const swappedpost_userid = swappedpost_user.user_id
                    const swappedpost_friendindex = friendsid_map.get(swappedpost_userid)
                    nextfeed[0] = friendposts[friendpost_index]
                     heapify_for_swap(nextfeed)
                     feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [j]: feedrecord.posts_addedinfeed[j] + 1 }
                     feedrecord.posts_addedinfeed = { ...feedrecord.posts_addedinfeed, [swappedpost_friendindex]: feedrecord.posts_addedinfeed[swappedpost_friendindex] - 1 }
                     friendpost_index = friendpost_index - 1;
                    if (friendpost_index == -1){break}
                }

                continue
            }
            continue
        }

        if(nextfeed.length!=0)feedrecord.lastpost_time = nextfeed[0].time

        const nextfeedposts = await Promise.all(nextfeed.map(postobj => Post.findById(postobj.postid)))

     
        const option = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: false,
            secure: false,
            path: '/',
        };

        console.log(feedrecord)

        return res.cookie("feedrecord", feedrecord, option).json(nextfeedposts)
    }
    catch (err) {
        res.send("err-" + err)
    }

}

//delete post

//fav posts

