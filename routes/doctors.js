const router = require("express").Router();
const axios = require("axios").default;
const xss = require('xss');

const {
  isNameInvalid,
  isEmailInvalid,
  isPasswordInvalid,
  isSpecialtyInvalid,
  isAddressInvalid,
} = require("../helpers/auth_helper");

const {
  createDoc,
  checkDoc,
  isDuplicateEmail,
  getDoctor,
  updateDoctor,
} = require("../models/doctors");

const {
  authorizeDoctor
} = require("../controllers/auth");
const {
  getDocReviews
} = require("../models/reviews");
const {
  prepDocPageData,
  validateID
} = require("../helpers/doc_helper");



router.get("/home", async (req, res) => {
  if (!req.session.doctor) {
    res.redirect("/doctor/login");
  } else {
    // get data for rendering here
    res.render("pages/doctor_home", {
      script_file: "doc_home",
      title: "Doctor Home",
    });
  }
});

router.get('/data/:doc_id?', async (req, res) => {
  try {
    if (!req.params.doc_id && !req.session.doctor) {
      res.redirect('/doctor/login');
    } else {
      const id = req.params.doc_id || req.session.doctor.id;
      validateID(id);
      const data = await getDoctor(id);
      res.json({
        schedules: data.schedules
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

router.post("/data", async (req, res) => {
  try {
    if (!req.session.doctor) {
      res.redirect("/doctor/login");
    } else {
      const schedules = req.body.schedules;
      const id = req.session.doctor.id;
      schedules.forEach((schdl) => {
        schdl.available = JSON.parse(schdl.available);
        schdl.sessionTime = JSON.parse(schdl.sessionTime);
        if (!schdl.breakTimes) schdl.breakTimes = [];
      });
      const result = await updateDoctor(id, {
        schedules,
      });
      res.json({
        schedules: result.schedules,
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

router.get("/login", async (req, res) => {
  if (req.session.doctor) {
    res.redirect("/");
  } else {
    res.render("pages/login", {
      title: "Login",
      action: "/doctor/login",
      linkTo: "/doctor/signup",
    });
  }
});

router.get("/signup", async (req, res) => {
  if (req.session.doctor) {
    res.redirect("/");
  } else {
    res.render("pages/signup", {
      script_file: "auth_validation",
      address_script: "true",
      title: "Sign Up",
      action: "/doctor/signup",
      linkTo: "/doctor/login",
      specialty: [
        "Acupuncturist",
        "Addiction Specialist",
        "Adult Nurse Practitioner",
        "Dentist",
        "Dermatologist",
        "Primary Care",
        "Eye Doctor",
      ],
    });
  }
});

router.post("/login", async (req, res) => {
  let email = xss(req.body.email).trim();
  let password = xss(req.body.password).trim();
  try {
    const doc = await checkDoc(email, password);
    if (doc) {
      authorizeDoctor(req, {
        id: doc._id,
        firstname: doc.firstname,
        usertype: "doctor"
      });
      res.redirect("/doctor/home");
    } else {
      res.status(500).render("pages/error", {
        error: "Internal Server Error",
      });
    }
  } catch (error) {
    res.render("pages/login", {
      title: "Login",
      action: "/doctor/login",
      linkTo: "/doctor/signup",
      error,
    });
  }
});

router.post("/signup", async (req, res) => {
  let firstname = xss(req.body.firstname).trim();
  let lastname = xss(req.body.lastname).trim();
  let email = xss(req.body.email).trim();
  let password = xss(req.body.password).trim();
  let specialty = xss(req.body.specialty).trim();
  let address = xss(req.body.address).trim();
  let apartment = xss(req.body.address2).trim();
  let city = xss(req.body.address3).trim();
  let state = xss(req.body.address4).trim();
  let zip = xss(req.body.address5).trim();
  let country = xss(req.body.address6).trim();
  const fullAddress = address + " " + city + " " + " " + state + " " + zip;
  let geoloc;

  async function getloc(fadd) {
    var {
      data
    } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${fadd}&key=AIzaSyBFYx4flUaipnwrahPBPcFqVLqkKyLwVnE`
    );
    if (data.results[0]) {
      data = data.results[0].geometry.location;
      return data;
    } else {
      data = {
        lat: 0,
        lng: 0
      }
      addressError = "Please enter address again, GPS coordinates not found"
    }

    return data
  }

  geoloc = await getloc(fullAddress);

  const firstnameError = isNameInvalid(firstname);
  const lastnameError = isNameInvalid(lastname);
  let emailError = isEmailInvalid(email);
  const passwordError = isPasswordInvalid(password);
  const specialtyError = isSpecialtyInvalid(specialty);
  var addressError = isAddressInvalid(city);




  try {
    email = email.trim().toLowerCase();
    if (await isDuplicateEmail(email)) {
      emailError = "Account already present. Please Login";
    }
    if (
      firstnameError ||
      lastnameError ||
      emailError ||
      passwordError ||
      specialtyError ||
      addressError
    )
      throw "Validation error in doc signup!!";
    const {
      docInserted
    } = await createDoc(
      firstname,
      lastname,
      email,
      password,
      specialty,
      address,
      apartment,
      city,
      state,
      zip,
      country,
      geoloc
    );
    if (docInserted) {
      res.redirect("/doctor/login");
    } else {
      res.status(500).render("pages/error", {
        error: "Internal Server Error",
      });
    }
  } catch (e) {
    console.log(e);
    res.render("pages/signup", {
      script_file: "auth_validation",
      address_script: "true",
      title: "Sign Up",
      action: "/doctor/signup",
      linkTo: "/doctor/login",
      specialty: [
        "Acupuncturist",
        "Addiction Specialist",
        "Adult Nurse Practitioner",
        "Dentist",
        "Dermatologist",
        "Primary Care",
        "Eye Doctor",
      ],
      error: {
        firstnameError,
        lastnameError,
        emailError,
        passwordError,
        specialtyError,
        addressError,
      },
    });
  }
});



router.post('/appointment', async (req, res) => {
  if (!req.session.user) {
    res.json({
      url: '/user/login'
    });
  } else {
    try {
      const doc_id = xss(req.body.bookingDetails.doc_id);
      const insurance = xss(req.body.bookingDetails.insurance);
      const reason = xss(req.body.bookingDetails.reason);
      const new_patient = xss(req.body.bookingDetails.new_patient);
      const timeSlot = xss(req.body.bookingDetails.timeSlot);
      console.log(doc_id, insurance, reason, new_patient, timeSlot);
      if (!doc_id || !insurance || !reason || !new_patient || !timeSlot) {
        res.redirect('/');
      } else {
        req.session.apptmnt = {
          doc_id,
          insurance,
          reason,
          new_patient,
          timeSlot
        };
        res.json({
          url: '/user/booking'
        });
      }
    } catch (error) {
      console.log(error);
      res.render("pages/error404", {
        title: "Error 404",
        error,
      });
    }
  }
});


router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    validateID(id);
    if (!id || id.trim().length === 0) {
      res.render('/');
    }
    id = id.trim();
    const doc_data = await getDoctor(id);
    const doc_reviews = await getDocReviews(id);
    doc_data.reviews = doc_reviews;
    const page_data = prepDocPageData(doc_data);
    let location_coords = doc_data.coords
    res.render('pages/doctor', {
      title: "Doctor",
      script_file: "doc_public",
      location_c: encodeURIComponent(JSON.stringify(location_coords)),
      id,
      helpers: {
        star(num, rating) {
          return Math.round(rating) < num ? "" : "star";
        }
      },
      ...page_data
    });
  } catch (error) {
    console.log(error);
    res.render("pages/error404", {
      title: "Error 404",
      error,
    });
  }
});


module.exports = router;