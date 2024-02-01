const {
    getUserIDAppointmentID,
    getDoctorIDAppointmentID
} = require('../models/appointments');



const express = require("express");
const { ObjectId } = require('../config/mongoConnection');
const router = express.Router();


router.get('/:room' , async (req,res)=>{
    try {
        let loginId
        const appointment = req.params.room
        if(!ObjectId.isValid(appointment)){
                res.render("pages/error404", {
                    title: "Error 404",
                    error: "Page not Found",
                  });
                  return null;
        }
        let loginStat = req.session.user ?? req.session.doctor
        if (!loginStat) {
            res.render("pages/error403", {
              title: "Error 403",
              error: "Page Forbidden",
            });
        } else {
            
            const usertype = loginStat.usertype
            let authStat = false

            switch(usertype) {
                case "doctor":
                    loginId = req.session.doctor.id
                    const docAppointment = await getDoctorIDAppointmentID(appointment,loginId)
                    if(docAppointment.length > 0){
                        if (docAppointment[0].doctor_id == loginId)
                        {
                            authStat = true
                        }
                    }
                    break;
                case "patient":
                    loginId = req.session.user.id
                    const userAppointment = await getUserIDAppointmentID(appointment,loginId)
                    if(userAppointment.length > 0){
                        if (userAppointment[0].user_id == loginId)
                    {
                        authStat = true
                    }
                    }
                    break;
                default:
                    throw "Logged user is neither doctor nor user"
              }
            
            if(authStat){
                res.render('pages/video', {RoomId: req.params.room});
            }
            else{
                res.render('pages/error403', {
                    title: "Error 403",
                    error: "Page Forbidden"
                });
            }

        }
    } catch (error) {
        console.log(error);
    }


});




module.exports = router;