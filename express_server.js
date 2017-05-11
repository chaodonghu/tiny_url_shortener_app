/* DEPENDENCIES */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

/* ENVIRONMENT SETUP & CONFIGURATION */
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/* GLOBAL VARIABLES */
// Defines PORT 8080
const PORT = process.env.PORT || 8080; // default port 8080
// Defines database of urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Defines database of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

/* HELPER FUNCTIONS */
// Function that generates a random shortURL
function generateRandomString() {
    let newURL = "";
    const dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
      newURL += dictionary[Math.floor(Math.random() * dictionary.length)];
    }
   return newURL;
 }

// Function that checks if the entered email is already in the
// users database
function canRegister(email) {
  for (var id in users) {
    if (users[id].email === email) {
      return false;
    }
  }
  return true;
}

/* GET REQUEST RESPONSES */

app.get("/", (req, res) => {
  res.end("Hello!");
});

// Display object of all urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Display object of all users
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Displays all urls created
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: users[req.cookies.user_id] ? users[req.cookies.user_id].email : ""
  };
  res.render("urls_index", templateVars);
});

// Add new url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// Registration page
app.get("/register", (req, res) => {
    res.render("register");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
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
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
});

// To logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Registrtion
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.sendStatus(400);
  } else {
    if(canRegister(email)) {
      let newUserId = generateRandomString();
      users[newUserId] = {id: newUserId, email: email, password: password};
      res.cookie("user_id", newUserId);
      res.redirect("/urls")
    } else {
      res.sendStatus(403);
    }
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
