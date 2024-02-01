const { searchDocs } = require("../models/doctors");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

  let doctors = await searchDocs("Specialty", "Choose your Insurance")
  let docs01, docs02, docs03, docs04, docs05, docs06;

  docs01 = doctors.slice(0, 3);
  docs02 = doctors.slice(4, 7);
  docs03 = doctors.slice(8, 11);
  docs04 = doctors.slice(12,15);
  docs05 = doctors.slice(16,19);
  docs06 = doctors.slice(20,23)


  res.render("pages/home", {
    script_file: "home",
    title: "Home",
    docs1: docs01,
    docs2: docs02,
    docs3: docs03,
    docs4: docs04,
    docs5: docs05,
    docs6: docs06,
    homepagecss: true,
    mapsApi:true
  });
});


module.exports = router;
