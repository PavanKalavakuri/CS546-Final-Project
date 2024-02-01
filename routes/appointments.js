const router = require("express").Router();
const xss = require('xss');

const {
    getUserAppointments,
    getDocAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment
} = require('../models/appointments');

const {
    addApptmntToDocSchedule,
    removeApptmntFromDocSchedule
} = require('../controllers/doctors');

const {
    prepareAppointments,
    sendEmail,
    validateID,
    validateApptmnt
} = require('../helpers/apptmnt_helper');
const {
    getUser
} = require("../models/users");



router.get('/', async (req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user.id;
            const apptmnts = await getUserAppointments(userId);
            prepareAppointments(apptmnts);
            res.json({
                apptmnts
            });
        } else if (req.session.doctor) {
            const docId = req.session.doctor.id;
            const apptmnts = await getDocAppointments(docId);
            prepareAppointments(apptmnts);
            res.json({
                apptmnts
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
        res.render("pages/error404", {
            title: "Error 404",
            error,
        });
    }
});

// UPDATE APPOINTMENT FROM USER HOME PAGE
router.post('/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/');
        } else {
            const id = req.params.id;
            validateID(id);
            const apptmnt = req.body.updatedApptmnt;
            await removeApptmntFromDocSchedule(apptmnt);
            const updatedApptmnt = await updateAppointment(id, apptmnt);
            await addApptmntToDocSchedule(updatedApptmnt);
            prepareAppointments([updatedApptmnt]);
            const user = await getUser(updatedApptmnt.user_id);
            updatedApptmnt.user_email = user.email;
            await sendEmail(updatedApptmnt, "Rescheduled");
            res.json({
                updatedApptmnt
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

router.delete('/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/');
        } else {
            const id = req.params.id;
            validateID(id);
            const result = await deleteAppointment(id);
            if (result.deleted) {
                await removeApptmntFromDocSchedule(result.apptmnt);
                const user = await getUser(result.apptmnt.user_id);
                result.apptmnt.user_email = user.email;
                await sendEmail(result.apptmnt, "Cancelled");
                res.json('Successfully deleted Appointment');
            }
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