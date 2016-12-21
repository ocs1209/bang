(function(window, undefined) {

'use strict';

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
							console.log( e );
							stack = "";
						}
						
						window.console.log( stack );
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

				self.userInfo().clear();
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
					console.log( "user auth is invalid");
					return false;
				}

				var elapsedTime = self.userInfo().elapsedTime();

				if ( elapsedTime > _VALID_SESSION_TIME ) {
					console.log( "session is invalid")
					return false;			
				}

				return true;
			},

			authSession: function() {
				console.log( "_useSession", _useSession );
				
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
	_completed = false,
	_context = window;

	return {
		command: function() {
			return _command;
		},
		
		execute: function() {
			var self = this;
			var result = _handler.apply(self, arguments);

			console.log( _delegate.macroID(), "execute", _command, result );

			return result;
		},
		
		isCompleted: function() {
			return _completed
		},

		complete: function() {
			var self = this;

			//console.log( _delegate.macroID(), "complete", _command );

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
					console.log( "command is not registerd - " + command );
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
					console.log( "command is not registered - " + command );
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
				console.log( _macroID, "start" );

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

				//console.log( _macroID, "next - ", macroData.command );
				
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

				console.log( _macroID, "cancel" );

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

				console.log( _macroID, "done" );

				_progressing = false;
				_macroQueue = [];

				if ( typeof _finishHandler === "function" ) {
					_finishHandler( _cancelled === true ? false : true );
				}
			},

			clear: function() {

				console.log( _macroID, "clear" );

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
		var self, _macro, _sessionController, _view, _debug = new Debug();

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

			moveToPairingPage: function() {

				var nextPage = document.location.href.indexOf("dashboard.main.html") !== -1 ? "dashboard.main.html" : "setting.device.html";
				var nextAction = document.location.href.indexOf("dashboard.main.html") !== -1 ? "CLEAR_TOP" : "NEW_SRC";

				M.page.html("setting.pairing.html", {
					action:"NO_HISTORY", 
					param:{"next-page":nextPage, "next-action":nextAction}
	            });
			},

			moveToSettingPage: function() {
				if ( ! self.fitManager().isPaired() ) {
		            M.page.html("setting.pairing.html", 
		                {
		                    action:"NO_HISTORY", 
		                    param:{"next-page":"setting.device.html", "next-action":"NEW_SRC"}
		                }
		            );
		        }
		        else {
		            M.page.html("setting.device.html", {"action":"NEW_SRC"});
		        }
			},

			moveToLoginPage: function() {
            
				M.page.html("user.login.html", {action:"NO_HISTORY", animation:"SLIDE_RIGHT"});
			},
            
            moveToHome: function() {
            
                M.page.html("dashboard.main.html", {action:"NEW_SRC", animation:"SLIDE_LEFT"});
            },

            retry: function( event ) {
            	event.options.retryCount = event.retryCount = event.retryCount + 1;
            	
            	setTimeout( function() {
	            	self.execute.call( self, event.action, event.params, event.options );
	            }, 500 );
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
						self.moveToSettingPage();

						self.dispatchEvent("didFinishExecute", event );
					break;

					case "move.home":

						self.moveToHome();
						
						self.dispatchEvent("didFinishExecute", event );
					break;

					case "page.back":
						M.page.back();

						self.dispatchEvent("didFinishExecute", event );
					break;

					case "device.pairing":
						self.moveToPairingPage();

						self.dispatchEvent("didFinishExecute", event );
					break;

					case "device.unpairing":
						self.fitManager().unpair(function( result ) {

							if ( result.error ) {
								event.error = result.error;
							}
							else {
								_view.updateMenu();
							}

							self.dispatchEvent("didFinishExecute", event );
						});
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
							success: function(result, setting) {

								event.result = result;

								if ( result["status"] != "Y" ) {
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
							error: function(code, message, setting) {
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

						var requestData = {
							"auth_token" : self.userInfo().authToken(),
	                        "user_key": self.userInfo().userKey()
						};
								
						self.profileInfo().clear();
						self.deviceInfo().clear();
						self.fitManager().clear();

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
								console.log( "result", result );

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
								console.log( "result", result );
								
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
								"goal_body_weight": formData["goal_weight"],
                                "goal_fit_step": formData["goal_step"],
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
