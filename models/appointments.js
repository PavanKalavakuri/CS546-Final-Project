const {
    getAppointments,
    ObjectId,
    MongoError
} = require('../config/mongoCollections');


const getUserAppointments = async (userId) => {
    const apptmnts = await getAppointments();
    let userAppointments = await apptmnts.find({
        user_id: userId
    }).toArray();
    if (!userAppointments) throw `Failed to get appointments for user id: ${userId}`;
    return userAppointments;
};

const getDocAppointments = async (docId) => {
    const apptmnts = await getAppointments();
    let docAppointments = apptmnts.find({
        doctor_id: docId
    }).toArray();
    if (!docAppointments) throw `Failed to get appointments for doctor id: ${docId}`;
    return docAppointments;
};

const getPatAppointments = async (doctor_id, user_id, patient_name) => {
    const apptmnts = await getAppointments();
    let patApptmnts = apptmnts.find({
        doctor_id,
        user_id,
        patient_name
    }).toArray();
    if (!patApptmnts) throw `Failed to get patient appointments for doctor id: ${doctor_id}, user id: ${user_id} and patient name: ${patient_name}`;
    return patApptmnts;
};

const createAppointment = async (apptmnt) => {
    const apptmnts = await getAppointments();
    const {
        acknowledged,
        insertedId
    } = await apptmnts.insertOne(apptmnt);
    if (!acknowledged || !insertedId) {
        throw 'Failed to create Appointment';
    }
    delete apptmnt._id;
    apptmnt = {
        _id: insertedId.toString(),
        ...apptmnt
    }
    return apptmnt;
};

const updateAppointment = async (id, {
    new_time
}) => {
    const _id = ObjectId(id);
    const time = new Date(new_time);
    const apptmnts = await getAppointments();
    const res = await apptmnts.findOneAndUpdate({
        _id
    }, {
        '$set': {
            time
        }
    }, {
        returnDocument: 'after'
    });
    const updatedApptmnt = res.value;
    if (updatedApptmnt === null) throw `Failed to update Appointment with id: ${id}`;
    return updatedApptmnt;
};

const addPrescription = async (id, prescription) => {
    const _id = ObjectId(id);
    const apptmnts = await getAppointments();
    const res = await apptmnts.findOneAndUpdate({
        _id
    }, {
        '$set': {
            prescription
        }
    }, {
        returnDocument: 'after'
    });
    const updatedApptmnt = res.value;
    if (updatedApptmnt === null) throw `Failed to update Appointment with id: ${id}`;
    return updatedApptmnt;
};

const getAppointment = async (id) => {
    const _id = ObjectId(id);
    const apptmnts = await getAppointments();
    const apptmnt = await apptmnts.find({
        _id
    }).toArray();
    if (!apptmnt) throw `Failed to get appointment with id: ${id}`;
    return apptmnt[0];
};

const deleteAppointment = async (id) => {
    const _id = ObjectId(id);
    const apptmnts = await getAppointments();
    const apptmnt = await getAppointment(id);
    const res = await apptmnts.deleteOne({
        _id
    });
    if (res.deleteCount === 0) throw `Failed to delete Appointment with id: ${id}`;
    return {
        deleted: true,
        apptmnt
    };
};

const getUserIDAppointmentID = async (appointmentId,userId) => {
    const apptmnts = await getAppointments();
    let userAppointment = await apptmnts.find({_id: ObjectId(appointmentId), user_id: userId }).toArray();
    if (!userAppointment) throw `Failed to get appointments for user id: ${userId}`;
    return userAppointment;
};

const getDoctorIDAppointmentID = async (appointmentId,doctorId) => {
    const apptmnts = await getAppointments();
    let doctorAppointment = await apptmnts.find({_id: ObjectId(appointmentId), doctor_id: doctorId }).toArray();
    if (!doctorAppointment) throw `Failed to get appointments for user id: ${userId}`;
    return doctorAppointment;
};

module.exports = {
    getUserAppointments,
    getDocAppointments,
    getPatAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getUserIDAppointmentID,
    getDoctorIDAppointmentID,
    addPrescription
};