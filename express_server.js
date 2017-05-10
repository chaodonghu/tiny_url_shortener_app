// import modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// envrionment setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// global variables
const PORT = process.env.PORT || 8080; // default port 8080
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a random shortURL
function generateRandomString() {
    let newURL = "";
    const dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
      newURL += dictionary[Math.floor(Math.random() * dictionary.length)];
    }
   return newURL;
 }

const newUserId = generateRandomString()

// request responses
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
