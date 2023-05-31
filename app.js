if (process.env.Node_ENV !== "production") {
    require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const session = require("express-session");
//used to connect session to mongo db
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");
const methodOveride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");

const User = require("./models/user");

const app = express();

//importing router for specific routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
// const db_url = process.env.DB_URL;
const db_url = "mongodb://127.0.0.1:27017/CampScape";

const secret = process.env.SECRET || "thisisasecret";

mongoose.connect(db_url);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
});

const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    },
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
//declare after sesion
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//serialize means how do we store the user in session
passport.serializeUser(User.serializeUser());
//deserialize means getting back user from session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    //save the current url to returnto so after login return back to same urls
    // console.log(req.session.returnTo, " : ", req.originalUrl);
    if (!["/login", "/"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//declare routes
app.use("/", userRoutes);
app.use("/campground", campgroundRoutes);
app.use("/campground/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

//This gets called for all http method for a particular route .
//here * means all route
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found", 404));
});

app.get("/error", (req, res) => {
    throw new Error("DONT EXIST");
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "ERROR NOT FOUND" } = err;
    console.log("***************ERROR*****************");

    if (!err.message) err.message = "Oh no something went wrong";
    res.status(statusCode).render("error", { err });
});
