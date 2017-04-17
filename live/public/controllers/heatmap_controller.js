
myApp.controller('HeatmapController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from heatmap controller");




var baseLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mrliffa/ciwh1527n00c22ps5vuljnkhl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
    ,{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mrliffa/citses8bt00062ipelfijao0j/tiles/256',
        accessToken: 'pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
    }
);



var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 0.002,
  "maxOpacity": .8, 
  // scales the radius based on map zoom
  "scaleRadius": true, 
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries 
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": false,
  // which field name in your data represents the latitude - default "lat"
  latField: 'lat',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'lon',
  // which field name in your data represents the data value - default "value"
  valueField: 'count'
};

var heatmapLayer = new HeatmapOverlay(cfg);
var globalData = []

var mymap = new L.Map('mapid', {
  center: new L.LatLng(59.32166538, 18.06916639),
  zoom: 13,
  layers: [baseLayer, heatmapLayer]
});


getApartmentsToPlot()




function getApartmentsToPlot(){
    query_in = "select lon,lat,substr(sold_date::text,0,11) as date, sold_price, sqm from apartments where sold_date > '2010-01-01' and (sold_price/nullif(sqm,0)) > 90000"
    //query_in  = "select address, lon,lat,substr(date::text,0,11) as date, soldprice, sqm from apartments where subarea = 'Tulemarken'"
    //query_in = "select lon,lat,substr(date::text,0,11) as date, soldprice, sqm from apartments where date > '2016-01-01' and soldprice/nullif(sqm,0) > 100000 and sqm between 50 and 60"
    // query_in = "select lon,lat,substr(date::text,0,11) as date, soldprice, sqm from apartments where area in ('City') "
    reqData = {
        query: query_in
    }
    $http.get('/get_apartments', {params: reqData}).success(function(response){
        if (response.success){
            data = response.data 
            globalData = data // assign global variable with apartments location data
            updateHeatmap();
            getFilterAttributes();
            setDatesForSlider();
        }
    });
}

$scope.updateHeatmap = function(){
    updateHeatmap()
}
function updateHeatmap(){
    var tempLocations = []
	for (var i in globalData){
        var aptDate = new Date(globalData[i]["date"]);
        var compareDate = new Date($scope.slider.value,1,1)
        if (compareDate.getFullYear() == aptDate.getFullYear()){
            tempLocations.push(globalData[i]);
        }
    }
    console.log(tempLocations.length)
    var heatmapObject = {
        max: 8,
        data: tempLocations
    };            
    heatmapLayer.setData(heatmapObject);
}


function setDatesForSlider(){
    //get min/max dates
    dates = []
    for (var i in globalData){
        dates.push(new Date(globalData[i]["date"]));
    }
    extreme = {}
    extreme["min"] = new Date(Math.min.apply(null,dates)).getFullYear();
    extreme["max"] = new Date(Math.max.apply(null,dates)).getFullYear();
        
    // dates for slider
    $scope.slider = {
        value: parseInt((extreme["min"]+extreme["max"])/2),
        options: {
            floor: extreme["min"],
            ceil: extreme["max"],
            step: 1,
            onChange: $scope.updateHeatmap
        }
    };
    updateHeatmap();
}


// function getExtremeValues(){
//     dates = []
//     for (var i in globalData){
//         dates.push(new Date(globalData[i]["date"]));
//     }
//     extreme = {}
//     extreme["min"] = new Date(Math.min.apply(null,dates)).getFullYear();
//     extreme["max"] = new Date(Math.max.apply(null,dates)).getFullYear();
//     //console.log("max: " + maxDate + ", min: " +minDate);
    
//     return extreme
// }



//not used
function getFilterAttributes(){
    attributes = []
    for(var attributeName in globalData[0]){ // dynamically creating object from 
        if (attributeName != 'lon' && attributeName != 'lat' && attributeName != 'value' ){
            attributes.push(attributeName)
        }
    }
    console.log(attributes)
}


// not used
// function createLocationItem(item){
//     var locationItem = {}
//     for(var attributename in item){ // dynamically creating object from 
//         locationItem[attributename] = item[attributename];
//     }
//     locationItem["value"] = 1;
//     return(locationItem)
// }
}])