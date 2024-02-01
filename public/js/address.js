"use strict";

function initMap() {
  const componentForm = [
    "location",
    "locality",
    "administrative_area_level_1",
    "country",
    "postal_code",
  ];

  const getFormInputElement = (component) =>
    document.getElementById(component + "-input");

  const autocompleteInput = getFormInputElement("location");
  const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
    fields: ["address_components", "geometry", "name"],
    types: ["address"],
  });
  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    fillInAddress(place);
  });

  function fillInAddress(place) {
    // optional parameter
    const addressNameFormat = {
      street_number: "short_name",
      route: "long_name",
      locality: "long_name",
      administrative_area_level_1: "short_name",
      country: "long_name",
      postal_code: "short_name",
    };
    const getAddressComp = function (type) {
      for (const component of place.address_components) {
        if (component.types[0] === type) {
          return component[addressNameFormat[type]];
        }
      }
      return "";
    };
    getFormInputElement("location").value =
      getAddressComp("street_number") + " " + getAddressComp("route");
    for (const component of componentForm) {
      // Location field is handled separately above as it has different logic.
      if (component !== "location") {
        getFormInputElement(component).value = getAddressComp(component);
      }
    }
  }
}
