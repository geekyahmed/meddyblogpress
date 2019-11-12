const express = require("express");
const router = express.Router();
const defaultController = require("../controllers/defaultController");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Post = require("../models/PostModel").Post;
const User = require("../models/UserModel").User;

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "default";

  next();
});

// router.get('/', (req, res) => {
//  if (req.query.search) {
//         const regex = new (escapeRegex(req.query.search), 'gi')

//         Post.find({name: regex}, function (err, posts) {
//             if (err) {
//                 console.log(err)
//             }
//             else{
//                 res.render("default/index", {posts: posts});
//             }
//         })

//  }
// });

// noinspection JSCheckFunctionSignatures
router.route("/").get(defaultController.index);

router.route("/users").get(defaultController.user);

// Defining Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ email: email }).then(user => {
        if (!user) {
          return done(
            null,
            false,
            req.flash("error-message", "User not found with this email.")
          );
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
          if (err) {
            return err;
          }

          if (!passwordMatched) {
            return done(
              null,
              false,
              req.flash("error-message", "Invalid Username or Password")
            );
          }

          return done(
            null,
            user,
            req.flash("success-message", "Login Successful")
          );
        });
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// noinspection JSCheckFunctionSignatures
router
  .route("/login")
  .get(defaultController.loginGet)
  .post(
    passport.authenticate("local", {
      successRedirect: "/admin",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: true,
      session: true
    }),
    defaultController.loginPost
  );

// noinspection JSCheckFunctionSignatures
router
  .route("/register")
  .get(defaultController.registerGet)
  .post(defaultController.registerPost);

router
  .route("/post/:id")
  .get(defaultController.getSinglePost)
  .post(defaultController.submitComment);

router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success-message", "Logout was successful");
  res.redirect("/");
});
function escapeRegex(text) {
  return text.replace(/[-[\]{}{}()*+?. ,\\^$|#\s]/g, "\\$&");
}
module.exports = router;
