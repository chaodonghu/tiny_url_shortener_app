// Dependencies
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// Envrionment setup & configuration
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Global variables
const PORT = process.env.PORT || 8080; // default port 8080
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// Generate a random shortURL
function generateRandomString() {
    let newURL = "";
    const dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
      newURL += dictionary[Math.floor(Math.random() * dictionary.length)];
    }
   return newURL;
 }

const newUserId = generateRandomString()

// Routes
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Displays all urls created
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// Add new url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

/* POST REQUESTS */

// Server-side - handles the post request to delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Server-side - handles the post request to update URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

// Redirect to edit url page.
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

// To login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// To logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
