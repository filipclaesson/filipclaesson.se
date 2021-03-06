
myApp.controller('AptSanityGraphsController', ['$scope', '$http', '$rootScope', function($scope, $http) {
//console.log("Hello World from analysis controller");

plotChartText('quarter','price' ,'%', 'Prisuppgång från utgångsbud per stadsdel och storlek (%)', "analysis_chart", "select  areas , sqm_bucket ,round(avg(bid_increase::numeric*100),1) as bid_increase from analysis_base where bid_increase <> 'NaN' and room is not null and areas_count > 300 and areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma') group by 1,2 order by 1,2 ")

function plotChartDate(x_data, y_data, yaxis_title, title, graph_name,query_in){
    // query_in = "select * from analysis_test where areas in ('Bromma','Bagarmossen')"
    //query_in = "select * from analysis_test where areas in ('Hammarby Sjöstad','Hammarbyhöjden','Södermalm','Årsta','Liljeholmen','Aspudden','Östermalm','Kungsholmen','Gröndal','Vasastan','Älvsjö','Enskede','Midsommarkransen','Telefonplan','Hägersten','Bromma')"
    
    reqData = {
        query: query_in
    }

    $http.get('/run_postgres_query', {params: reqData}).success(function(response){
        if (response.success){
            //console.log(response)
            data = response.data
            structureDataDate(data, x_data, y_data, graph_name, title,yaxis_title);
        }
    });
}


function structureDataDate(data, x_data, y_data, graph_name, title, yaxis_title){
    x = [];
    y = [];
    plot_data = []
    y.push(data[0][y_data])
    date = new Date(data[0][x_data]);
    //console.log(String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3)))
    date = String(date.getFullYear()) + '-Q' + String(Math.floor((date.getMonth() + 3) / 3))
    x.push(date)
    for (var i = 1; i < data.length; i++) {
        if (data[i]["areas"] == data[i-1]["areas"]){
            //console.log("old area: " + data[i]["areas"])
            y.push(data[i][y_data])
            date = new Date(data[i][x_data])
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
            y.push(data[i][y_data])
            date = new Date(data[i][x_data])
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



function structureDataText(data, x_data, y_data, graph_name, title, yaxis_title){
    x = [];
    y = [];
    plot_data = []
    y.push(data[0][y_data])
    x.push(data[0][x_data])
    for (var i = 1; i < data.length; i++) {
        if (data[i]["areas"] == data[i-1]["areas"]){
            //console.log("old area: " + data[i]["areas"])
            y.push(data[i][y_data])
            
            x.push(data[i][x_data])
        }else{
            //console.log("new area: " + data[i]["areas"])
            plot_data.push({
                x:x,
                y:y,
                mode: 'bar',
                name: data[i-1]["areas"]
            });
            x = [];
            y = [];
            y.push(data[i][y_data])
            
            x.push(data[i][x_data]);
        }
    };
    
    plot_data.push({
        x:x,
        y:y,
        mode: 'bar',
        name: data[data.length-1]["areas"]
    });
    console.log(plot_data);


    var layout = {
        title: title,
        xaxis: {
            title: 'Kvm',
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