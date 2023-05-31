const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("./users/register");
    // res.render("./campground/new");
};

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        //logs in after registration
        req.login(registeredUser, (err) => {
            if (err) next(err);
            req.flash("success", "Welcome to yelp camp");
            res.redirect("/campground");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login");
};

module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome Back");
    //
    const redirectUrl = req.session.returnTo || "/campground";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) next(err);
    });
    req.flash("success", "GoodBye!");
    res.redirect("/campground");
};
