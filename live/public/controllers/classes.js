// ------------------------ Event ------------------------ //

function EventHandler(name){
	this.name = name
	this.chart = document.getElementById(name);
}


ChartHandler.prototype.plotData = function(chart_data) {
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
        
    Plotly.plot(this.chart, chart_data, layout);
}



// ------------------------ Chart ------------------------ //

function ChartHandler(name){
	this.name = name
	this.chart = document.getElementById(name);
}


ChartHandler.prototype.plotData = function(chart_data) {
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
        
    Plotly.plot(this.chart, chart_data, layout);
}



// ------------------------ MAP ------------------------ //
function MapHandler(name){
		this.name = name;
		//this.data = data;
		// setup leaflet map
		this.leaflet_map = L.map('mapid_sanity',{ zoomControl:true }).setView([59.33057783, 18.0894317], 13);
		L.tileLayer(
			'https://api.mapbox.com/styles/v1/mrliffa/ciwh1527n00c22ps5vuljnkhl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
			, {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mrliffa/citses8bt00062ipelfijao0j/tiles/256',
				accessToken: 'pk.eyJ1IjoibXJsaWZmYSIsImEiOiJjaXRzZWk2NDYwMDFoMm5tcmdobXVwMmgzIn0.I-e4EO_ZN-gC27258NMZNQ'
			}
		).addTo(this.leaflet_map);
}

MapHandler.prototype.getName = function() {
	return this.name
};

MapHandler.prototype.getMap = function() {
	return this.leaflet_map
};


MapHandler.prototype.setLegend = function(position_in, text) {
	var legend_description = L.control({position: position_in});
	legend_description.onAdd = function (mymap) {
	    var div = L.DomUtil.create('div', 'sanity-visualize-legend')	        
	    div.innerHTML += text
	    // loop through our density intervals and generate a label with a colored square for each interval
	    return div;
	};
	legend_description.addTo(this.leaflet_map);
};




MapHandler.prototype.onClick = function() {
	var marker = L.marker([59.33057783, 18.0894317])
	this.leaflet_map.on('click', function(e) {
		console.log(e.latlng.lng);


		//console.log([e.latlng.lng,e.latlng.lat])
	    // $scope.lonFromMap = e.latlng.lng
	    // $scope.latFromMap = e.latlng.lat
	    // $scope.$apply();
	    // latlng = L.latLng(e.latlng.lat,e.latlng.lng)
	    // console.log(latlng)
	    // marker.setLatLng(latlng)
	    // if (!mymap.hasLayer(marker)){
	    //     marker.addTo(mymap)
	    // }
	    // marker.update()

	    // //console.log((L.circle(latlng,500)).getBounds())
	    // $scope.bounds = getBoundsFromPosAndDist(latlng,500)
	    // $scope.visualizeProximityApt($scope.apt)
	});
}




// // 
// 	getName(){
// 		return this.name
// 	}

// 	setName(name){
// 		this.name = name
// 	}

// }

// module.exports =MapHandler;


 // Plotly.purge('analysis_graph');
 //    y = []
 //    x = []
 //    console.log(db_result[i])
 //    plot_data = []
 //    for (var i = 0; i < db_result.length; i++) {
 //        y.push(db_result[i]["sqm_price"])
 //        date = new Date(db_result[i]["sold_date"]);
 //        // date = date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
 //        x.push(date)
 //    };

 //    plot_data.push({
 //        x:x,
 //        y:y,
 //        mode: 'markers',
 //        name: 'Historiska Försäljningar'
 //    });
 //    // apt_in
    
 //    today = new Date();
    
 //    plot_data.push({
 //        y:[apt_in.price/apt_in.m2],
 //        x:[today],
 //        mode: 'markers',
 //        name: 'Angiven Lägenhet'
 //    });
 //    console.log("plot_data");
 //    console.log(plot_data);
    
 //    var layout = {
 //        title: 'Historisk Data',
 //        xaxis: {
 //            title: 'Datum',
 //            showgrid: false,
 //            zeroline: false
 //        },
 //        yaxis: {
 //            title: 'pris',
 //            showline: false
 //        }
 //    };
    
 //    PLOT = document.getElementById('analysis_graph');
 //    Plotly.plot(PLOT, plot_data, layout);


