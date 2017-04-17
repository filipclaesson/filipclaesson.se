
myApp.controller('AnalysisController', ['$scope', '$http', function($scope, $http) {
//console.log("Hello World from analysis controller");

runPostgresQuery()

function runPostgresQuery(){
    // query_in = "select * from analysis_test where areas in ('Bromma','Bagarmossen')"
    query_in = "select * from analysis_test where areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma')"
    reqData = {
        query: query_in
    }

    $http.get('/run_postgres_query', {params: reqData}).success(function(response){
        if (response.success){
            //console.log(response)
            data = response.data
            structureData(data);
        }
    });
}


function structureData(data){
    x = [];
    y = [];
    plot_data = []
    y.push(data[0]["round"]*100)
    date = new Date(data[0]["quarter"]);
    //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
    date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
    x.push(date)
    for (var i = 1; i < data.length; i++) {
        if (data[i]["areas"] == data[i-1]["areas"]){
            //console.log("old area: " + data[i]["areas"])
            y.push(data[i]["round"]*100)
            date = new Date(data[i]["quarter"])
            //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
            date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
            x.push(date)
        }else{
            //console.log("new area: " + data[i]["areas"])
            plot_data.push({
                x:x,
                y:y,
                mode: 'lines',
                name: data[i-1]["areas"]
            });
            x = [];
            y = [];
            y.push(data[0]["round"]*100)
            date = new Date(data[0]["quarter"])
            //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
            date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
            x.push(date);
        }
    };
    //console.log(plot_data);
    plot_data.push({
        x:x,
        y:y,
        mode: 'lines',
        name: data[data.length-1]["areas"]
    });


    var layout = {
        title: 'Prisutveckling per Område (40kvm - 80kvm)',
        xaxis: {
            title: 'Kvartal',
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: '%',
            showline: false
        }
    };

    PLOT = document.getElementById('price_development');
    Plotly.plot( PLOT, plot_data, layout );

}




}])