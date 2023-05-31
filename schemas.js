const joi = require("joi");

module.exports.campgroundSchema = joi.object({
    campground: joi
        .object({
            title: joi.string().required(),
            price: joi.number().required().min(1),
            location: joi.string().required(),
            description: joi.string().required(),
        })
        .required(),
    deleteImages: joi.array(),
});

module.exports.reviewSchema = joi.object({
    review: joi
        .object({
            rating: joi.number().required().min(1).max(5),
            body: joi.string().required(),
        })
        .required(),
});

module.exports.filesSchema = joi
    .array()
    .min(1)
    .messages({ "array.min": "Upload atleast 1 image" });
