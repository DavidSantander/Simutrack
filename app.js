//jshint esversion:6

//Load all modules required
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Set the number of salt rounds for the Password
const saltRounds = 10;

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

//Connect to the MongoDB database
mongoose.connect("mongodb://localhost:27017/simutrackDB", {useNewUrlParser: true});


//Create a user Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

//Create the new model for User
const User = new mongoose.model("User", userSchema);

//User request for the homepage
app.get("/", function(req, res) {
  res.render("home");
});

//When user register no page
app.post("/home", function(req, res) {
  //Create the hash password
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //Create new user with the date submited by user
    const newUser = new User({
      username: req.body.username,
      email: req.body.userMail,
      password: hash
    });

    //Save the user in the database
    newUser.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        //Enter the page
        res.send("User saved");
      }
    });
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  //Save the data posted by the user when logging in
  const userEmail = req.body.userMail;
  const password = req.body.password;


  User.findOne({email: userEmail}, function(err, foundUser) {
     if(err){
       console.log(err);
     } else {
       if (foundUser) {
         bcrypt.compare(password, foundUser.password, function(err, result) {
           if(result === true) {
             res.send("Successfully logged in.");
           }
         });
       }
     }
  });
});

//Listen for connections on the specified host and port
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
