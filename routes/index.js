var express = require('express');
var router = express.Router();
const userModel =require("./users");
const postModel =require("./post");
const passport = require('passport');
const localstrategy=require("passport-local")
const upload = require("./multer")

passport.use(new localstrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav: false });
});

router.get('/register',function(req,res,next){
  res.render("register",{nav: false }); 
});
router.get('/profile',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts")
  res.render("profile",{user,nav: true }); 
});
router.get('/show/posts',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts")
  res.render("show",{user,nav: true }); 
});

router.get('/feed',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  })
 const posts= await postModel.find().populate("user")
 res.render("feed",{user,posts,nav:true});

});
router.get('/feed/post/:id', async (req, res) => {
  try {
    console.log('Post ID:', req.params.id);  // Log the post ID
    const post = await postModel.findById(req.params.id);
    
    if (!post) {
      console.log('Post not found');
      return res.status(404).send('Post not found');
    }

    res.render('feeder', { post,nav:true });
  } catch (error) {
    console.error('Error fetching post:', error);  
    res.status(500).send('Server error');
  }
});

router.get('/show/posts/:id', async (req, res) => {
  try {
    console.log('User ID:', req.params.id);  
    const user = await postModel.findById(req.params.id);
    console.log(user);
    if (!user) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    res.render('showpost', {user, nav: true });
  } catch (error) {
    console.error('Error fetching user:', error);  
    res.status(500).send('Server error');
  }
});

router.get('/add',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  })
  res.render("add",{user,nav: true }); 
});

router.post('/createpost',isLoggedIn,upload.single("postimage") ,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  })
  const post =await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});



router.post('/fileupload',isLoggedIn, upload.single('image'),async function (req, res) {

  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (req.file && req.file.filename) {
      user.profileImage = req.file.filename;
      await user.save();
      res.redirect('/profile');
    } else {
      res.status(400).send('No file uploaded');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

router.post('/register',function(req,res,next){
const data = new userModel({
  username:req.body.username,
  email:req.body.email,
  contact :req.body.contact,

})
userModel.register(data,req.body.password)
.then(function(){
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile");
  })
})
});
router.post('/login',passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:"/profile",
  }));

  router.get("/logout",function(req,res,next){
    req.logout(function(err){
      if(err){
       { return next(err);}
      }
      res.redirect('/login');
    });
      
    })

    function isLoggedIn(req,res,next){
      if(req.isAuthenticated()) return next();
      res.redirect('/');
    }
module.exports = router;
