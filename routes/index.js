var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localstrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localstrategy(userModel.authenticate()));

// GET home page
router.get('/', async function(req, res, next) {
  try {
    res.render('index', { nav: false });
  } catch (error) {
    next(error);
  }
});

// GET register page
router.get('/register', async function(req, res, next) {
  try {
    res.render("register", { nav: false });
  } catch (error) {
    next(error);
  }
});

// GET profile page
router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    res.render("profile", { user, nav: true });
  } catch (error) {
    next(error);
  }
});

// GET user's posts
router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
    res.render("show", { user, nav: true });
  } catch (error) {
    next(error);
  }
});

// GET feed page
router.get('/feed', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find().populate("user");
    res.render("feed", { user, posts, nav: true });
  } catch (error) {
    next(error);
  }
});

// GET specific post
router.get('/feed/post/:id', async (req, res, next) => {
  try {
    console.log('Post ID:', req.params.id);
    const post = await postModel.findById(req.params.id);

    if (!post) {
      console.log('Post not found');
      return res.status(404).send('Post not found');
    }

    res.render('feeder', { post, nav: true });
  } catch (error) {
    console.error('Error fetching post:', error);
    next(error);
  }
});

// GET show a specific post by user ID
router.get('/show/posts/:id', async (req, res, next) => {
  try {
    console.log('User ID:', req.params.id);
    const user = await postModel.findById(req.params.id);

    if (!user) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    res.render('showpost', { user, nav: true });
  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
});

// GET add post page
router.get('/add', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render("add", { user, nav: true });
  } catch (error) {
    next(error);
  }
});

// POST create post
router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  try {
    // Check if file is uploaded successfully
    if (!req.file) {
      return res.status(400).send("No image uploaded");
    }

    // Find the user from the session
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Create a new post and save the Cloudinary URL in the 'image' field
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.path // Save the Cloudinary image URL
    });

    // Add the post to the user's posts array
    user.posts.push(post._id);
    await user.save();

    // Redirect to the profile page
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});


// POST file upload for profile image
router.post('/fileupload', isLoggedIn, upload.single('image'), async function(req, res, next) {
  try {
    // Find the user from the session
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Check if a file was uploaded successfully
    if (req.file && req.file.path) {
      // Save the Cloudinary URL in the user's profileImage field
      user.profileImage = req.file.path; // Cloudinary URL
      await user.save();
      res.redirect('/profile');
    } else {
      res.status(400).send('No file uploaded');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// POST register user
router.post('/register', async function(req, res, next) {
  try {
    const data = new userModel({
      username: req.body.username,
      email: req.body.email,
      contact: req.body.contact,
    });

    await userModel.register(data, req.body.password);
    passport.authenticate("local")(req, res, function() {
      res.redirect("/profile");
    });
  } catch (error) {
    next(error);
  }
});

// POST login user
router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}));

// GET logout
router.get("/logout", function(req, res, next) {
  try {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  } catch (error) {
    next(error);
  }
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
