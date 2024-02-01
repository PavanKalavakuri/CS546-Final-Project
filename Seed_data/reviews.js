const mongoCollections = require('../config/mongoCollections');
const mongocall = require("mongodb");
const {ObjectId} = require('mongodb');
const reviews = mongoCollections.reviews;
const doctorList = mongoCollections.doctors;

// Function to create reviews
async function createReviews(apptmnt_id, doctor_id,rating, review, user_id){
    if(apptmnt_id == null || doctor_id == null || user_id == null || review == null || rating == null){
        throw Error("INVALID: invalid input parameters")
    }
    if(review.trim(' ').length===0 || rating.trim(' ').length===0 ){
        throw Error("review text or rating cannot have white spaces");
    }
    if(typeof rating != 'string' || typeof review != 'string'){
        throw Error("INVALID: rating or review parameter");
    }
    let x = ObjectId(doctor_id);
    let rObj = {apptmnt_id,doctor_id,user_id,review,rating};
    const getDoctor = await doctorList();
    const insertComment = await getDoctor.updateOne({_id:x},{$push:{reviews:rObj}});
    return insertComment;
}
module.exports={createReviews}
