// Common UI Script
(function(window, undefined) {

'use strict';

var projectName = "Wellness";

$(document.body).ready(function(){

	var 
	$body = $("body"),
	$popupWrap = $(".pop_bg[data-pop-wrap]");

	$body.on("click", "[data-open-pop]", function(e){
		e.preventDefault();
		var id = $(this).attr("data-open-pop");
		if(id != undefined && id != ""){
			window[projectName].showLayerPopup(id);		
		}
	});

	$body.on("click", "[data-close-pop]", function(e){
		e.preventDefault();
		window[projectName].hideLayerPopup();
	});

	$body.on("click", "[data-tab-btn]", function(e){
		e.preventDefault();
		var $t = $(this).addClass("selectd");
		var id = $t.attr("data-tab-btn");
		$t.parent().siblings().find("a").removeClass("selectd");
		$("[data-tab-content="+id+"]").removeClass("dn").siblings().filter("[data-tab-content]").addClass("dn");
	});
	
	$popupWrap.on("click", ".ic_man", function(e){
		e.preventDefault();
		$(this).addClass("on");
		$(".pop_bg[data-pop-wrap] .ic_woman").removeClass("on");
	});

	$popupWrap.on("click", ".ic_woman", function(e){
		e.preventDefault();
		$(this).addClass("on");
		$(".pop_bg[data-pop-wrap] .ic_man").removeClass("on");
	});

	$popupWrap.on("click", "#pop_user_gender [data-close-pop]", function(e){
		e.preventDefault();
		var gender = "";
		var dateGender = "";
		if($(".pop_bg[data-pop-wrap] .ic_woman").hasClass("on")){
			gender = "여성";
			dateGender = "F";
		}else if( $(".pop_bg[data-pop-wrap] .ic_man").hasClass("on") ){
			gender = "남성";
			dateGender = "M";
		}

		$("span.user_gender").html(gender);
		$("input.user_gender").val(dateGender);
	});

    $(document.body).trigger("didLoad");
});

var $currentPop, $popWrap;

window[projectName] = {
	startSpinAnimation:function( $el, duration ){
		$el.data("isAnimate", true);
		duration = (duration==undefined) ? 1000 : duration;
		$el.stop().prop({"tempRotate":0}).animate({ "tempRotate":358}, { duration: duration, easing: "easeInOutQuad", 
            step: function(n){
               $el.css('transform', 'rotate('+n+'deg)');
            }, 
		    complete: function(){      
		    	if( $el.data("isAnimate") == true ){
		    		window.Wellness.startSpinAnimation($el);
		    	}
            }
        });	

	},

	stopSpinAnimation:function( $el ){
		$el.stop().data("isAnimate", false);
	},

	showLayerPopup: function(openID){
		if( $popWrap == undefined){
			$popWrap = $("[data-pop-wrap]");
		}

		$popWrap.removeClass("dn");
		$currentPop = $("#"+openID).removeClass("dn");
		$currentPop.siblings().addClass("dn");

		if( $currentPop.find(".m-loadingspinner").length != 0 ){
			var $spin = $currentPop.find(".m-loadingspinner .m-draw2");
			window.Wellness.startSpinAnimation($spin);	
		}		
	},

	hideLayerPopup: function(){
		if( $popWrap == undefined){
			$popWrap = $("[data-pop-wrap]");
		}

		//if( $currentPop != undefined ){
			$popWrap.addClass("dn");
			$popWrap.find(".popup_wrap").addClass("dn");
			//$currentPop.addClass("dn");
		//}
		if( $currentPop && $currentPop.find(".m-loadingspinner").length != 0 ){
			var $spin = $currentPop.find(".m-loadingspinner .m-draw2");
			window.Wellness.stopSpinAnimation($spin);	
		}			
	},

	createDatepickerPopup:function($element){
		var defaultDate = new Date(1990, 6-1, 15);
		var datepicker = $element.mobiscroll().date({
            theme: 	$.mobiscroll.defaults.theme,
            mode: "scroller",
            display: "inline", 
            rows: 3,
            minDate: new Date(1910, 1-1, 1),
            maxDate: new Date(),
            defaultValue: defaultDate,
            monthNames: ["1월","2월","3월","4월","5월","6월", "7월","8월","9월","10월","11월","12월"],
            dateOrder: "yymd",
            height: 35
        });

        datepicker.mobiscroll('setVal', defaultDate);

        return datepicker;
	},

	getDatepickerVal:function(datepicker){
		var data = datepicker.mobiscroll('getVal');
		if(data == null){
			return null;
		}

        var year = data.getFullYear();
        var month = data.getMonth()+1;
 		var date = data.getDate();

        var fullDateKo = year+"년 "+month+"월 "+date+"일";
        if(month<10){
            month = "0"+month;
        }
       
        if(date<10){
            date = "0"+date;
        }


       return {year: year, month: month, date: date, fullDate: year+"-"+month+"-"+date, fullDateKo: fullDateKo};        
	},

	createTimepicker:function($element, defaultValue){	
		if( defaultValue == undefined){defaultValue = [0,0] }	
		var timepicker = $element.mobiscroll().scroller({
            theme: $.mobiscroll.defaults.theme     // Specify theme like: theme: 'ios' or omit setting to use default 
             ,mode: "scroller"       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
            ,display: "inline"
            ,height: 47
            ,minWidth:59
            ,wheels: [[
                {
                    keys: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    values: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
                },{
                    keys: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
                    values: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"]
                }
            ]]
            ,rows: 3                
        });
	
       $element.mobiscroll('setValue', defaultValue);
        return timepicker;
	},

	getTimepickerVal:function(timepicker){
		var data = timepicker.mobiscroll('getArrayVal');
		if(data == null){
			return null;
		}

       return data;   
	}
};

window[projectName].util = {
	comma:function(str) {
	    str = String(str);
	    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
}

})(window);

// M-API Common
(function(window, undefined) {

'use strict';

var
controller = MainController.sharedInstance(),
popupController = PopupController.sharedInstance();

M.onReady(function(e) {
    
	controller.initialize();

	if ( M.data.param("clear-stack") === "Y" ) {
		M.data.removeParam("clear-stack");
		controller.clearStack();
	}

	controller.bind("didFinishExecute", function( event ) {
		
        if ( event.action === "user.auth.start" ) {

            if ( event.error ) {
            	controller.moveToLoginPage();
            	return;
            }

            var result = event.result;
            
            if ( controller.userInfo().auth(result) ) {
                // 자동 로그인 후 회원 정보가 없으면, 프로필 설정화면 으로 진행
                if ( ! controller.userInfo().userName() ) {
                    M.page.html("user.terms.html", {action:"NO_HISTORY"});
                }
                else if ( ! controller.deviceInfo().hasPairedBand() ){
                    M.page.html("intro.pairing.html", {action:"NO_HISTORY", animation:"SLIDE_LEFT"});
                }
                else {
                    controller.moveToHome();
                }
            }
            else {
                controller.sessionController().closeSession();
            
                //popupController.alert( M.locale.localizedString("message_login_error") );
                
                if (controller.sessionController().activedSession()) {
					controller.moveToLoginPage();
				}
            }
        }
        else if ( event.action === "user.auth" ) {
        	
        	if ( event.error ) {
            	controller.moveToLoginPage();
            	return;
            }

    		var result = event.result;

			if ( controller.userInfo().auth(result) ) {
                controller.sessionController().startSession();
			}
			else {
				controller.sessionController().closeSession();
            
                //popupController.alert( M.locale.localizedString("message_login_error") );

				if (controller.sessionController().activedSession()) {
					controller.moveToLoginPage();
				}
			}
    	}
        else if ( event.action === "user.logout" ) {
            popupController.toast( "logout!!" );

            controller.moveToLoginPage();
        }
	});
	
	setTimeout( function() {
		$(document.body).trigger("didAppear");
	}, 0);
});

M.onBack(function(e) {
	if ( M.info.stack().length < 2 ) {
        M.pop.alert({
        	"title": "알림",
            "message": "종료하시겠습니까?",
            "buttons": ["취소", "종료"],
            "onclick": function( buttonIndex ) {
                if ( buttonIndex == 1 ) {
                	M.sys.exit();
                }
            }
        });
	}
	else {
		controller.execute( "page.back" );
	}
});

M.page.prefer().blockMovePage = false;
M.page.prefer().shouldMovePage(function( api, url, param ) {
    if ( M.page.prefer().blockMovePage === true ) {
        return false;
    }
    
    M.page.prefer().blockMovePage = true;
});

M.onResume( function(e) {
    setTimeout(function() {
        $(document.body).trigger("applicationDidEnterForground");
    }, 0);
});

M.onPause( function(e) {
    setTimeout(function() {
        $(document.body).trigger("applicationDidEnterBackground");
    }, 0);
});

M.onRestore( function(e) {
    M.page.prefer().blockMovePage = false;

    if ( controller.sessionController().activedSession() ) {
	    controller.sessionController().startTimer();
	}
    
    setTimeout(function() {
        $(document.body).trigger("didAppear");
    }, 0);
});

M.onHide( function(e) {
   	controller.sessionController().stopTimer();

    $(document.body).trigger("willDisappear", {});
});

})(window);