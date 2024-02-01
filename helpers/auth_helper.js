const isNameInvalid = (name) => {
  if (
    name === undefined ||
    name.trim().length === 0 ||
    !/^[a-z\s]+$/i.test(name.trim())
  ) {
    return "Name should only have letters and not be empty";
  }
  return false;
};

const isNumberInvalid = (number) => {
    if (number === undefined || number.trim().length === 0 || !/^[0-9\s]+$/i.test(number.trim())) {
        return 'Number should only have digits and not be empty';
    }
    return false;
};

const isEmailInvalid = (email) => {
  // regex -> /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  // unicode regex -> /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  if (
    email === undefined ||
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email.trim()
    )
  ) {
    return "Email is invalid";
  }
  return false;
};

const isPasswordInvalid = (password) => {
  if (
    password === undefined ||
    typeof password !== "string" ||
    password.trim().length < 6 ||
    !/^\S+$/.test(password)
  ) {
    return "Password should be atleast 6 characters (no spaces)";
  }
  return false;
};

const isSpecialtyInvalid = (specialty) => {
  if (specialty === undefined || specialty === "Specialty") {
    return "Please choose a specialty";
  } 
  let specialties= [
    "Acupuncturist",
    "Addiction Specialist",
    "Adult Nurse Practitioner",
    "Dentist",
    "Dermatologist",
    "Primary Care",
    "Eye Doctor",
  ]
  specialties.forEach(element => {
    if(specialty == element){
      return false
    } else{
      return "Incorrect Specialty, Please choose a specialty from Options"
    }
  });
  return false;
};

const getAuthDetails = (req_session) => {
  // console.log(req_session);
  if (req_session.user) {
    return `Authenticated User '${req_session.user.id}'`;
  }
  if (req_session.doctor) {
    return `Authenticated Doctor '${req_session.doctor.id}'`;
  }
  return "Non-Authenticated";
};

const isAddressInvalid = (address) => {
  if (address === undefined || address === "") {
    return "Please select a address";
  }
  return false;
};

const isSpecialtyInvalidSearch = (specialty) => {
  let specialties = [
    "Acupuncturist",
    "Addiction Specialist",
    "Adult Nurse Practitioner",
    "Dentist",
    "Dermatologist",
    "Primary Care",
    "Eye Doctor",
    "Specialty",
  ];
  let is_SpecialtyInvalid;
  specialties.forEach((element) => {
    if (specialty == element) {
      is_SpecialtyInvalid = false;
    }
  });
  return is_SpecialtyInvalid;
};

const isInsuranceInvalidSearch = (insurance) => {
  let insurances = [
    "Choose your Insurance",
    "self",
    "Aetna",
    "Cigna",
    "United Healthcare",
    "Humana",
    "Kaiser Foundation",
    "Centene Corporation",
  ];
  let is_InsuranceInvalid;
  insurances.forEach((element) => {
    if (insurance == element) {
      is_InsuranceInvalid = false;
    }
  });
  return is_InsuranceInvalid;
};

module.exports = {
  isNameInvalid,
  isNumberInvalid,
  isEmailInvalid,
  isPasswordInvalid,
  isSpecialtyInvalid,
  getAuthDetails,
  isAddressInvalid,
  isInsuranceInvalidSearch,
  isSpecialtyInvalidSearch
};
