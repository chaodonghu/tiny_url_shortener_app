/* DEPENDENCIES */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

/* ENVIRONMENT SETUP & CONFIGURATION */
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["A mysterious key"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/* GLOBAL VARIABLES */
// Defines PORT 8080
const PORT = process.env.PORT || 8080; // default port 8080
// Defines database of urls
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
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
// Function that generates a random string of 6 characters
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

// Function that obtains urls associated with userID
function urlsForUser(id) {
  var result = {};
  for (var shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
}

// Function that obtains password associated with user login input
function findUser(email, password) {
  // iterate through the users database
  for (var user in users) {
    // checks if the inputted email is equal to an email in the user database
    if (users[user].email === email) {
      // if the email is equal to the email in the user database then check
      // if the email's password is equal to the bcryptted password in the user database
      if (bcrypt.compareSync(password, users[user].password)) {
        return user;
      } else {
        return undefined;
      }
    }
  }
  // if the inputted email is not an email in the user database
  return undefined;
}

/* GET REQUEST RESPONSES */

// Display object of all urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Display object of all users
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Redirects to /urls if logged in, otherwise
// renders home with links to register or login
app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      email: users[userID] ? users[userID].email : ""
    }
    res.render("home", templateVars);
  }
});

// Registration page
app.get("/register", (req, res) => {
  let templateVars = {
    userID: false,
    username: ""
  };
    res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  let templateVars = {
    userID: false,
    username: ""
  };
  res.render("login", templateVars);
});

// Renders urls_index if logged in, otherwise redirects to '/'
app.get('/urls', (req, res) => {
  let userID = req.session.user_id;
  if (userID && users[userID]) {
    let templateVars = {
      // passes in subset of database that is pertaining to userID
      urls: urlsForUser(userID),
      email: users[userID].email
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/");
  }
});

// Renders urls_new if logged in, otherwise redirects to '/'
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  if (userID && users[userID]) {
    let templateVars = {
      email: users[userID].email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/");
  }
});

// Renders url show page allowing user to edit the url
// If user is not logged in, redirects user to home page
app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  if (userID && users[userID]) {
    let templateVars = {
      shortURL: shortURL,
      url: urlDatabase[shortURL].url,
      email: users[userID].email
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/");
  }
});

app.get("/u/:shortURL", (req,res) => {
  res.redirect(urlDatabase[req.params.shortURL].url);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

/* POST REQUESTS */

// Handles the post request to delete URL,
// Displays 403 error if user is not the creator of the URL.
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

// Handles the post request to update URL,
// Displays 403 error if the user is not the creator of the URL.
app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  if (userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = {
      url: req.body.newURL,
      userID: userID,
    }
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

// Redirect to edit url page.
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { url: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${newShortURL}`);
});

// To login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.sendStatus(400);
  } else {
    let userID = findUser (email, password);
    if (userID) {
      req.session.user_id = userID;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});

// To logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// Registration
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.sendStatus(400);
  } else {
    if(canRegister(email)) {
      let newUserId = generateRandomString();
      users[newUserId] = {id: newUserId, email: email, password: bcrypt.hashSync(password, 10)};
      req.session.user_id = newUserId;
      res.redirect("/urls")
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
