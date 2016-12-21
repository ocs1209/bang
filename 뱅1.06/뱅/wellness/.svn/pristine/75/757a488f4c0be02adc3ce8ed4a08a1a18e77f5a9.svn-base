
(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
UIView = Class.UIView,
UIController = Class.UIController,

GNB = Class({
	name: "GNB",
	parent: "IObject",
	constructor: function() {
		var self, $wrap, $openBtn, $backBtn, $menu, $body, $layer, _loadedView = false;

		return {

			_setupElements: function() {
				$wrap = $("#wrap");
				$menu = $("#menu");
				$openBtn = $(".header [role=list]");
			    $backBtn = $(".header [role=back]");
				$body = $("body");
				$layer = $(".layer");
			},

			_bindEvents: function() {
				$("body").on("click", "[close-gnb]", function(){
					self.closeMenu(function() {
						//
					});
				});

				$openBtn.on("click", function(e) {
					self.openMenu(function() {
						$layer.one("click", function(e) {
							self.closeMenu(function() {
								//
							});
						});
					});
				});

			    $backBtn.on("click", function(e) {
			        MainController.sharedInstance().execute( "page.back" );
			    });
			},

			init: function() {
				self = this;

				return this;
			},

			loadView: function() {
				if ( _loadedView == true ) {
					return;
				}

				_loadedView = true;

            	self._setupElements();
                self._bindEvents();
                
				self.updateMenu();
			},

			isOpened: function() {
				return $body && $body.hasClass("open") ? true : false;
			},

			closeMenu: function( handler ) {
				if ( self.isOpened() ){
					$layer.unbind("click");
					$body.removeClass("open");

					$wrap.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
						function() {
							$layer.addClass("dn");
							if ( typeof handler == "function" ) {
								handler();
								handler = null;
							}
						}
					);
					
					setTimeout( function() {
						$layer.addClass("dn");
						if ( typeof handler == "function" ) {
							handler();
							handler = null;
						}
					}, 300);
				}
			},

			openMenu: function( handler ) {
				if ( self.isOpened() === false ){
					$body.addClass("open");
					$layer.removeClass("dn");
					
					$wrap.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
						function() {
							if ( typeof handler == "function" ) {
								handler();
								handler = null;
							}
						}
					);
					
					setTimeout( function() {
						if ( typeof handler == "function" ) {
							handler();
							handler = null;
						}
					}, 300);
				}
			},

			updateMenu: function() {
				console.log( "updateMenu" );

				if ( document.location.href.indexOf("dashboard.main.html") !== -1 || document.location.href.indexOf("setting.device.html") !== -1 ) {
					$("#menu-device-setting").addClass("dn");

					if ( MainController.sharedInstance().fitManager().isPaired() ) {
						$("#menu-device-pairing").addClass("dn");
						$("#menu-device-unpairing").removeClass("dn");

						$(".btn_setting").removeClass("on");
					}
					else {
						$("#menu-device-unpairing").addClass("dn");
						$("#menu-device-pairing").removeClass("dn");

						$(".btn_setting").addClass("on");
					}
				}
				else {
					$("#menu-device-pairing").addClass("dn");
					$("#menu-device-unpairing").addClass("dn");
					$("#menu-device-setting").removeClass("dn");
				}
			}
		}
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInstance: function() {
				if ( _instance === undefined ) {
					_instance = new GNB();
				}
				return _instance;
			}
		}
	}
}),

ViewController = Class({
	name: "ViewController",
	parent: UIController,
	constructor: function() {
    
        var _view;
    

		return {
            init: function( element ) {
                var self = this._super("init", arguments);

                _view = new UIView( element );
                
                $(document).ready(function(){
	                self.loadView();
                });

                return self;
			},
            
            view: function() {
                return _view;
            },
            
            $view: function( query ) {
                return $(_view.element());
            },

            didOpenMenu: function() {

            },

            didCloseMenu: function() {

            },

            loadView: function() {
            	var self = this;
				
                self.loadEvent();

				if ( $("#menu").first() ) {
					$("#menu").load("inc/_menu.html", function() {
						GNB.sharedInstance().loadView();

						self.loadEvent();
					});
				}
            },

            updateMenu: function() {
            	if ( $("#menu").first() ) {
					GNB.sharedInstance().updateMenu();
				}
            },
            
            loadEvent: function() {
            	/*
            	$('a, button').unbind("mousedown.highlighted touchstart.highlighted").bind("mousedown.highlighted touchstart.highlighted", function(e) {
            		$(this).addClass("highlighted");
            	});

            	$('a, button').unbind("mouseenter.highlighted").bind("mouseenter.highlighted", function(e) {
            		$(this).addClass("highlighted");
            	});

            	$('a, button').unbind("mouseleave.highlighted").bind("mouseleave.highlighted", function(e) {
            		$(this).removeClass("highlighted");
            	});

            	$('a, button').unbind("mousemove.highlighted touchmove.highlighted").bind("mousemove.highlighted touchmove.highlighted", function(e) {
            		//$(this).removeClass("highlighted");
            	});

            	$('a, button').unbind("mouseup.highlighted touchend.highlighted touchcancel.highlighted").bind("mouseup.highlighted touchend.highlighted touchcancel.highlighted", function(e) {
            		
            	});

            	$('a, button').unbind("click.highlighted").bind("click.highlighted", function(e) {
            		var $this = $(this);
                	setTimeout( function() {
                		$this.removeClass("highlighted");
                	}, 100);
            	});
				*/

                // Bind event to make auto-links
                $('[data-link][auto-link]').bind("click.autolink", function(e) {
                	/*
                	if ( $(this).hasClass("highlighted") === false ) {
                		return;
                	}
					*/

                    var link = $(this).attr("data-link") || "";
                    var action = $(this).attr("data-action") || "NEW_SRC";
                    var params = $(this).attr("data-params") || "";
                    var animation = $(this).attr("data-animation") || "SLIDE_LEFT";

                    var currentPage = M.info.stack()[M.info.stack().length-1].key;
                    currentPage = currentPage.split("/").pop();

                    if( currentPage == link && action != "REPLACE" ){
                    	if ( GNB.sharedInstance().isOpened() ) {
		                	GNB.sharedInstance().closeMenu();
		                }
                    	return;
                    }

                    var movePage = function() {
                    	if ( action == "REPLACE" ) {
                    		M.page.replace(link);
                    	}
                    	else {
	                    	M.page.html(link, {action:action, param:params, animation:animation});
	                    }
                    };
                    
                    if ( link == "" ) {
                        return;
                    }

                    if ( GNB.sharedInstance().isOpened() ) {
	                	GNB.sharedInstance().closeMenu( function() {
	                		movePage();
	                	});
	                }
	                else {
	                	movePage();
	                }

	                e.preventDefault();
	                return false;
                }).removeAttr("auto-link");

                $('[data-command][auto-command]').bind("click.autocommand", function(e) {
                    var command = $(this).attr("data-command") || "";
                    
                    if ( command == "" ) {
                        return;
                    }
                    
                    if ( command == "user.setting" || command == "move.setting" || command == "device.pairing") {
	                    if ( GNB.sharedInstance().isOpened() ) {
		                	GNB.sharedInstance().closeMenu( function() {
			                    MainController.sharedInstance().execute(command);
			                });
			            }
			            else {
			            	MainController.sharedInstance().execute(command);
			            }
			        }
			        else {
			        	MainController.sharedInstance().execute(command);
			        }

	                e.preventDefault();
	                return false;
                }).removeAttr("auto-command");
            },

			scrollToElement: function( element ) {
				$('html, body').animate({
			        scrollTop: $(element).offset().top
				}, 300);
			}
		};
	}
}),

PopupController = Class({
	name: "PopupController",
	parent: UIController,
	constructor: function() {
    
        var _view;
    

		return {
            init: function() {
                this._super("init", arguments);
                
			},

			indicator: function( show, message ) {
				if ( show == true ) {
					Wellness.showLayerPopup("loading_pop");

					this.setIndicatorMessage( message );
				}
				else {
					Wellness.hideLayerPopup("loading_pop");	
				}
			},

			setIndicatorMessage: function( message ) {
				if ( message ) {
					$("#loading-message").text( message ).removeClass("dn");
				}
				else {
					$("#loading-message").text( "" ).addClass("dn");
				}
			},

			showIndicator: function( message ) {
				this.indicator( true, message );
			},

			hideIndicator: function() {
				this.indicator( false );
			},
			
			confirm: function( message, buttons, callback, waitUntilDone  ) {
                callback = callback || function() {};
            
				M.pop.alert( {
					"title": "",
					"waitUntilDone": waitUntilDone === true ? true : false,
					"message": message, 
					"buttons": buttons || [ "확인", "취소" ]
				}, function( index, option ) {
					callback( index );
				});
			},
			
			alert: function( message, callback ) {
                callback = callback || function() {};
            
				M.pop.alert( {
					"title": "",
					"message": message,
					"buttons": [ "확인" ]
				}, function( index, option ) {
					callback( index );
				});
			},
            
            toast: function( message ) {
                M.tool.log( "toast", message );

                M.pop.instance( {
                    "message": message
                });
            }
		};
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInstance: function() {
				if ( _instance === undefined ) {
					_instance = new PopupController();
				}
				return _instance;
			}
		}
	}
}),

FormViewController = Class({
	name: "FormViewController",
	parent: ViewController,
	constructor: function() {
    
        var _$form, _callback, _showIndicator = false;

		return {
			showIndicator: function( bool ) {
				_showIndicator = bool;
			},

			init: function() {
                this._super("init", arguments);
                
                _$form = this.$view();
                _$form.bind("submit", function(e) {

                	var action = $(this).attr("action");
                    var formArray = $(this).serializeArray();
                    var formData = {};
                    
                    $(formArray).each( function( index, field ) {
                        if ( field.value === "" ) {
                            return;
                        }
                        
                        var fieldName = field.name, fieldValue = field.value, isArray = false;
                        
                        if ( fieldName.indexOf("[]") !== -1 ) {
                            fieldName = fieldName.replace('[]', '');
                            fieldValue = formData[fieldName] || [];
                            fieldValue.push( field.value );
                            
                            isArray = true;
                        }
                        
                        formData[fieldName] = fieldValue;
                    });
                    
                    MainController.sharedInstance().execute( action, formData, {
                    	showIndicator: _showIndicator,
                    	callback: function( event ) {
                    		if ( typeof _callback === "function" ) {
                    			_callback( event );
                    		}
                    	}
                    });
                    
                    return false;
                });
			},

			isValidForm: function( invalidData, firstBreak ) {
				invalidData = invalidData || [];
                
                var isBreak = false;
				var group = {};

				_$form.find("input").each( function( index, field ) {
					var $field = $(field);
					var name = $field.prop("name");
					var type = $field.prop("type");
					var role = $field.prop("role");

					if ( ! $(field).attr("required") ) {
						return true;	
					}

					if ( ( type === "text" || type === "tel" || type === "date" || type === "password" || type === "number") && $field.prop("required") && $field.val().trim() === "" ) {
						if ( group[name] === undefined ) {
                            
							group[name] = {
                                name: name,
                                type: type,
                                role: role,
                                field: field,
                                items: [field]
                            };
                            
							invalidData.push(group[name]);
						}
						else {
							group[name].items.push( field );
						}

						if ( firstBreak === true ) {
							isBreak = true;
							return false;
						}
					}
					else if ( type === "checkbox" ) {
						if ( _$form.find("input[name='"+name+"'][type='checkbox']:checked").length === 0 ) {

							if ( group[name] === undefined ) {
								group[name] = {
									name: name,
									type: type,
                                    role: role,
									field: field,
									items: [field]
								};
                                
								invalidData.push(group[name]);
							}
							else {
								group[name].items.push( field );
							}

							if ( firstBreak === true ) {
								isBreak = true;
								return false;
							}
						}
					}
					else if ( type === "radio" ) {
						if ( _$form.find("input[name='"+name+"'][type='radio']:checked").length === 0 ) {
							if ( group[name] === undefined ) {
								group[name] = {
									name: name,
									type: type,
                                    role: role,
									field: field,
									items: [field]
								};
                                
								invalidData.push(group[name]);
							}
							else {
								group[name].items.push( field );
							}

							if ( firstBreak === true ) {
								isBreak = true;
								return false;
							}
						}
					}
				});

				_$form.find("select").each( function( index, field ) {
					var $field = $(field);
					var name = $field.prop("name");
					var type = "select";

					if ( ! $(field).attr("required") ) {
						return true;	
					}

					if ( _$form.find("select[name='"+name+"']").val() === "" ) {
						if ( group[name] === undefined ) {
							group[name] = {
								name: name,
								type: type,
								field: field,
								items: [field]
							};
							invalidData.push(group[name]);
						}
						else {
							group[name].items.push( field );
						}

						if ( firstBreak === true ) {
							isBreak = true;
							return false;
						}
					}

					if ( isBreak === true ) {
						return false;
					}
				});
                
				return invalidData.length === 0 ? true : false;
			},

			submit: function( callback ) {
				_callback = callback;

				this.$view().submit();
			}
		}
	}
});

window.GNB = GNB;
window.ViewController = ViewController;
window.PopupController = PopupController;
window.FormViewController = FormViewController;

	
})(window);