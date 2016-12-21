

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
	maxStep: 16,
	graphOptions: {}
}

WellnessLineGraph.prototype.__init=function(){
	this.graphOptions = {
		responsive: true,
		bezierCurve : false,
		datasetFill : false,
		animation: false
		,scaleShowVerticalLines: false
		,showTooltips: false
		,scaleGridLineColor : "rgba(0,0,0,.05)"
	}

	this.graphOptions = $.extend({}, this.graphOptions, this.options.graphOptions);
	this.__createGraph();
}


WellnessLineGraph.prototype.__createGraph=function(){
	var data = [];
	$.each(this.chartData.datasets, function(){
		data = data.concat(this.data);
	});
	
	var sortData = data.concat().sort(function(a, b){return a-b});
	var averageDist = this.__getAverageDist(sortData);

	var min = Math.floor(sortData[0]-averageDist);//Math.floor(sortData[0])-0.5;
	var max = Math.ceil(sortData[sortData.length-1]+averageDist);//Math.ceil(sortData[sortData.length-1])+0.5;
	var dist = max-min;

	if(dist<this.options.maxStep){		
		var halfMaxStep = Math.floor(this.options.maxStep/2);
		if(dist<halfMaxStep ){
			this.graphOptions.scaleStepWidth=0.5;		
			this.graphOptions.scaleSteps=dist*2;
		}else {
			this.graphOptions.scaleStepWidth=1;
			this.graphOptions.scaleSteps=dist;
		}
		
		this.graphOptions.scaleOverride=true;		
		this.graphOptions.scaleStartValue = min;
	}	
	
	this.chartData.datasets.push({
		label: "",
		strokeColor : "rgba(0,0,0,0)",
		pointColor : "rgba(0,0,0,0)",
		pointStrokeColor : "rgba(0,0,0,0)",
		fillColor: "rgba(0,0,0,0)",  
		data : [min, max]
	});

	this.$canvas = new Chart( this.$canvas.get(0).getContext("2d") ).Line(this.chartData , this.graphOptions);
}

WellnessLineGraph.prototype.__getAverageDist=function(dataAry){
	var minMaxObj = this.__getMinMaxValue(dataAry);
	return (minMaxObj.max - minMaxObj.min)/this.options.maxStep;
}

WellnessLineGraph.prototype.__getMinMaxValue=function(dataAry){
	var min = dataAry[0];
	var max = min;

	if(min == max){
		max +=0.5;
	}//error

	$.each( dataAry, function(index, value){
		if( value < min ){
			min = value;
		}

		if( value > max ){
			max = value;
		}
	});

	return {"min": min, "max": max};
}






