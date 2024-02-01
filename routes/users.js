const router = require("express").Router();
const moment = require('moment');
const xss = require('xss');


const {
    isNameInvalid,
    isEmailInvalid,
    isPasswordInvalid,
    isNumberInvalid,
    isSpecialtyInvalid
} = require('../helpers/auth_helper');

const {
    splitAppointments,
    sendEmail
} = require('../helpers/apptmnt_helper');

const {
    createUser,
    checkUser,
    isDuplicateEmail,
    getUser
} = require('../models/users');

const {
    logout,
    authorizeUser
} = require('../controllers/auth');

const {
    addApptmntToDocSchedule
} = require('../controllers/doctors');

const {
    getUserAppointments,
    createAppointment,
    addPrescription
} = require('../models/appointments');
const {
    getDoctor
} = require("../models/doctors");



router.get('/home', async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/user/login');
        } else {
            const userId = req.session.user._id;
            const apptmnts = await getUserAppointments(userId);
            const {
                newApptmnts,
                pastApptmnts
            } = splitAppointments(apptmnts);
            res.render('pages/user_home', {
                script_file: "user_home",
                title: "Patient Home",
                newApptmnts,
                pastApptmnts
            });
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }
});

router.get('/booking', async (req, res) => {
    try {
        if (req.session.user && req.session.apptmnt) {
            let user_id = req.session.user.id;
            const bookingDetails = req.session.apptmnt;
            const {
                doc_id,
                insurance,
                reason,
                new_patient,
                timeSlot
            } = bookingDetails;
            const doctor = await getDoctor(doc_id);
            const user = await getUser(user_id);
            const data = {
                user_id,
                firstname: user.firstname,
                lastname: user.lastname,
                insurance,
                reason,
                new_patient,
                timeSlot,
                doc_id,
                doc_firstname: doctor.firstname,
                doc_lastname: doctor.lastname,
                qualification: doctor.qualification,
                specialty: doctor.specialty,
                address: doctor.address,
                city: doctor.city,
                state: doctor.state,
                zip: doctor.zip,
                rating: doctor.rating,
            };
            console.log(data);

            res.render('pages/booking', {
                script_file: "booking",
                title: 'Booking',
                data,
                helpers: {
                    select(variable, fixed) {
                        return variable === fixed ? "selected" : "";
                    },
                    check(variable, fixed) {
                        return variable === fixed ? "checked" : "";
                    },
                    time(timeSlot) {
                        return moment(timeSlot).format("MMMM Do, h:mm a")
                    }
                }
            });
        } else {
            res.redirect('/user/login');
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }
});

router.post('/booking', async (req, res) => {
    try {
        if (!req.session.user && !req.session.doctor) {
            res.redirect('/user/login');
        } else {
            const user_id = xss(req.body.bookingDetails.user_id);
            const doc_id = xss(req.body.bookingDetails.doc_id);
            const firstname = xss(req.body.bookingDetails.firstname);
            const lastname = xss(req.body.bookingDetails.lastname);
            const age = xss(req.body.bookingDetails.age);
            const phone = xss(req.body.bookingDetails.phone);
            const someone_else = xss(req.body.bookingDetails.someone_else);
            const gender = xss(req.body.bookingDetails.gender);
            const insurance = xss(req.body.bookingDetails.insurance);
            const reason = xss(req.body.bookingDetails.reason);
            const new_patient = xss(req.body.bookingDetails.new_patient);
            const notes = xss(req.body.bookingDetails.notes);
            const duration = xss(req.body.bookingDetails.duration);
            const timeSlot = xss(req.body.bookingDetails.timeSlot);

            const doctor = await getDoctor(doc_id);
            const apptmntDetails = {
                user_id,
                doctor_id: doc_id,
                doctor_name: `Dr. ${doctor.firstname} ${doctor.lastname}`,
                doctor_specialty: doctor.specialty,
                doctor_location: {
                    address: doctor.address,
                    city: doctor.city,
                    state: doctor.state,
                    zip: doctor.zip
                },
                patient_name: `${firstname} ${lastname}`,
                patient_reason: reason,
                patient_notes: notes,
                patient_gender: gender,
                patient_age: parseInt(age),
                patient_phone: phone,
                someone_else: someone_else === 'yes',
                insurance,
                new_patient: new_patient === 'yes',
                duration: parseInt(duration),
                time: new Date(timeSlot),
                prescription: ""
            }
            const apptmnt = await createAppointment(apptmntDetails);
            await addApptmntToDocSchedule(apptmnt);
            const user = await getUser(user_id);
            apptmnt.user_email = user.email;
            await sendEmail(apptmnt, "Booked");
            delete req.session.apptmnt;
            res.json({
                apptmnt
            });
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }

});

router.post('/booking/:id', async (req, res) => {
    try {
        if (!req.session.user && !req.session.doctor) {
            res.redirect('/user/login');
        } else {
            const aptId = xss(req.params.id);
            const prescription = xss(req.body.presc);
            const apptmnt = await addPrescription(aptId, prescription);
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }
});

router.get('/login', async (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('pages/login', {
            title: "Login",
            action: "/user/login",
            linkTo: "/user/signup"
        });
    }
});


router.get('/signup', async (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('pages/signup', {
            script_file: "auth_validation",
            title: "Sign Up",
            action: "/user/signup",
            linkTo: "/user/login"
        });
    }
});


router.post('/login', async (req, res) => {
    let email = xss(req.body.email).trim();
    let password = xss(req.body.password).trim();

    try {
        const user = await checkUser(email, password);
        if (user) {
            authorizeUser(req, {
                id: user._id,
                firstname: user.firstname,
                usertype: "patient"
            });
            if (req.session.apptmnt) {
                res.redirect('/user/booking');
            } else {
                res.redirect('/user/home');
            }
        } else {
            res.status(500).render("pages/error", {
                error: "Internal Server Error"
            });
        }
    } catch (error) {
        res.render('pages/login', {
            title: "Login",
            action: "/user/login",
            linkTo: "/user/signup",
            error
        });
    }
});


router.post('/signup', async (req, res) => {
    let firstname = xss(req.body.firstname).trim();
    let lastname = xss(req.body.lastname).trim();
    let email = xss(req.body.email).trim();
    let password = xss(req.body.password).trim();

    const firstnameError = isNameInvalid(firstname);
    const lastnameError = isNameInvalid(lastname);
    let emailError = isEmailInvalid(email);
    const passwordError = isPasswordInvalid(password);

    try {
        email = email.trim().toLowerCase();
        if (await isDuplicateEmail(email)) {
            emailError = "Account already present. Please Login";
        }
        if (firstnameError || lastnameError || emailError || passwordError) throw 'Validation error in user signup!!';
        const {
            userInserted
        } = await createUser(firstname, lastname, email, password);
        if (userInserted) {
            res.redirect("/user/login");
        } else {
            res.status(500).render("pages/error", {
                error: "Internal Server Error"
            });
        }
    } catch (e) {
        console.log(e);
        res.render('pages/signup', {
            script_file: "auth_validation",
            title: "Sign Up",
            action: "/user/signup",
            linkTo: "/user/login",
            error: {
                firstnameError,
                lastnameError,
                emailError,
                passwordError
            }
        });
    }
});



module.exports = router;