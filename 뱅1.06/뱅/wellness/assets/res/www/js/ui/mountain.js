(function(window, undefined) {

/*$(window).on("resize", function(){
		setTimeout(function(){
			window.myLine.resize();
			window.myLine.update();
		}, 10);
	});*/
function WellnessLineGraph( canvas, chartData, options){
	this.chartData = chartData;
	this.options = $.extend({}, WellnessLineGraph.defaultOptions, options);
	this.$canvas = canvas;
	this.__init(options);
}

WellnessLineGraph.defaultOptions={
	maxStep: 16
}

WellnessLineGraph.prototype.__init=function(){
	
	this.graphOptions = {
		responsive: true,
		bezierCurve : false,
		datasetFill : false,
		animation: false
		,scaleLabelFontColor: "#555"
		,scaleShowVerticalLines: false
		//,showTooltips: false
	}

	this.__createGraph();
}


WellnessLineGraph.prototype.__createGraph=function(){
	var data = [];
	$.each(this.chartData.datasets, function(){
		data = data.concat(this.data);
	});
	
	var sortData = data.concat().sort(function(a, b){return a-b});
	var min = Math.floor(sortData[0])-0.5;
	var max = Math.ceil(sortData[sortData.length-1])+0.5;
	var dist  = max-min;
	
	if( dist < this.options.maxStep/2){
		var step = 0;
		for(var i=0; i<dist; i++ ){
			step +=2;
		}

		this.graphOptions.scaleOverride=true;
		this.graphOptions.scaleStepWidth=0.5;
		this.graphOptions.scaleStartValue=min;
		this.graphOptions.scaleSteps=step;
	}else{

		this.chartData.datasets.push({
			label: "",
			strokeColor : "rgba(0,0,0,0)",
			pointColor : "rgba(0,0,0,0)",
			pointStrokeColor : "rgba(0,0,0,0)",
			data : [min, max]
		});
	}
	
	
	this.$canvas = new Chart( this.$canvas.get(0).getContext("2d") ).Line(this.chartData , this.graphOptions);
}

//window.WellnessLineGraph = WellnessLineGraph;

})(window);