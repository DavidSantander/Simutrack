//jshint esversion:6

//Load all modules required
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

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

//User request for the homepage
app.get("/", function(req, res) {
  res.render("home");
});

//Listen for connections on the specified host and port
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
