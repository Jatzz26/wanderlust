const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const { LogedIn, isAuthor } = require('../middleware');
const ReviewController = require('../Controllers/reviews');

// Middleware: Validate review using Joi schema
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Route: Create new review
router.post(
    '/',
    LogedIn,
    validateReview,
    wrapAsync(ReviewController.CreateReview)
);

// Route: Delete review
router.delete(
    '/:reviewId',
    LogedIn,
    isAuthor,
    wrapAsync(ReviewController.DeleteReview)
);

module.exports = router;
