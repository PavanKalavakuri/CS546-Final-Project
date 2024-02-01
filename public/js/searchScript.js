var pager = {};
pager.items = stores;
console.log(stores)
if (JSON.stringify(stores) !== "{}") {
  pager.itemsPerPage = 6;
  pagerInit(pager);

  function bindList() {
    var pgItems = pager.pagedItems[pager.currentPage];
    $("#myList").empty();

    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 9,
      center: stores[0].coords,
    });
    for (var i = 0; i < pgItems.length; i++) {
      var option = $(
        '<a href="/doctor/'+pgItems[i]._id +'" class="list-group-item list-group-item-action">'
      );
      option.html(
        `<div class="row">${i + 1}
      <div class="col-xs-4 col-sm-2"><img src="/public/img/${pgItems[i]._id}.png" class="rounded" alt="Profile Picture" style="height: 100px" onerror=this.src="/public/img/doctor_male.jpeg"></div>
      <div class="col-xs-12 col-sm-4">
        <p id='DocName' class="visible-xs  style="height: 20px"> ${pgItems[i].firstname} ${pgItems[i].lastname}</p>
        <p id='DocSpecialty' class="visible-xs" style="height: 20px"> ${pgItems[i].specialty}</p>
        <p id='DocQualification' class="visible-xs" style="height: 20px"> ${pgItems[i].qualification} <br> ${pgItems[i].insurance}</p>
      </div>
      <div class="col-xs-8 col-sm-3">${pgItems[i].address} ${pgItems[i].apartment} ${pgItems[i].city} ${pgItems[i].state} ${pgItems[i].zip}<br> <span class="fa fa-star"> ${pgItems[i].rating}</span></div>
      </div>`
      );

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(pgItems[i].coords), // whatever applies
        map: map,
        draggable: false,
        icon: `https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red${
          i + 1
        }.png`,
      });

      if (i == 0) {
        map.setCenter(marker.getPosition());
      }

      $("#myList").append(option);
    }
  }
  function prevPage() {
    pager.prevPage();
    bindList();
  }
  function nextPage() {
    pager.nextPage();
    bindList();
  }
  function pagerInit(p) {
    p.pagedItems = [];
    p.currentPage = 0;
    if (p.currentPage == 0) {
      {
        $("#prev").addClass("disabled");
      }
      {
        $("#next").removeClass("disabled");
      }
    }
    if (pager.items.length == pager.itemsPerPage) {
      {
        $("#next").addClass("disabled");
      }
    }
    if (p.itemsPerPage === undefined) {
      p.itemsPerPage = 5;
    }
    p.prevPage = function () {
      if (p.currentPage > 0) {
        p.currentPage--;
        if (p.currentPage == 0) {
          {
            $("#prev").addClass("disabled");
          }
          {
            $("#next").removeClass("disabled");
          }
        }
        if (p.currentPage !== p.pagedItems.length - 1) {
          $("#next").removeClass("disabled");
        }
      }
    };
    p.nextPage = function () {
      if (p.currentPage < p.pagedItems.length - 1) {
        p.currentPage++;
        {
          $("#prev").removeClass("disabled");
        }
        if (p.currentPage == p.pagedItems.length - 1) {
          $("#next").addClass("disabled");
        }
      }
    };
    initt = function () {
      for (var i = 0; i < p.items.length; i++) {
        if (i % p.itemsPerPage === 0) {
          p.pagedItems[Math.floor(i / p.itemsPerPage)] = [p.items[i]];
        } else {
          p.pagedItems[Math.floor(i / p.itemsPerPage)].push(p.items[i]);
        }
      }
    };
    initt();
  }

  $(function () {
    bindList();
  });
}
