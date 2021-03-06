(function(window, undefined) {

'use strict';

var debug = window.debug;

var 
Class = UI.Class,

API = (function() {
    return {
        serverName: "GATEWAY_SERVER",
        address: function() {
        	var self = this;
        	var address = "";

		    try {
			    var appInfo = M.info.app();
				var manifest = appInfo.manifest;
			    address = manifest.network.http[self.serverName]["address"];
			} catch(e) {

			}

			return address;
        }
    };
})(),

Debug = function() {
	
	var _microtime = function( get_as_float ) {
		var now = new Date().getTime() / 1000;
		var s = parseInt(now, 10); 
		return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000);
	};

	Debug.enabled = false;
	Debug.currentTime = _microtime(true);
	
	var _methods = ["log", "info", "warn", "error"];
	var _methodsPatch = function( handler, context ) {
		if (typeof handler != "function") {
			return;
		}
		
		for( var i in _methods ) {
			var method = _methods[i];
			handler.call( context, method );
		}
	};
	
	// IE bug Fixed
	if ( Function.prototype.bind && window.console != undefined && typeof window.console.log == "object" ) {
		_methodsPatch( function( method ) {
			if ( window.console[method] == undefined ) {
				window.console[method] = this.bind( window.console[method], window.console );
			}
		}, Function.prototype.call );
		
		return window.console;
	}
	
	_methods.push( "resetTime", "elapsedTime", "captureTrace", "message" );
	
	var _constructor = {
		filter:[],
		
		_execute: function( method, args ) {
			if ( method != "message" && method != "error" && ! Debug.enabled ) {
				return;
			}
			
			// force message
			if ( method == "message" ) {
				method = "log";
			}
			
			var params = Array.prototype.slice.call( args, 0 );
			
			if ( Function.prototype.bind && window.console != undefined ) {
			
				switch ( method ) {
					case "resetTime":
						Debug.currentTime = _microtime(true);
					break;
					
					case "captureTrace":
						var stack = "";
				
						try {
							var trace = {};
							
							if ( typeof Error.captureStackTrace == "function" ) {
								Error.captureStackTrace(trace, this ); // for Crome
							}
							else {
								var error = new Error();
								trace.stack = error.stack; // Firefox
							}
							
							var stack = trace.stack.split(/\n/);
							stack.shift();
							stack.shift();
							stack.shift();
							stack.shift();
							
							stack = stack[0];
						}
						catch(e) {
							debug.log( e );
							stack = "";
						}
						
						window.debug.log( stack );
					break;
	
					case "elapsedTime":
						params.push( method );
						params.push( (_microtime(true) - Debug.currentTime).toFixed(3) );
			
						var func = Function.prototype.bind.call( window.console["log"], window.console );
						func.apply( window.console, params );
					break;
	
					default:
						if ( _constructor.filter && _constructor.filter.length > 0 ) {
							if ( ! in_array( _constructor.filter, params[0] ) ) {
								break;
							}
						}
						
						var func = Function.prototype.bind.call( window.console[method], window.console );
						func.apply( window.console, params );
					break;
				}
			}
		}
	};
	
	_methodsPatch( function( method ) {
		if ( typeof _constructor["_execute"] == "function" ) {
			_constructor[method] = function( message ){ 
				_constructor._execute( method, arguments ); 
			};
		}
		
	}, _constructor );
	
	return _constructor;
},

DataModel = Class.DataModel,
DatabaseConfig = Class.DatabaseConfig,
UserInfo = Class.UserInfo,
ProfileInfo = Class.ProfileInfo,
DeviceInfo = Class.DeviceInfo,
FitConfig = Class.FitConfig,
ViewController = Class.ViewController,

SessionController = Class({
	name: "SessionController",
	parent: "IObject",
	constructor: function() {

		var /* constant */
		_VALID_SESSION_TIME = 1000*60*30;

		var 
		self,
		_timeout = null, 
		_activeTimer = false, 
		_useSession = false;

		return {
			userInfo: function() {
				return UserInfo.sharedInfo();
			},

			init: function() {
				self = this;
				
				return self;
			},

			activedSession: function() {
				return _useSession;
			},

			startSession: function() {
				//debug.log( "startSession");

				_useSession = true;

				if ( ! self.userInfo().isLogin() ) {
					self.closeSession();
				}
				else if ( ! self.checkSession() ) {
					self.authSession();
				}
				else {
					self.startTimer();
				}
			},

			closeSession: function() {
				//debug.log( "closeSession");

				self.stopTimer();

				self.userInfo().truncate();
                _useSession = false;
			},

			startTimer: function() {
				//debug.log( "startTimer");

				if ( _activeTimer == true ) {
					self.scheduleTimeout();

					return;
				}

				_activeTimer = true;

				self.scheduleTimeout();
			},

			stopTimer: function() {
				//debug.log( "stopTimer");

				_activeTimer = false;

				if ( _timeout ) {
					clearTimeout( _timeout );
					_timeout = null;
				}
			},

			scheduleTimeout: function() {
				//debug.log( "scheduleTimeout");

				if ( _timeout ) {
					clearTimeout( _timeout );
                    
					_timeout = null;
				}

				_timeout = setTimeout( function() {
					
                    if ( _activeTimer == true ) {
						
                        if ( ! self.userInfo().isLogin() ) {
							self.closeSession();
							return;
						}
						else if ( ! self.checkSession() ) {
							self.authSession();
							return;
						}

						self.scheduleTimeout();
					}
					else {
						self.stopTimer();
					}
				}, 30000);
			},

			checkSession: function() {
				//debug.log( "checkSession");

				if ( ! self.userInfo().isLogin() ) {
					debug.log( "user auth is invalid");
					return false;
				}

				var elapsedTime = self.userInfo().elapsedTime();

				if ( elapsedTime > _VALID_SESSION_TIME ) {
					debug.log( "session is invalid")
					return false;			
				}

				return true;
			},

			authSession: function() {
				debug.log( "_useSession", _useSession );
				
                if ( _useSession == true ) {
                    MainController.sharedInstance().execute("user.auth", self.userInfo().data());
                }
                else {
                    self.stopTimer();
                }
			},
		};
	}
}),

Command = function( command, handler, delegate ) {
	var 
	_command = command,
	_handler = handler,
	_delegate = delegate,
	_args = [],
	_completed = false,
	_context = window;

	return {
		command: function() {
			return _command;
		},
		
		execute: function() {
			debug.log( _delegate.macroID(), "execute", _command );

			var self = this;
			var args = Array.prototype.slice.call( arguments, 0 );
			var result = _handler.apply(self, args);

			_args = args;

			return result;
		},

		retry: function() {
			debug.log( _delegate.macroID(), "retry execute", _command );

			var self = this;
			var result = _handler.apply(self, _args);

			return result;
		},
		
		isCompleted: function() {
			return _completed
		},

		complete: function() {
			var self = this;

			//debug.log( _delegate.macroID(), "complete", _command );

			setTimeout(function() {
				_completed = true;
				_delegate.complete( self );
			}, 0);
		}
	};
},

Macro = Class({
	name: "Macro",
	parent: "IObject",
	constructor: function( macroID ) {

		var self, _macroID = macroID || UI.Helper.String.guid( "Macro.xxxxxxxx" ), _finishHandler, _commandObjects = {}, _macroQueue = [], _currentMacroData = null, _cancelled = false, _progressing = false;

		return {
			init: function() {
				self = this;

				return self;
			},

			macroID: function() {
				return _macroID;
			},

			get: function( command ) {
				return _commandObjects[command] ? _commandObjects[command] : null;
			},

			register: function( command, handler ) {
				var commandObject = new Command( command, handler, self );
				_commandObjects[command] = commandObject;
			},

			unregister: function( command ) {
				delete _commandObjects[command];
				_commandObjects[command] = null;
			},

			execute: function( command ) {

				var commandObject = _commandObjects[command];

				if ( ! commandObject ) {
					debug.log( "command is not registerd - " + command );
					return;
				}

				var args = Array.prototype.slice.call( arguments, 1 );

				commandObject.execute.apply( commandObject, args );
			},

			complete: function( commandObject ) {

				setTimeout( function() {
					self.next();
				}, 0);
			},

			add: function( command ) {
				
				var commandObject = _commandObjects[command];
				if ( ! commandObject ) {
					debug.log( "command is not registered - " + command );
					return;
				}

				var params = Array.prototype.slice.call( arguments, 1 );
				params.unshift( commandObject );

				self.addCommandObject.apply( self, params );
			},

			delay: function( delay ) {
				
				var commandObject = new Command( "_DELAY_", function( delay ) {
					setTimeout( function() {
						commandObject.complete(commandObject);
					}, delay * 1000);
				}, self );

				self.addCommandObject.apply( self, [commandObject] );
			},

			addCallback: function( callback ) {
				
				var commandObject = new Command( "_CALLBACK_", function() {
					callback.apply(commandObject, arguments);
					commandObject.complete(commandObject);
				}, self );

				self.addCommandObject.apply( self, [commandObject] );
			},

			addCommandObject: function( commandObject ) {
				var params = Array.prototype.slice.call( arguments, 1 );
				var macroData = {
					target: commandObject,
					command: commandObject.command(),
					params: params
				};

				_macroQueue.push( macroData );
			},

			addQueue: function( queues ) {
				for ( var i=0; i<queues.length; i++ ) {
					var queue = queues[i];
					_macroQueue.push( queue );
				}
			},

			start: function() {
				debug.log( _macroID, "start" );

				_cancelled = false;
				_progressing = true;

				setTimeout( function() {
					self.next();
				}, 0);
			},

			next: function() {

				if ( _currentMacroData != null ) {
					if ( _currentMacroData.target ) {
						if ( ! _currentMacroData.target.isCompleted ) {
							console.error(_currentMacroData.target, _currentMacroData.command, "it is not completed" );
						}
					}
				}

				var macroData = _macroQueue.shift();

				//debug.log( _macroID, "next - ", macroData.command );
				
				if ( ! macroData ) {
					self.done();
					return;
				}

				var args = macroData.params;
				args.unshift( macroData.command );

				_currentMacroData = macroData;

				macroData.target.execute.apply( macroData.target, args );
			},

			cancel: function( handler ) {

				debug.log( _macroID, "cancel" );

				_cancelled = true;

				self.done();

				if ( typeof handler === "function" ) {
					handler( );
				}
			},

			done: function() {
				if ( _progressing == false ) {
					return;
				}

				debug.log( _macroID, "done" );

				_progressing = false;
				_macroQueue = [];

				if ( typeof _finishHandler === "function" ) {
					_finishHandler( _cancelled === true ? false : true );
				}
			},

			clear: function() {

				debug.log( _macroID, "clear" );

				_macroQueue = [];
			},

			finishHandler: function( handler ) {
				_finishHandler = handler;
			},

			marcoQueue: function() {
				return _macroQueue;
			},

			isProgressing: function() {
				return ( _macroQueue.length > 0 ) ? true : false;
			},

		};
	}
}),

ExecuteEvent = function( command, params, options, args ) {

	var 
	_command = command || "",
	_params = params || {},
	_options = UI.Helper.Object.extend( {
		showIndicator: true,
		callback: function() {

		},
		retryCount: 1
	}, options || {} );

	return {
		action: _command,
		args: args,
		params: _params,
		options: _options,
		code: 200,
		error: "",
		result: {},
		retryCount: _options.retryCount,
		showIndicator: _options.showIndicator,
		cancelable: false,
		callback: function() {
			if ( typeof _options.callback === "function" ) {
				_options.callback( this );
			}
		}
	};
},

MainController = Class({
	name: "MainController",
	parent: "UIController",
	constructor: function() {
		var self, _macro, _sessionController, _view, _debug = new Debug(), _appeared = false;
		var _isDialogShowing = false;
		return {
			debug: function() {
				return _debug;
			},
            
			userInfo: function() {
				return UserInfo.sharedInfo();
			},
            
			profileInfo: function() {
				return ProfileInfo.sharedInfo();
			},
            
			deviceInfo: function() {
				return DeviceInfo.sharedInfo();
			},

			fitManager: function() {
				return FitManager.defaultManager();
			},
			
            macro: function() {
                return _macro;
            },

			sessionController: function() {
				return _sessionController;
			},

			view: function() {
				return _view;
			},

			init: function() {
				self = this;
                _macro = new Macro();
				_sessionController = new SessionController();
				_view = new ViewController( document.body );

				return self;
			},

			initialize: function() {
				self.dispatchEvent( "ready" );

				return self;
			},

			clearStack: function() {
				var stackList = M.info.stack();
            
                if ( stackList.length >= 2 ) {
                	var hasMainStack = false;

                    for ( var i=stackList.length-2; i>=0; i-- ) {
                        var stackInfo = stackList[i];

                        if ( document.location.href.indexOf("user.login.html") !== -1 ) {
                        	M.page.remove( stackInfo.key );
                        }
                        else {
	                        if ( stackInfo.key.toLowerCase().indexOf("dashboard.main.html") !== -1 ) {
	                        	if ( hasMainStack === true ) {
		                        	M.page.remove( stackInfo.key );
		                        }
		                        else {
		                        	hasMainStack = true;
		                        }
	                        }
	                        else {
	                        	M.page.remove( stackInfo.key );
	                        }
	                    }
                    }
                }
			},

			isReady: function() {
				return this.fitManager().synchronizeManager().isSyncing() === false ? true : false;
			},

			moveToPairingPage: function( event ) {
				var popupController = PopupController.sharedInstance();
				
				if ( M.navigator.os("android")){
					if(M.data.global("paired") == "N") {
						popupController.alert( "밴드 연결이 되어있지 않습니다." );
						return;
					}
				}
				
				
				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 연결 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}

				var nextPage = document.location.href.indexOf("dashboard.main.html") !== -1 ? "dashboard.main.html" : "setting.device.html";
				var nextAction = document.location.href.indexOf("dashboard.main.html") !== -1 ? "CLEAR_TOP" : "NEW_SRC";
				
				//설정창에서 기기 혜제 시 설정창 2번 팝업되는현상 수정.
				if(document.location.href.indexOf("setting.device.html") !== -1){
					nextAction = "CLEAR_TOP";
				}
				

				M.page.html("setting.pairing.html", {
					action:"NO_HISTORY", 
					param:{"next-page":nextPage, "next-action":nextAction}
	            });

				self.dispatchEvent("didFinishExecute", event );
			},

			unpairingDevice: function( event ) {
				var popupController = PopupController.sharedInstance();
				
				if ( M.navigator.os("android")){
					if(M.data.global("paired") == "N") {
						popupController.alert( "밴드 연결이 되어있지 않습니다." );
						return;
					}
				}

				if ( this.isReady() === false ) {
					/*
					event.error = "동기화 중에는 연결 해제를 실행 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
					*/

					self.fitManager().synchronizeManager().cancel();
				}
                       
               if ( !M.navigator.os("android")){
                       alert("스마트밴드의 블루투스를 완전히 끄기 위해서는 설정->Bluetooth->나의 기기->이기기 지우기를 하시기 바랍니다.");
               }

				this.fitManager().unpair(function( result ) {

					if ( result.error ) {
						event.error = result.error;
					}
					else {
						_view.updateMenu();
					}
					
					if(M.navigator.os("android")) {
						M.execute("wnRemoveLocalData");
					}
					else {
						WN2Common("wnRemoveLocalData");
					}
					
					// 기기 해제 시, 새 기계 연결 선택을 하게 되면, 자동 로그인으로 처리하지않고, 새로 
					// intro를 진입하는 것으로 가정하기 위해서.
					
					
					debug.log("hyjeon"," 기기 해제 했습니다. ");
					
					self.dispatchEvent("didFinishExecute", event );
				});
			},
			
//			moveToSettingPage: function( event ) {
//				var popupController = PopupController.sharedInstance();
//				debug.log('###finish dialog moveToSettingPage### isDialogShow? ', _isDialogShowing );
//				if ( this.isReady() === false) {
//					if( _isDialogShowing == false){
//						_isDialogShowing= true;
//						event.error = "동기화 중에는 설정 페이지로 이동 할 수 없습니다.";
//						popupController.confirm(
//	                        event.error, 
//	                        ["확인"],
//	                        function( buttonIndex ) {
//	                        	_isDialogShowing= false;
//	                        	debug.log('###finish dialog moveToSettingPage onClick### isDialogShow? ', _isDialogShowing );
//	                        }
//	                    );
//					}
//
//					self.dispatchEvent("didFinishExecute", event );
//					return;
//				}
//
//				if ( ! self.fitManager().isPaired() ) {
//		            M.page.html("setting.pairing.html", 
//		                {
//		                    action:"NO_HISTORY", 
//		                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
//		                }
//		            );
//		        }
//		        else {
//		            M.page.html("setting.device.html", {"action":"NEW_SRC"});
//		        }
//
//				self.dispatchEvent("didFinishExecute", event );
//			},
			
			moveToSettingPage: function( event ) {
				var popupController = PopupController.sharedInstance();
				debug.log('###finish dialog moveToSettingPage### isDialogShow? ', _isDialogShowing );
				if ( M.data.global("BLE_LOCK") == "LOCK") {
					if( _isDialogShowing == false){
						_isDialogShowing= true;
						event.error = "동기화 중에는 설정 페이지로 이동 할 수 없습니다.";
						popupController.confirm(
	                        event.error, 
	                        ["확인"],
	                        function( buttonIndex ) {
	                        	_isDialogShowing= false;
	                        	debug.log('###finish dialog moveToSettingPage onClick### isDialogShow? ', _isDialogShowing );
	                        }
	                    );
					}

					self.dispatchEvent("didFinishExecute", event );
					return;
				}
				//ios일때
				if(M.navigator.os("ios")){	
					if ( ! self.fitManager().isPaired() ) {
                       popupController.confirm(
                                               "밴드 연결이 되어있지 않습니다.",
                                               ["확인"],
                                               function( buttonIndex ) {
                                                   M.page.html("setting.pairing.html",
                                                               {
                                                               action:"NO_HISTORY",
                                                               param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
                                                               }
                                                               );
                                                   }
                                               );
			        }
			        else {
			        	M.page.html("setting.device.html", {"action":"NEW_SRC"});
			        }
				}
				//안드로이드 
				if ( M.navigator.os("android")){
					if(M.data.global("paired") == "N") {
						popupController.alert( "밴드 연결이 되어있지 않습니다." );
					}else {
						M.page.html("setting.device.html", {"action":"NEW_SRC"});
					}
				}
				
				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveUserMypageSetting: function( event ) {
				console.log('intro moveUserMypageSetting');
				var popupController = PopupController.sharedInstance();

				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 목표 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}

				if (M.navigator.os("ios")) {

					M.page.html("user.mypage.html", {action:"CLEAR_TOP"});
				} 
				else {
					if ( ! self.fitManager().isPaired() ) {
			            M.page.html("setting.pairing.html", 
			                {
			                    action:"NO_HISTORY", 
			                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
			                }
			            );
			        }
			        else {
			            M.page.html("user.mypage.html", {"action":"NEW_SRC"});
			        }
				}
				
				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveDashboardStepWeekly: function( event ) {
				var popupController = PopupController.sharedInstance();

				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 걸음 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}
				
//				if (M.navigator.os("ios")) {
					M.page.html("dashboard.step.weekly.html", {"action":"NEW_SRC"});
//				} else {
//					if ( ! self.fitManager().isPaired() ) {
//			            M.page.html("setting.pairing.html", 
//			                {
//			                    action:"NO_HISTORY", 
//			                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
//			                }
//			            );
//			        }
//			        else {
//			        	M.page.html("dashboard.step.weekly.html", {"action":"NEW_SRC"});
//			        }
//				}
				

				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveDashboardDistanceWeekly: function( event ) {
				var popupController = PopupController.sharedInstance();

				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 이동거리 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}

//				if (M.navigator.os("ios")) {
					M.page.html("dashboard.distance.weekly.html", {"action":"NEW_SRC"});
//				} else {
//					if ( ! self.fitManager().isPaired() ) {
//			            M.page.html("setting.pairing.html", 
//			                {
//			                    action:"NO_HISTORY", 
//			                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
//			                }
//			            );
//			        }
//			        else {
//			        	M.page.html("dashboard.distance.weekly.html", {"action":"NEW_SRC"});
//			        }
//				}

				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveDshboardBurnToday: function( event ) {
				var popupController = PopupController.sharedInstance();

				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 칼로리 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}

//				if (M.navigator.os("ios")) {
                       //2016.10.14 오늘 탭 삭제
//                       M.page.html("dashboard.burn.today.html", {"action":"NEW_SRC"});
                       M.page.html("dashboard.burn.weekly.html", {"action":"NEW_SRC"});
//				} else {
//					if ( ! self.fitManager().isPaired() ) {
//			            M.page.html("setting.pairing.html", 
//			                {
//			                    action:"NO_HISTORY", 
//			                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
//			                }
//			            );
//			        }
//			        else {
//			        	M.page.html("dashboard.burn.today.html", {"action":"NEW_SRC"});
//			        }
//				}

				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveDashboardSleepToday: function( event ) {
				var popupController = PopupController.sharedInstance();

				if ( this.isReady() === false ) {
					event.error = "동기화 중에는 수면시간 페이지로 이동 할 수 없습니다.";
					popupController.confirm(
                        event.error, 
                        ["확인"],
                        function( buttonIndex ) {
                            
                        }
                    );

					self.dispatchEvent("didFinishExecute", event );
					return;
				}
				

				if ( M.navigator.os("ios") ){
					if ( M.data.global("BLE_LOCK") == "LOCK" ) {
						event.error = "동기화 중에는 수면시간 페이지로 이동 할 수 없습니다.";
						popupController.confirm(
	                        event.error, 
	                        ["확인"],
	                        function( buttonIndex ) {
	                            
	                        }
	                    );
	
						self.dispatchEvent("didFinishExecute", event );
						return;
					}
				}
				
//				if (M.navigator.os("ios")) {
//					M.page.html("dashboard.sleep.today.html", {"action":"NEW_SRC"});
//				} else {
//					if ( ! self.fitManager().isPaired() ) {
//			            M.page.html("setting.pairing.html", 
//			                {
//			                    action:"NO_HISTORY", 
//			                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
//			                }
//			            );
//			        }
//			        else {
			        	M.page.html("dashboard.sleep.today.html", {"action":"NEW_SRC"});
//			        }
//				}

				self.dispatchEvent("didFinishExecute", event );
			},
			
			moveToLoginPage: function( event ) {  
            
				M.page.html("user.login.html", {action:"CLEAR_TOP", animation:"SLIDE_RIGHT"});

            	self.dispatchEvent("didFinishExecute", event );
			},
            
            moveToHome: function( event ) { 
            
                M.page.html("dashboard.main.html", {action:"NEW_SRC", animation:"SLIDE_LEFT"});

            	self.dispatchEvent("didFinishExecute", event );
            },

            moveToBack: function( event ) {
            	M.page.back();

            	self.dispatchEvent("didFinishExecute", event );
            },

            retry: function( event ) {
            	event.options.retryCount = event.retryCount = event.retryCount + 1;
            	
            	setTimeout( function() {
	            	self.execute.call( self, event.action, event.params, event.options );
	            }, 500 );
            },

            reset: function() {
            	_macro.cancel();
            },

            isAppeared: function() {
            	return _appeared;
            },

            didAppear: function() {
			    if ( _sessionController.activedSession() ) {
				    _sessionController.startTimer();
				}

			   	_appeared = true;

				DataModel.needToRestore();
            },

            willDisappear: function() {
			   	_sessionController.stopTimer();
			   	_appeared = false;

				DataModel.needToSave();
			},

            dispatchEvent: function( command,  event ) {
            	if ( event && typeof event.callback === "function" && command === "didFinishExecute" ) {
            		setTimeout( function() {
            			event.callback();
            		}, 0);
            	}

            	self._super( "dispatchEvent", arguments );
            },
            
			execute: function( command, params, options ) {
				var event = new ExecuteEvent( command, params, options, arguments );
                
				switch( command ) {
					case "synch.manual":
						var popupController = PopupController.sharedInstance();
						
						if ( M.data.global("paired") == "N" ) {
							popupController.alert( "밴드 연결이 되어있지 않습니다." );
							return;
						}
						
							
						if (  M.data.global("BLE_LOCK") == "LOCK" ) {
							if( _isDialogShowing == false){
								_isDialogShowing= true;
							event.error = "밴드 동기화 중입니다.동기화는 1~2분 정도 소요 됩니다.잠시만 기다리세요.";
								popupController.confirm(
			                        event.error, 
			                        ["확인"],
			                        function( buttonIndex ) {
			                        	_isDialogShowing= false;
			                        	debug.log('###finish dialog moveToSettingPage onClick### isDialogShow? ', _isDialogShowing );
			                        }
			                    );
							}
							return;
						}else{
							console.log('[ 커런트 값 및 지난 데이터 가져오기 ] ');
							
							//WN2Common("exWN2PluginFitBandHistoryyy");
							
							if( _isDialogShowing == false){
								_isDialogShowing= true;
								event.error = "밴드 동기화를 진행합니다.동기화는 약 1~2분정도 소요됩니다.";
								//alert("밴드 동기화를 진행합니다.동기화는 약 1~2분정도 소요됩니다.");
//								popupController.confirm(
//			                        event.error, 
//			                        ["확인"],
//			                        function( buttonIndex ) {
			                        	if ( M.navigator.os("android")){
			                        	self.fitManager().connect( function( result ) {
								            if ( result.error ) {
								            	
								            }
								            M.fit.current(function( result ) {
								    			console.log('M.fit.current');
								                if ( result.error ) {
								                	console.log(result.error);
								                }
								                else {
								    				console.log('fitManager.info().data');
								    				self.fitManager().info().data({
								                        "current_calorie": result.calorie,
								                        "current_distance": result.distance,
								                        "current_step": result.step
								                    });
								
								                    M.data.storage("CALORIE", result.calorie);
								                    M.data.storage("DISTANCE", result.distance);
								                    M.data.storage("STEP", result.step);
								                    _isDialogShowing= false;
								                   
								                    self.fitManager().synchManually(  function() {
								                		
								                	 });
								                }
								                
								    		});
								                  
								   	 	}, true );
			                        	}
			                        	else {  //바꾼부분
//			                        		self.fitManager().synchManually(  function() {
//						                		
//						                	 });
//			                        		alert('실행');
//						                    alert(self.fitManager().userInfo().userKey());
//						                    alert(self.fitManager().userInfo().authToken());
//						                    alert(DeviceInfo.sharedInfo().sleepEnd());
						                    //WN2Common("exWN2PluginFitBandHistoryyy");
						                    //M.execute("exWN2PluginFitBandHistory", "", "", "", "");
			                        		
			                        		WN2Common("exWN2PluginFitBandHistory", self.fitManager().userInfo().userKey(), self.fitManager().userInfo().authToken(), DeviceInfo.sharedInfo().sleepStart(), DeviceInfo.sharedInfo().sleepEnd());
			                        		
//			                        		M.fit.current(function( result ) {
//								    			console.log('M.fit.current');
//								                if ( result.error ) {
//								                	console.log(result.error);
//								                }
//								                else {
//								    				console.log('fitManager.info().data');
//								    				self.fitManager().info().data({
//								                        "current_calorie": result.calorie,
//								                        "current_distance": result.distance,
//								                        "current_step": result.step
//								                    });
//								
//								                    M.data.storage("CALORIE", result.calorie);
//								                    M.data.storage("DISTANCE", result.distance);
//								                    M.data.storage("STEP", result.step);
//								                    _isDialogShowing= false;								                    
//								                    self.fitManager().synchManually(  function() {
//								                		
//								                	 });
//								                }								                
//								    		});
			                        	}
//			                        } 
//			                    );

	                        	
							}
							
						}
						/////////////////////////////////

						break;
					case "system.exit":

						_view.confirm( 
							"앱을 종료하시겠습니까?", 
							["확인", "취소"],
							function( buttonIndex ) {
								if ( buttonIndex == 0 ) {
									M.sys.exit();
								}
							}
						);
						self.dispatchEvent("didFinishExecute", event );
					break;
					
					
					case "move.setting":						
						self.moveToSettingPage( event );
						break;
					case "move.user.mypage.setting": //목표
						if ( M.navigator.os("ios") ) {
							M.page.html("user.mypage.html");
						}else{
							
							self.moveUserMypageSetting( event );
						}
						break;
					case "move.dashboard.step.weekly": //걸음
						self.moveDashboardStepWeekly( event );
						break;	
					case "move.dashboard.distance.weekly": //이동거리
						self.moveDashboardDistanceWeekly( event );
						break;
					case "move.dashboard.burn.today": //칼로리
						self.moveDshboardBurnToday( event );
						break; 
					case "move.dashboard.sleep.today": //수면시간
						self.moveDashboardSleepToday( event );
					break;

					case "move.home":
						self.moveToHome( event );
					break;

					case "move.login":
						self.moveToLoginPage( event );
					break;

					case "page.back":
						self.moveToBack( event );
					break;

					case "device.pairing":
						if ( M.navigator.os("ios") ) {
							if(M.data.global("BLE_LOCK") == "LOCK"){
					    		alert("동기화 중에는 기기연결을 할 수 없습니다.");
					    		return;
					    	}
		        		}
						
						if(M.navigator.os("ios")){
							if ( ! self.fitManager().isPaired() ) {
								M.page.html("setting.pairing.html", {"action":"NEW_SRC"});
					        }
						}else{
							self.moveToPairingPage( event );
							
						}
						
					break;

					case "device.unpairing": //기기해제
						
						if ( M.navigator.os("ios") ) {
							if(M.data.global("BLE_LOCK") == "LOCK"){
					    		alert("동기화 중에는 기기해제를 할 수 없습니다.");
					    		return;
					    	}
		        		}
						
						self.unpairingDevice( event );
					break;
                    
                    case "user.signup":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                       
						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/signup",
							data: {
								"user_email": formData["user_email"],
                                "user_password": formData["user_password"],
                                "promotion": (formData["promotion"] === "Y" ? "Y" : "N")
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
                                result["user_email"] = formData["user_email"];

								event.result = result;

								if ( result["status"] != "Y" ) {
									self.dispatchEvent("didErrorExecute", event );
									return;
								}

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                       
                    break;

					case "user.login":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/login",
							data: {
								"user_email": formData["user_email"],
                                "user_password": formData["user_password"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event);
							},
							success: function(result, setting) { //수동로그인 성공한 부분
//								M.data.storage( "JOIN_DATE" , result. ); //neh
								event.result = result;
									
								if ( result["status"] != "Y" ) {
									event.error = result["status_msg"];

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
								
								M.data.global("AUTO_LOGIN", "MANUAL");
					            M.data.storage("USER_CREATED_DATE", result.user_date_created);

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "user.password.once":

						if ( ! M.info.device("network.connected") ) { 
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/password/once",
							data: {
                                "auth_token": self.userInfo().authToken(),
								"user_key" : self.userInfo().userKey(),
                                "user_email": formData["user_email"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {

								event.result = result;
                                
                                if ( result["status"] != "Y" ) {
                                	event.code = -1;
									event.error = result["status_msg"];

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
                                
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "user.reset.password":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/reset/password",
							data: {
                                "auth_token": self.userInfo().authToken(),
								"user_key" : self.userInfo().userKey(),
								"user_old_password": formData["user_old_password"],
                                "user_password": formData["user_password"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {

								event.result = result;
                                
                                if ( result["status"] != "Y" ) {
                                	event.code = -1;
									event.error = result["status_msg"];

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
                                
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;
                    
					case "user.auth":
					case "user.auth.signup":
					case "user.auth.start":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/auth",
                            timeout: 5000,
							data: {
                                "user_key" : self.userInfo().userKey(),
                                "user_email": self.userInfo().userEmail(),
                                "auth_token": self.userInfo().authToken()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								if ( M.navigator.os("ios") ) {
					                if(  M.data.storage("FIRST_PAIRING") != "Y" ){ //neh
										M.page.html("intro.pairing.html");
					                 }
				        		}
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								event.result = result;

								if ( result["status"] != "Y" ) {
									event.code = -1;
									event.error = result["status_msg"];

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
								M.data.global("AUTO_LOGIN", "AUTO");  //자동로그인 성공하면 AUTO_LOGIN을 AUTO로 설정#
								self.dispatchEvent("", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "info.terms":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                       
                    	var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/info/terms",
							data: {
                                
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								event.result = result;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;
                    
                    case "apartment.info":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                       
                    	var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/common/aptInfo",
							data: {
                                
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								event.result = result;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                       
                    break;
                    
                    case "user.profile.edit":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};
                       
                        var requestData = {
                            "auth_token" : self.userInfo().authToken(),
                            "user_key": self.userInfo().userKey(),
                            "user_name": formData["user_name"],
                            "user_birth": (formData["user_birth"] + "").split(".").join("-"),
                            "user_gender": formData["user_gender"],
                            "user_phone": formData["user_phone"] ? (formData["user_phone"]+'') : "",
                            
                            "body_weight": formData["body_weight"] + "KG",
                            "body_height": formData["body_height"] + "CM",
                            "goal_body_weight": formData["goal_weight"] ? (formData["goal_weight"] + "KG") : "0KG",
                            "goal_fit_step": formData["goal_step"] ? (formData["goal_step"] + "ST") : "10000ST"
                        };
                       
                        if ( formData["descCd"] != undefined && formData["descCd"] != "" ) {
                            requestData["descCd"] = formData["descCd"] + '';
                            requestData["apt_name"] = formData["apt_name"] + '';
                            requestData["dong"] = formData["dong"] + '';
                            requestData["ho"] = formData["ho"] + '';
                        }

						M.net.http.send({
							server: API.serverName,
							path: "/user/profile/edit",
							data: requestData,
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								if ( result["status"] != "Y" ) {
									event.code - -1;
									event.error = result["status_msg"];

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
								
								event.result = requestData;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "user.profile":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/profile",
							data: {
	                            "auth_token" : self.userInfo().authToken(),
	                            "user_key": self.userInfo().userKey()
	                        },
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								event.result = result;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, m음ssage, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "user.profile.upload":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						self.dispatchEvent("didStartExecute", event );
						
						M.net.http.upload({
							url: API.address() + "/common/setUserImage",
							method: "POST",
							timeout: 30000,
							header: {
								"os_type": (M.navigator.os() == "iOS" ? "I" : M.navigator.os() == "Android" ? "I" : "A"),
								"device_uuid": M.info.device("uuid")
							},
							indicator: event.showIndicator,
						    body: [
							    {
									type: "FILE",
									mimetype: "DEFAULT",
									name: "upload",
									content: formData["path"]
							    },
							    {
							    	type: "TEXT",
							    	name: "auth_token",
							    	content: self.userInfo().authToken()
							    },
							    {
							    	type: "TEXT",
							    	name: "user_key",
							    	content: self.userInfo().userKey()
							    }
							],
						    encoding : "UTF-8",
						    progress : function(total, current) {
						    	
						    },
						    finish : function(status, header, body, setting) {
								
								try {
									var data = JSON.parse( body );

									if ( status === 200 ) {

										var resultCode = parseInt(data.head.result_code);

										if ( resultCode == 200 ) {
											var profileURL = data.body.attachFiles.httpurl;

											event.result = {
												"user_profile_url": profileURL
											};

											self.dispatchEvent("didSuccessExecute", event);
										}
										else {
											event.code = (isNaN(resultCode) ) ? -1 : resultCode;
											event.error = data.head.result_msg;

											self.dispatchEvent("didErrorExecute", event);
										}
									}
									else {
										event.code = status;
										event.error = "upload error";

										self.dispatchEvent("didErrorExecute", event);
									}
								}
								catch(e) {
									event.code = -1;
									event.error = e.message;

									self.dispatchEvent("didErrorExecute", event);
								}

								self.dispatchEvent("didFinishExecute", event);
						    }
						});

					break;

					case "user.badge.list":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};
						
						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/badge/list",
							data: {
	                            "auth_token" : self.userInfo().authToken(),
	                            "user_key": self.userInfo().userKey()
	                        },
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								event.result = result;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

					break;

					case "user.logout":

						if ( M.navigator.os("ios") ) {
							if(M.data.global("BLE_LOCK") == "LOCK"){
					    		alert("동기화 중에는 로그아웃을 할 수 없습니다.");
					    		return;
					    	}
		        		}
						var requestData = {
							"auth_token" : self.userInfo().authToken(),
	                        "user_key": self.userInfo().userKey()
						};
								
						self.profileInfo().truncate();
						self.deviceInfo().truncate();
						
                        self.fitManager().reset();
                        
                        
                		

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";
							
							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						var formData = params || {};

						M.net.http.send({
							server: API.serverName,
							path: "/user/logout",
							data: requestData,
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								
								if ( M.navigator.os("ios") ) {
									
									M.data.removeStorage("FIRST_PAIRING");
								}

								event.result = result;

								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
							
						});

					break;
                    
                    case "fit.dashboard":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                    
                        var formData = params || {};
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/dashboard",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"start": formData["start"],
                                "end": formData["end"],
                                "soso": FitConfig.sleepSosoValue(),
                                "bad": FitConfig.sleepBadValue()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								
								console.log('/fit/dashboard result= ', result);
								self.fitManager().updateDashboardWithSampleData( result );

								event.result = self.fitManager().dashboardData();
									
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    
                    break;
                    
                    case "fit.dashboard.summary":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                    
                        var formData = params || {};
                    	var sleepStart = DeviceInfo.sharedInfo().sleepStart();
		                var sleepEnd = DeviceInfo.sharedInfo().sleepEnd();
		                var goalStep = FitInfo.sharedInfo().goalStep();
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/dashboard/summary",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"sleep_start": sleepStart,
								"sleep_end": sleepEnd,
								"goal_val": goalStep,
								"start": formData["start"],
                                "end": formData["end"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								self.fitManager().updateDashboardWithSampleData( result );

								event.result = self.fitManager().dashboardData();
									
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    
                    break;

                    case "fit.dashboard.rebon":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                    
                        var formData = params || {};
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/dashboard/rebon",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"count": FitConfig.rebonMaxCount()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								self.fitManager().updateDashboardWithRebonData( result );

								event.result = self.fitManager().dashboardData();
									
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    
                    break;

                    case "fit.sync.samples.load":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

                    	var formData = params || {};

                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/sync/samples/load",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"start": formData["date"].split("-").join("") + "00",
                                "end": formData["date"].split("-").join("") + "24"
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								debug.log( "result", result );

								event.result = result;
								
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

                    break;

                    case "fit.sync.samples.send":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

                    	var formData = params || {};
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/sync/samples",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"fit_uuid": self.deviceInfo().pairedBandUuid(),
								"fit_samples": formData["samples"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								debug.log( "result", result );
								
								event.result = result;
									
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

                    break;

                    case "fit.sync.summary.load":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

                    	var formData = params || {};
                    	var sleepStart = DeviceInfo.sharedInfo().sleepStart();
		                var sleepEnd = DeviceInfo.sharedInfo().sleepEnd();
		                var goalStep = FitInfo.sharedInfo().goalStep();
		                
		                debug.log('##GoalStep Confirm: ', goalStep);
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/sync/summary/load",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"sleep_start": sleepStart,
								"sleep_end": sleepEnd,
								"goal_val": goalStep,
								"device": formData["device"],
                                "start": formData["start"],
                                "end": formData["end"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								debug.log( "result", result );

								if ( ! result["items"] || result["datalist"]) {
									if ( $.isArray(result["datalist"]) ) {
										var items = [];
										$(result["datalist"]).each( function( idx, data ) {
											var itemData = {};
											for ( var key in data ) {
												var itemKey = key.toLowerCase();
												var itemValue = data[key];

												itemData[itemKey] = itemValue;
											}
											items.push(itemData);
										});

										result["items"] = items;
									}
								}

								event.result = result;
								
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

                    break;

                    case "fit.sync.summary.send":
                    	
                    	console.log('/fit/sync/summary/send auth_token: authToken: ', self.userInfo().authToken());
                    	console.log('/fit/sync/summary/send auth_token userKey: ', self.userInfo().userKey());

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

                    	var formData = params || {};
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/sync/summary/send",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
                                "device": formData["device"],
                                "items": formData["items"],
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								debug.log( "result", result );

								event.result = result;
								
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});

                    break;
                    
                    case "fit.goal":

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                    
                        var formData = params || {};
                       
                        M.net.http.send({
							server: API.serverName,
							path: "/fit/goal",
							data: {
                                "auth_token" : self.userInfo().authToken(),
                                "user_key": self.userInfo().userKey(),
								"goal_body_weight": formData["goal_weight"],// + "KG",
                                "goal_fit_step": formData["goal_step"],// + "ST",
                                "push_yn": formData["push_yn"]
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {

								if ( result["status"] != "Y" ) {
									event.code = -1;
									event.error = result["status_msg"];

									self.fitManager().info().data( formData );

									self.dispatchEvent("didErrorExecute", event );
									return;
								}
								
								event.result = {
									"goal_weight": formData["goal_weight"],
	                                "goal_step": formData["goal_step"]
								};
									
								self.dispatchEvent("didSuccessExecute", event);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    
                    break;

                    case "fit.step.weekly":   //이번주 걸음

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/step/weekly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log("************************result");
								console.log(result);
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" + (day<10 ? '0'+day : day); //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentStep(); //걸음수 
								console.log(current);
								
								if (  current >  result.data[today].goal && current >  result.data[week].goal  ) {
									//ok
									result.data[today].status = "OK";
									result.data[week].status = "OK";
								}else if (  current <  result.data[today].goal  &&   current <  result.data[week].goal  ) {
									//fail
									result.data[today].status = "failure";
									result.data[week].status = "failure";
								}
								var avg = result.averageData;  
								var tot = result.totalData;
								var dataKey = result.dateKeys.length;
								
								console.log("averageData: " +  avg);
								console.log("totalData: "+ tot);
								console.log("dataKey의 length:    "+ dataKey);
								console.log( result.data[today].value );
								var avg_result = ( avg * dataKey -  result.data[today].value + current ) / dataKey;
								var total_result =  tot - result.data[today].value + current ;
								
								console.log("-------------결과------------")
								console.log(avg_result);
								console.log(total_result);

								//result.userData[ week_1[today_1.getDay()] ].value = current;
								
								result.userData[week] = current;
								result.data[today].value = current;
								
								if ( result.cnt == "0"){
									result.averageData = current;
									result.data.average = current;
								}else {
									result.averageData =  Math.floor(( result.totalData + current ) / result.cnt);  //평균  //neh
									result.data.average = Math.floor(( result.totalData + current ) / result.cnt);  //평균
								}
								
								
					        	new WellnessBarGraph(result); 
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;

                    case "fit.step.monthly":   //이번달 걸음

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/step/monthly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" + (day<10 ? '0'+day : day);  //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentStep(); //걸음수 
								
								
								console.log(current);
								console.log("------------------------------------------");
								console.log(result);
								
								//
								var avg = result.averageData;  
								var tot = result.totalData;
								var dataKey = result.dateKeys.length;
								
								console.log("averageData: " +  avg);
								console.log("totalData: "+ tot);
								console.log("dataKey의 length:    "+ dataKey);
								console.log( result.data[today].value );
								var avg_result = ( avg * dataKey -  result.data[today].value + current ) / dataKey;
								var total_result =  tot - result.data[today].value + current ;
								
								console.log("-------------결과---------")
								console.log(avg_result);
								console.log(total_result);

								console.log(week);
								//result.userData[ week_1[today_1.getDay()] ].value = current;
								
								result.userData[today] = current;
								result.data[today].value = current;
								result.averageData =  Math.floor(( result.totalData + current ) / result.cnt);  //평균  //neh
								result.data.average = Math.floor(( result.totalData + current ) / result.cnt);  //평균
								
								
					        	///--------------------------------------------성공했을 경우
								
								
//								var 
//							    controller = MainController.sharedInstance(),
//							    fitManager = FitManager.defaultManager().initialize();
							    //data = fitManager.stepMonthlyData();   
							    var  data = result;
							    
							    
							    var currentDateAry = data.target.split("-");
							    
							    $(".m-calendar").instance("Calendar",{
							        dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
							        active: true,
							        firstDay: 1
							    }).change(currentDateAry[0], currentDateAry[1])
							    .bind("selected", function(ui, date){        
							        var $selectEl = $(".m-calendar td.m-select");
							        if( $selectEl.hasClass("ok") || $selectEl.hasClass("failure") ){
							            var message = 
							                $selectEl.attr("data-day")+"일 "+
							                $selectEl.data("goal")+"걸음 목표 중 " +
							                $selectEl.data("value")+"걸음";

							            showToast(message);
							        }
							        ui.cancelSelect();
							    });


							    var timer;
							    var $toast = $(".toast_popup");
							    function showToast(txt){
							        hideToast();
							        $toast.find(".pop_txtw").html(txt);
							        var wid = $toast.removeClass("dn").width();
							        $toast.css("margin-left", Math.round(wid*.5*-1));
							        timer = setTimeout(function(){
							           hideToast();
							        }, 1800);
							    }

							    function hideToast(){
							        clearTimeout(timer);
							        $toast.addClass("dn");
							    }


							    $(".m-calendar .m-calendar-header").addClass("dn");
							    $(".m-calendar table").addClass("cal_list");
							    var $items = $(".cal_list td");
							    var goal = data.goalData;

							    var sucCount=0;
							    var failCount=0;
							    $.each(data.dateKeys, function(index, key){
							        var itemData = data.data[key];

							        var attrData = {
							            value: String(itemData.value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'), 
							            goal: String(itemData.goal).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,')
							        };

							        if( itemData.status === "OK" ){
							            sucCount++;
							            $items.filter("[data-day="+(index+1)+"]").addClass("ok").data(attrData);
							        }
//                                    else if(itemData.value == 0 && itemData.goal == 0){}
							        else{
                                       if(parseInt(key.replace(/[^0-9]/gi, '')) >= parseInt(fitManager.userInfo().userDateCreated().replace(/[^0-9]/gi, ''))){
                                           failCount++;
                                           $items.filter("[data-day="+(index+1)+"]").addClass("failure").data(attrData);
                                       }
							        }
							    });

							    $("em.average_num").html(String(data.averageData).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
							    $(".txt1.goal em").html(String(goal).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
							    $(".suc_ok em").html(sucCount);
							    $(".suc_fa em").html(failCount);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    case "fit.step.all":   //전체 걸음

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/step/all",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentStep();

								var total_val = 0;
								if(result.item == null){
									total_val = current;
								} else {
									total_val = result.item.SYNC_VAL  + current;
								}
								
					        	 ///성공했을시---------------------------------------
								var stepCumulativelyData = total_val;
								var controller = MainController.sharedInstance(),
								fitManager = FitManager.defaultManager().initialize();

								if(isNaN(stepCumulativelyData)){
									stepCumulativelyData = 0;
								}
							    var userDataVale = stepCumulativelyData;
								var planetList = [{
									name: "달",
									step: 200000,
									className: "pl_moon"
								},{
									name: "금성",
									step: 200000,
									className: "pl_venus"
								},{
									name: "화성",
									step: 200000,
									className: "pl_mars"
								},{
									name: "수성",
									step: 200000,
									className: "pl_mercury"
								},{
									name: "태양",
									step: 200000,
									className: "pl_sun"
								},{
									name: "목성",
									step: 200000,
									className: "pl_jupiter"
								},{
									name: "토성",
									step: 200000,
									className: "pl_saturn"
								},{
									name: "천왕성",
									step: 200000,
									className: "pl_uranus"
								},{
									name: "해왕성",
									step: 200000,
									className: "pl_neptune"
								},{
									name: "명왕성",
									step: 200000,
									className: "pl_pluto"
								},{
									name: "캐플러452b",
									step: 200000,
									className: "pl_kepler"
								}];

								var elStr = "";
								var lastElStr = "";
								var addClassName = "";

								var totalStep =0;
								console.log("stepCumulativelyData", stepCumulativelyData);
								$.each(planetList, function(index, val){
									totalStep+=val.step;
									var data = stepCumulativelyData -= val.step;
									if( data < 0 ){
										// lastData = val.step + stepCumulativelyData;
										lastElStr = '<tr>'+
														'<td class="fzc">+'+(val.step + stepCumulativelyData)/1000+'K</td>'+
													'</tr>';
										
										return false;
									}else {
										addClassName = val.className;
										elStr += '<tr>'+
												'<td>+'+(val.step/1000)+'K</td>'+
											'</tr>'

										if(data==0){
											lastElStr = '<tr>'+
														'<td class="fzc">+'+0+'K</td>'+
													'</tr>';
											return false;
										}
									}
								});

								if(totalStep <= userDataVale ){
									lastElStr ="";
								}

								elStr = lastElStr+elStr;
								$(".planet_off").addClass(addClassName);
								$("tbody").html(elStr);
								$(".suc_txt em").html( fitManager.numberFormat( userDataVale ) );

								
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;

                    
                    case "fit.distance.weekly":   //이번주 이동거리

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";
							
							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/distance/weekly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" +  (day<10 ? '0'+day : day);  //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentDistance(); //거리수 
//								var current = 2000;
								
								console.log(current);
								console.log("------------------------------------------");
								console.log(result);
								
								
								if (  current >  result.data[today].goal && current >  result.data[week].goal  ) {
									//ok
									result.data[today].status = "OK";
									result.data[week].status = "OK";
								}else if (  current <  result.data[today].goal  &&   current <  result.data[week].goal  ) {
									//fail
									result.data[today].status = "failure";
									result.data[week].status = "failure";
								}
								
								//
								var avg = result.averageData;  
								var tot = result.totalData;
								var dataKey = result.dateKeys.length;
								
								console.log("averageData: " +  avg);
								console.log("totalData: "+ tot);
								console.log("dataKey의 length:    "+ dataKey);
								console.log( result.data[today].value );
								var avg_result = ( avg * dataKey -  result.data[today].value + current ) / dataKey;
								var total_result =  tot - result.data[today].value + current ;
								
								console.log("-------------결과------------")
								console.log(avg_result);
								console.log(total_result);

								console.log(week);
								//result.userData[ week_1[today_1.getDay()] ].value = current;
								
								result.userData[week] = Math.floor(current);

								if( result.cnt == "0" ){
									result.averageData = current;
									result.data.average =current;
								}else{
									result.averageData =  Math.floor(( result.totalData + current ) / result.cnt);  //평균  //neh
									result.data.average = Math.floor(( result.totalData + current ) / result.cnt);  //평균
								}
								//---------------------성공했을시 
									var data = result;
								    
								    new WellnessBarGraph(data);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    case "fit.distance.monthly":   //이번달 이동거리
                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/distance/monthly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" + (day<10 ? '0'+day : day);  //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentDistance(); //걸음 수 
								
								console.log(current);
								console.log(result.cumulativelyData );
								
								var first = "1W";
								
								result.userData[first]= result.userData[first] + current; 
								result.totalData = result.totalData + current; 
								result.cumulativelyData = result.cumulativelyData + current;
								console.log("---------"+  result.userData[first]);

								console.log(result.cumulativelyData );
								
								
								//---------성공했을 시 
									var data = result;
								    var elStr = "";
								    $.each(data.dateGroupKeys, function(index, val){
								        if(index == 0){
								            elStr += '<div class="wl_w current">';
								        }else{
								            elStr += '<div class="wl_w">';
								        }

								        elStr +='<p class="ww1">'+val+'</p>'+
								                '<p class="ww2">+</p>'+
								                '<p class="ww3">'+String(data.userData[val]).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,')+'m</p>'+
								            '</div>';
								    });

								    $(".suc_txt em").html(String(data.cumulativelyData).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
								    $(".w_wrap").html(elStr);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    case "fit.distance.all":   //전체 이동거리

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/distance/all",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentDistance(); //이동거리 
								
								result.item.SYNC_VAL  =  result.item.SYNC_VAL  + current;
								
								
					        	//---------------성공했을 때
							
								    var distanceCumulativelyData = result.item.SYNC_VAL;
								    
								 
								    var data = (function(userDistance){
								        var mountain = [];
								        var data = {distance: userDistance, mountain: mountain};
								        var mountainInfo = [
								            {"name": "청계산", "height": 24800, "bgClass": "mtbg1", "imgName": "mt1_1.png"},
								            {"name": "북한산", "height": 33440, "bgClass": "mtbg1", "imgName": "mt1_2.png"},
								            {"name": "속리산", "height": 42320, "bgClass": "mtbg2", "imgName": "mt2_1.png"},
								            {"name": "용문산", "height": 46280, "bgClass": "mtbg2", "imgName": "mt2_2.png"},
								            {"name": "무등산", "height": 47480, "bgClass": "mtbg2", "imgName": "mt2_3.png"},
								            {"name": "팔공산", "height": 47680, "bgClass": "mtbg2", "imgName": "mt2_4.png"},
								            {"name": "가야산", "height": 57200, "bgClass": "mtbg2", "imgName": "mt2_5.png"},
								            {"name": "소백산", "height": 57560, "bgClass": "mtbg2", "imgName": "mt2_6.png"},
								            {"name": "오대산", "height": 62520, "bgClass": "mtbg3", "imgName": "mt3_1.png"},
								            {"name": "태백산", "height": 62680, "bgClass": "mtbg3", "imgName": "mt3_2.png"},
								            {"name": "함백산", "height": 62920, "bgClass": "mtbg3", "imgName": "mt3_3.png"},
								            {"name": "계방산", "height": 63080, "bgClass": "mtbg3", "imgName": "mt3_4.png"},
								            {"name": "덕유산", "height": 64560, "bgClass": "mtbg4", "imgName": "mt4_1.png"},
								            {"name": "금강산", "height": 65520, "bgClass": "mtbg4", "imgName": "mt4_2.png"},
								            {"name": "설악산", "height": 68320, "bgClass": "mtbg4", "imgName": "mt4_3.png"},
								            {"name": "묘향산", "height": 76360, "bgClass": "mtbg4", "imgName": "mt4_4.png"},
								            {"name": "지리산", "height": 76600, "bgClass": "mtbg4", "imgName": "mt4_5.png"},
								            {"name": "한라산", "height": 78000, "bgClass": "mtbg4", "imgName": "mt4_6.png"},
								            {"name": "남포태산", "height": 97400, "bgClass": "mtbg5", "imgName": "mt5_1.png"},
								            {"name": "백산", "height": 99040, "bgClass": "mtbg5", "imgName": "mt5_2.png"},
								            {"name": "북수백산", "height": 100880, "bgClass": "mtbg5", "imgName": "mt5_3.png"},
								            {"name": "백두산", "height": 109760, "bgClass": "mtbg5", "imgName": "mt5_4.png"}
								        ]

								        $.each(mountainInfo, function(){
								            userDistance -= this["height"];
								            mountain.push(this);
								            if(userDistance <= 0 ){
								                data["lastDistance"] = this["height"]+userDistance;
								                return false;
								            }
								        });
								        return data;

								    })(distanceCumulativelyData);

								    $(".suc_txt em").html(Wellness.util.comma(distanceCumulativelyData));
								    
								    var Template = UI.Template;
								    var html = $("#template-mountain-list").html();
								    var template = Template.parse(html);
								    var parsedHTML = template.render( {items: data.mountain} );


								    var totalPage, currentPage;
								    var $container = $(".sl_list");
								    $container.html(parsedHTML);

								    var $element = $(".m-scrollswipe");
								    $element.height($element.height());
								    
								    var $prev = $(".wm_pre");
								    var swipe = $element.instance("ScrollSwipe", {
								        autoResize: true,
								        usePageIndicator: false,
								        useScrollBounce: true,
								        alwaysScrollBounce: true,
								    }).bind("change", function(ui, page){
								        setContent(page);
								    });

								    totalPage = swipe.totalPage();

								    var scroll = $element.instance("ScrollSwipe").scroll();
								    var flag;
								    scroll.bind("scrolling", function(){
								        if($element.width()*(swipe.totalPage()-1)+100 < scroll.scrollInfo().contentOffset.x){
								            if(flag){
								                showPopup();
								            }
								            flag = false;
								        }       
								    });

								    scroll.bind("endDragging", function(){
								        flag = true;
								    });

								    $(".contents").on("click", ".wm_pre", function(){
								        swipe.prev();
								        var page = swipe.page();
								        setContent(page);
								    });

								    $(".contents").on("click", ".wm_next", function(){
								        if(currentPage == totalPage){
								            showPopup();
								        }

								        swipe.next();
								        var page = swipe.page();
								        setContent(page);
								    });

								    var showPopup=function(){
								        window.Wellness.showLayerPopup("pop01");
								    }

								    var $items = $(".sl_list li");
								    var setCurrentMountainInfo=function(index){
								        var $item = $items.eq(index-1);
								        var name = data.mountain[index-1].name;
								        var height = Wellness.util.comma($item.attr("data-height"));
								        var distStr;
								        if( index != totalPage ){
								            name += " 도달";  
								            distStr = height + "m / "+height+"m";
								        }else{
								            var n = Wellness.util.comma(data.lastDistance);
								            distStr = n+ "m / "+height+"m";
								        }

								        $(".t1").html(name);
								        $(".t2").html(distStr);
								    }

								    var setPrevButtonVisible = function(page){
								        if(page == 1 || totalPage == 1){
								            $prev.addClass("dn");
								        }else{
								            $prev.removeClass("dn");
								        }
								    }   

								    var setFlag=function(index){
								        var $item = $items.eq(index-1);
								        var $flag = $item.find(".w_flag");
								        var bottom = 100;
								        if( totalPage == index){
								            var height = $item.attr("data-height");
								            bottom = ( 100 - 0 ) / ( height - 0 ) * ( data.lastDistance - 0 ) + 0;
								        }

								        setTimeout(function(){
								            $flag.css("bottom", bottom+"%");
								        }, 300 );
								        
								    }

								    var setContent=function(page){
								        currentPage = page;
								        setPrevButtonVisible(page);
								        setCurrentMountainInfo(page);
								        setFlag(page);
								    }

								    var imgCount = $(".mtps>img").length;
								    $(".mtps>img").load(function(){
								        imgCount--;
								        if(imgCount==0){
								            setContent(1);    
								        }
								    });
								    
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    
                    case "fit.calory.today":   //오늘 칼로리

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/calory/today",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" +  (day<10 ? '0'+day : day); //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentCalorie(); //현재칼로리  

								
								console.log(current);
								console.log("------------------------------------------");
								console.log(result);
								
								result.item.SYNC_VAL= current;
								
					        	//-------------------------------성공시
//								var controller = MainController.sharedInstance(),
//							    fitManager = FitManager.defaultManager().initialize(),
							    var userCalories = result.item.SYNC_VAL;   
							    
							    $(".w_mt_ck").removeClass("dn");
							    var $targetEl = $(".wwck_img").removeClass("sm");
							    if( userCalories < 400 ){
							        $targetEl.addClass("sm");
							    }else if(userCalories>=400 && userCalories<800){
							        $targetEl.addClass("md");
							    }else{
							        $targetEl.addClass("lg");
							    }

							    setTimeout(function(){
							        $(".img_fire_bg>.img_fire").addClass("ani");
							    }, 700 );
							    
							    
							    $(".suc_txt_ck .num em").html(String(userCalories).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
							   /* (".suc_txt_ck .num").prepend((function(no){
							        var str = no+"";
							        str = str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
							        var noAry = str.split("");
							        var elStr = "";
							        $.each(noAry, function(index, value){
							            if(value != ","){
							                elStr += '<span title="'+value+'">'+value+'</span>';    
							            }else{
							                elStr += '<span>'+value+'</span>';    
							            }
							        });
							        return elStr;
							    })( userCalories ));

							    //caloriesBySteps

							    var $items = $(".suc_txt_ck .num span[title]");
							    var time=0;
							    var itemHei = $items.eq(0).height();
							    var textGroupNum = 1;
							    var targetTop = (itemHei*(10*textGroupNum)*-1);
							    for(var i=$items.length-1; i>=0; i--){
							        time++;
							        var $t = $($items.eq(i));
							        var n = parseInt($t.attr("title"));
							        var html = $t.html();
							        for(var j=0; j<(10*textGroupNum); j++){
							            n++;
							            if(n>9){
							                n=0;
							            }
							            html+= "<br>"+n;            
							        }

							        (function(target){
							            setTimeout(function(){
							                slideTxt(target, targetTop);
							            }, (time*170)+300);
							        })($t);
							        
							        $t.html(html);
							    }

							    

							    var slideTxt=function($target, top){
							        $target.animate({top: top}, 1200, "easeInOutElastic");
							    }*/
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    
                    case "fit.calory.weekly":   //이번주  칼로리
                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/calory/weekly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" + (day<10 ? '0'+day : day);  //오늘 날짜 가져오기 
								
								console.log(today); 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentCalorie(); //칼로린 수 
								
								console.log(current);
								console.log("------------------------------------------");
								console.log(result);
								
								//
								var avg = result.averageData;  
								var tot = result.totalData;
								var dataKey = result.dateKeys.length;
								
								var avg_result = ( avg * dataKey -  result.data[today].value + current ) / dataKey;
								var total_result =  tot - result.data[today].value + current ;
								
								console.log("-------------결과------------")
								console.log(avg_result);
								console.log(total_result);

								console.log(week);
								//result.userData[ week_1[today_1.getDay()] ].value = current;
								
								result.userData[week] = current;
								console.log("골:   "+result.data[today].goal   +  "현재   :" + current);
								console.log("골:   "+result.data[week].goal   +  "현재   :" + current);
									if (  current >  result.data[today].goal && current >  result.data[week].goal  ) {
										//ok
										result.data[today].status = "OK";
										result.data[week].status = "OK";
									}else if (  current <  result.data[today].goal  &&   current <  result.data[week].goal  ) {
										//fail
										result.data[today].status = "failure";
										result.data[week].status = "failure";
									}
									

									if( result.cnt == "0" ){
										result.averageData = current;
										result.data.average = current;
									}else {
										result.averageData =  Math.floor(( result.totalData + current ) / result.cnt);  //평균  //neh
										result.data.average = Math.floor(( result.totalData + current ) / result.cnt);  //평균
										}
								
					        	//---------------------------------------------성공시
								 var controller = MainController.sharedInstance(),
								 fitManager = FitManager.defaultManager().initialize();
								 var  data = result;
								    
								    new WellnessBarGraph(data);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    case "fit.calory.monthly":   //이번달 칼로리

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/calory/monthly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
								
								var dateObj = new Date();
								var year = dateObj.getFullYear();
								var month = dateObj.getMonth()+1;
								var month1 = "";
								if( month < 10 ) {
									month1 = "0"+month;
								}else if( month >= 10) {
									month1 = month;
								}
								
								var day = dateObj.getDate();
								var today = year + "-" + month1+ "-" + (day<10 ? '0'+day : day);  //오늘 날짜 가져오기 
								
								var today_1 = new Date();
								var week_1 = new Array ('sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat');
								console.log(today);
								console.log( week_1[today_1.getDay()] ); //오늘 요일 가져오기 
								var week = week_1[today_1.getDay()];
								
								
								var 
							    fitManager = self.fitManager();
								var current = fitManager.info().currentCalorie(); //칼로린 수 
								console.log(current);
							
								//result.userData[ week_1[today_1.getDay()] ].value = current;
								if (  current >  result.data[today].goal ) {
									//ok
									result.data[today].status = "OK";
									
								}else if (  current <  result.data[today].goal ) {
									//fail
									result.data[today].status = "failure";
								
								}
								
								
								result.data[today].value = current; 						//현재날짜에 해당하는 값 
								result.averageData =  Math.floor(( result.totalData + current ) / result.cnt);  //평균
								result.data.average = Math.floor(( result.totalData + current ) / result.cnt);  //평균	
								
								
								
					        	//------------------------------------성공했을 때
								 var controller = MainController.sharedInstance(),
								    fitManager = FitManager.defaultManager().initialize();
								   var data = result;   
								    
								    var $userDataEl = $(".user_value");
								    var currentDateAry = data.target.split("-");
								    var userAverageData = String(data.averageData).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');

								    var calendar = $(".m-calendar").instance("Calendar",{
								        dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
								        active: true,
								        firstDay: 1
								    }).change(currentDateAry[0], currentDateAry[1])
								    .bind("selected", function(ui, date){
								        /*var year = date.getFullYear();
								        var month = date.getMonth()+1;
								        var date = date.getDate();

								        calendar.select(year, month, date);

								        if(month<10){month = "0"+month;}
								        if(date<10){date = "0"+date;}
								        var dateStr = year+"-"+month+"-"+date;
								        */
								        var $selectEl = $(".m-calendar td.m-select");
								        if( $selectEl.hasClass("ok") || $selectEl.hasClass("failure") ){
								            var message = 
								                $selectEl.attr("data-day")+"일 "+
								                $selectEl.data("goal")+"kcal 목표 중 " +
								                $selectEl.data("value")+"kcal 소모";

								            showToast(message);
								            
								            ui.cancelSelect();
								            //$userDataEl.html($selectEl.attr("data-day")+"일 "+$selectEl.attr("data-userValue"));
								        }else{
								            //showToast("평균 "+userAverageData+"kcal 소모");
								            //$userDataEl.html("평균 "+userAverageData);
								        }
								    });

								    var timer;
								    var $toast = $(".toast_popup");
								    function showToast(txt){
								        hideToast();
								        $toast.find(".pop_txtw").html(txt);
								        var wid = $toast.removeClass("dn").width();
								        $toast.css("margin-left", Math.round(wid*.5*-1));
								        timer = setTimeout(function(){
								           hideToast()
								        }, 1800);
								    }

								    function hideToast(){
								        clearTimeout(timer);
								        $toast.addClass("dn");
								    }

								    $(".m-calendar .m-calendar-header").addClass("dn");
								    $(".m-calendar table").addClass("cal_list");
								    var $items = $(".cal_list td");
								    var goal = data.goalData;
								    var sucCount=0;
								    var failCount=0;

								    $.each(data.dateKeys, function(index, key){
								        var itemData = data.data[key];

								        var attrData = {
								            value: String(itemData.value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'), 
								            goal: String(itemData.goal).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,')
								        };

								        if( itemData.status === "OK" ){
								            sucCount++;
								            $items.filter("[data-day="+(index+1)+"]").addClass("ok").data(attrData);
								        }else{
								            failCount++;
								            $items.filter("[data-day="+(index+1)+"]").addClass("failure").data(attrData);
								        }
								    });

								    $userDataEl.html("평균 "+userAverageData);
								    $(".txt1.goal em").html(String(goal).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
								    $(".suc_ok em").html(sucCount);
								    $(".suc_fa em").html(failCount);
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    case "fit.sleep.get":   //수면시간 대시보드 

						if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

		
						M.net.http.send({
							server: API.serverName,
							path: "/fit/sleep/get",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								
								console.log(result);
								
								$("#span_come").text("계산하는 중...");
								event.result = result.retItem;
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                    
                    case "fit.sleep.yesterday":   //어제 수면시간
                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}  

						M.net.http.send({
							server: API.serverName,
							path: "/fit/sleep/yesterday",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
					        //	----------------------------------- ----------성공시

								event.result = result;
								//self.dispatchEvent("didFinishExecute", event );
											 
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
                      
                    case "fit.sleep.weekly":   //이번주 수면시간

                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}

						M.net.http.send({
							server: API.serverName,
							path: "/fit/sleep/weekly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								console.log(result);
					        	//------------------------------------성공했을 시 
								
								var data = result;
//					        	
//					            var controller = MainController.sharedInstance(),
//					            fitManager = FitManager.defaultManager().initialize(),
//					            data = fitManager.sleepWeeklyData();
					            
					            var timeAry=[];
					            var goodCount = 0;
					            var sosoCount = 0;
					            var badCount = 0;

					            $.each( data.userData, function(){
					                timeAry.push(this["time"]["good"]);
					                timeAry.push(this["time"]["soso"]);

					                switch(this["status"]){
					                    case "GOOD":
					                        goodCount++;
					                    break;
					                    case "SOSO":
					                        sosoCount++;
					                    break;
					                    case "BAD":
					                        badCount++;
					                    break;
					                };
					            });

					            var sortTime = timeAry.concat().sort(function(a, b){return a-b});
					            var maxTime = sortTime.pop();

					            $(".suc_ok em").html(goodCount);
					            $(".suc_fa em").html(badCount);
					            $(".suc_txt_sl2 em").html(sosoCount);

					            var elementStr = "";
					            
					            $.each( data.weekKeys, function(idx, weekKey){
					                var itemData = data.userData[weekKey];
					                var str = "";

					                if ( itemData ) {

					                    str = '<li>'+
					                            '<div class="dw">'+weekKey+'</div>'+
					                            '<div class="dw_bar">'+
					                                
					                            '</div>'+
					                        '</li>';

					                    var goodTime = itemData["time"]["good"];
					                    var sosoTime = itemData["time"]["soso"];

					                    var goodWid = Math.round(( 100 - 0 ) / ( maxTime - 0 ) * ( goodTime - 0 ) + 0);
					                    var sosoWid = Math.round(( 100 - 0 ) / ( maxTime - 0 ) * ( sosoTime - 0 ) + 0);
					                    
					                    var stateClass = "gs";

					                    if ( itemData["status"] === "-" ) {
					                        return;
					                    }

					                    switch(itemData["status"]){
					                        case "SOSO":
					                            stateClass = "ss";
					                        break;
					                        case "BAD":
					                            stateClass = "bs";
					                        break;
					                    }

					                    str =   '<li>'+
					                                    '<div class="dw '+stateClass+'">'+weekKey+'</div>'+
					                                    '<div class="dw_bar">'+
					                                        '<div class="bar1">'+
					                                            '<div class="ds_bar">'+
					                                                '<span class="handle" style="width:0%;" data-wid="'+goodWid+'%"></span>'+
					                                                '<span class="ds_txt">'+getTimeStr(goodTime)+'</span>'+
					                                            '</div>'+                                                       
					                                        '</div>'+
					                                        '<div class="bar1">'+
					                                            '<div class="ss_bar">'+
					                                                '<span class="handle" style="width:0%;" data-wid="'+sosoWid+'%"></span>'+
					                                                '<span class="ds_txt">'+getTimeStr(sosoTime)+'</span>'+
					                                            '</div>'+                                           
					                                        '</div>'+
					                                    '</div>'+
					                                '</li>';
					                }

					                elementStr = elementStr + str;
					            });
					            
					            $(".sleep_bargr ul").html(elementStr);

					            var count = 0;
					            $(".bar1 .handle").each(function(index){
					                var $target = $(this);
					                setTimeout(function(){
					                    $target.width($target.attr("data-wid"));
					                }, count );

					                if(index%2){
					                    count += 200;   
					                }else{
					                    count += 100;
					                }       
					            }); 

					            
					            function getTimeStr(time){
					                var hour = Math.floor(time/60);
					                var min = time%60;
					                return (hour)+"시 "+min+"분" ;
					            }

							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
                    break;
//                    
//                    
                    case "fit.sleep.monthly":   //이번달 수면시간
                    	if ( ! M.info.device("network.connected") ) {
							event.code = -1;
							event.error = "network is disconnected";

							self.dispatchEvent("didErrorExecute", event);
							return;
                    	}
                    	
						M.net.http.send({
							server: API.serverName,
							path: "/fit/sleep/monthly",
							data: {
                                "user_key": self.userInfo().userKey()
							},
                            indicator: {
                                show: event.showIndicator,
                                cancelable: event.cancelable
                            },
							method: "POST",
							start: function() {
								self.dispatchEvent("didStartExecute", event );
							},
							finish: function() {
								self.dispatchEvent("didFinishExecute", event );
							},
							success: function(result, setting) {
								
								console.log(result);
					        	 ///성공했을 시 --------------------------------
//								  var controller = MainController.sharedInstance(),
//								    fitManager = FitManager.defaultManager().initialize(),
//								    data = fitManager.sleepMonthlyData();
									var data = result;
								    var currentDateAry = data.target.split("-");

								    $(".m-calendar").instance("Calendar",{
								        dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
								        active: true,
								        firstDay: 1
								    }).change(currentDateAry[0], currentDateAry[1])
								    .bind("selected", function(ui, date){        
								        console.log( ui, date );

								        var $selectEl = $(".m-calendar td.m-select");
								        if( $selectEl.hasClass("ok") || $selectEl.hasClass("failure") || $selectEl.hasClass("bad")){
								            var sleepTime = parseInt($selectEl.attr("data-time-sleep"));
								            var goodTime =  parseInt($selectEl.attr("data-time-good"));
								            var sosoTime = parseInt($selectEl.attr("data-time-soso"));
								            var badCount = parseInt($selectEl.attr("data-time-bad"));
								           

								            var str =  "총수면시간 : "+Math.floor(sleepTime/60)+"시간 "+(sleepTime%60)+"분"+"<br>"
								                        +"숙면 : "+Math.floor(goodTime/60)+"시간 "+(goodTime%60)+"분"+"<br>"
								                        +"선잠 : "+Math.floor(sosoTime/60)+"시간 "+(sosoTime%60)+"분"+"<br>"
								                        +"기상 : "+badCount/2+"회";

								            showToast(str);            
								        }

								        ui.cancelSelect();
								    });

								    $(".m-calendar .m-calendar-header").addClass("dn");
								    $(".m-calendar table").addClass("cal_list");
								    var $items = $(".cal_list td");
								    var goal = data.goalData;

								    var sucCount=0;
								    var failCount=0;

								    $.each(data.dateKeys, function(index, val){
								        if( data.todayDateKey != this ){
								            var infoData = data.data[String(this)];
								            var status = data.userData[val];
								            var $target = $items.filter("[data-day="+(index+1)+"]");
								            if ( status == "GOOD" ) {
								                sucCount++;
								                $target.addClass("ok");
								            }
								            else if ( status == "SOSO" ) {
								                failCount++;
								                $target.addClass("bad");
								            }
								            else if ( status == "BAD" ){
								                failCount++;
								                $target.addClass("failure");
								            }

								            if( infoData && infoData.time ){
								                $target.attr("data-bad-count", infoData.count);
								                $target.attr("data-time-total", infoData.time.total);
								                $target.attr("data-time-sleep", infoData.time.sleep);
								                $target.attr("data-time-good", infoData.time.good);
								                $target.attr("data-time-soso", infoData.time.soso);
								                $target.attr("data-time-bad", infoData.time.bad);
								            }
								        }
								    });

								    $(".suc_ok em").html(data.good);
								    $(".suc_txt_sl2 em").html(data.soso);
								    $(".suc_fa em").html(data.bad);



								    var timer;
								    var $toast = $(".toast_popup");
								    function showToast(txt){
								        hideToast();
								        $toast.find(".pop_txtw").html(txt);
								        var wid = $toast.removeClass("dn").width();
								        $toast.css("margin-left", Math.round(wid*.5*-1));
								        timer = setTimeout(function(){
								           hideToast();
								        }, 1800);
								    }

								    function hideToast(){
								        clearTimeout(timer);
								        $toast.addClass("dn");
								    }
					        	
							},
							error: function(code, message, setting) {
								event.code = code;
								event.error = message;

								self.dispatchEvent("didErrorExecute", event);
							}
						});
						
                    break;



					default:
						console.warn("unknown command", event.command, event );

				}

				return self;
			}
		};
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInstance: function() {
				if ( _instance === undefined ) {
					_instance = new MainController();
				}
				return _instance;
			}
		}
	}
});

window.Macro = Macro;
window.MainController = MainController;

})(window);
