
myApp.controller('AptSanityVisualizerController', ['$scope', '$http', '$rootScope', function($scope, $http,$rootScope) {
    console.log("Hello World from apts sanity visalization");

// L title kommer från mapbox i styles
var mymap = L.map('mapid',{ zoomControl:true }).setView([59.33057783, 18.0894317], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/mrliffa/ciwh1527n00c22ps5vuljnkhl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ', {
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
maxZoom: 18,
id: 'mrliffa/citses8bt00062ipelfijao0j/tiles/256',
accessToken: 'pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
}).addTo(mymap);

//initialize objects
theRectangle = L.rectangle([[59.33057783, 18.0894317], [59.34057783, 18.0994317]], {color: "#ff7800", weight: 1})
$scope.lonFromMap = 'lon1'
$scope.latFromMap = 'lat1'
$scope.apartmentsInRectangle = L.layerGroup()


// add legend description
var legend_description = L.control({position: 'topright'});
legend_description.onAdd = function (mymap) {

    var div = L.DomUtil.create('div', 'sanity-visualize-legend')
        
    div.innerHTML += '<p><b>Klicka på kartan!</b><br>Platsen markerad kommer att "sanity checkas".</p>'
    // loop through our density intervals and generate a label with a colored square for each interval
    
    return div;
};
legend_description.addTo(mymap);


// gets called by input controller when button is hit
$rootScope.$on("CallParentMethod", function(event, apt_in){
   $scope.visualizeProximityApt(apt_in);
});



$scope.visualizeProximityApt = function(aptIn) {

    price = aptIn.price
    m2 = aptIn.m2

    console.log(aptIn)
    
    lon_min = $scope.bounds.getSouthWest().lng
    lat_min = $scope.bounds.getSouthWest().lat
    lon_max = $scope.bounds.getNorthEast().lng
    lat_max = $scope.bounds.getNorthEast().lat
    
    query_in = "select sold_date,sold_price, sqm, sqm_price, lon, lat from apt_sanity where lon::numeric between " + lon_min + " and " + lon_max + " and lat::numeric between " + lat_min + " and " + lat_max + " order by sold_date"
    
    reqData = {
        query: query_in
    }
    $http.get('/get_apartments', {params: reqData}).success(function(response){
        if (response.success){
            console.log(response)
            data = response.data         
            db_result = data
            // Plots Graphics on map
            plotRectangleAndApts(db_result, $scope.bounds)
            // Setup Chart
            setupChart(db_result,aptIn)
            
        }
    });
}


var marker = L.marker([59.33057783, 18.0894317])
mymap.on('click', function(e) {
    $scope.lonFromMap = e.latlng.lng
    $scope.latFromMap = e.latlng.lat
    $scope.$apply();
    latlng = L.latLng(e.latlng.lat,e.latlng.lng)
    console.log(latlng)
    marker.setLatLng(latlng)
    if (!mymap.hasLayer(marker)){
        marker.addTo(mymap)
    }
    marker.update()
    $scope.bounds = getBoundsFormPosAndDist(latlng,1000)
});













function getBoundsFormPosAndDist(latlng, square_meassure){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
   
    meters_per_deg_lon = 111320*Math.cos(latlng.lat)
    meters_per_deg_lat = 110574 //1 deg matlab lat
    degrees_to_subadd_lng = ((square_meassure/2)/meters_per_deg_lon)
    degrees_to_subadd_lat = ((square_meassure/2)/meters_per_deg_lat)   
    var southWest = L.latLng(latlng.lat-degrees_to_subadd_lat, latlng.lng-degrees_to_subadd_lng)
    var northEast = L.latLng(latlng.lat+degrees_to_subadd_lat, latlng.lng+degrees_to_subadd_lng)
    // northEast = L.latLng(40.774, -74.125),
    bounds = L.latLngBounds(southWest, northEast);
    return bounds
}





function plotRectangleAndApts(db_result, bounds){
    theRectangle.setBounds(bounds)
    theRectangle.addTo(mymap);
    $scope.apartmentsInRectangle.clearLayers()
    // plot circles
    for (var i in db_result){
        var popupLabel = String(db_result[i]["sold_date"]) + ", sqm: " + db_result[i]["sqm"] + ", " + db_result[i]["sqm_price"] + " sek/sqm";
        var color = "#19BF00"
        var circle = L.circle(L.latLng(db_result[i]["lat"],db_result[i]["lon"]), 10)
        circle.bindPopup(popupLabel);
        $scope.apartmentsInRectangle.addLayer(circle)
    }
    $scope.apartmentsInRectangle.addTo(mymap)
}

function setupChart(db_result, apt_in){
    Plotly.purge('analysis_graph');
    y = []
    x = []
    console.log(db_result[i])
    plot_data = []
    for (var i = 0; i < db_result.length; i++) {
        y.push(db_result[i]["sqm_price"])
        date = new Date(db_result[i]["sold_date"]);
        // date = date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
        x.push(date)
    };

    plot_data.push({
        x:x,
        y:y,
        mode: 'markers',
        name: 'Historiska Försäljningar'
    });
    // apt_in
    
    today = new Date();
    
    plot_data.push({
        y:[apt_in.price/apt_in.m2],
        x:[today],
        mode: 'markers',
        name: 'Angiven Lägenhet'
    });
    console.log("plot_data");
    console.log(plot_data);
    
    var layout = {
        title: 'Historisk Data',
        xaxis: {
            title: 'Datum',
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: 'pris',
            showline: false
        }
    };
    
    PLOT = document.getElementById('analysis_graph');
    Plotly.plot( PLOT, plot_data, layout);
}



// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------
// ---------                           ----------
// ---------                           ----------
// ---------                           ----------
// ---------                           ----------
// ---------            OLD            ----------
// ---------                           ----------
// ---------                           ----------
// ---------                           ----------
// ---------                           ----------
// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------



$scope.updatePlot = function(){
    sliderDate = ($scope.slider.date);
    for (var i in plotObjects){
        plotObjects[i]["cricle"].addTo(mymap);  
    }

}

function createCircle(latlng, color, fillColor, fillOpacity, radius, popupText){
    var circle =  L.Circle(latlng, {
        color: color,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        radius: radius
        })
    circle.bindPopup(popupText);
    return circle;
}

function createSquare(lat,lng, color, fillColor, fillOpacity, radius, popupText){
  //bounds = [[lat,lng], [parseFloat(lat)+0.01, parseFloat(lng)+ 0.01]]
  bounds = [[lat,lng], [parseFloat(lat)+0.001, parseFloat(lng)+ 0.001]]
  var rectangle =  L.rectangle(bounds, {
      color: color,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      radius: radius,
      weight: 1
    })
  rectangle.bindPopup(popupText);
  return rectangle;
}

function getColor(minutes){
    //http://www.perbang.dk/rgbgradient/
    var cases = [
       [40, '#E50005'],
       [36, '#E02900'],
       [32, '#DC5600'],
       [28, '#D88200'],
       [24, '#D4AC00'],
       [20, '#CACF00'],
       [16, '#9CCB00'],
       [12, '#6EC700'],
       [8, '#43C300'],
       [4, '#19BF00']
    ]
    var color = '#19BF00';
    for (i in cases){
        //console.log(cases[i][0] + ' ' +minutes )
        if (parseInt(minutes) > cases[i][0]){
             //console.log("inside")
             color = cases[i][1]
             break;
        }
    }
    //console.log(color)
return color
}
// dates for slider
var dates = [];
for (var month = 1; month <= 10; month++) {
    dates.push(new Date(2016, month, 1));
}


$scope.slider = {
  date: dates[0], // or new Date(2016, 7, 10) is you want to use different instances
  options: {
    stepsArray: dates,
    translate: function(date) {
      if (date != null)
        return date.toDateString();
      return '';
    },
    onChange: $scope.updatePlot
  }
};


function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}
}])

