const mongoCollections = require("../config/mongoCollections");
const doctors = mongoCollections.doctors;
const { ObjectId } = require("mongodb");
// const { doctors } = require("..");
const { getDocs } = require("./../config/mongoCollections");
const axios = require("axios").default;

//  Function to create doctors

async function create(
  first_name,
  last_name,
  email_id,
  address_str,
  city_str,
  state_str,
  zip_num,
  country_str,
  gender_str,
  phone_number_num,
  //    primary_speciality: p_speciality,
  //    secondary_speciality: s_speciality,
) {
  // validating the poarameters
  //   if (arguments.length !== 12) {
  //     throw Error("incorrect paramter");
  //   }
  //   if (
  //     first_name == null ||
  //     last_name == null ||
  //     gender == null ||
  //     email == null ||
  //     phone_number == null ||
  //     address == null ||
  //     city == null ||
  //     state == null ||
  //     zipcode == null ||
  //     qualification == null ||
  //     speciality == null ||
  //     insurance == null
  //   ) {
  //     throw Error(" INVALID: parameter");
  //   }
  //   if (typeof first_name != String || typeof last_name != String || typeof gender != String) {
  //     throw Error("INVALID: parameter");
  //   }


  /*
  1. It uses the axios library to make a GET request to the Google Maps API.
  2. It uses the data.results[0] to get the first result from the Google Maps API.
  3. It uses the geometry.location to get the location of the first result.
  4. It returns the location of the first result.
  */
  async function getloc(fadd) {
    var { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${fadd}&key=AIzaSyBFYx4flUaipnwrahPBPcFqVLqkKyLwVnE`
    );
    if (data.results[0]) {
      data = data.results[0].geometry.location;
    } else {
      return false;
    }
    return data
  }

  /*
  1. The function getRandomInt() takes two arguments, min and max.
  2. The min and max arguments are converted to integers.
  3. The maximum is exclusive and the minimum is inclusive.
  4. The function returns a random integer between min and max.
  */
  function getRandomInt(min,max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  const fullAddress = address_str + " " + city_str + " " + " " + state_str + " " + zip_num;
  let coords = await getloc(fullAddress);
  if(coords == false){
    coords = await getloc(state_str);
  }

  let location_obj = { type: "Point", coordinates: [coords.lng,coords.lat] }

  let qualification_array= [
    "MBBS","BDS MBBS","BDS"
  ]

  let specialty_array = [
    "Acupuncturist",
    "Addiction Specialist",
    "Adult Nurse Practitioner",
    "Dentist",
    "Dermatologist",
    "Primary Care",
    "Eye Doctor"
  ];
  let insurance_array = [
    "Aetna",
    "Cigna",
    "United Healthcare",
    "Humana",
    "Kaiser Foundation",
    "Centene Corporation",
  ];
  /*
  1. Generate a random number between 0 and the length of the specialty_array.
  2. Generate a random number between 0 and the length of the insurance_array.
  3. Generate a random number between 1 and 5.
  */
  const randomSpecialty = Math.floor(Math.random() * specialty_array.length);
  const randomInsurance = Math.floor(Math.random() * insurance_array.length);
  const randomQualification = Math.floor(Math.random() * qualification_array.length);
  const randomRating = getRandomInt(1,6)

  let rating_num = randomRating

  const new_doctor = {
    firstname: first_name,
    lastname: last_name,
    email: email_id,
    password: "$2b$16$vY7AbuVM51nilu0w.5odgOYsv2kpKY5JR7UBUYY61DeQv7FaURcyu", //aaaaaaaa
    specialty: specialty_array[randomSpecialty],
    schedules: [],
    address: address_str,
    apartment: "",
    city: city_str,
    state: state_str,
    zip: zip_num,
    country: country_str,
    coords: coords,
    insurance: insurance_array[randomInsurance],
    location: location_obj,
    gender: gender_str,
    phone_number: phone_number_num,
    qualification: qualification_array[randomQualification],
    rating: rating_num,
    //    primary_speciality: p_speciality,
    //    secondary_speciality: s_speciality,
  };
  /** 
* Paste one or more documents here
*/
  const doctorCollection = await getDocs();
  const new_details = await doctorCollection.insertOne(new_doctor);
  // if(!new_details.acknowledged || !new_details.insertedId) throw 'can not add new doctor'
  const new_data = new_details.insertedId.toString();
  const inserted_doctor = await this.get(new_data);
  inserted_doctor._id = inserted_doctor._id.toString();
  console.log(inserted_doctor);
  return inserted_doctor;
}

//  Function to get get all doctors

const getAll = async function getAll() {
  const doctorCollection = await getDocs();
  const doctors_Data = await doctorCollection.find({}).toArray();
  if (doctors_Data == null) {
    throw Error("Could not get all bands");
  }
  doctors_Data.map((x) => {
    x["_id"] = x["_id"].toString();
  });
  return doctors_Data;
};

// Function to get doctors By id

const get = async function get(id) {
  // if(typeof id !== 'string') throw "Invalid id : not a string"
  // if(id === null) throw "Invalid id : null "
  // if(!ObjectId.isValid(id)) throw "Provided object id is invalid"
  const doctorCollection = await getDocs();
  const data = await doctorCollection.findOne({ _id: ObjectId(id) });
  // if(data === null) throw "find no band with provided id"
  data["_id"] = data["_id"].toString();
  return data;
};

// // Function to to get doctors By location

// const get = async function get(location) {
//     // if(typeof id !== 'string') throw "Invalid id : not a string"
//     // if(id === null) throw "Invalid id : null "
//     // if(!ObjectId.isValid(id)) throw "Provided object id is invalid"
//     const doctorCollection = await doctors();
//     const data = await doctorCollection.findOne({_id: ObjectId(id)});
//     // if(data === null) throw "find no band with provided id"
//     data["_id"] = data["_id"].toString();
//     return data;
// }

module.exports = {
  create,
  getAll,
  get
};
