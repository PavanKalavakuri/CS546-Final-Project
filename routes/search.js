const express = require("express");
const { isInsuranceInvalidSearch, isSpecialtyInvalidSearch } = require("../helpers/auth_helper");
const router = express.Router();
const axios = require("axios").default;
var xss = require("xss");



const { searchD } = require("../models/doctors");

/* router.get("/", async (req, res) => {
  res.render("pages/search", {
    title: "Search",
  })
}) */

router.get("/", async (req, res) => {
  let searchJson = req.query;
  if (JSON.stringify(searchJson) !== "{}") {
    let specialtyIn = xss(searchJson.Specialty);
    let insuranceIn = xss(searchJson.Insurance);
    let locationError;
    let locationIn = await getloc(xss(searchJson.Location));
    var query;

    let incorrectSpecialty = isSpecialtyInvalidSearch(specialtyIn);
    let incorrectInsurance = isInsuranceInvalidSearch(insuranceIn);

    if (incorrectSpecialty !== false && incorrectInsurance !== false) {
      res.status(400).render("pages/search", {
        incorrectSpecialty:
          "Incorrect Specialty, Please choose a specialty from Options",
        incorrectInsurance:
          "Incorrect Insurance, Please choose a specialty from Options",
        hasErrors: true,
        mapsApi: true,
        title: "Error 400",
      });
      return;
    }
    if (incorrectSpecialty !== false) {
      res.status(400).render("pages/search", {
        incorrectSpecialty:
          "Incorrect Specialty, Please choose a specialty from Options",
        hasErrors: true,
        mapsApi: true,
        title: "Error 400",
      });
      return;
    }
    if (incorrectInsurance !== false) {
      res.status(400).render("pages/search", {
        incorrectInsurance:
          "Incorrect Insurance, Please choose a specialty from Options",
        hasErrors: true,
        mapsApi: true,
        title: "Error 400",
      });
      return;
    }

    if (locationIn == false) {
      locationIn = [-74.0059728, 40.7127753];
      locationError =
        "Please enter search location again, Meanwhile showing doctor's near NYC";
    } else {
      locationIn = [locationIn.lng, locationIn.lat];
    }

    if (
      specialtyIn == "Specialty" &&
      (insuranceIn == "Choose your Insurance" || insuranceIn == "self")
    ) {
      query = {};
    } else if (
      insuranceIn !== "Choose your Insurance" &&
      insuranceIn !== "self" &&
      specialtyIn == "Specialty"
    ) {
      query = { insurance: insuranceIn };
    } else if (
      specialtyIn !== "Specialty" &&
      (insuranceIn == "Choose your Insurance" || insuranceIn == "self")
    ) {
      query = { specialty: specialtyIn };
    } else {
      query = {
        specialty: specialtyIn.toString(),
        insurance: insuranceIn.toString(),
      };
    }

    try {
      const searchdocs = await searchD(query, locationIn);
      if (searchdocs.length == 0) {
        res.render("pages/search", {
          title: "Search",
          mapsApi: true,
          searchError:
            "No Doctors found. Please enter different Speciality or Insurance and try again",
          locError: locationError,
        });
      } else {
        res.render("pages/search", {
          title: "Search",
          searchScript: true,
          mapsApi: true,
          docs: searchdocs,
          docsEncoded: encodeURIComponent(JSON.stringify(searchdocs)),
          helpers: {
            counter: (n) => n + 1,
          },
          locError: locationError,
        });
      }
    } catch (e) {
      res
        .status(404)
        .render("pages/error404", { error: e + " ", title: "Error 404" });
    }
  } else {
    res.render("pages/search", {
      title: "Search",
    });
  }
});

async function getloc(fadd) {
  if (fadd == "") {
    return false;
  }
  if (fadd == undefined) {
    return false;
  }
  var { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${fadd}&key=AIzaSyBFYx4flUaipnwrahPBPcFqVLqkKyLwVnE`
  );
  if (data.results[0]) {
    data = data.results[0].geometry.location;
    return data;
  } else {
    data = false;
  }

  return data;
}

router.post("/", async (req, res) => {
  let specialty = xss(req.body.specialty);
  let insurance = xss(req.body.insurance);
  let location = xss(req.body.locationS);

  let incorrectSpecialty = isSpecialtyInvalidSearch(specialty);
  let incorrectInsurance = isInsuranceInvalidSearch(insurance);

  if (!specialty) {
    specialty = "Specialty";
  }
  if (!insurance) {
    insurance = "Choose your Insurance";
  }

  if (incorrectSpecialty !== false && incorrectInsurance !== false) {
    res.status(400).render("pages/search", {
      incorrectSpecialty:
        "Incorrect Specialty, Please choose a specialty from Options",
      incorrectInsurance:
        "Incorrect Insurance, Please choose a specialty from Options",
      hasErrors: true,
      mapsApi: true,
      title: "Error 400",
    });
    return;
  }
  if (incorrectSpecialty !== false) {
    res.status(400).render("pages/search", {
      incorrectSpecialty:
        "Incorrect Specialty, Please choose a specialty from Options",
      hasErrors: true,
      mapsApi: true,
      title: "Error 400",
    });
    return;
  }
  if (incorrectInsurance !== false) {
    res.status(400).render("pages/search", {
      incorrectInsurance:
        "Incorrect Insurance, Please choose a specialty from Options",
      hasErrors: true,
      mapsApi: true,
      title: "Error 400",
    });
    return;
  }
  let sendSearch = {
    Specialty: specialty,
    Insurance: insurance,
    Location: location,
  };

  sendSearch = new URLSearchParams(sendSearch);

  try {
    res.redirect(`/search/?${sendSearch}`);
  } catch (e) {
    res.status(500).json({ error: e });
  }

  return;
});
module.exports = router;
