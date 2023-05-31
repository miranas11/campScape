const ExpressError = require("./ExpressError");

module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};
