const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const getUsers = mongoCollections.users;

const {
    //getUsers,
    getApps,
    MongoError,
    users
} = require('../config/mongoCollections');

const {
    isNameInvalid,
    isEmailInvalid,
    isPasswordInvalid,
    isNumberInvalid,
    isgenderInvalid,
    isdobInvalid,
    isphone_numberInvalid


} = require('../helpers/auth_helper');


const isDuplicateEmail = async (email) => {
    const users = await getUsers();
    let user = await users.findOne({
        email
    });
    if (user) return true;
    return false;
};

const createUser = async (firstname, lastname, email, password,gender,dob,phone_number) => {
    const firstnameError = isNameInvalid(firstname);
    const lastnameError = isNameInvalid(lastname);
    const emailError = isEmailInvalid(email);
    const passwordError = isPasswordInvalid(password);
    const genderError = isgenderInvalid(gender);
    const dobError = isdobInvalid(dob);
    const phone_numberError = isphone_numberInvalid(phone_number);
    try {
        //if(! firstnameError || ! lastnameError || ! emailError || ! passwordError || ! genderError || ! dobError || ! phone_numberError) throw 'Validation error in createUser!!';
        const saltRounds = 16;
        password = await bcrypt.hash(password, saltRounds);
        const users = await getUsers();
        const {
            acknowledged,
            insertedId
        } = await users.insertOne({
            first_name: firstname,
            last_name: lastname,
            password: password,
            gender: gender,
            dob: dob,
            phone_number: phone_number,
            email:email,
        });
        return {
            userInserted: acknowledged && insertedId
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const checkUser = async (email, password) => {
    try {
        email = email.trim().toLowerCase();
        const users = await getUsers();
        let user = await users.findOne({
            email
        });
        if (!user) throw "Either the email or password is invalid";
        const result = await bcrypt.compare(password, user.password);
        if (!result) throw "Either the email or password is invalid";
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const createAppointment = async (patient_id, firstname, lastname, gender, isElse, number, reason, isNew, time, notes) => {
    const firstnameError = isNameInvalid(firstname);
    const lastnameError = isNameInvalid(lastname);
    const numberError = isNumberInvalid(number);

    try {
        if (firstnameError || lastnameError || numberError) throw 'Validation error in createAppointment!!';

        const appointments = await getApps();
        const { acknowledged, insertedId } = await appointments.insertOne({ 
            _id: new ObjectId(),
            patient_id: patient_id, 
            patient_firstname: firstname, 
            patient_lastname: lastname, 
            gender: gender, 
            someone_else: isElse, 
            phone_number: number, 
            reason_for_visit: reason, 
            new_patient: isNew, 
            appointment_time: time, 
            notes_to_doctor: notes, 
            status: "confirmed",
            created_at: new Date(),
            updated_at: new Date() });
        return {
            userInserted: acknowledged && insertedId, _id: _id
        };                                    
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getAppointment = async (patient_id) => {
    try {
        if (!patient_id || typeof patient_id != 'string' || !ObjectId(patient_id)) throw 'Validation error in getAppointment!!';

        const appointments = await getApps();
        const appointmentsData = await appointments.findOne({ patient_id: patient_id });
        return appointmentsData;                                    
    } catch (error) {
        console.log(error);
        throw error;
    }
};
const getAll = async() => {
    const userData = await users();
    const allU = await userData.find({}).toArray();
    return allU.reverse();
}

module.exports = {
    createUser,
    checkUser,
    isDuplicateEmail,
    createAppointment,
    getAppointment,
    getAll
}
