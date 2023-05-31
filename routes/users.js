const express = require("express");

const passport = require("passport");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require("../middleware");
const router = express.Router();

const userController = require("../controllers/user");

router
    .route("/register")
    .get(userController.renderRegisterForm)
    .post(userController.registerUser);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        userController.loginUser
    );

router.get("/logout", userController.logoutUser);

module.exports = router;
