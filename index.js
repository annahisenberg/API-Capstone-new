let shelterData;
let zipCode;
let petfinder_URL;

function clickGo() {
    $('button').click(event => {
        event.preventDefault();
        zipCode = $('input').val();
        petfinder_URL = `https://api.petfinder.com/shelter.find?format=json&key=705081f265b2ea3051d728969b1eccfd&animal=cat&location=${zipCode}&output=basic&callback=?`;
        petfinderApiRequest();
        //clear text input
        $('input:text').val('');
    });
}

//
function petfinderApiRequest() {
    $.getJSON(petfinder_URL)
        .done(function (responseData) {
            console.log(responseData);
            shelterData = responseData;
            initMap();
            renderResults(responseData);
        })

}


//Render list of shelters
function renderResults(obj) {
    const shelterArray = obj.petfinder.shelters.shelter;
    let results = [];

    for (let i = 0; i < shelterArray.length; i++) {
        let shelterName = `${i + 1}. ${shelterArray[i].name.$t}`;

        results.push(`
        <div class="shelter-list-item">
            <h3>${shelterName}</h3>
            <p id="${shelterArray[i].id.$t}"></p>
        </div>
        `);
    }

    $('.displayResults').html('<h2>Here are the shelters closest to you:</h2>' + results);
    loadShelterAddresses(obj);
}




function initMap() {

    let location;

    // Show default location when page opens
    location = {
        lat: 40.659177,
        lng: -73.958434
    };

    //If there is shelterData after api call, then take the first shelter of the array 
    //and use it for the map's location
    if (shelterData) {
        location = {
            lat: Number(shelterData.petfinder.shelters.shelter[0].latitude.$t),
            lng: Number(shelterData.petfinder.shelters.shelter[0].longitude.$t)
        };

    };

    //Load map
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: location
    });


    //This function adds the initial marker to the map
    function addsMarkers(place, shelterName) {
        var contentString = shelterName;

        var infowindow = new google.maps.InfoWindow({
            content: contentString //This is what will be displayed in the infowindow
        });

        var marker = new google.maps.Marker({
            position: place,
            map: map
        });

        //Adds the popup infowindow when marker is clicked on
        marker.addListener('click', function () {
            infowindow.open(map, marker)
        });
    }
    //Call this function to add the first marker to the map
    addsMarkers(location);


    //Loops through the response and gathers longitude, latitude, and name of each shelter and then adds markers to all
    if (shelterData) {
        for (let i = 0; i < shelterData.petfinder.shelters.shelter.length; i++) {
            location.lat = Number(shelterData.petfinder.shelters.shelter[i].latitude.$t);
            location.lng = Number(shelterData.petfinder.shelters.shelter[i].longitude.$t);
            shelterN = shelterData.petfinder.shelters.shelter[i].name.$t
            addsMarkers(location, shelterN);
        }

    }

}

function loadShelterAddresses(obj) {

    const shelterArray = obj.petfinder.shelters.shelter;

    for (let i = 0; i < shelterArray.length; i++) {
        let shelterID = shelterArray[i].id.$t;
        let lat = Number(shelterArray[i].latitude.$t);
        let lng = Number(shelterArray[i].longitude.$t);

        //This is the API URL to get the address from the lat and lng (reverse geocoding)
        let getAddressURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDbEkT06yRxGSnhfi9b45Ww21HHfdfkBuU`;


        $.getJSON(getAddressURL)
            .done(function (data) {
                console.log(data);
                $(`#${shelterID}`).html(data.results[0].formatted_address);
            })
    }
}


$(clickGo);