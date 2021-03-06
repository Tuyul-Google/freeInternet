freeInternet.Charts = Class.$extend({
    // Constants
    TIMESTEP : 1,
    TIME_HEURISTIC : 30,
    MAX_POINTS : 10,

    CHARTS_TO_GRAPH : [
        {
            name: "Credit",
            data_name: "credit",
            proportion: false,
            units: "Credits",
        },
        {
            name: "Bandwidth",
            data_name: "bandwidth",
            proportion: true,
            units: "kB/s",            
        }
    ],

    // Static vars
    charts : {},
    count : 0,
    inspect : false,

    defaultOptions : function(name, id, units, proportion){
        var options = {
            title: {
                text: name + " over Time"
            },
            chart: {
                renderTo: id + '_chart',
                animation: {
                    duration: this.TIMESTEP * 1000 - this.TIME_HEURISTIC,
                    easing: 'linear'

                },
                events: {
                    click: function(e){
                        ui.charts.inspect = !ui.charts.inspect;
                    }
                },
            },
            credits: {
                enabled: false,
            },
            xAxis: {
                /*title: {
                    text: 'Time'
                },*/
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: units,
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                formatter: function() {
                    var output = '<b>' + Highcharts.dateFormat("%M:%S", this.x) + '</b>';

                    $.each(this.points, function(i, point){
                        output += '<br/>' + 
                            '<span style="color: ' + point.series.color + ';">' + point.series.name + '</span>' +
                            ':'+
                            '<b>' + Highcharts.numberFormat(this.y, 0, ',') + '</b>';
                        if(proportion){
                            output += ' ('+ Highcharts.numberFormat(this.percentage, 1) + '%)';
                        }
                    });
                    return output;
                 }
            },

            legend: {
                enabled: true,
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
            },
            series: []
        }

        var marker = {
            enabled: false,
            states: {
                hover: {
                   enabled: true,
                   symbol: 'circle',
                   radius: 2,
                   lineWidth: 1
                }
            }
        };

        if(proportion){
            return $.extend(true, options, {
                chart: {
                    defaultSeriesType: 'areaspline'
                },
                plotOptions: {
                    areaspline: {
                        //enableMouseTracking: false,
                        stacking: 'normal',
                        marker: marker
                    },
                },
            });
        } 

        return $.extend(true, options, {
            chart: {
                defaultSeriesType: 'spline'
            },
            plotOptions: {
                spline: {
                    //enableMouseTracking: false,
                    marker: marker
                }
            }
        });
    },

    updateForever : function(self, data){
        /*
            data:{{int}} -> undefined

            Updates/creates initial lines with data
            Calls to plot each graph
            Sets a Timeout for itself
        */

        var now = new Date().getTime();
        if(!self.inspect){
            $.each(self.CHARTS_TO_GRAPH, function(i, chart_to_graph){
                var chart_name = chart_to_graph.name;
                var chart = self.charts[chart_name];

                var shift = self.charts[chart_name].series[0].data.length == self.MAX_POINTS;


                // For each ip
                var j = 0;
                $.each(data[chart_to_graph.data_name], function(ip, value){
                    // Add point
                    chart.series[j].addPoint(
                        [now, value],
                        false, // redraw?
                        shift  // shift points?
                    );
                    j++;
                });

                chart.redraw();

            });
        }

        setTimeout(
            function (){
                freeInternet.ajaxCallback(
                    self,
                    'creditbandwidth.json',
                    self.updateForever
                )
            },
            self.TIMESTEP * 1000
        );
    },

    drawCharts : function(self, data){
        /*
            chart_name:String | chart:{String:{}} -> undefined

            Inserts new graph DOM divs in graph_node (if necessary) and plots them
        */

        $.each(self.CHARTS_TO_GRAPH, function(i, chart_to_graph){
            var chart_name = chart_to_graph.name;

            // Create container node
            var id = chart_name.replace(" ", "_");
            var chart_node = $(
                '<div class="graph" id="' + id + '">' +
                    /*'<div class="graph_bar">' +
                        '<img src="img/minimize.png" id="graph_minimize" />' +
                        '<img src="img/maximize.png" id="graph_maximize" />' +
                    '</div>' +*/
                    '<div id="' + id + '_chart" style="width: 600px; height: 200px;"></div>' +
                '</div>'
            );
            self.CHARTS_NODE.append(chart_node);

            // Create chart
            var options = self.defaultOptions(chart_name, id, chart_to_graph.units, chart_to_graph.proportion);

            for(var ip in data[chart_to_graph.data_name]){
                options.series.push({
                    name: ip,
                    data: []
                });
            }
            self.charts[chart_name] = new Highcharts.Chart(options);
        })

        self.updateForever(self, data);
    },

    __init__ : function(CHARTS_NODE){
        this.CHARTS_NODE = CHARTS_NODE;
    },
});

/*    
var charts;
$(function(){
    charts = new freeInternet.Charts($('#interface'));
    freeInternet.ajaxCallback(
        charts,
        'creditbandwidth.json',
        charts.drawCharts
    );
});
*/