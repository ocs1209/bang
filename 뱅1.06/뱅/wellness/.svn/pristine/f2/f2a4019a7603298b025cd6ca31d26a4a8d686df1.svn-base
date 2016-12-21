function comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}


function WellnessBarGraph( data ){      //---
	this.dataLen = 0;
	this.data = data;
	
	this.$buttons = $(".week li");
	this.$graphItems = $(".graph [data-day]");

	this.__init();
}

WellnessBarGraph.prototype.__init=function(){
	//$(".graph ul").height($(".bar_wrap").height());
	this.__bindEvent();
	this.__setBarGraph(this.data);
};


WellnessBarGraph.prototype.__bindEvent=function(){
	var me = this;
	
	this.$buttons.on("click", function(e){
		if(e.target.nodeName == "A"){
			e.preventDefault();
		}
		var index = me.$buttons.index(this);
		me.selectedDay(index);
	});

	var $graphBar = this.$graphItems.find("div");
	$graphBar.on("click", function(e){
		var index = $graphBar.index(this);
		me.selectedDay(index);
	})
};

WellnessBarGraph.prototype.selectedDay=function(index){
	if( index > this.dataLen-1){return;}
	this.$buttons.eq(index).addClass("on").siblings().removeClass("on");	
	var itemData = this.$graphItems.eq(index).data();
	this.$graphItems.eq(index).addClass("on").siblings().removeClass("on");
	
	var day = "";

	if( itemData.day == this.data.today){
		day = "오늘 ";
	}/*else{
		day = getDayNameKor(day);
	}*/

	console.log( 'itemData', itemData );

	$(".suc_txt .goal em").html(day+comma((itemData.goal)));
	$(".suc_txt .value em").html(comma((itemData.value)));
	
	if ( itemData.status == "OK") {
		$(".suc_txt div").addClass("on");
	}
	else{
		$(".suc_txt div").removeClass("on");
	}
};

WellnessBarGraph.prototype.__selectedDay=function(){
	var name = "";
	switch(day){
		case "mon":
			name = "월요일";
		break;
		case "tue":
			name = "화요일";
		break;
		case "wed":
			name = "수요일";
		break;
		case "thu":
			name = "목요일";
		break;
		case "fri":
			name = "금요일";
		break;
		case "sat":
			name = "토요일";
		break;
		case "sum":
			name = "일요일";
		break;
	}

	return name;
};

WellnessBarGraph.prototype.__setBarGraph=function(data){
	var maxValue = this.__getMinMaxData(data).max;
	if(maxValue%100 != 0){
		maxValue = (parseInt(maxValue/100)+1)*100;
	}

	$(".vertical-txt01").html(comma(maxValue));

	var centerValue = maxValue/2;
	if( maxValue>200 && centerValue%100 != 0 ){
		centerValue = Math.round(centerValue/100)*100;
	}

	$(".vertical-txt02").html(comma(centerValue)).css("bottom", this.__getPosition({
		max: maxValue,
		value: centerValue
	})+"%");
	
	$(".nline em").html(comma(data.goalData));
	$(".nline").css("bottom", this.__getPosition({
			max: maxValue,
			value: data.goalData
	})+"%");

	var lastDay;
	var count=400;
	var me = this;
	var total = 0;
	$.each(data.userData, function(key, val){
		var value = me.__getPosition({
			max: maxValue,
			value: val
		});

		me.dataLen++;
		var $target = me.$graphItems.filter("[data-day="+key+"]");
		me.$buttons.filter("[data-day="+key+"]").removeClass("no-data");
		setTimeout(function(){
			$target.find("div").height(parseInt(value)+"%");
		}, count);
		count += 100;
		
		var itemData = data.data[key];

		$target.data({
			status: itemData.status,
			goal: itemData.goal,
			value: val,
			day: key
		});

		total += val;
		lastDay = key;
	});

	$(".gr_txt em").html(comma(Math.round(data.averageData)));

	this.selectedDay(this.$graphItems.index(this.$graphItems.filter("[data-day="+data.target+"]")));
};

WellnessBarGraph.prototype.__getMinMaxData=function(data){	
	var min = this.data.userData.mon;
	var max = Math.max(this.data.goalData+Math.ceil(this.data.goalData/10), 100);
	$.each(this.data.userData, function(key, val){
		if( min > val ){
			min = val;
		}
		if(max < val){
			max = val;
		}
	});

	return {min: min, max: max};
};

WellnessBarGraph.prototype.__getAverage=function(data){	
	var num=0;
	var index = 0;
	$.each(data.userData, function(){
		index++;
		num+=this;
	});

	return parseInt(num/index);
};
	
WellnessBarGraph.prototype.__getPosition=function(data){	
	var value = ( 100 - 0 ) / ( data.max - 0 ) * ( data.value - 0 ) + 0;
	return value;
};
