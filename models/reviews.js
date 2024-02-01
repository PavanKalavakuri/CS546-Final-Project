const {
    getReviews,
    ObjectId,
    MongoError
} = require("../config/mongoCollections");



const addReview = async (reviewData) => {
    const reviews = await getReviews();
    const result = await reviews.updateOne({
        appointment_id: reviewData.apptmnt_id
    }, {
        '$set': {
            ...reviewData,
            updated_at: JSON.parse(JSON.stringify(new Date()))
        }
    }, {
        upsert: true
    });
    if (!result.acknowledged) throw `Failed to add or update review for apptmnt id: ${reviewData.apptmnt_id}`;
    return result;
};

const getDocReviews = async (doctor_id) => {
    const reviews = await getReviews();
    const docReviews = await reviews.find({
        doctor_id
    }).toArray();
    return docReviews;
};

module.exports = {
    addReview,
    getDocReviews
};