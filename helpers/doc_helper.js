const moment = require('moment');
const {
    ObjectId
} = require('mongodb');


const validateID = (id) => {
    try {
        if (id === undefined) {
            let e = new Error("The 'id' parameter does not exist !!");
            e.error_code = 400;
            throw e;
        }
        if (typeof (id) !== 'string' || id.trim().length === 0) {
            let e = new Error("The 'id' parameter should be a non-empty string(excluding spaces) !!");
            e.error_code = 400;
            throw e;
        }
        id = id.trim();
        if (!ObjectId.isValid(id) || ObjectId(id).toString() !== id) {
            let e = new Error("The 'id' parameter is not a valid ObjectID!!");
            e.error_code = 400;
            throw e;
        }
        return id;
    } catch (error) {
        console.log(`Error ${error.error_code}: ${error.message}`);
        throw error;
    }
};

const prepHomeDocs = (topDocs) => {
    topDocs.forEach(doc => {
        doc.doc_id = doc._id.toString();
        delete doc._id;
        doc.name = `${doc.firstname} ${doc.lastname}`;
    });
    return topDocs;
};

const prepDocPageData = (doc) => {
    delete doc._id;
    doc.name = `${doc.firstname} ${doc.lastname}`;
    doc.reviews_count = doc.reviews.length;
    doc.reviews.forEach(review => {
        delete review._id;
        review.review_time = moment(review.updated_at).format('MMMM Do YYYY');
    });
    const page_data = {
        name: `${doc.firstname} ${doc.lastname}`,
        reviews_count: doc.reviews.length,
        reviews: doc.reviews,
        qualification: doc.qualification,
        specialty: doc.specialty,
        location: doc.location,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        zip: doc.zip,
        rating: doc.rating,
        recent_review: doc.reviews[doc.reviews.length - 1] ? doc.reviews[doc.reviews.length - 1].review : undefined,
        recent_review_time: doc.reviews[doc.reviews.length - 1] ? doc.reviews[doc.reviews.length - 1].review_time : undefined,
    };
    return page_data;
};


const createSchedules = () => {
    let count = 14;
    let curDate = moment();
    let schedules = [];
    while (count--) {
        const daySchedule = {
            day: curDate.format('DD'),
            month: curDate.format('MM'),
            year: curDate.format('Y'),
            dayOfWeek: curDate.format('ddd'),
            monthName: curDate.format('MMM'),
            available: true,
            startDay: '09:00',
            endDay: '18:00',
            sessionTime: 30,
            breakTimes: [],
            workTimes: []
        }
        schedules.push(daySchedule);
        curDate.add(1, 'days');
    }
    return schedules;
};

const generateInsurance = () => {
    let insurance_array = [
        "Aetna",
        "Cigna",
        "United Healthcare",
        "Humana",
        "Kaiser Foundation",
        "Centene Corporation",
    ];
    const randomInsurance = Math.floor(Math.random() * insurance_array.length);
    return insurance_array[randomInsurance];
};

module.exports = {
    prepHomeDocs,
    prepDocPageData,
    createSchedules,
    generateInsurance,
    validateID
};