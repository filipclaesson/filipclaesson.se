myApp.controller('AptSanityController', ['$scope', '$http', '$rootScope', function($scope, $http,$rootScope) {
    console.log("Hello World from apts sanity visalization");
    
    // ------------ global variables ------------ //
    $scope.datas_within_bounds = [] // the data that should be within the sanity check
    $scope.datas_to_plot = [];
    $scope.radius_size = 300;
    $scope.apt = {};
    $scope.ResPricePerM2 = "";
    $scope.sqm_slider_value_min = 20;
    $scope.sqm_slider_value_max = 150;
    // ------------------------------------------ //



    get_data_from_db(L.latLng(59.33057783, 18.0494317));


    var sanity_map = new MapHandler('mapid_sanity', $scope.radius_size)
    sanity_map.setLegend('topright','<p><b>Klicka på kartan!</b><br>Analysen nedan baseras på områden innanför cirkeln.</p>')

    var sanity_chart = new ChartHandler('analysis_graph')
    //sanity_chart.plotData([])



    /* -------------- observer definitions -------------- */
    var inherits = require('util').inherits;
    var EventEmitter = require('events').EventEmitter;

    function dbObservable() {  
        EventEmitter.call(this);
    }
    inherits(dbObservable, EventEmitter);  
    dbObservable.prototype.db_data_updated = function (position) {  
        this.emit('db_data_updated', position);
    };
    
    function slidersObservable() {  
        EventEmitter.call(this);
    }
    inherits(slidersObservable, EventEmitter);  
    slidersObservable.prototype.slider_updated = function (position) {  
        this.emit('slider_updated', position);
    };
    /* ------------------------------------------ */


    /* -------------- on events -------------- */

    var db_observer = new dbObservable();
    var sqm_slider_observer = new slidersObservable();
   

    db_observer.on('db_data_updated', function () {
        console.log("db_data_updated event occured")
        filterOnSqm();
        sanity_map.clearApts();
        sanity_map.drawApts($scope.datas_to_plot);
        sanity_map.setBounds($scope.current_center, $scope.radius_size);
        sanity_chart.plotData($scope.datas_to_plot);
    });


    sqm_slider_observer.on('slider_updated', function () {
        console.log("slider_updated event occured")
        filterOnSqm();
        sanity_map.clearApts();
        sanity_map.drawApts($scope.datas_to_plot);
        sanity_chart.plotData($scope.datas_to_plot);

    });

    sanity_map.getMap().on('click', function(e) {
        get_data_from_db(e.latlng)
    });

    
function get_data_from_db(position){
    console.log("map_click event occured")
        $scope.current_center = position;

        bounds = getBoundsFromPosAndDist(position,500);

        lon_min = bounds.getSouthWest().lng
        lat_min = bounds.getSouthWest().lat
        lon_max = bounds.getNorthEast().lng
        lat_max = bounds.getNorthEast().lat
        
        query_in = "select sold_date,sold_price, sqm, sqm_price, lon, lat from apt_sanity where lon::numeric between " + lon_min + " and " + lon_max + " and lat::numeric between " + lat_min + " and " + lat_max + " order by sold_date"
        reqData = {
            query: query_in
        }
        
        $http.get('/get_apartments', {params: reqData}).success(function(response){
            if (response.success){
                data = response.data;         
                db_result = data;
                //filter raw data to fit within circle
                $scope.datas_within_bounds = [];
                $scope.datas_to_plot = [];
                center = position;
                for (var i in db_result){
                    cur_pos = L.latLng(db_result[i]["lat"],db_result[i]["lon"])
                    if (center.distanceTo(cur_pos)<$scope.radius_size){
                        $scope.datas_within_bounds.push(db_result[i])
                        $scope.datas_to_plot.push(db_result[i])
                    }
                }
                console.log($scope.datas_to_plot.length)
                db_observer.db_data_updated();
                
            }
        });

}

// $scope.radius_size = 300
// the_cricle = L.circle([[59.33057783, 18.0894317], [59.34057783, 18.0994317]],$scope.radius_size,{color: "#ff7800",fillOpacity: 0.0})
// //initialize objects
// //theRectangle = L.rectangle([[59.33057783, 18.0894317], [59.34057783, 18.0994317]], {color: "#ff7800", weight: 1})
// $scope.lonFromMap = 'lon1'
// $scope.latFromMap = 'lat1'
// $scope.apartmentsInRectangle = L.layerGroup()
// $scope.apartmentsNotInRectangle = L.layerGroup()
// initiatePlot()



// // gets called by input controller when button is hit
// $rootScope.$on("CallParentMethod", function(event, apt_in){
//    $scope.visualizeProximityApt(apt_in);
// });


$scope.sqm_slider_update = function(){
    sqm_slider_observer.slider_updated();
}

$scope.slider = {
    minValue: 0,
    maxValue: 200,
    options: {
        floor: 0,
        ceil: 200,
        step: 5,
        minRange: 5,
        noSwitching: true,
        onChange: $scope.sqm_slider_update
    }
};

// ***** Data Helper ?? ***** //

function filterOnSqm(){
    new_datas_to_plot = [];
    for (var i in $scope.datas_within_bounds){
        if ($scope.datas_within_bounds[i]["sqm"] < parseInt($scope.sqm_slider_value_max) && parseInt($scope.datas_within_bounds[i]["sqm"]) > $scope.sqm_slider_value_min){
            new_datas_to_plot.push($scope.datas_within_bounds[i])
        }
    }
    $scope.datas_to_plot = new_datas_to_plot;
}



// ************************** //



// $scope.childmethod = function() {
//     $rootScope.$emit("CallParentMethod", $scope.apt);
// }



// $scope.computePricePerM2 = function(){
//     res = $scope.apt.price/$scope.apt.m2;
//     $scope.ResPricePerM2 = Math.round(res*1000)/1000;
// }


// $scope.visualizeProximityApt = function(aptIn) {

//     price = aptIn.price
//     m2 = aptIn.m2
//     console.log(aptIn)
//     lon_min = $scope.bounds.getSouthWest().lng
//     lat_min = $scope.bounds.getSouthWest().lat
//     lon_max = $scope.bounds.getNorthEast().lng
//     lat_max = $scope.bounds.getNorthEast().lat
    
//     query_in = "select sold_date,sold_price, sqm, sqm_price, lon, lat from apt_sanity where lon::numeric between " + lon_min + " and " + lon_max + " and lat::numeric between " + lat_min + " and " + lat_max + " order by sold_date"
    
//     reqData = {
//         query: query_in
//     }
//     $http.get('/get_apartments', {params: reqData}).success(function(response){
//         if (response.success){
//             console.log(response)
//             data = response.data         
//             db_result = data
//             //filterDataToCircle()



//             datas_to_plot = []
//             // Plots Graphics on map
//             $scope.apartmentsInRectangle.clearLayers()
//             center =  L.latLng($scope.latFromMap,$scope.lonFromMap)
//             for (var i in db_result){
//                 cur_pos = L.latLng(db_result[i]["lat"],db_result[i]["lon"])
//                 if (center.distanceTo(cur_pos)<$scope.radius_size){
//                     var circle = L.circle(cur_pos,10)
//                     datas_to_plot.push(db_result[i])
//                     $scope.apartmentsInRectangle.addLayer(circle)
//                 }else{
//                     var circle = L.circle(cur_pos,10,{color: 'red',fillColor: '#ffffff',fillOpacity: 0.5});
//                     $scope.apartmentsNotInRectangle.addLayer(circle)
//                 }
//             }
//             $scope.apartmentsInRectangle.addTo(mymap)
//             $scope.apartmentsNotInRectangle.addTo(mymap)

//             the_cricle.setLatLng(center)
//             the_cricle.addTo(mymap)

//             // Setup Chart
//             setupChart(datas_to_plot,aptIn)

            
//         }
//     });
// }


// var marker = L.marker([59.33057783, 18.0894317])
// mymap.on('click', function(e) {
//     $scope.lonFromMap = e.latlng.lng
//     $scope.latFromMap = e.latlng.lat
//     $scope.$apply();
//     latlng = L.latLng(e.latlng.lat,e.latlng.lng)
//     console.log(latlng)
//     marker.setLatLng(latlng)
//     if (!mymap.hasLayer(marker)){
//         marker.addTo(mymap)
//     }
//     marker.update()

//     //console.log((L.circle(latlng,500)).getBounds())
//     $scope.bounds = getBoundsFromPosAndDist(latlng,500)
//     $scope.visualizeProximityApt($scope.apt)
// });


// function getDataInRadius(lon,lat,radius){
// 	squareData = getDataFromDB(lon,lat,radius);
// 	circleData = setupCircleData(squareData);
// 	plotOnMap(circleData);
// 	setupChart(circleData);
// }


// function getDataFromDB(){
// 	// get min and max lon, lat
// 	var southWest = L.latLng(latlng.lat-((square_meassure)/110574), latlng.lng-((square_meassure)/111320*Math.cos(latlng.lat)))
//     var northEast = L.latLng(latlng.lat+((square_meassure)/110574), latlng.lng+((square_meassure)/111320*Math.cos(latlng.lat)))
//     var bounds = L.latLngBounds(southWest, northEast);
//     query_in = "select sold_date,sold_price, sqm, sqm_price, lon, lat from apt_sanity where lon::numeric between " + bounds.getSouthWest().lng + " and " + bounds.getNorthEast().lng + " and lat::numeric between " + bounds.getSouthWest().lat + " and " + bounds.getNorthEast().lat + " order by sold_date"
//     reqData = {query: query_in}
// }





















function getBoundsFromPosAndDist(latlng, square_meassure){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
   
    meters_per_deg_lon = 111320*Math.cos(latlng.lat)
    meters_per_deg_lat = 110574 //1 deg matlab lat
    degrees_to_subadd_lng = ((square_meassure)/meters_per_deg_lon)
    degrees_to_subadd_lat = ((square_meassure)/meters_per_deg_lat)   
    var southWest = L.latLng(latlng.lat-degrees_to_subadd_lat, latlng.lng-degrees_to_subadd_lng)
    var northEast = L.latLng(latlng.lat+degrees_to_subadd_lat, latlng.lng+degrees_to_subadd_lng)
    // northEast = L.latLng(40.774, -74.125),
    bounds = L.latLngBounds(southWest, northEast);
    return bounds
}



// function setupChart(db_result, apt_in){
//     Plotly.purge('analysis_graph');
//     y = []
//     x = []
//     console.log(db_result[i])
//     plot_data = []
//     for (var i = 0; i < db_result.length; i++) {
//         y.push(db_result[i]["sqm_price"])
//         date = new Date(db_result[i]["sold_date"]);
//         // date = date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
//         x.push(date)
//     };

//     plot_data.push({
//         x:x,
//         y:y,
//         mode: 'markers',
//         name: 'Historiska Försäljningar'
//     });
//     // apt_in
    
//     today = new Date();
    
//     plot_data.push({
//         y:[apt_in.price/apt_in.m2],
//         x:[today],
//         mode: 'markers',
//         name: 'Angiven Lägenhet'
//     });
//     console.log("plot_data");
//     console.log(plot_data);
    
//     var layout = {
//         title: 'Historisk Data',
//         xaxis: {
//             title: 'Datum',
//             showgrid: false,
//             zeroline: false
//         },
//         yaxis: {
//             title: 'pris',
//             showline: false
//         }
//     };
    
//     PLOT = document.getElementById('analysis_graph');
//     Plotly.plot(PLOT, plot_data, layout);
// }


// function initiatePlot(){
//     plot_data = []
//     plot_data.push({
//         y:[0],
//         x:[0],
//         mode: 'markers',
//         name: 'Angiven Lägenhet'
//     });
//     console.log("plot_data");
    
//     var layout = {
//         title: 'Historisk Data',
//         xaxis: {
//             title: 'Datum',
//             showgrid: false,
//             zeroline: false
//         },
//         yaxis: {
//             title: 'pris',
//             showline: false
//         }
//     };
    
//     PLOT = document.getElementById('analysis_graph');
//     Plotly.plot(PLOT, plot_data, layout);
// }


// // ----------------------------------------------
// // ----------------------------------------------
// // ----------------------------------------------
// // ---------                           ----------
// // ---------                           ----------
// // ---------                           ----------
// // ---------                           ----------
// // ---------            OLD            ----------
// // ---------                           ----------
// // ---------                           ----------
// // ---------                           ----------
// // ---------                           ----------
// // ----------------------------------------------
// // ----------------------------------------------
// // ----------------------------------------------



// $scope.updatePlot = function(){
//     sliderDate = ($scope.slider.date);
//     for (var i in plotObjects){
//         plotObjects[i]["cricle"].addTo(mymap);  
//     }

// }

// function createCircle(latlng, color, fillColor, fillOpacity, radius, popupText){
//     var circle =  L.Circle(latlng, {
//         color: color,
//         fillColor: fillColor,
//         fillOpacity: fillOpacity,
//         radius: radius
//         })
//     circle.bindPopup(popupText);
//     return circle;
// }

// function createSquare(lat,lng, color, fillColor, fillOpacity, radius, popupText){
//   //bounds = [[lat,lng], [parseFloat(lat)+0.01, parseFloat(lng)+ 0.01]]
//   bounds = [[lat,lng], [parseFloat(lat)+0.001, parseFloat(lng)+ 0.001]]
//   var rectangle =  L.rectangle(bounds, {
//       color: color,
//       fillColor: fillColor,
//       fillOpacity: fillOpacity,
//       radius: radius,
//       weight: 1
//     })
//   rectangle.bindPopup(popupText);
//   return rectangle;
// }

// function getColor(minutes){
//     //http://www.perbang.dk/rgbgradient/
//     var cases = [
//        [40, '#E50005'],
//        [36, '#E02900'],
//        [32, '#DC5600'],
//        [28, '#D88200'],
//        [24, '#D4AC00'],
//        [20, '#CACF00'],
//        [16, '#9CCB00'],
//        [12, '#6EC700'],
//        [8, '#43C300'],
//        [4, '#19BF00']
//     ]
//     var color = '#19BF00';
//     for (i in cases){
//         //console.log(cases[i][0] + ' ' +minutes )
//         if (parseInt(minutes) > cases[i][0]){
//              //console.log("inside")
//              color = cases[i][1]
//              break;
//         }
//     }
//     //console.log(color)
// return color
// }
// // dates for slider
// var dates = [];
// for (var month = 1; month <= 10; month++) {
//     dates.push(new Date(2016, month, 1));
// }


// $scope.slider = {
//   date: dates[0], // or new Date(2016, 7, 10) is you want to use different instances
//   options: {
//     stepsArray: dates,
//     translate: function(date) {
//       if (date != null)
//         return date.toDateString();
//       return '';
//     },
//     onChange: $scope.updatePlot
//   }
// };


// function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
//     var R = 6378.137; // Radius of earth in KM
//     var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
//     var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
//     var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     var d = R * c;
//     return d * 1000; // meters
// }
}])

