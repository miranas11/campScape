const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAP_BOX_PUBLIC_KEY;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("./campground/index", { campgrounds });
};

module.exports.newForm = (req, res) => {
    res.render("./campground/new");
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder
        .forwardGeocode({ query: req.body.campground.location, limit: 1 })
        .send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    //adds the current user as author
    campground.author = req.user._id;
    console.log(campground);
    await campground.save();

    req.flash("success", "Succesfully made a Campground");
    res.redirect(`/campground/${campground.id}`);
};

module.exports.showCampground = async (req, res, next) => {
    //nested populate
    const campground = await Campground.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");

    if (!campground) {
        req.flash("error", "Cannot find campground");
        return res.redirect("/campground");
    }

    res.render("./campground/show", { campground });
};

module.exports.getEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find campground");
        return res.redirect("/campground");
    }

    res.render("./campground/edit", { campground });
};

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;

    const campground = req.body.campground;

    const newCampground = await Campground.findByIdAndUpdate(
        req.params.id,
        {
            ...campground,
        },
        { new: true }
    );
    const imgs = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    newCampground.images.push(...imgs);
    await newCampground.save();

    //remove images from mongo db
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await Campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }

    req.flash("success", "Succesfully updated a Campground");
    res.redirect(`/campground/${id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Succesfully deleted a Campground");
    res.redirect("/campground");
};
