const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema, filesSchema } = require("./schemas.js");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You Must Be Logged In First!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);

    if (result.error) {
        const msg = result.error.details.map((e) => e.message).join(",");
        console.log(msg);

        throw new ExpressError(result.error.message, 404);
    } else {
        next();
    }
};

module.exports.validateFiles = (req, res, next) => {
    const result = filesSchema.validate(req.files);

    if (result.error) {
        const msg = result.error.details.map((e) => e.message).join(",");
        console.log(msg);

        throw new ExpressError(result.error.message, 404);
    } else {
        next();
    }
};

//authorize campground so the author can only edit and delete campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You dont have permission to access this");
        return res.redirect(`/campground/${id}`);
    }

    next();
};

//authorize review so only a author can delete review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You dont have permission to access this");
        return res.redirect(`/campground/${id}`);
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(msg, 404);
    } else {
        next();
    }
};
