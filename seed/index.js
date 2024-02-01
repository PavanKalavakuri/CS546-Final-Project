var casual = require("casual");
const axios = require("axios").default;
const {getAddress} = require("./main") ;
const isValidCoordinates = require('is-valid-coordinates')


const { getDocs, ObjectId } = require("./../config/mongoCollections");
const { closeConnection } = require("./../config/mongoConnection");


const createDoc = async () => {
  let coords;
  let specialty = [
    "Acupuncturist",
    "Addiction Specialist",
    "Adult Nurse Practitioner",
  ];
  let schedules = [];
  let insurance = [
    "Aetna",
    "Cigna",
    "United Healthcare",
    "Humana",
    "Kaiser Foundation",
    "Centene Corporation",
  ];
  const randomSpecialty = Math.floor(Math.random() * specialty.length);
  const randomInsurance = Math.floor(Math.random() * insurance.length);
  var fake_Address = await getAddress({ countryCode: 'us' });
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

  firstname = casual.first_name;
  lastname = casual.last_name;
  email = casual.email;
  specialty = specialty[randomSpecialty];
  apartment = "";
  address = fake_Address['Street'];
  city = fake_Address['City/Town'];
  state = fake_Address['State/Province/Region'];
  zip = fake_Address['Zip/Postal Code'];
  country = fake_Address['Country'];
  insurance = insurance[randomInsurance];

  const fullAddress = address + " " + city + " " + " " + state + " " + zip;

  coords = await getloc(fullAddress);
  if(coords == false){
    coords = { lat: parseFloat(fake_Address['Latitude']), lng: parseFloat(fake_Address['Longitude'])}
  }
  if (!isValidCoordinates(coords.lng,coords.lat)){
    coords = { lat: 0, lng: 0}
  }
  let location = { type: "Point", coordinates: [coords.lng,coords.lat] }
  password = "$2b$16$vY7AbuVM51nilu0w.5odgOYsv2kpKY5JR7UBUYY61DeQv7FaURcyu";
  const docs = await getDocs();
  const { acknowledged, insertedId } = await docs.insertOne({
    firstname,
    lastname,
    email,
    password,
    specialty,
    schedules: [],
    address,
    apartment,
    city,
    state,
    zip,
    country,
    coords,
    insurance,
    location
  });

  return {
    docInserted: acknowledged && insertedId,
  };
};

async function main() {
  for (var i = 0; i < 10; i++) {
    await createDoc();
  }
  const doctorDB = await getDocs();
  await doctorDB.createIndex( { location: "2dsphere" } )
  await closeConnection();
}
main();
