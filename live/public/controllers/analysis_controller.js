
myApp.controller('AnalysisController', ['$scope', '$http', function($scope, $http) {
//console.log("Hello World from analysis controller");

runPostgresQuery('%', 'Prisutveckling per Område % (40kvm - 80kvm)', "price_development_percent", "select * from analysis_test where areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma')")
runPostgresQuery('Tkr', 'Prisutveckling per Område Tkr (40kvm - 80kvm)', "price_development_absolute", "with base2 as ( select  areas , areas_count , quarter , round(avg(sold_price/nullif(sqm,0))) as avg_price , round(avg(sqm)) as avg_sqm , avg(lon::numeric) lon , avg(lat::numeric) lat from analysis_base where sqm between 40 and 80 and areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma') group by 1,2,3 ) select areas, quarter, round(avg_price::numeric/1000,1) as round from base2 order by 1,2")

function runPostgresQuery(yaxis_title, title, graph_name,query_in){
    // query_in = "select * from analysis_test where areas in ('Bromma','Bagarmossen')"
    //query_in = "select * from analysis_test where areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma')"
    
    reqData = {
        query: query_in
    }

    $http.get('/run_postgres_query', {params: reqData}).success(function(response){
        if (response.success){
            //console.log(response)
            data = response.data
            structureData(data, graph_name, title,yaxis_title);
        }
    });
}




function structureData(data, graph_name, title, yaxis_title){
    x = [];
    y = [];
    plot_data = []
    y.push(data[0]["round"])
    date = new Date(data[0]["quarter"]);
    //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
    date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
    x.push(date)
    for (var i = 1; i < data.length; i++) {
        if (data[i]["areas"] == data[i-1]["areas"]){
            //console.log("old area: " + data[i]["areas"])
            y.push(data[i]["round"])
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
            y.push(data[i]["round"])
            date = new Date(data[i]["quarter"])
            //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
            date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
            x.push(date);
        }
    };
    
    plot_data.push({
        x:x,
        y:y,
        mode: 'lines',
        name: data[data.length-1]["areas"]
    });
    console.log(plot_data);


    var layout = {
        title: title,
        xaxis: {
            title: 'Kvartal',
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: yaxis_title,
            showline: false
        }
    };

    PLOT = document.getElementById(graph_name);
    Plotly.plot( PLOT, plot_data, layout);

}




}])