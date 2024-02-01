const router = require("express").Router();
const xss = require('xss');

const {
    addReview
} = require('../models/reviews.js');

const {
    updateDocRating
} = require('../controllers/doctors');

router.post('/', async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/');
        } else {
            const apptmnt_id = xss(req.body.reviewData.apptmnt_id);
            const user_id = xss(req.body.reviewData.user_id);
            const doctor_id = xss(req.body.reviewData.doctor_id);
            let rating = xss(req.body.reviewData.rating);
            const review = xss(req.body.reviewData.review);
            rating = parseInt(rating);
            const reviewData = {
                apptmnt_id,
                user_id,
                doctor_id,
                rating,
                review
            };
            const result = await addReview(reviewData);
            await updateDocRating(reviewData);
            res.json(`Successfully added or updated the review for apptmnt id: ${reviewData.apptmnt_id}`);
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }
});


module.exports = router;