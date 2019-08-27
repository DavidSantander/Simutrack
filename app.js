//jshint esversion:6

//Load all modules required
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy =require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


//Initialize the express module
const app = express();

//Serve static files included in the "public" folder
app.use(express.static("public"));
//Set EJS as the view engine for the app
app.set('view engine', 'ejs');
//Use the body parser for the app with URL encoding
app.use(bodyParser.urlencoded({
  extended: true
}));

//Set up session
app.use(session({
  secret: "Our little Secret.",
  resave: false,
  saveUninitialized: false
}));

//Initialize passport module
app.use(passport.initialize());

//Initialize passport for sessions
app.use(passport.session());

//Connect to the MongoDB database
mongoose.connect("mongodb+srv://admin-david:S4nT4nD3radmin@simutrackcluster-qdwmq.mongodb.net/simutrackDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

//Create a user Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  googleId: String
});

//Add the passport module to the user Schema
userSchema.plugin(passportLocalMongoose);
//Add findOrCreate module to the user userSchema
userSchema.plugin(findOrCreate);

//Create the new model for User
const User = new mongoose.model("User", userSchema);

//Create the strategy for User
passport.use(User.createStrategy());

//Serialize and deserialize cookie
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//Configure strategy for Google auth
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/session",
    //Necessary to handle Google Plus deprecation
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

////////////////////////////////////////////////////  REQUESTS //////////////////////////////////////////////////

//User request for the homepage
app.get("/", function(req, res) {
  res.render("home");
});

//User request for the homepage
app.get("/home", function(req, res) {
  res.render("home");
});


//When user register no page
app.post("/home", function(req, res) {
  User.register({username: req.body.username, email:req.body.userEmail}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.render("session");
      });
    }
  });
});

//When user authenticates using GoogleStrategy
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/session",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect session.
    res.redirect("/session");
  });


//When user request the log in page
app.get("/login", function(req, res) {
  res.render("login");
});

//Whe user tryes to authenticate
app.post('/login', passport.authenticate('local', { successRedirect:'/session',  failureRedirect: '/login' }));

//If user request the session route
app.get("/session", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("session");
  } else {
    res.redirect("/login");
  }
});

//Whe user log out
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});





//Listen for connections on the specified host and port
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
