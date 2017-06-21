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

    /* ------------------------------------------ */

    
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

