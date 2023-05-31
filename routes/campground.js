const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const { session } = require("passport");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

const {
    isLoggedIn,
    validateCampground,
    isAuthor,
    validateFiles,
} = require("../middleware");
const campgroundController = require("../controllers/campground");
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");

router
    .route("/")
    .get(campgroundController.index)
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        validateFiles,
        catchAsync(campgroundController.createCampground)
    );

router.get("/new", isLoggedIn, campgroundController.newForm);

router
    .route("/:id")
    .get(catchAsync(campgroundController.showCampground))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("image"),
        validateCampground,
        catchAsync(campgroundController.editCampground)
    )
    .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgroundController.deleteCampground)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.getEditForm)
);

module.exports = router;
