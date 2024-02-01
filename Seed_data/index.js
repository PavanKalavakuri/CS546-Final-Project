const doctors = require("./doctor_public.js");
const users = require("./users.js");
const reviews = require("./reviews.js");
//const appointments = require("./appointments.js");
const connection = require("./../config/mongoConnection");
const { connectToDb } = require("./../config/mongoConnection");
const e = require("express");
const docJson = require("./doctors.json");
const { getDocs } = require("../config/mongoCollections.js");

const main = async () => {
  let doctor1 = undefined;
  let doctor2 = undefined;
  let doctor3 = undefined;
  let doctor4 = undefined;
  let doctor5 = undefined;
  let user1 = undefined;
  let user2 = undefined;
  let user3 = undefined;
  let user4 = undefined;
  let user5 = undefined;
  let Appointment1 = undefined;
  let Appointment2 = undefined;
  let Appointment3 = undefined;
  let Appointment4 = undefined;
  let Appointment5 = undefined;
  let review1 = undefined;
  let review2 = undefined;
  let review3 = undefined;
  let review4 = undefined;
  let review5 = undefined;

  
    for (var i = 0; i < docJson.length; i++) {
      await doctors.create(
        docJson[i].firstname,
        docJson[i].lastname,
        docJson[i].email,
        docJson[i].address,
        docJson[i].city,
        docJson[i].state,
        docJson[i].zip,
        docJson[i].country,
        docJson[i].gender,
        docJson[i].phone_number
      );
    }
    const doctorDB = await getDocs();
    await doctorDB.createIndex( { location: "2dsphere" } )



/*   
  try {
    doctor1 = await doctors.create("Krithika", "Gandlaur" , "Female" , "kgm@stevens.edu" , "2016758976", "232 Hancock" , "Jersey City" , "NJ", "07307","4568568976","4576864579", "MBBS" , "Dentist","Orthopedic", ["Aetna", "Tata", "Reliance"],5,"12:30PM","10:00AM");
    console.log("doctor details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
    try {
      doctor1 = await doctors.get(doctor1._id);
      console.log(doctor1);
    } catch (error) {
      console.log(error);
    }

  try {
    doctor2 = await doctors.create("Nikhil", "Bhoneja" , "Male" , "nikhilb@stevens.edu" , "2078958976", "232 Grand st" , "Hoboken" , "NJ", "07030","8768568976","1476864579", "MBBS" , "Gupt", "Orthopedic",["Aetna", "Idea", "Reliance"],5,"10:30PM","10:00AM");
    console.log("doctors details inserted successfully..");
  } catch (error) {
    console.log(error);
  }
    try {
      doctor2 = await doctors.get(doctor2._id);
      console.log(doctor2);
    } catch (error) {
      console.log(error);
    }

  try {
    doctor3 = await doctors.create("James", "Bond" , "Male" , "james@nhu.in" , "9167868976", "456 Hacensek" , "Edison" , "NJ", "07080","1238568976","5616864579", "BDS MBBS" , "Orthodontist","Cardiologist", ["Tata", "Reliance"],4,"1:00PM","12:00PM");
    console.log("doctor details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    doctor4 = await doctors.create("Preet", "Kumar" , "Male" , "pkumar@max.in" , "2015674325", "2 Bergaline ave" , "Union City" , "NJ", "071456","7868568976","8716864579", "BDS" , "Orthodpedic","ENT", ["Aetna","apollo","LIC","Tata", "Reliance"],3,"5:30PM","3:00PM");
    console.log("doctor details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    doctor5 = await doctors.create("Praveen", "Gupta" , "Male" , "pskkumar@apollo.in" , "9175674325", "456 Tonnevel ave" , "North Bergan" , "NJ", "871456","9968568976","0016864579", "MBBS" , "Dentist","ENT", ["LIC","Tata", "Reliance"],5,"6:30PM","3:00PM");
    console.log("doctor details inserted succesfully");
  } catch (error) {
    console.log(error);
  } */
  try {
    user1 = await users.createUser(
      "Krithika",
      "Gandlaur",
      "kgm@stevens.edu",
      "krithika123",
      "female",
      "11-09-1997",
      "2017365305",
      
    );
    console.log("user details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    user2 = await users.createUser(
      "saket",
      "Vishnu",
      "sv@stevens.edu",
      "saket123",
      "male",
      "01-11-1997",
      "2017365306",
      
    );
    console.log("user details inserted successfully..");
  } catch (error) {
    console.log(error);
  }
  try {
    user3 = await users.createUser(
      "laila",
      "jane",
      "Laila123",
      "laila@stevens.edu",
      "female",
      "19-01-2007",
      "2017365307",
      
    );
    console.log("user details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    user4 = await users.createUser(
      "mike",
      "Ross",
      "mike@stevens.edu",
      "Mike123",
      "male",
      "15-04-2017",
      "2017365308",
    );
    console.log("user details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    user5 = await users.createUser(
      "Annie",
      "Formoso",
      "Annie@stevens.edu",
      "Annie123",
      "female",
      "10-10-1987",
      "2017365309",
    );
    console.log("user details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    review1 = await reviews.createReviews(
      "62740df8d1d458314e1d810b",
      "62745eb6ab61859f455215e5",
      "Dr Krithika has been really caring towards her patients and will revist her again",
      " 4.6"  
    );
    console.log("review1 details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    review2 = await reviews.createReviews(
      "62740f54f8b312d1a69e718b",
      "62745ebaab61859f455215e6",
      "Dr nikhil was very patient towards his clients and was very efficint in his treatment treatment",
      "4.4"
      
    );
    console.log("review2 details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    review3 = await reviews.createReviews(
      "62740f54f8b312d1a69e718c",
      "62745ebfab61859f455215e7",
      " dr james was efficient in his treatment but spent very little time with his patients",
      "3.8"
      
    );
    console.log("review3 details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    review4 = await reviews.createReviews(
      "62740f54f8b312d1a69e718d",
      "62745ec4ab61859f455215e8",
      "Dr preet was really calm and helped me go through the right treatment",
      " 4.5"
      
    );
    console.log("review4 details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    review5 = await reviews.createReviews(
      "627426615f0f60a95fd9d69f",
      "62745ec8ab61859f455215e9",
      "Dr praveen has high knowledge in his treatment process and would revist the doctor again in the future",
      "4.0"
      
    );
    console.log("review5 details inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  try {
    Appointment1 = await appointments.createUser(
      "Annie",
      "Formoso",
      "Annie123",
      "female",
      "2017365309",
      "Annie@stevens.edu"
    );
    console.log("user details inserted succesfully");
  } catch (error) {
    console.log(error);
  }

  try {
    let all_doctors = await reviews.getAll();
    console.log(all_doctors);
  } catch (error) {
    console.log(error);
  }
  try {
    let all_user = await reviews.getAll();
    console.log(all_user);
  } catch (error) {
    console.log(error);
  }

 
};

main()
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    connection.closeConnection();
  });
