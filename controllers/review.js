const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();

    req.flash("success", "Succesfully made a Review");
    res.redirect(`/campground/${camp._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    const result = await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Succesfully deleted a Campground");
    res.redirect(`/campground/${id}`);
};
