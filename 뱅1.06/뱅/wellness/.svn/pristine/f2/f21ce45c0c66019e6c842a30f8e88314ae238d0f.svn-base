/*! Javascript UI Frameworks | Instance - 1.0.0.0 */

/*! Instance UIFramework - 1.0.7.1 */

(function(window, undefined) {

'use strict';

/* ----- UI ----- */
var

version = "1.0.7.1",

UI = {
	Constants: {
		NULL_FUNCTION: function() {},
		NULL_ELEMENT_FUNCTION: function() {
			return document.createElement("DIV");
		}	
	}
},

ScriptLoader = (function ScriptLoader() {
	var _head = document.getElementsByTagName("head")[0];
	var _baseElement = document.getElementsByTagName("base")[0];
	var _queue = [];
	var _queueing = false;
	
	if ( _baseElement ) {
		_head = baseElement.parentNode;
	}
	
	var _nextQueue = function() {
		
		var script = _queue.shift();
		
		if ( _baseElement ) {
			_head.insertBefore(script, _baseElement );
		}
		else {
			_head.appendChild(script);
		}
	};

	return {
		scriptPath: function( fileName ) {
			var elements = document.getElementsByTagName('script'),
				protocal = document.location.protocol,
				scriptPath = "",
				components;
			
			for (var i = 0; i < elements.length; i++) { 
				if (elements[i].src && elements[i].src.indexOf(fileName) != -1) { 
					scriptPath = elements[i].src.substring(0, elements[i].src.lastIndexOf('/') + 1); 
					break;
				}
			}
			
			scriptPath = scriptPath.replace(document.location.protocol + "//", '');
			components = scriptPath.split("/");
			
			if ( components.length > 0 && components[components.length-1] == "" ) {
				components.pop();
			}
			
			return protocal + "//" + components.join("/");
		},
	
		loadScript: function( path, rootPath, callback, useQueue ) {
			if ( arguments[0] != undefined && arguments[0].constructor === Array ) {
				var files = arguments[0];
				for ( var i in files ) {
					var file = files[i];
					this.loadScript( file, rootPath, callback, useQueue );
				}
				
				return files;
			}
			
			var src = ( rootPath !== "" ) ? ( rootPath + "/" + path ) : path;
			var loaded = false;
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = src;
			script.charset = "utf-8";
			
		    if ( callback || useQueue ) {
				script.onreadystatechange = script.onload = function() {
					if ( loaded === false ) {
						if ( typeof callback === "function" ) {
							callback()
						}
					}
					
					loaded = true;
					
					if ( useQueue ) {
						
						if ( _queue.length == 0 ) {
							_queueing = false;
						}
						else {
							_nextQueue();
						}
					}
		        };
		    }
		    
		    if ( useQueue === true ) {
			    _queue.push( script );
			    
			    if ( _queueing === false ) {
				    _queueing = true;
				    _nextQueue();
			    }
		    }
			else {
				if ( _baseElement ) {
					_head.insertBefore(script, _baseElement );
				}
				else {
					_head.appendChild(script);
				}
			}
		},
		
		writeScript: function( path, rootPath ) {
			if ( arguments[0] != undefined && arguments[0].constructor === Array ) {
				var files = arguments[0];
				for ( var i in files ) {
					var file = files[i];
					this.writeScript( file, rootPath );
				}
				
				return files;
			}
			
			var src = ( rootPath !== "" ) ? ( rootPath + "/" + path ) : path;
			document.write( '<script type="text/javascript" src="' + src + '"></script>' );
		}
	};
	
})(),

Global = (function Global() {

	return {
		register: function( name, object, force ) {
			if ( window[name] !== undefined ) {
				debug.warn("Warning Glboal Extend: "+name+" is exists !!");
			}

			if ( window[name] === undefined || force === true ) {
				window[name] = object;
			}
		}
	};
})();

UI.register = function( name, object, force ) {
	if ( UI[name] !== undefined ) {
		debug.warn("Warning Extend: property ("+name+") of UI is exists !!");
	}

	if ( UI[name] === undefined || force === true ) {
		UI[name] = object;
	}
};

UI.register( "ScriptLoader", ScriptLoader );
UI.register( "Global", Global );
UI.Global.register( "UI", UI );

})(window);

(function(window, undefined) {

'use strict';
	
// debug 
window.debug_enabled = window.debug_enabled || false;


var 
/* ----- Debug ----- */

Debug = function() {
	
	var _microtime = function( get_as_float ) {
		var now = new Date().getTime() / 1000;
		var s = parseInt(now, 10); 
		return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000);
	};

	// Debugging 내용 출력 허용 여부
	// 전역 변수로 DebugEnabled 값을 true 로 하고 실행하면 출력 허용됨
	Debug.enabled = ( window['debug_enabled'] === true ) ? true : false;
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
};

Debug.type = function( type ) {
	var filter = ( window.debug ) ? window.debug.filter : [];

	window.debug = ( type == "console" && window.console ) ? window.console : new Debug();
	window.debug.filter = filter;
};

Debug.__ClassCreateLog = false;
	
Debug.filter = function( filter ) {
	window.debug.filter = arguments;
};

Debug.type( "debug" ); //( window.console ? "console" : 

UI.register("Debug", Debug);

})(window);
(function( window, undefined) {

'use strict';

var 
/* ----- Helper ----- */

Helper = function Helper( name, target, global ) {
	
	var options = ( typeof target == "function" ) ? target.call(target) : ( target || {} );
	var helper = ( window[name] === undefined ) ? (new Function( "return function "+name+"() {}"))() : window[name];

	Helper.register(helper, options);

	if ( global ) {
		for ( var key in global ) {
			var funcName = global[key];
			window[funcName] = window[funcName] || options[key];
		}
	}

	helper.toPrototype = function() {
		var fn = window[name].prototype;

		for ( var funcName in options ) {
			var camelName = funcName.replace(/[_|-](.)/g, function(_, c) {
				return c.toUpperCase();
			});

			if ( fn[camelName] == undefined ) {
				if ( camelName.charAt(0) !== "_" ) {
					fn[camelName] = function() {
						var args = Array.prototype.slice.call( arguments, 0 );
						args.unshift(this);

						return options[funcName].apply( helper, args );
					}
				}
			}
		}
	};

	Helper[name] = helper;
	
	return helper;
};

Helper.register = function(context, options, override ) {
	context = ( context == undefined ) ? {} : context;
	for ( var prop in options ) {
		// camelize
		var camelName = prop.replace(/[_|-](.)/g, function(_, c) {
			return c.toUpperCase();
		});

		if ( !!override || context[camelName] == undefined ) {
			if ( camelName.charAt(0) !== "_" ) {
				context[camelName] = options[prop];
			}
		}
	}
	
	return context;
};

// Object Helper
Helper( "Object", {
	is_object: function( object ) {
		return ( Object.prototype.toString.call( object ) === '[object Object]' );
	},
	
	is_equal: function( object, target, depth, strict ) {
		var bool = true;
	
		if  ( depth === true && typeof object == "object" && typeof object == "object") {
			for ( var key in object ) {
				if ( object[key] !== target[key] ) {
					bool = false;
					break;
				}
			}
		}
		else {
			bool = strict === true ? ( object === target ) : ( object == target );
		}
	
		return bool;
	},
	
	is_plain_object: function( object ) {
		if ( typeof object !== "object" || object.nodeType || object === window ) {
			return false;
		}

		try {
			if ( object.constructor && ! Object.prototype.hasOwnProperty.call( object.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}

		return true;
	},
	
	copy: function( object ) {
		var copyObj = {};
		this.merge( copyObj, object, true );
		return copyObj;
	},
	
	extend: function( object, target ) {
		object = object || {};
	
		for (var key in target ) {
			var value = target[key];
			
			if ( Array.isArray( value ) ) {
				object[key] = Helper.Array.extend( object[key], value );
			}
			else if ( Object.isObject( value ) ) {
				object[key] = Helper.Object.extend( object[key], value );
			}
			else {
				object[key] = value;
			}
		}
		
		return object;
	},

	each: function( _obj, _handler, _context ) {
		var key, value, type, context, keys;
		context = _context || this;
		
		for ( key in _obj ) {
			value = _obj[key];

			if ( _handler.call( context, key, value ) === false ) {
				break;
			}
		}
	},

	'include': function( target, object, deep ) {
		deep = ( deep === undefined ) ? 5 : deep;
		
		this.each( target, function( key, value ) {
			if ( object[key] !== undefined ) {
				var objValue = object[key];
				var targetValueType = typeof value;
				var objectValueType = typeof objValue;
				
				if ( targetValueType === 'object' && objectValueType === 'object' ) {
					if ( deep > 0 ) {
						var hasKey = false; 
						for ( hasKey in value ) { 
							break;
						}
						
						if ( hasKey === false ) {
							value = objValue;
						}
						else {
							value = this.include( value, objValue, (deep - 1) );
						}
					}
				}
				else if ( targetValueType === undefined || targetValueType === objectValueType ) {
					value = objValue;
				}
				
				target[key] = value;
			}
		}, this);
		
		return target;
	},

	objectFromQueryString: function( str ) {
		var paramComponents = str.split("&");
		var paramObject = {};

		for ( var i in paramComponents ) {
			var param = ( paramComponents[i].indexOf("=") === -1 ) ? [paramComponents[i], ''] : paramComponents[i].split("=");
			var paramKey = decodeURI(param[0]);
			var paramValue = decodeURI(param[1]);

			paramObject[paramKey] = paramValue;
		}

		return paramObject;
	},
	
	clone: function( object ) {
		return Helper.Object.merge( {}, object, true );
	},
	
	merge: function( object, target, override ) {
		if ( override == true ) {
			object = object || {};
		
			for ( var key in target ) {
				var value = target[key];
					
				if ( Array.isArray( value ) ) {
					object[key] = Helper.Array.merge( object[key], target[key], override );
				}
				else if ( Object.isObject( value ) ) {
					object[key] = Helper.Object.merge( object[key], target[key], override );
				}
				else {
					object[key] = target[key];
				}
			}
		}
		else {
			for ( var key in target ) {
				if ( object[key] != undefined ) {
					
					var value = target[key];
					
					if ( Array.isArray( value ) ) {
						object[key] = Helper.Array.merge( object[key], target[key] );
					}
					else if ( Object.isObject( value ) ) {
						object[key] = Helper.Object.merge( object[key], target[key] );
					}
					else if ( typeof value == "number" ) {
						if ( (''+object[key]).indexOf('.') !== -1 ) {
							object[key] = parseFloat(target[key]) || 0;
						}
						else {
							object[key] = parseInt(target[key]) || 0;
						}
					}
					else { // string
						object[key] = value;
					}
				}
			}
		}
		
		return object;
	}
});

// Array Helper
Helper( "Array", {
	is_array: function( array ) {
		return ( Object.prototype.toString.call( array ) === '[object Array]' );
	},
	
	in_array: function( array, needle, strict ) {
		for ( var key in array) {
			if ( Helper.Object.isEqual( array[key], needle, true, strict ) ) {
				return true;
			}
		}

		return false;
	},

	index_by_object: function( array, object ) {
		
		if ( ! Helper.Array.isArray(array) ) {
			return -1;
		}
		
		var index = -1;
		
		for (var i = 0; i < array.length; i++) {
			if (i in array) {
				if ( array[i] === object ) {
					index = i;
					break;
				}
			}
		}
		
		return index;
	},

	add: function( array, object ) {
		
		if ( ! Helper.Array.isArray(array) ) {
			array = new Array();
		}
		
		if ( object != null ) {
			array.push.call( array, object );
		}
		
		return array;
	},
	
	remove_at_index: function( array, index ) {
		
		if ( index < 0 || index > array.length - 1  ) {
			return array;
		}
	
		var rest = array.slice( index+1 || array.length );
		array.length = index;
		array.push.apply( array, rest );
		
		return array;
	},

	remove: function( array, object ) {
		if ( object == null || array.length == 0 ) {
			return -1;
		}

		var index = -1;
		for ( var i=0; i<array.length; i++ ) {
			if ( Helper.Object.isEqual( array[i], object, true ) ) {
				index = i;
				break;
			}
		}
		
		if ( index === -1 ) {
			return array;
		}
		
		return Helper.Array.removeAtIndex( array, index );
	},
	
	copy: function( array ) {
		return Array.prototype.slice.call(array, 0);
	},
	
	sort: function( array, handler, thisArg ) {
		if (typeof handler != "function") {
			return ;
		}
		
		var length = array && typeof array["length"] != undefined ? array.length : 0;
		var isBreak = false;
		
		for (var i=0; i<length; i++) {
			for (var j=0; j<length-1; j++) {
			
				var sortType = handler.call( thisArg, array[j], array[j+1] );
				
				if ( sortType === "ASC" ) {
					var tmp = array[j+1];
					array[j+1] = array[j];
					array[j] = tmp;
				}
				else if ( sortType === "DESC" ) {
					var tmp = array[j];
					array[j] = array[j+1];
					array[j+1] = tmp;
				}
				else if ( sortType === false ) {
					isBreak = true;
					break;
				}
			}
			
			if ( isBreak == true ) {
				break;
			}
		}
	},

	merge: function( array, target ) {
		array = array || [];
		return array.concat( target );
	},

	extend: function( array, target ) {
		array = array || [];

		for ( var i in target ) {
			if ( array[i] == undefined ) {
				array[i] = target[i];
			}
		}

		return array;
	},

	each: function( array, handler, thisArg ) {
		if (typeof handler != "function") {
			return ;
		}
		
		var length = array && typeof array["length"] != undefined ? array.length : 0;

		for (var i = 0; i < length; i++) {
			if (i in array) {
				if ( handler.call( thisArg, i, array[i] ) === false ) {
					break;
				}
			}
		}
	}
});

// Number Helper
Helper( "Number", {
	parse_int: function( number ) {
		var str = String(number).replace(/[,]/gi, '');
		var i = parseInt(str, 10);
		if ( isNaN( i ) ) {
			i = 0;
		}
		
		return i;
	},
	
	format: function( number ) {
		var str = String(number); 
		var reg = /(\-?\d+)(\d{3})($|\.\d+)/;
		var self = this;

		if ( reg.test(str) ) {
			return str.replace(reg, function(str, p1, p2, p3) { return self.format(p1) + "," + p2 + "" + p3; } );
		}
		
		return str;
	},
	
	pad: function( number, totalDigits ) {
		var padding = "00000000000000";
		var rounding = 1.000000000001;
		var currentDigits = number > 0 ? 1 + Math.floor(rounding * (Math.log(number) / Math.LN10)) : 1;
		return (padding + number).substr(padding.length - (totalDigits - currentDigits));
	},

	//소수즘 증가, 감소시 chrome버그 부분 해결 
	precision: function(value) {
		var precisionOf=function( num ) {
			var str = num.toString(),
				decimal = str.indexOf( "." );
			return decimal === -1 ? 0 : str.length - decimal - 1;
		}

		var precision = precisionOf( value );
		return precision;
	}

}, 
{
	'format': 'number_format',
	'pad': 'number_pad'
});

// XML Helper
Helper( "XML", {
	to_JSON: function( xml ) {
		// Create the return object
		var obj = {};
	
		if (xml.nodeType == 1) { // element
			// do attributes
			
			if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
				
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.value;
				}
			}
		}
		else if (xml.nodeType == 3 || xml.nodeType == 4 ) { // text or cdata-section
			return xml.nodeValue;
		}
		else if ( xml.nodeType == 8  ) { // comment
			return obj;		
		}
		else if ( xml.nodeType == 9 ) { // document
			
		}
	
		// do children
		if ( xml.hasChildNodes() ) {
			var onlyHashName = true;
			
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				
				if ( item.nodeType == 8 ) {
					//console.log( item );
					continue;
				}
				
				var nodeName = item.nodeName;
				var nodeValue = Helper.XML.toJSON(item);
				nodeValue = (typeof nodeValue == "string") ? trim(nodeValue) : nodeValue;
				
				var isHashName = nodeName.indexOf("#") !== -1;
				
				if ( ! isHashName ) {
					onlyHashName = false;
				}
				
				if ( typeof nodeValue !== "string" || trim(nodeValue) !== "" ) {
					if (obj[nodeName] === undefined) {
						obj[nodeName] = nodeValue;
					} 
					else {
					
						if (typeof(obj[nodeName].push) == "undefined") { // no array
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						
						obj[nodeName].push( nodeValue );
					}
				}
			}
		
			if ( onlyHashName === true ) {
				var returnString = "";
				
				for ( var nodeName in obj ) {
					if ( nodeName.indexOf("#") !== -1 ) {
						returnString += obj[nodeName];
					}
				}
				
				return returnString;
			}
		}
		
		return obj;
	}
});

// String Helper
Helper( "String", {
	guid: function( string ) {
		var format = ( string == undefined || typeof string !== "string" ) ? "xxxx-xxxx-xxxx-xxxx" : string;
		
		return format.replace( /[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
	
	trim: window.trim || function( string ) {
		return string == null ? "" : ( string + "" ).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	
	lcfirst: function( string ) {
		string += '';
		var firstChar = string.charAt(0).toLowerCase();
		return firstChar + string.substr(1);
	},

	ucfirst: function (string) {
		string += '';
		var firstChar = string.charAt(0).toUpperCase();
		return firstChar + string.substr(1);
	},

	camelize: function(string) {
		return string.replace(/[_|-](.)/g, function(_, c) {
			return c.toUpperCase();
		});
	},

	/* 바-카멜 */
	decamelize: function(string) {
		return string.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
	},

	splitString: function( str, delimiter ) {
		delimiter = delimiter || ',';
	
		var arr = str.split(delimiter);
		for ( var key in arr ) {
			arr[key] = this.trim(arr[key]);
		}

		return arr;
	}
},{
	'trim': 'trim',
	'ucfirst': 'ucfirst'
});

// Cookie Helper
Helper( "Cookie", {
	set: function( cookieName, value, expireTime, path, domain, secure ) {
	
		expireTime = expireTime || 60*60*24*30*3;
	
		var expireDate = new Date();
		expireDate.setTime( expireDate.getTime() + expireTime );
		
		var cookieValue = escape( value ) + (( expireTime == undefined ) ? "" : "; expires=" + expireDate.toUTCString());
		
		if ( path ) {
			cookieValue += "; path=" + escape( path );
		}
		
		if ( domain ) {
			cookieValue += "; domain=" + escape( domain );
		}
		
		if ( secure ) {
			cookieValue += "; secure";
		}
		
		document.cookie = cookieName + "=" + cookieValue;
	},
	
	get: function( cookieName ) {
		var cookieValue = document.cookie;
		var start = cookieValue.indexOf(" " + cookieName + "=");
		
		if (start == -1) { 
			start = cookieValue.indexOf(cookieName + "=");
		}
		
		if (start == -1) { 
			cookieValue = null;	
		}
		else {
			start = cookieValue.indexOf("=", start) + 1;
			var end = cookieValue.indexOf(";", start);
			if (end == -1) {
				end = cookieValue.length;
			}
			
			cookieValue = unescape(cookieValue.substring(start, end));
		}
		
		return cookieValue;
	}
}, 
{
	"set":"set_cookie",
	"get":"get_cookie"
});

// Date Helper

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) {
			debug.error("invalid date");
			return null;
		}

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

Helper( "Date", {
	format: function( date, mask, utc ) {
		var result = dateFormat(date, mask, utc);
		return result === null ? "" : result;
	}
});

UI.register("Helper", Helper);
	
})(window);

(function(window, undefined) {

'use strict';

var 
/* ----- Core ----- */

Debug = UI.Debug,

Core = function Core() {
	return Core.__constructor;
};

Core.__constructor = function() {

	return {
		destroy: function() {	// 파괴자 함수
			this.__destruct.apply( this, arguments );
		},
		
		toString: function() { // 문자 치환 함수
			if ( this["__name"] ) {
				return this.__name;
			}
			
			return "{" + "" + "}";	
		},
		__construct: function() {},	// 생성시 실행 함수
		__destruct: function() {},	// 파괴시 실행 함수
	};
};

Core.__constructor.prototype = Core.prototype = {
	constructor: Core,
	__parent: Object,
	__name: "Core",
	__class: Core,
	__ancestor: Core
};

window.GLOBAL_VALUE = 1;

var 
/* ----- Class ----- */

Class = function( options ) {
	if ( typeof options == 'function' ) { // 익명함수를 Class 화 함, 관리하는 방법은 추후 구현
		options = {
			name:"__CLASS__",
			parent: IObject,
			constructor: options
		};
	}

	var _instance, _class, _parent, _constructor, _caller;
	var className = Class.className( options.name );
		
	//_class = function __CLASS__() { _instance = this; return _nativeCode.apply( _instance, arguments ); };
	_class = eval('function '+className+'() { _instance = this; return _nativeCode.apply( _instance, arguments ); };'+className );
	//_class = new Type(className, function() { _instance = this; return _nativeCode.apply( _instance, arguments ); });
	
	_parent = ( typeof options.parent == "function" ) ? 
		// is Function
		function( parent ) {
			if ( Debug.__ClassCreateLog ) {
				debug.log( "Class create [", className, "] from [", parent.__name, "]" );
			}
			return parent;
		}( options.parent ) : 
		
		// is String
		function( parentName ) { 
			if ( Debug.__ClassCreateLog ) {
				debug.log( "Class create [", className, "] from [", parentName, "]" );
			}
			
			var parent = ( typeof window[parentName] == "function" && window[parentName].prototype.__ancestor === Core ) ? 
						window[parentName] : 
						( ( typeof Class[parentName] == "function" && Class[parentName].prototype.__ancestor === Core ) ? 
						Class[parentName] : Core );
			
			return parent;
			
		}( ( typeof options.parent == "string" ) ? options.parent : "Core" );

	_constructor = ( options.constructor == undefined ) ? function() {} : options.constructor;
	
	// Prototype 상속
	_class.prototype.include = _class.include = Class.include;
	_class.prototype.extend = _class.extend = Class.extend;
	_class.prototype.inherit = _class.inherit = Class.inherit;
	_class.include( _parent );

	_class.prototype.constructor = _class;
	_class.prototype.__name = className;
	_class.prototype.__class = _class;
	_class.prototype.__parent = _parent;
	_class.prototype.__ancestor = _parent.prototype.__ancestor;

	// Static 상속
	_class.extend( _parent );
	
	if ( options["static"] != undefined ) {
		options["staticConstructor"] = options["static"];
	}
	
	if ( options["staticConstructor"] != undefined ) {
		var _staticInstance = ( typeof options.staticConstructor == "function" ) ? options.staticConstructor.apply(_class) : options.staticConstructor;
		
		_class.extend( _staticInstance );
	}
	
	// Constructor 구현 및 상속
	_class.__constructor = function () {
		var constructor = ( typeof _constructor === 'function') ? _constructor.apply( this, arguments ) : _constructor;
		return constructor;
	};

	_class.__constructor.prototype = _class.prototype;
	
	var _nativeCode = function() {
		
		var classConstructor, constructor, constructors = [], instance = this, args = arguments;
		classConstructor = _class.__constructor;
		constructor = classConstructor.apply( instance, args );
		constructor.include = Class.include;
		constructor.extend = Class.extend;
		constructor.inherit = Class.inherit;
		constructor.__name = classConstructor.prototype.__name;
		constructor.__class = classConstructor.prototype.__class;
		constructor.__parent = classConstructor.prototype.__parent;
		constructor.__ancestor = classConstructor.prototype.__ancestor;
		constructors.push( constructor );

		while( classConstructor ) {
			classConstructor = classConstructor.prototype.__parent.__constructor;
			if ( classConstructor == undefined ) {
				break;
			}

			var wasConstructor = constructors[constructors.length-1];
			constructor = classConstructor.apply( instance, args );
			constructor.include = Class.include;
			constructor.extend = Class.extend;
			constructor.inherit = Class.inherit;
			constructor.__name = classConstructor.prototype.__name;
			constructor.__class = classConstructor.prototype.__class;
			constructor.__parent = classConstructor.prototype.__parent;
			constructor.__ancestor = classConstructor.prototype.__ancestor;
			constructors.push( constructor );
		}

		var _superObject = {
			_super: function() {
				return this;
			}
		};

		for ( var i=constructors.length-1; i>=0; i-- ) {
			constructor = constructors[i];
			constructor.inherit( _superObject );

			// override method for dis-super-method
			for ( var method in constructor ) {
				var excludeMethods = ["__class", "__parent", "__ancestor", "constructor", "extend", "inherit", "include"];

				if ( typeof constructor[method] === 'function' && ! UI.Helper.Array.inArray( excludeMethods, method ) ) {
					constructor[method] = (function( context, constructor, method, prop ) {
						return function() {
							var result;

							if ( method !== context._superMethod && context._super !== context._inheritSuper ) { 
								var currentSuper = context._super;
								context._super = context._inheritSuper;
								result = prop.apply( context, arguments );
								context._super = currentSuper;
							}
							else {
								result = prop.apply( context, arguments );
							}

							return result;
						};
					})(this, constructor, method, constructor[method]);
				}
			}

			// create super method
			constructor._inheritSuper = constructor._super = (function ( _constructor, _superObject ) {

				var superMethod = function ( method, args ) {

					var _super = _superObject;
					
					if ( arguments.length === 0 ) {
						return _super;
					}
				
					if ( typeof _super[method] === "function" ) {
						var result;

						var currentSuper = this._super;
						this._super = _superObject._super;
						this._superMethod = method;
						result = _super[method].apply( this, args );
						this._superMethod = undefined;
						this._super = currentSuper;

						return result;
					}
					else if ( typeof _super[method] !== 'undefined' ) {
						if ( args == undefined ) {
							return _super[method];	
						}
						
						_super[method] = args;
					}
					else {
						console.error( this, "parent is not has method(" + method + ")" );
					}

					return this;
				};

				superMethod.prototype = constructor;

				return superMethod;
			})(constructor, _superObject);

			// instance 에 상속
			instance.extend( constructor );
			_superObject = constructor;
		}
		
		if ( ( instance.constructor === Core || instance.constructor === _class ) && typeof instance.__construct == "function" ) {
			instance.__construct.apply( instance, arguments );
		}
		
		return instance;
	};

	Class.register( className, _class, options.force === true );
	
	return _class;
};

Class.className = function( className ) {
	if ( typeof className == 'string' && className.length > 1 ) {
		var firstChar = className.charAt(0);
		var remainName = className.substr(1);

		firstChar = firstChar.replace(/[^a-z_]/gi, '');

		if ( firstChar != '' ) {
			remainName = remainName.replace(/[^a-z0-9_]/gi, '');
			className = firstChar + remainName;

			if ( className.length > 0 ) {
				return className;
			}
		}
	}

	return "__CLASS__";
};

Class.isClass = Core.isClass = function( constructor ) {
	if ( typeof constructor !== "function" ) {
		return false;
	}
	
	if ( typeof constructor.prototype["__ancestor"] == undefined ) {
		return false;
	}
	
	return  ( constructor.prototype.__ancestor === Core );
};

Class.register = function( name, object, force ) {
	if ( Class[name] != undefined ) {
		debug.warn("Warning Extend: property ("+name+") of Class is exists !!");
	}

	if ( Class[name] == undefined || force === true ) {
		Class[name] = object;
	}
};

Class.inherit = function( parent, context ) { // Instance 상속 함수
	context = ( context == undefined ) ? this : context;

	for ( var name in parent ) {
		if ( context[name] == undefined ) {
			context[name] = parent[name];
		}
	}
};
	
Class.include = function( proto, context ) { // Prototype 상속 함수
	context = ( context == undefined ) ? this : context;
	
	var cloneProto = Object.clone( proto );
	var prototype = context.prototype;
	if ( prototype == undefined ) {
		prototype = context.prototype = {};
	}

	for ( var name in cloneProto ) {
		prototype[name] = cloneProto[name];
	}
};

Class.extend = function( prop, context, ignoreOverride, hidden ) { // Static 상속 함수
	context = ( context == undefined ) ? this : context;

	for ( var name in prop ) {
		if ( ! ignoreOverride || context[name] == undefined ) {
			if ( ! hidden || name.substr(0,1) !== "_" ) {
				context[name] = prop[name];
			}
		}
	}
};

UI.register( "Class", Class );

})(window);

(function( window, undefined) {

'use strict';
	
var 
/* ----- Data ----- */
Class = UI.Class,
Core = Class.Core,
IObject = Class.IObject,
Helper = UI.Helper,

UserDefaults = Class({
	name: "UserDefaults",
	parent: Class.IObject,
	constructor: function() {
		
		var _defaultKey;
		var _data = {};
		var _localStorage = window.localStorage;
		
		return {
			__construct: function( defaultKey ) {
				_defaultKey = defaultKey;
			
				var data = _localStorage.getItem( _defaultKey );
				
				_data = ( data && typeof data == "string" ) ? JSON.parse(data) : {};
				
				return this;
			},
			
			data: function() {
				return _data;	
			},
			
			get: function( key ) {
				if ( _data[key] == undefined ) {
					return undefined;
				};
				
				return _data[key];
			},
			
			set: function( key, value ) {
				_data[key] = value;
			},
			
			remove: function( key ) {
				_data[key] = undefined;
				delete _data[key];	
			},
			
			clear: function() {
				_data = {};	
			},
		
			keys: function() {
				var keys = [];
				for ( var key in _data ) {
					keys.push(key);
				}
			
				return keys;
			},
			
			synchronize: function() {
				var data = JSON.stringify( _data );
				
				_localStorage.setItem( _defaultKey, data )
			}
		};
	},
	'static': function() {
		// TODO : 다시 데이타를 복구 하는 부분 체크
		
		var _defaults = {};
		
		return {
			standardUserDefaults: function() {
				return UI.UserDefaults.userDefaultsWithKey( "__UIKIT_USER_DEFAULT__" );
			},
			
			userDefaultsWithKey: function(key) {
				if ( _defaults[key] != undefined ) {
					return _defaults[key];
				};
				
				_defaults[key] = new Class.UserDefaults(key);
				
				return _defaults[key];
			},
			
			resetStandardUserDefaults: function() {
				_standardUserDefaults.destroy();
				_standardUserDefaults = undefined;
				
				_standardUserDefaults = new Class.UserDefaults();
			}
		};
	}
}),

LocalStorage = Class({
	name: "LocalStorage",
	parent: IObject,
	constructor: function() {
	
		var localStorage = window.localStorage;
		
		return {
			init: function() {
				return this;
			},
			
			get: function( key ) {
				return localStorage.getItem( key );
			},
			
			set: function( key, value ) {
				localStorage.setItem( key, value );
			},
			
			remove: function( key ) {
				localStorage.removeItem( key );
			},
			
			clear: function() {
				localStorage.clear();
			},
			
			data: function() {
				return localStorage;
			},
		
			keys: function() {
				var keys = [];
				
				for ( var key in localStorage ) {
				
					if ( key != "length" ) {
						keys.push(key);
					}
				}
			
				return keys;
			},
		};
	},
	'static': function() {
		// TODO : 다시 데이타를 복구 하는 부분 체크
		
		var _sharedInstance;
		
		return {
			sharedInstance: function() {
				if ( ! _sharedInstance ) {
					_sharedInstance = new Class.LocalStorage();
				}

				return _sharedInstance;
			}
		};
	}
}),

DataMap = Class({
	name: "DataMap",
	parent: Core,
	constructor: function() {

		var _keys = [],
			_data = {};

		return {
			data: function( data ) {
				if ( arguments.length == 0 ) {
					return _data;
				};
				
				_data = data;
			},
		
			get: function( key ) {
				return _data[key];
			},
			
			put: function( key, value ) {
				if ( _data[key] == undefined ) {
					_keys.push(key);
				}
				
				_data[key] = value;
			},
			
			remove: function( key ) {
				_data[key] = undefined;
				delete _data[key];
				Array.remove( _keys, key );	
			},
			
			each: function( fn ) {
				if ( typeof fn != 'function' ) {
					return;
				}
				
				for ( var i=0, length=_keys.length; i<length; i ++ ) {
					var key = _keys[i];
					var value = _data[key];
					fn.call( this, key, value, i );
				}
			},
			
			// TODO: 함수명 리펙토링
			entrys: function() {
				var length = _keys.length;
			    var entrys = new Array(length);
			    for (var i = 0; i < length; i++) {
			        entrys[i] = {
			            key : _keys[i],
			            value : _data[i]
			        };
			    }
			    return entrys;
			},
			
			isEmpty: function() {
				return _keys.length == 0;
			},
			
			size: function() {
				return _keys.length;
			}
		};
	}
});

UI.register("UserDefaults", UserDefaults);
UI.register("LocalStorage", LocalStorage);
UI.register("DataMap", DataMap);
	
})(window);

(function(window, undefined) {

'use strict';
	
var 
/* ----- Dimention ----- */

UIPoint = function( x, y ) { 
	var _x = ( x == undefined || isNaN(parseFloat(x)) ) ? 0 : parseFloat( x );
	var _y = ( y == undefined || isNaN(parseFloat(y)) ) ? 0 : parseFloat( y );
	
	var point = { x:_x, y:_y }; 
	point.toString = function() {
		return JSON.stringify( rect );
	};
	
	return point;
},

UISize = function( width, height ) { 
	var _width = ( width == undefined || isNaN(parseFloat(width)) ) ? 0 : parseFloat(width);
	var _height = ( height == undefined || isNaN(parseFloat(height)) ) ? 0 : parseFloat(height);
	
	var size = { width:_width, height:_height };
	size.toString = function() {
		return JSON.stringify( rect );
	};
	
	return size;
},

UIRect = function( x, y, width, height ) {
	if ( arguments.length == 1 ) {
		var rect = x;
		
		return new UIRect( rect.origin.x, rect.origin.y, rect.size.width, rect.size.height );	
	}

	var _x = ( x == undefined || isNaN(parseFloat(x)) ) ? 0 : parseFloat( x );
	var _y = ( y == undefined || isNaN(parseFloat(y)) ) ? 0 : parseFloat( y );
	var _width = ( width == undefined || isNaN(parseFloat(width)) ) ? 0 : parseFloat(width);
	var _height = ( height == undefined || isNaN(parseFloat(height)) ) ? 0 : parseFloat(height);
	
	var rect = { origin:new UIPoint(_x, _y), size:new UISize(_width, _height) };
	rect.toString = function() {
		return JSON.stringify( rect );
	};
	
	return rect;
},

UIEdgeInsets = function( top, right, bottom, left ) {
	var _top = ( top == undefined || isNaN(parseFloat(top)) ) ? 0 : parseFloat( top );
	var _right = ( right == undefined || isNaN(parseFloat(right)) ) ? 0 : parseFloat( right );
	var _bottom = ( bottom == undefined || isNaN(parseFloat(bottom)) ) ? 0 : parseFloat( bottom );
	var _left = ( left == undefined || isNaN(parseFloat(left)) ) ? 0 : parseFloat( left );
	
	var edgeInsets = { 
		top: _top, 
		right: _right, 
		bottom: _bottom, 
		left: _left 
	};
	edgeInsets.toString = function() {
		return JSON.stringify( rect );
	};
	
	return edgeInsets;
};

var 

UIPointFromElement = function( element ) {

	var win, docElem, position, box = { top: 0, left: 0 }, offset = { top: 0, left: 0 };
	
	if ( ! document.documentElement.contains( element ) ) {
		return new UIPoint( offset.left, offset.top );
	}
	
	var style = element.ownerDocument.defaultView.getComputedStyle( element, null );
	
	position = style.position;
	box = ( ! ( position === "fixed" || position === "absolute" ) && element.getBoundingClientRect !== undefined ) ? element.getBoundingClientRect() : { top: element.offsetTop, left: element.offsetLeft };
	
	var docElem = document.documentElement;
	var win = element !== window ? window : ( element.nodeType === 9 ? element.defaultView || element.parentWindow : undefined );
	var windowOffset = {
		top: ( win.pageYOffset || docElem.scrollTop ),
		left: ( win.pageXOffset || docElem.scrollLeft )
	};
	var clientOffset = {
		top: ( docElem.clientTop  || 0 ),
		left: ( docElem.clientLeft || 0 )
	};
	
	offset = {
		top: box.top + windowOffset.top - clientOffset.top,
		left: box.left + windowOffset.left - clientOffset.left
	};
	
	return new UIPoint( offset.left, offset.top );
};

UIPoint.fromElement = UIPointFromElement;

UI.register("UIPoint", UIPoint);
UI.register("UISize", UISize);
UI.register("UIRect", UIRect);
UI.register("UIEdgeInsets", UIEdgeInsets);
	
})(window);

(function(window, undefined) {

'use strict';

var 
RGBColor = function RGBColor(color_string) {
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }
};

UI.register( "RGBColor", RGBColor );
	
})(window);

(function( window, undefined ) {

'use strict';
	
var 
/* ----- Tween ----- */
Class = UI.Class,
Helper = UI.Helper,
RGBColor = UI.RGBColor,

Core = Class.Core,

Easing = {
	Linear: function( t, s, e, d ) {
		if ( t <= 0 ) {
			return s;
		}
		else if ( t >= 1 ) {
			return e;
		}
		
		return t * e + (1-t) * s;
	},
	
	Quad: {
		easeIn: function( t, s, e, d ) {
			return Easing.Linear( t * t, s, e );
		},
		
		easeOut: function( t, s, e, d ) {
			return Easing.Linear( ( 2 - t ) * t, s, e );
		},
		
		easeInOut: function( t, s, e, d ) {
			
			var wt = t;
			
			t /= d / 2;
			
			if ( t < 1 ) {
				return Easing.Linear( t * t, s, e + (s-e)*0.5 );
			}
			
			t = wt;
			
			return Easing.Linear( ( 2 - t ) * t, s-(s-e)*0.5, e );
		}
	},
	
	Bounce: {
		easeOut: function( t, s, e, d ) {
			debug.log( t );
		
			if ( t * 2 < 1 ) {
				return Easing.Linear( t * t, s, e );
			}
			
			return Easing.Linear( ( 2 - t ) * t * -1, s, e );
		}
	},
},

Tween = Class({
	name: "Tween",
	parent: Core,
	constructor: function(  ) {
		
		var _instance,
			_duration = 0,
			_defaultVars = {
				delay:0,
				top:undefined, left:undefined, right:undefined, bottom:undefined,
				width:undefined, height:undefined,
				scale:1,
				ease: Easing.Linear,
				
				transform: {
					rotation: {
						x:0, y:0, z:0
					},
					
					scale: {
						x:0, y:0, z:0
					},
					
					skew: {
						x:0, y:0
					},
					
					matrix: {
						x:0, x2:0, x3:0,
						y:0, y2:0, y3:0,
						z:0, z2:0, z3:0,
						d:0, d2:0, d3:0,
						
						tx:0, ty:0, tz:0, td:0
					}
				},
				
				shadow:0,
				opacity:1,
				
				css: {
					backgroundColor: new RGBColor("white")
				},
				
				onBefore: UI.Constants.NULL_FUNCTION,
				onStart: UI.Constants.NULL_FUNCTION,
				onUpdate: UI.Constants.NULL_FUNCTION,
				onComplete: UI.Constants.NULL_FUNCTION
			},
			_data = {
				top:0, left:0, right:0, bottom:0,
				width:0, height:0,	
				
				transform: {
					rotation: {
						x:0, y:0, z:0
					},
					
					scale: {
						x:0, y:0, z:0
					},
					
					skew: {
						x:0, y:0
					},
					
					matrix: {
						x:0, x2:0, x3:0,
						y:0, y2:0, y3:0,
						z:0, z2:0, z3:0,
						d:0, d2:0, d3:0,
						
						tx:0, ty:0, tz:0, td:0
					}
				},
				
				shadow:0,
				opacity:1,
				
				css: {
					backgroundColor: new RGBColor("white")
				}
			},
			_vars = {},
			_kill = false,
			_needToComplete = false,
			_beginTime = -1,
			_curveFunction = function() {},
			_requestAnimationFrame = function(func) { // window.requestAnimationFrame || function(func) {
				var timeStamp = +new Date;
				setTimeout( function() {
					func(timeStamp)
				}, 0);
			},
			_cancelAnimFrame = window.cancelAnimationFrame;
		
		return {
			_animationPosition: 0,
			
			instance: function() {
				return _instance;	
			},
		
			__construct: function( instance ) {
			
				_instance = instance;
				
				this.init.apply( this, arguments );
			},
			
			_render: function( timeStamp ) {
				//debug.log( "_render", timeStamp, _kill );
			
				if ( _kill === true ) {
					return false;
				}
			
				var self = this,
					beginTime = ( _beginTime == -1 ) ? (_beginTime = timeStamp) : _beginTime,
					currentTime = timeStamp,
					elapsedTime = currentTime - beginTime,
					animationPosition = ( _duration == 0 ) ? 1 : (( elapsedTime == 0 ) ? 0 : Math.min(1, elapsedTime / _duration ));
				
				this._animationPosition = animationPosition;
				
				this._onUpdate( animationPosition );
				
				return ( animationPosition === 1 );
			},
			
			_easingCurve: function( t, start, end ) {
				
			},
			
			_curve: function( timing, start, end ) {
				if ( timing <= 0 ) {
					return start;
				}
				else if ( timing >= 1 ) {
					return end;
				}
				
				return _curveFunction.call( this, timing, start, end, _duration );
			},
			
			_requestAnimationFrame: function() {
				var self = this;
				
				if ( _duration == 0 ) {
					self._render(-1);
					self._onComplete.call( self );
					
					return;
				}
				
				_requestAnimationFrame( function() {
					
					if ( ! self._render.apply( self, arguments ) ) {
						if ( _kill == false ) {
							self._requestAnimationFrame();
						}
						else {
							if ( _needToComplete == true ) {
								setTimeout(function() { self._onComplete.call( self ); }, 0);
							}
						}
					}
					else {
						setTimeout(function() { self._onComplete.call( self ); }, 0);
					}
				});	
			},
			
			_onBefore: function() {
				//debug.log( "onBefore" );
				
				if ( typeof _vars.onBefore == "function" ) {
					_vars.onBefore();
				}
			},
			
			_onStart: function() {
				//debug.log( "onStart" );
				
				_beginTime = -1;
				
				if ( typeof _vars.onStart == "function" ) {
					_vars.onStart();
				}
			},
			
			_draw: function( timing ) {
				var css = {};
				
				for ( var key in _vars ) {
					
					if ( Array.inArray( ["left", "right", "top", "bottom", "width", "height"], key ) && _vars[key] != undefined ) {
						/*
						if ( typeof _vars[key] === "string" && _vars[key].indexOf('%') ) {
							css[key] = this._curve( timing, parseInt(_data[key]), parseInt(_vars[key]) ) + "%";
						}
						else {
							css[key] = this._curve( timing, _data[key], _vars[key] ) + "px";
						}
						*/
						
						css[key] = this._curve( timing, _data[key], _vars[key] ) + "px";
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["opacity"], key ) ) {
						css[key] = this._curve( timing, _data[key], _vars[key] );
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["scale"], key ) ) {
						var value = this._curve( timing, _data[key], _vars[key] );
						_instance[key](value);
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["css"], key ) ) {
						
						for ( var subKey in _vars.css ) {
							if ( subKey == "backgroundColor" ) {
								var r = this._curve( timing, _data.css.backgroundColor.r, _vars.css.backgroundColor.r );
								var g = this._curve( timing, _data.css.backgroundColor.g, _vars.css.backgroundColor.g );
								var b = this._curve( timing, _data.css.backgroundColor.b, _vars.css.backgroundColor.b );
							
								css["background-color"] = "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) +")";
							}
						}
						
					}
				}
			
				_instance.css(css);	
			},
			
			_onUpdate: function( timing ) {
				if ( _kill == true ) {
					return;
				}
			
				this._draw( timing );
				
				if ( typeof _vars.onUpdate == "function" ) {
					_vars.onUpdate( timing );
				}
			},
			
			_onComplete: function() {
				//debug.log( "onComplete", _instance );
				
				this._draw( 1 );
				
				if ( typeof _vars.onComplete == "function" ) {
					_vars.onComplete.call( _instance, this, _vars );
				}
				
				if ( typeof _instance.__didFinishToTween == "function" ) {
					_instance.__didFinishToTween.call( _instance, this );
				}
			},
			
			_vars: function( vars ) {
				_vars = {};//Helper.Object.copy( _defaultVars );
				
				for ( var key in _defaultVars ) {
				
					if ( vars[key] != undefined ) {
						var type = typeof _defaultVars[key];
						
						if ( type == "object" ) {
							if ( key === "css" && vars.css.backgroundColor != undefined ) {
								_vars.css = _vars.css || {};
								_vars.css.backgroundColor = new RGBColor(vars.css.backgroundColor);
							}
						}
						else if ( type == "number" ) {
							if ( (''+_defaultVars[key]).indexOf('.') !== -1 ) {
								_vars[key] = parseFloat(vars[key]) || 0;
							}
							else {
								_vars[key] = parseInt(vars[key]) || 0;
							}
						}
						else { 
							_vars[key] = vars[key];
						}
					}
				}
			},
			
			_data: function() {
				var element = _instance.element();
				var size = _instance.size();
				var backgroundColor = _instance.css("background-color");
				var width = size.width;
				var height = size.height;
				
				/*
				if ( element.style.width && typeof element.style.width === "string" && element.style.width.indexOf('%') !== -1 ) {
					width = element.style.width;
				}
				else {
					width = size.width;
				}
				
				if ( element.style.height && typeof element.style.height === "string" && element.style.height.indexOf('%') !== -1 ) {
					height = element.style.height;
				}
				else {
					height = size.height;
				}
				*/
				
				_data = {
					left: parseFloat(_instance.css("left")),
					top: parseFloat(_instance.css("top")),
					width: width,
					height: height,
					scale: _instance.scale(),
					opacity: ( element.style.opacity ) ? parseInt( element.style.opacity ) : 1,
					css: {
						backgroundColor: backgroundColor
					}
				};
				
				if ( _instance.css("right") !== "auto" && ! isNaN( parseInt(_instance.css("right") ) ) ) {
					_data.right = parseInt(_instance.css("right"));
				}
				
				if ( _instance.css("bottom") !== "auto" && ! isNaN( parseInt(_instance.css("bottom") ) ) ) {
					_data.bottom = parseInt(_instance.css("bottom"));
				}
			},
			
			init: function( instance ) {
					
				var a = ["ms","moz","webkit","o"];
				var i = a.length;
				
				while (--i > -1 && !_requestAnimationFrame) {
					//_requestAnimationFrame = window[a[i] + "RequestAnimationFrame"];
					//_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
				}	
			},
			
			killTo: function( completed ) {
				//degug.log( "killTo", completed );
			
				_kill = true;
				_needToComplete = completed;
				
				if ( typeof _instance.__didFinishToTween == "function" ) {
					_instance.__didFinishToTween.call( _instance, this );
				}
			},
			
			set: function( duration, vars ) {
				
				_duration = duration * 1000;
				_curveFunction = _vars.ease || Easing.Linear;
				
				this._vars(vars);
			},
			
			to: function( duration, vars ) {
			
				_kill = false;
				_needToComplete = false;
			
				this.set( duration, vars );
				this.start();
			},
			
			start: function() {
				//debug.log( "start" );
				
				if ( Tween.slowAnimation === true ) {
					_duration = _duration * 10;
				}
			
				this._onBefore();
				this._onStart();
				this._data();
				this._requestAnimationFrame();
			}
		}
	},
	'static': function() {
		
		return {
			slowAnimation: false,
		
			set: function( target, duration, vars ) {
				var tween = new Tween( target );
				tween.set( duration, vars );
				return tween;
			},
		
			to: function( target, duration, vars ) {
				var tween = new Tween( target );
				tween.to( duration, vars );
				return tween;
			}
		};
	}
});

Tween.Easing = Easing;

UI.register( "Tween", Tween );

})(window);

(function( window, undefined) {

'use strict';

var 
/* ----- Event ----- */
Class = UI.Class,
Core = Class.Core,
IObject = Class.IObject,

Event = Class({
	name: "Event",
	parent: Core,
	constructor: function() {
		
		return {
			__construct: function( touches, event ) {
				var touch = ( touches != undefined && touches[0] != undefined ) ? touches[0] : undefined;
		
				if ( touch != undefined && touch["pageX"] != undefined && touch["pageY"] != undefined ) {
					return {
						"offsetX":touch.pageX,
						"offsetY":touch.pageY
					};
				}
			
				var clientX = ( touches != undefined && touches["length"] > 0 ) ? touches[0].clientX : event.clientX;
				var clientY = ( touches != undefined && touches["length"] > 0 ) ? touches[0].clientY : event.clientY;
				var touches = [];
			
				var doc, docElem, body, win;
				var srcElement = event.target || event.srcElement;
			
				win = window;
				doc = srcElement && srcElement.ownerDocument;
				docElem = doc.documentElement;
				body = doc.body;
							
				var clientTop = docElem.clientTop || body.clientTop || 0;
				var clientLeft = docElem.clientLeft || body.clientLeft || 0;
				var scrollTop = win.pageYOffset || docElem.scrollTop;
				var scrollLeft = win.pageXOffset || docElem.scrollLeft;
			
				var phase = event.type;
			
				this["phase"] = phase;
				this["touches"] = touches;
				this["clientX"] = clientX;
				this["clientY"] = clientY;
				this["offsetX"] = clientX + scrollLeft - clientLeft;
				this["offsetY"] = clientY + scrollTop - clientTop;
			}
		}
	},
	'static': function() {
	
		var _manager;
	
		return {
			eventUID: 0,
			hasTouch: 'ontouchstart' in window,
			manager: function() {
				if ( ! _manager)  {
					_manager = new EventManager();
				}
				return _manager;
			}
		};
	}
}),

TouchEvent = {
	Start:		Event.hasTouch ? "touchstart" : "mousedown",
	Move:		Event.hasTouch ? "touchmove" : "mousemove",
	End:		Event.hasTouch ? "touchend" : "mouseup",
	Cancel:		"touchcancel",
},

EventHandler = function( instance, type ) {

	var _instance = instance;
	var _element = instance.element ? instance.element() : undefined;
	var _type = type;
	var _bindedHandlers = [];

	return {
		/*
		handler: function(e) {
			for ( var i in _bindedHandlers ) {
				var handler = _bindedHandlers[i];
				handler.apply( _element, e );
			}
		},
		*/
		
		bindedHandlers: function() {
			return _bindedHandlers;	
		},
	
		addEventListener: function( handler, options ) {
				
			if ( typeof handler != "function" ) {
				return;
			}		

			_bindedHandlers[_bindedHandlers.length] = handler;

			/*
			for ( var i in _element ) {
				var bubbles = options;
				var element = _element[i];
				
				if ( element && element["nodeType"] != undefined && element["nodeType"] === 1 || element === window ) {
					element.addEventListener( _type, this.handler, false );
				}
			}
			*/
		},
		
		removeEventListener: function( handler, options ) {
			Array.remove( _bindedHandlers, handler );
			
			/*
			
//			for ( var i in _element ) {
				var bubbles = options;
				var element = _element;
				
				if ( element["nodeType"] != undefined && element["nodeType"] === 1 || element === window ) {
					element.addEventListener( _type, this.handler );
				}
//			}

			*/
		},
		
		dispatchEvent: function() {
			var args = arguments;
		
			Array.each( _bindedHandlers, function( index, handler ) {
				handler.apply( _instance, args );
			});
		}
	}	
},

EventManager = function() {
	var _bindedInstances = {};
	
	return {
	
		bindedEvent: function( instance, types ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			
			return _bindedInstances[eventUID][type];
		},
		
		add: function( instance, types, handler, options ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			_bindedInstances[eventUID][type].addEventListener( handler, options );
		},
		
		remove: function( instance, types, handler ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			_bindedInstances[eventUID][type].removeEventListener(handler);
		},
		
		trigger: function( instance, types ) {
			console.log("trigger");
			var type = types.split(".")[0];
			var eventUID = instance.eventUID();
			
			if ( _bindedInstances[eventUID][type] != undefined ) {
				_bindedInstances[eventUID][type].trigger
			}
		}
	};
};

UI.register("TouchEvent", TouchEvent);
UI.register("Event", Event);
	
})(window);

(function(window, undefined) {

'use strict';
	
var 
/* ----- Private UI Module ----- */
Class = UI.Class,
Helper = UI.Helper,
Core = Class.Core,
Event = Class.Event,
UIPoint = UI.UIPoint,
UISize = UI.UISize,
UIRect = UI.UIRect,
UIEdgeInsets = UI.UIEdgeInsets,
Tween = UI.Tween,
RGBColor = UI.RGBColor,

/**
 * IObject
 * @name IObject
 * @class
 */

IObject = Class({
	name: "IObject",
	parent: Core,
	constructor: function() {
	
		return {
			__construct: function() {
				this.init.apply( this, arguments );
			},
			
			init: function() {
				return this;
			}
		};
	}
}),

/**
 * Responder
 * @name Responder
 * @class
 */

Responder = Class({
	name: "Responder",
	parent: IObject,
	constructor: function() {
	
		
		var _eventUID;
		
		return {
			eventUID: function() {
				if ( ! _eventUID ) {
					_eventUID = "Event." + Element.guid ++;
				}
				
				return _eventUID;
			},
		
			context: function( func, context ) {
				var context = context || this;
				
				return (function() {
					return func.apply( context, arguments );
				});
			},
			
			eventHandlers: function( event ) {
				return Event.manager().bindedEvent( this, event).bindedHandlers();	
			},

			addEventListener: function( event, handler ) {
			
				if ( typeof handler != "function" ) {
					return;
				}
				
				var context = this;
				
				/**/if ( Array.isArray( event ) ) {
					Array.each( event, function( i, e ) {
						this.addEventListener( e, handler );
					}, context);
					
					return;
				}
				
				Event.manager().add( this, event, handler );
			},
			
			removeEventListener: function( event, handler ) {
				
				var context = this;
				
				if ( Array.isArray( event ) ) {
					Array.each( event, function( i, e ) {
						this.removeEventListener( e, handler );
					}, context);
					
					return;
				}
				
				Event.manager().remove( this, event, handler );
			},
			
			dispatchEvent: function( event ) {
				
				var args = Array.prototype.slice.call( arguments, 0 );
				args.shift();
				
				var dispatcher = Event.manager().bindedEvent( this, event );
				dispatcher.dispatchEvent.apply( dispatcher, args );
			},
			
			bind: function( event, handler ) {
				this.addEventListener.apply( this, arguments );
				
				return this;
			},
			
			unbind: function( event, handler ) {
				this.removeEventListener.apply( this, arguments );
				
				return this;
			},
			
			trigger: function(){
				this.dispatchEvent.apply( this, arguments );
				
				return this;
			}
		};
	}
}),

/**
 * Element
 * @name Element
 * @class
 */
Element = Class({
	name: "Element",
	parent: Responder,
	constructor: function() {
	
		var 
			_element,
			//_enabled = true,
			_instance = null,
			_animating = false,
			_tweens = [],
			_plugins = [],
			_scale = 1,
			_gestureRecognizers = [];
		var _eventList = {};
		
		return {
			__captureElement: function( element ) {
				var wasElement = element;
			
				if ( element == undefined ) {
					element = undefined;
				}
				else {
					if ( typeof element == "string" ) {
						element = document.createElement(element.toUpperCase());
					}
					else if ( typeof element == "object" ) {
						if ( element.jquery ) {
							element = element.get(0);
						}
					}
				}
				return element;
			},
			
			__isElement: function( element ) {
				if ( typeof element === "object" && element.nodeType !== undefined ) {
					return true;
				}
				
				return false;
			},
			
			__setElement: function( element ) {
				var element = this.__captureElement( element );
			
				if ( this.__isElement(element) ) {
					_element = element;
					
					this._addInstance();
				}
			},
		
			__construct: function( element ) {
				var args = Array.prototype.slice.call( arguments, 1);
			
				_instance = this;
				
				this.__setElement(element);
				
				args.unshift( _element );
				
				this.init.apply( this, args );
			},

			__destruct: function() {
				if ( _element ) {
					_element = undefined;
				}
			},
			
			_addInstance: function() {
				var name, nameQueue;
				name = Helper.String.guid( "UIKit.xxxxxxxx" ) + "." + Element.guid ++;
				nameQueue = this.attribute("data-instance-id") ? ( " " + this.attribute("data-instance-id") + " " ).replace( /[\t\r\n\f]/g, " " ) : " ";
				
				if ( nameQueue ) {
					if ( nameQueue.indexOf( " " + name + " " ) < 0 ) {
						nameQueue += name + " ";
					}

					nameQueue = trim( nameQueue );
					
					this.attribute("data-instance-id", nameQueue);
				}
				
				this.instanceID = name;
				
				UI.manager.add( this );
			},
			
			_removeInstance: function( value ) {
				UI.manager.remove( this );
			
				var name, nameQueue;
				name = this.instanceID;
				nameQueue = this.attribute("data-instance-id") ? ( " " + this.attribute("data-instance-id") + " " ).replace( /[\t\r\n\f]/g, " " ) : " ";
				
				if ( nameQueue ) {
					while ( nameQueue.indexOf( " " + name + " " ) >= 0 ) {
						nameQueue = nameQueue.replace( " " + name + " ", " " );
					}

					nameQueue = trim( nameQueue );
					
					this.attribute("data-instance-id", nameQueue);
				}
			},
			
			_instance: function() {
				return _instance;
			},
			
			instanceID: 0,
		
			init: function( element ) {
				return this;
			},
			
			parent: function() {
				if ( ! this.hasElement() ) {
					return undefined;
				}
				
				return _element.parentNode;	
			},
			
			children: function() {
				if ( ! this.hasElement() ) {
					return [];
				}
			
				var children = [];
					
				Array.each( _element.children, function(i, element) {
					if ( element.nodeType === 1 ) {
						children.push( element );
					}
				});
				
				return children;
			},
			
			removeFromParent: function() {
				if ( ! this.hasElement() ) {
					return;
				}
			
				if ( this.parent() && _element ) {
					this.parent().removeChild( _element );
				}
			},

			destroy: function( withElement ) {
			
				this._removePlugins();
				this._removeInstance();
				
				if ( withElement === true ) {
					this.removeFromParent();
				}
				
				this._super( "destroy", arguments );
			},
			
			hasElement: function() {
				return this.__isElement(_element) ? true : false;
			},
			
			window: function() {
				return window;
			},
			
			element: function() {
				return _element;
			},
			
			_removePlugins: function() {
				
				for ( var i in _plugins ) {
					var plugin = _plugins[i];
					plugin.destroy();
				}
				
				_plugins = [];
			},
			
			plugins: function() {
				return _plugins;	
			},
			
			plugin: function( ) {
				for ( var i in arguments ) {
					var pluginName = "UIPlugin" + String.ucfirst(arguments[i]);
					if ( UI.Class[pluginName] !== undefined ) {
						var clazz = UI.Class[pluginName];
						var plugin = new clazz( this );
						
						_plugins.push( plugin );
					}
				}
				
				this._plugins = _plugins;
			},
			
			style: function( name, value ) {
				if ( ! this.hasElement() ) {
					return;
				}
				
				if ( name.indexOf("-") !== -1 ) {
					var nameComponents = name.split("-");
					var convertName = nameComponents.shift();
					Array.each( nameComponents, function( idx, name ) {
						convertName += String.ucfirst(name);
					});
					name = convertName;
				}
			
				var style = _element.style;
				var cssNumber = {
					"columnCount": true,
					"fillOpacity": true,
					"fontWeight": true,
					"lineHeight": true,
					"opacity": true,
					"order": true,
					"orphans": true,
					"widows": true,
					"zIndex": true,
					"zoom": true
				};
				
				if ( typeof value === "number" && ! cssNumber[ name ] ) {
					value += "px";
				}
	
				if ( value === "" && name.indexOf("background") === 0 ) {
					style[ name ] = "inherit";
				}
				else {
					style[ name ] = value;
				}
			},
			
			find: function( selector ) {
				if ( ! this.hasElement() ) {
					return [];
				}
			
				return _element.querySelectorAll(selector);
			},
			
			css: function( css ) {
				if ( ! this.hasElement() ) {
					return;
				}
				
				if ( Object.isObject(css) === true ) {
					for ( var name in css ) {
						this.style(name, css[name]);
					}
					return;
				}
				
				var curCss = {};
				var style = _element.ownerDocument.defaultView.getComputedStyle( _element, null );
				
				if ( typeof css === "string" ) {
					var value = style[css];
				
					if ( typeof value === "string" && ( value.indexOf("rgb") !== -1 || value.indexOf("#") !== -1 ) ) {
						value = new RGBColor( value );
					}
					
					return value;
				}
				
				for ( var name in style ) {
					if ( isNaN(parseInt(name)) && name !== "cssText" ) {
						var value = style[name];
						
						if ( typeof value === "string" && ( value.indexOf("rgb") !== -1 || value.indexOf("#") !== -1 ) ) {
							value = new RGBColor( value );
						}
						
						curCss[name] = value;
					}
				}
			
				return curCss;
			},
			
			hasClass: function( clazz ) {
				if ( ! this.hasElement() ) {
					return false;
				}
			
				var className = " " + clazz + " ";
				
				if ( _element.nodeType === 1 && (" " + _element.className + " ").replace(/[\t\r\n\f]/g, " ").indexOf( className ) >= 0 ) {
					return true;
				}
		
				return false;
			},
			
			addClass: function( value ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var clazz, className, c;
				value = ( value || "" ).match( /\S+/g ) || [];
				className = _element.nodeType === 1 && ( _element.className ? ( " " + _element.className + " " ).replace( /[\t\r\n\f]/g, " " ) : " " );
				
				if ( className ) {
					c = 0;
					while ( (clazz = value[c++]) ) {
						if ( className.indexOf( " " + clazz + " " ) < 0 ) {
							className += clazz + " ";
						}
					}

					className = trim( className );
					
					if ( _element.className !== className ) {
						_element.className = className;
					}
				}
			},
			
			removeClass: function( value ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var clazz, className, c;
				value = ( value || "" ).match( /\S+/g ) || [];
				className = _element.nodeType === 1 && ( _element.className ? ( " " + _element.className + " " ).replace( /[\t\r\n\f]/g, " " ) : " " );
				
				if ( className ) {
					c = 0;
					while ( (clazz = value[c++]) ) {
					
						while ( className.indexOf( " " + clazz + " " ) >= 0 ) {
							className = className.replace( " " + clazz + " ", " " );
						}
					}

					className = trim( className );
					
					if ( _element.className !== className ) {
						_element.className = className;
					}
				}
			},
			
			val: function( value ) {
				if ( ! this.hasElement() || _element["value"] === undefined ) {
					return;
				}
			
				if ( arguments.length === 0 ) {
					return _element.value || "";
				}
		
				_element.value = value;
			},
			
			/*
			enabled: function( enabled ) {
				if ( arguments.length == 0 ) {
					return _enabled;
				}

				_enabled = enabled;
			},
			*/
			
			isHidden: function( ) {
				if ( ! this.hasElement() ) {
					return true;
				}
			
				return ( this.css( "display" ) === "none" || ! _element.ownerDocument.contains( _element ) );
			},
			
			showHide: function( show ) {
			
				if ( ! this.hasElement() ) {
					return;
				}
			
				var display, hidden;
				
				display = _element.style.display;
					
				if ( show ) {
					if ( display === "none" ) {
						_element.style.display = "";
					}
				}
				else {				
					hidden = this.isHidden();
			
					if ( display && display !== "none" || !hidden ) {
						elem.style.display = "none";
					}
				}
			},
			
			show: function() {
				this.showHide( true );	
			},
			
			hide: function() {
				this.showHide( false );	
			},
			
			addGestureRecognizer: function( gestureRecognizer ) {
				if ( ! Array.inArray( _gestureRecognizers, gestureRecognizer  ) ) {

					if ( gestureRecognizer._gestureObject() ) {
						gestureRecognizer._gestureObject().removeGestureRecognizer.call( gestureRecognizer._gestureObject(), gestureRecognizer );
					}

					Array.add( _gestureRecognizers, gestureRecognizer );

					gestureRecognizer._gestureObject( this );
				}
			},

			removeGestureRecognizer: function( gestureRecognizer ) {
				if ( Array.inArray( _gestureRecognizers, gestureRecognizer  ) ) {
					gestureRecognizer._gestureObject( null );
					Array.remove( _gestureRecognizers, gestureRecognizer );
				}
			},
			
			scale: function( scale ) {
				if ( ! this.hasElement() ) {
					return _scale;
				}
			
				if ( arguments.length == 0 ) {
					return _scale;
				}
				
				_scale = scale;
				_element.style.cssText += "-webkit-transform:scale(" + _scale + ", " + _scale + ");";
			},
			
			width: function() {
				return this.size().width;	
			},
			
			height: function() {
				return this.size().height;	
			},
						
			size: function() {
				if ( ! this.hasElement() ) {
					return new UISize();
				}
			
				var width = this.css("width") || _element.offsetWidth;
				var height = this.css("height") || _element.offsetHeight;
					
				return new UISize( width, height );
			},
			
			offset: function() {
				if ( ! this.hasElement() ) {
					return new UIPoint();
				}	
				
				return UIPoint.fromElement(_element);
			},
			
			position: function() {
				if ( ! this.hasElement() ) {
					return new UIPoint();
				}
				
				var box, offset, parentStyle, parentOffset = {top:0, left:0}, offsetParent;
		
				offset = this.offset();
				offsetParent = _element.offsetParent;
				
				if ( this.css( "position" ) === "fixed" ) {
					parentOffset = UIPoint.fromElement(offsetParent);
					
					if ( this.parent() ) {
						parentStyle = _element.ownerDocument.defaultView.getComputedStyle( this.parent(), null );
						
						parentOffset.x = parentOffset.x + parseInt( parentStyle.borderLeftWidth );
						parentOffset.y = parentOffset.y + parseInt( parentStyle.borderTopWidth );
					}
				}
				else {
					parentOffset.x = 0;
					parentOffset.y = 0;
				}
				
			    box = {
			    	left: offset.x - parentOffset.x,
					top:  offset.y - parentOffset.y
				};
		
				return new UIPoint( box.left, box.top );
			},
			
			removeAttribute: function(key) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.removeAttribute( key );
			},
			
			attr: function() {
				this.attribute.apply( this, arguments );	
			},
			
			attribute: function(name, value) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				if ( value == undefined ) {
					return _element.getAttribute(name);
				}
			
				return _element.setAttribute(name, value);
			},
			
			attributes: function() {
				if ( ! this.hasElement() ) {
					return [];
				}
				
				return _element.attributes;
			},
			
			cloneElement: function(deep) {
				if ( ! this.hasElement() ) {
					return null;
				}
				
				var cloneElement = _element.cloneNode(deep);
				cloneElement.removeAttribute("data-instance-id");
				
				function removeInstance( children ) {
					Array.each( children, function(i, element) {
						if ( element.nodeType === 1 ) {
							element.removeAttribute("data-instance-id");
							
							if ( element.children ) {
								removeInstance( element.children );
							}
						}
					});
				}
				
				removeInstance( cloneElement.children );
				
				cloneElement.innerHeight = cloneElement.innerHeight;
				
				return cloneElement;
			},
			
			insertBefore: function( child ) {
				var childElement = child.element();
				
				if ( childElement ) {
					childElement = ( childElement.length ) ? childElement[0] : childElement;
					
					if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					
						this.parent().insertBefore(childElement, _element);
					
						return this;			
					}
				}
				
				return false;
			},
			
			insertAfter: function( child ) {
				var childElement = child.element();
				
				if ( childElement ) {
					childElement = ( childElement.length ) ? childElement[0] : childElement;
					
					if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					
						this.parent().insertBefore(childElement, _element.nextSibling);
					
						return this;			
					}
				}
				
				return false;
			},
			
			append: function( child, option ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var childElement = child.element();
				
				if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					if ( _element !== childElement ) {
						_element.appendChild( childElement );
					}
				}
			},
			
			remove: function( child, option ) {
				if ( child === undefined ) {
					this.destroy(true);
					return;
				}
				
				if ( ! this.hasElement() ) {
					return;
				}
			
				var childElement = child.element();
				childElement = ( childElement && childElement.jquery ) ? childElement.get(0) : childElement;
				
				_element.removeChild( childElement );
			},
			
			empty: function() {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML = "";	
			},
			
			appendHTML: function( html ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML += html;	
			},
			
			html: function( html ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML = html;	
			},
			
			data: function( key, value ) {
				if ( key === undefined ) {
					var data = {}, dataAttr = /^data\-(.+)$/;
					
					Array.each( this.attributes(), function( idx, attr ) {
						if ( dataAttr.test( attr.nodeName ) ) {
							var key = attr.nodeName.match(dataAttr)[1];
							data[key] = attr.nodeValue;
						}
					});
					
					return data;
				}
			
				if ( value === undefined ) {
					return this.attribute("data-"+key);
				}
				
				this.attribute("data-"+key, value);
			},
			
			addEventListener: function( event, handler, bubbles ) {
				this._super("addEventListener", arguments );
				if ( ! this.hasElement() ) {
					return;
				}
				
				//구분자를 통해 이벤트 관리 구분자로 이벤트를 선택적으로 삭제할수 있게끔 변경 		
				var me = this;
				var eventName = event.split(".")[0];
				var eventData = {
					eventKey: event.split(".")[1],
					handler: handler,
					nativeCallback : function(){
						me.dispatchEvent(event);
					}					
				}

				if(_eventList[eventName] == undefined){
					_eventList[eventName] = [];
				}

				_eventList[eventName].push(eventData);
				_element.addEventListener( eventName, eventData.nativeCallback, bubbles || false );
			},
			
			removeEventListener: function( event, handler, bubbles ) {
				this._super("removeEventListener", arguments );
				
				if ( ! this.hasElement() ) {
					return;
				}

				//jquery event 형태와 같이 ex)click.test<< .구분자로 이벤트 관리
				var eventName = event.split(".")[0]; 
				var eventKey = event.split(".")[1];
				var list;
				if( eventKey != undefined ){
					list = [];
					$.each( _eventList[eventName], function(){
						if( this.eventKey == eventKey ){
							list.push(this)
						}
					});
				}else{
					list = _eventList[eventName];
				}


				var me = this;
				if( Array.isArray(list)){
					if( typeof handler === "function" ){
						$.each(list, function(){
							if( this.handler == handler ){
								_element.removeEventListener( eventName, this.nativeCallback );	
							}
						});	
					}else{
						$.each(list, function(){
							_element.removeEventListener( eventName, this.nativeCallback );
						});	
					}
					
				}

				
				/*if ( typeof handler === "function" ) {
					_element.removeEventListener( event, handler, bubbles || false );
				}
				else {
					var handlers = this.eventHandlers( event );
					
					Array.each( handlers, function( idx, handler ) {						
						_element.removeEventListener( event, handler, bubbles || false );	
						
					});
				}*/
				
			},
			
			killAnimation: function( completed ) {
				
				if ( _tweens.length.length == 0 ) {
					return;
				}
				
				var wasTweens = _tweens;
				
				_tweens = [];
				
				for ( var i=0; i<wasTweens.length;i++ ) {
					var tween = wasTweens[i];
					tween.killTo( ( i == wasTweens.length - 1 ) ? completed : false );
					
					TweenManager.remove( tween );
				}
			},
			
			animate: function( duration, vars ) {
				//debug.log( this.name, "animate", arguments );
				
				var tween = new Tween( this );
				tween.set( duration, vars );
				
				_tweens.push( tween );
				
				if ( vars.inQueue === true ) {
					TweenManager.push( tween );
					TweenManager.start();
				}
				else {
					tween.start();
				}
			},
			
			_tweens: function() {
				return _tweens;	
			},
			
			_firstTween: function() {
				if ( _tweens.length == 0 ) {
					return undefined;
				}
			
				return _tweens[0];
			},
			
			__didFinishToTween: function( tween ) {
				Array.remove( _tweens, tween );
			
				TweenManager.didFinishToTween( this, tween );
			}
		};
	},
	'static': function() {
		
		return {
			guid: 0,
			
			createElement: function(elem, option) {
				var appendEle = document.createElement(elem);
				
				for(var name in option) {
					if(name == 'text') {
						text = document.createTextNode( option[name] );
						appendEle.appendChild(text);
					} else if(name == 'html') {
						appendEle.innerHTML = option[name];
					}
				}
				
				return appendEle;
			}
		}
	}
});

var TweenManager = function() {
	var 
	_animating = false,
	_queue = [];

	return {
		
		didFinishToTween: function( instance, tween ) {
			if ( _queue.length > 0 && tween !== _queue.shift() ) {
				console.error( "what!!!", tween,  _queue, _animating );
				return;
			}
			
			if ( _animating && _queue.length == 0 ) {
				return this.killAll();
			}
			
			setTimeout(function() {	TweenManager.next(); }, 0);
		},
	
		push: function( tween ) {
			_queue.push( tween );
		},
		
		remove: function( tween ) {
			var currentTween = this.first();
			Array.remove( _queue, tween );
			
			if ( currentTween === tween ) {
				this.next();
			}
		},
		
		first: function() {
			if ( _queue.length == 0 ) {
				return undefined;
			}
		
			return _queue[0];
		},
		
		next: function() {
			var tween = this.first();
			
			if ( tween == undefined ) {
				return this.killAll();
			}
			
			if ( tween == undefined ) {
				return this.killAll();
			}
			
			tween.start();
		},
		
		killAll: function() {
			//debug.log( "killAll" );
		
			_animating = false;
			_queue = [];
		},
		
		start: function() {
			if ( _animating == true ) {
				//console.warn("animating !!");
				return;
			}
		
			_animating = true;
			
			this.next();
		}
	}
}();


/* ----- Instance Manager ----- */

var

/**
 * Javascript Instance Module
 * @name UIManager
 * @class
 */
UIManager = function() {
	var _instances = [];
	var _defined = {};
	
	return {
		add: function( instance ) {
			if ( ! instance.element() || instance.element().length == 0 ||  ! instance.element().nodeType || instance.element().nodeType !== 1 ) {
				debug.warn( "instance is null", instance );
				return;
			}
		
			var instanceID = instance.instanceID;
			var instanceIndex = parseInt( instanceID.split(".")[2] );
			
			_defined[instanceID] = _instances[instanceIndex] = instance;
		},
		
		remove: function( instance ) {
			if ( instance.element().length == 0 ) {
				debug.warn( "instance is null", instance );
				return;
			}
		
			var instanceID = instance.instanceID;
			
			_defined[instanceID] = undefined;
			delete _defined[instanceID];
		},
		
		// 찾은 Element들 반환, callback 함수 가능
		find: function( selector, callback, context ) {
			var factory, items = [], canCallback = ( typeof callback == "function" );
			
			context = context || this;
			
			if ( typeof selector === "string" ) {
				items = document.querySelectorAll(selector);
			}
			else if ( selector.length > 0 && selector[0].nodeType != undefined ) { // element 배열
				items = selector;
			}
			else if ( selector.nodeType != undefined ) {
				items.push( selector );
			}
			else if ( Array.isArray( selector ) ) {
				
				Array.each( selector, function(idx, item) {
					if ( Class.isClass(item.constructor) ) {
						items.push( item.element() );
					}
				});
			}
			
			if ( canCallback ) {
				Array.each( items, function( index, element ) {
					callback.call( this, index, element );
				}, context);
			}
			
			return items;
		},
		
		isInstance: function( instance, constructor ) {
				
			if ( instance === undefined ) {
				return false;
			}
			
			// instance 는 존재하나 constructor 가 다른 경우
			if ( instance.constructor != undefined && constructor != undefined ) {
				if ( instance.constructor !== constructor ) {
					//debug.warn( "different constructor", item.constructor.name, constructor.name );
					return false;
				}
			}
			
			return true;
		},
		
		instance: function( element, constructor, params ) { 
			
			var instance, instances, context, hasInstance = false;
			
			context = this;
			instances = UI.manager.withElement( element );
			constructor =  typeof constructor === "string" ? ( Class[constructor] ) : constructor;
			params = params || [];
			
			Array.each( instances, function( index, instance ) {
				if ( context.isInstance(instance, constructor) === true ) {
					hasInstance = true;
					return false;
				}
			});
			
			// 이미 Instance 가 되어 있거나, constructor 가 다른 경우
			if ( element != undefined && constructor != undefined && hasInstance === false ) {
				
				if ( typeof constructor == "function"  ) {
					// is not class
					if ( ! Class.isClass( constructor ) ) {
						var className = ( typeof element["selector"] == "string" ? function( name ) {
								return name.replace(/[\.\-]/gi, "_");
							}(element["selector"]) : undefined );
						
						constructor = Class({
							"name": className,
							"parent": Element,
							"constructor": constructor
						});
					}
				}

				var args = params;
				
				if ( args.length == 1 ) {
					instance = new constructor( element, args[0] );
				}
				else if ( args.length == 2 ) {
					instance = new constructor( element, args[0], args[1] );
				}
				else if ( args.length == 3 ) {
					instance = new constructor( element, args[0], args[1], args[2] );
				}
				else if ( args.length == 4 ) {
					instance = new constructor( element, args[0], args[1], args[2], args[3] );
				}
				else if ( args.length == 5 ) {
					instance = new constructor( element, args[0], args[1], args[2], args[3], args[4] );
				}
				else {
					instance = new constructor( element );
				}
			}
			else if ( instances.length > 0 ) {
				instance = instances[instances.length-1];
			}

			//console.log( _defined );
			
			return instance;
		},
		
		// 
		get: function( items, constructor /*, ...args */ ) {

			if ( typeof arguments[0] === 'string' ) {
				var selector = arguments[0];
				items = this.find( selector );
			}

			var context = this,
				instances = [], 
				params = Array.prototype.slice.call( arguments, 2 );
			
			Array.each( items, function( index, element ) {
				var instance = this.instance( element, constructor, Array.copy( params ) );
				instances.push( instance );
			}, context);
			
			return instances.length === 1 ? instances[0] : instances;
		},
		
		byID: function( instanceID ) {
			return _defined[instanceID];
		},
		
		atIndex: function( index ) {
			return _instances[index];
		},
		
		withElement: function( element ) {
			var nameQueue = ( $(element).attr("data-instance-id") || "" ).match( /\S+/g ) || [];
			var context = this;
			var instances = [];
			
			Array.each( nameQueue, function( index, instanceID ) {
				var instance = context.byID( instanceID );
				
				instances.push( instance );
			});
			
			return instances;
		},
		
		countOf: function() {
			return _instances.length;
		}
	};
};

UI.register("manager", new UIManager());
	
})(window);

(function(window, undefined) {

'use strict';
	
var
/* ----- Public Module ----- */

Class = UI.Class,
Element = Class.Element,
TouchEvent = UI.TouchEvent,

/**
 * EventDispatcher
 * @name EventDispatcher
 * @class
 */
EventDispatcher = Class({
	name: "EventDispatcher",
	parent: Element,
	constructor: function() {
	
		var _binded = false;
		var _pressed = false;
		
		return {
			_shouldAttemptToRecognize: function() {
				return this.enabled();
			},
			
			_recognizeEvents: function( e ) {
				var bubbling = true;
				var event = e;//new UIEvent( e );
				
				//sdebug.log( "event", event );
			
				if ( this._shouldAttemptToRecognize() ) {
					switch ( event.type ) {
						case TouchEvent.Start:
							_pressed = true;
							
							bubbling = this.eventStart( event );
							break;

						case TouchEvent.Move:
							if ( _pressed == true ) {
								bubbling = this.eventDrag( event );
							}
							else {
								bubbling = this.eventMove( event );
							}
							
							break;

						case TouchEvent.End:
							_pressed = false;
							
							bubbling = this.eventEnd( event );
							break;

						/*
						case TouchEvent.Enter:
							_pressed = false;
							
							bubbling = this.eventEnter( event );
							break;

						case TouchEvent.Leave:
							_pressed = false;
							
							bubbling = this.eventLeave( event );
							break;
						*/
						
						case TouchEvent.Cancel:
							_pressed = false;
							
							bubbling = this.eventCancel( event );
							break;

						default:
							_pressed = false;
							
							break;
					}
				}
				
				return bubbling;
			},
			
			_bindEvents: function() {
				if ( _binded == true ) {
					return;	
				}
				
				_binded = true;
				
				var instance = this._instance();
				
				if ( this.hasElement() ) { 
					this.bind( TouchEvent.Start, function(e) {
						return instance._recognizeEvents( e );
					});
					
					this.bind( TouchEvent.Move, function(e) {
						return instance._recognizeEvents( e );
					});
					
					this.bind( TouchEvent.End, function(e) {
						return instance._recognizeEvents( e );
					});
					
					if ( ! Event.hasTouch ) {
						// this.bind( TouchEvent.Enter, function(e) {
						//	return instance._recognizeEvents( e );
						// });
					
						// this.bind( TouchEvent.Leave, function(e) {
						// 	return instance._recognizeEvents( e );
						// });
					}
					else {
						this.bind( TouchEvent.Cancel, function(e) {
							return instance._recognizeEvents( e );
						});
					}
				}
			},
			
			init: function() {
				var self = this._super("init", arguments);
				if (self) {
					
					//this._bindEvents();
					return this;
				}
			},
			
			destroy: function() {

				if ( _binded == true ) {
					this.unbind( TouchEvent.Start );
					this.unbind( TouchEvent.Move );
					this.unbind( TouchEvent.End );
					this.unbind( TouchEvent.Cancel );
					
					/*
					this.unbind( TouchEvent.Enter );
					this.unbind( TouchEvent.Leave );
					*/
					
					_binded = false;
				}

				this._super().destroy.apply( this._super(), arguments );
			},

			eventMove: function( event ) {
				return true;
			},
			
			eventStart: function( event ) {
				return true;
			},

			eventDrag: function( event ) {
				return true;
			},

			eventEnd: function( event ) {
				return true;
			},

			eventEnter: function( event ) {
				return true;
			},

			eventLeave: function( event ) {
				return true;
			},

			eventCancel: function( event ) {
				return true;
			}
		};
	}
}),

/**
 * UIView
 * @name UIView
 * @class
 */
UIView = Class({
	name: "UIView",
	parent: EventDispatcher,
	constructor: function() {
		
		var _subviews = [];
		
		return {
			addSubview: function( view ) {
				
				_subviews.push( view );
				
				this.element().appendChild( view.element() );
				
				this.needsDisplay();
			},
			
			superview: function() {
				return this.parent;
			},
			
			removeFromSuperview: function() {
				var superview = this.superview();
				
				this.remove();
				
				superview.needsDisplay();
			},
			
			needsDisplay: function() {
				
			}
		};
	}
});

})(window);
(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Responder = Class.Responder,
	
/**
 * UIController
 * @name UIController
 * @class
 */
UIController = Class({
	name: "UIController",
	parent: Responder,
	constructor: function() {
		
		var _instance;
		
		return {
			__construct: function( ) {
				_instance = this;

				this.init.apply( this, arguments );
			},

			__destruct: function() {
				_instance = undefined;
			},
			
			init: function() {
				
				return this;
			}
		};
	}
}),


/**
 * UIMacroController
 * @name UIMacroController
 * @class
 */
UIMacroController = Class({
	name: "UIMacroController",
	parent: UIController,
	constructor: function() {
		
		
		return {
			init: function() {
				var self = this._super("init", arguments);
				if (self) {
					
					return this;
				}
			}
		};
	}
});

})(window);

(function(window, undefined) {

'use strict';
	
var
/* ----- UI Gesture ----- */

Class = UI.Class,
Helper = UI.Helper,
Event = UI.Event,
TouchEvent = UI.TouchEvent,
IObject = Class.IObject,

UIGestureRecognizerState = {
	Possible:			10,
	Began:				21,
	Changed:			22,
	Ended:				23,
	Recognized:			23, // GestureRecognizerState.Ended
	Cancelled:			41,
	Failed:				44
},

AllowedTransitions = [
	// discrete gestures
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Recognized,	 	true,		true],
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Failed,			false,		true],

	// continuous gestures
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Began,				true,		false],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Changed,			true,		false],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Cancelled,			true,		true],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Ended,				true,		true],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Changed,			true,		false],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Cancelled,			true,		true],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Ended,				true,		true]
],

StateTransition = function( index ) {
	var transition = AllowedTransitions[index];

	return {
		fromState: transition[0],
		toState: transition[1],
		shouldNotify: transition[2],
		shouldReset: transition[3] 
	};
},

UIAction = function( target, action ) {
	this.target = target;
	this.action = action;
},

UIGestureRecognizer = Class({
	name: "UIGestureRecognizer",
	parent: IObject,
	constructor: function() {
		
		var _delegate = null;
		var _delegateCan = {
			shouldBegin: false,
			shouldReceiveTouch: false,
			shouldRecognizeSimultaneouslyWithGestureRecognizer: false 
		};

		var _state = UIGestureRecognizerState.Possible;

		var _registeredActions  = [];
		var _allowedTransitions = [];

		for ( var t in AllowedTransitions ) {
			_allowedTransitions[t] = new StateTransition( t );
		}
		
		var _pressed = false;

		var _gestureObject = null;
		var _trackingTouches = {};

		return {
			cancelsTouchesInView : true,
			delaysTouchesBegan  : false,
			delaysTouchesEnded  : true,
			
			_recognizeTouches: function( touches, event ) {
				//debug.error( this, "_recognizeTouches", UIControlEventString(event), touches, event );
				
				var bool = true;

				if ( this._shouldAttemptToRecognize() ) {
					_trackingTouches = touches;

					switch ( event.type ) {
						case TouchEvent.Start:
							_pressed = true;
							bool = this._gesturesBegan( touches, event );
							break;

						case TouchEvent.Move:
							
							// MouseEvent Bug
							if ( ! Event.hasTouch ) {
								if ( _pressed == false ) {
									return false;
								}
							}

							bool = this._gesturesMoved( touches, event );
							break;

						case TouchEvent.End:
							_pressed = false;
							bool = this._gesturesEnded( touches, event );
							break;

						case TouchEvent.Cancel:
							_pressed = false;
							bool = this._discreteGestures( touches, event );
							break;

						default:
							_pressed = false;
							break;
					}
				}

				return bool;
			},

			_gestureObject: function( instance ) {
				if ( arguments.length == 0 ) { 
					return _gestureObject
				}
				
				var self = this;

				_gestureObject = instance;

				_gestureObject.bind( TouchEvent.Start, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.Move, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.End, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.Cancel, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
			},

			_init: function() {
				
				_state = UIGestureRecognizerState.Possible;
				
				this.cancelsTouchesInView = true;
				this.delaysTouchesBegan = false;
				this.delaysTouchesEnded = true;
				
				_registeredActions = [];
				_trackingTouches = [];
				
				this.init();
			},
			
			init: function() {
					
			},

			destroy: function() {
			
				if ( _gestureObject ) {
					_gestureObject.unbind( TouchEvent.Start );
					_gestureObject.unbind( TouchEvent.Move );
					_gestureObject.unbind( TouchEvent.End );
					_gestureObject.unbind( TouchEvent.Cancel );
				}

				this._super("destroy", arguments);
			},

			delegate: function( delegate ) {
				if ( arguments.length == 0 ) {
					return _delegate;
				}

				_delegate = delegate;
				_delegateCan.shouldBegin = ( typeof _delegate["shouldBegin"] == "function" );
				_delegateCan.shouldReceiveTouch = ( typeof _delegate["shouldReceiveTouch"] == "function" );
				_delegateCan.shouldRecognizeSimultaneouslyWithGestureRecognizer = ( typeof _delegate["shouldRecognizeSimultaneouslyWithGestureRecognizer"] == "function" );
			},

			addTarget: function( target, action ) {
				var actionRecord = new UIAction();
				actionRecord.target = target;
				actionRecord.action = ( typeof action === "string" && typeof target[action] === "function" ) ? target[action] : ( typeof action === "function" ) ? action : (target["_recognizeTouches"] || function() {});

				Array.add( _registeredActions, actionRecord );
			},

			removeTarget: function( target, action ) {
				var actionRecord = new UIAction();
				actionRecord.target = target;
				actionRecord.action = action || target["_recognizeTouches"] || function() {};

				Array.remove( _registeredActions, actionRecord );
			},

			numberOfTouches: function() {
				return _trackingTouches.length;
			},

			state: function( state, silence ) {
				if ( arguments.length == 0 ) {
					return _state;
				}

				var transition = null;

				for ( var i=0; i<_allowedTransitions.length; i++ ) {
					if ( _allowedTransitions[i].fromState == _state && _allowedTransitions[i].toState == state ) {
						transition = _allowedTransitions[i];
						break;
					}
				}

				if ( transition ) {
				
					_state = transition.toState;
					
					if ( !silence && transition.shouldNotify ) {
						for ( var a in _registeredActions) {
							var actionRecord = _registeredActions[a];
		
							if ( typeof actionRecord.action == "function" ) {
								actionRecord.action.call( actionRecord.target, this );
							}
						}
					}
					
					if ( transition.shouldReset ) {
						this.reset();
					}
				}
			},

			isContainedView: function( event ) {
				
				var $element = $(event.srcElement);
				var $view = $( _gestureObject.element() );
				var $parent = $view;

				var isContained = false;

				if ( $parent[0] == $element[0] ) {
					return true;
				}

				var i = 0;

				while ( $parent.length > 0 && i < 20 ) {
					if ( $parent[0] === $element[0] ) {
						isContained = true;
						break;
					}

					$parent = $parent.parent();
					i = i + 1;
				}


				if ( isContained == false ) {
					$element = $( _gestureObject.element() );
					$view = $(event.srcElement);
					$parent = $view;

					i = 0;

					while ( $parent.length > 0 && i < 20 ) {
						if ( $parent[0] === $element[0] ) {
							isContained = true;
							break;
						}

						$parent = $parent.parent();
						i = i + 1;
					}
				}

				return isContained;
			},

			reset: function() {
				_state = UIGestureRecognizerState.Possible;
				_trackingTouches = [];
			},

			canPreventGestureRecognizer: function( preventedGestureRecognizer ) {
				return true;
			},

			canBePreventedByGestureRecognizer: function( preventedGestureRecognizer ) {
				return true;
			},

			ignoreTouch: function( touch, event ) {

			},

			_shouldAttemptToRecognize: function() {
				return ( _gestureObject &&
						_state != UIGestureRecognizerState.Failed &&
						_state != UIGestureRecognizerState.Cancelled && 
						_state != UIGestureRecognizerState.Ended );
			},

			_gesturesBegan: function( touches, event ) {
				return true;
			},

			_gesturesMoved: function( touches, event ) {
				return true;
			},

			_gesturesEnded: function( touches, event ) {
				return true;
			},

			_discreteGestures: function( touches, event ) {
				return true;
			}
		};
	},
	'static': {
		State: UIGestureRecognizerState
	}
}),

UITapGestureRecognizer = Class({
	name: "UITapGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {
	
		var _tapCount = 0;
		var _timestamp = new Date();
	
		return {
			
			init: function( view, enableInteraction ) {
				
			},
			
			_gesturesBegan: function( touches, event ) {
				
				
				
				return true;
			},

			_gesturesMoved: function( touches, event ) {
				_tapCount = 0;
				
				return true;
			},

			_gesturesEnded: function( touches, event ) {
				
				var timestamp = new Date();
				var difftime = (timestamp.getTime()*0.001) - (_timestamp.getTime()*0.001);
				
				_timestamp = timestamp;
				
				if ( difftime > 0.3 ) {
					_tapCount = 0;
				}
				
				_tapCount = _tapCount + 1;
				
				if ( _tapCount >= 2 ) {
					_tapCount = 0;
					
					return false;
				}
				
				return true;
			},

			_discreteGestures: function( touches, event ) {
				_tapCount = 0;
				
				return true;
			}
		};
	}
}),

UIPanInteraction = {
	Unknown:	1,
	Portrat:	2,
	Landscape: 	3,
	All:		4
},

UIPanGestureRecognizer = Class({
	name: "UIPanGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {

		var _minimumNumberOfTouches  = 1;
		var _maximumNumberOfTouches = 10;
		var _translation = { x:0, y: 0 };
		
		var _currentPoint = { x:0, y: 0 };
		var _currentTouch = null;

		var _enableInteraction = UIPanInteraction.Landscape;
		var _panningInteraction = UIPanInteraction.Unknown;
		var _checkInteraction = false;
		var _slideAngle = 60;

		return {
			
			_gesturesBegan: function( touches, event ) {
				var touch = new Event( touches, event );

				_currentTouch = touch;
				_currentPoint = { x: touch.offsetX, y: touch.offsetY };
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesMoved: function( touches, event ) {
				var touch = new Event( touches, event );
				var state = this.state();

				var point = { x: touch.offsetX, y: touch.offsetY };
				var delta = { x: point.x - _currentPoint.x, y:point.y - _currentPoint.y };

				_currentPoint = point;
				_currentTouch = touch;

				if ( _checkInteraction == false ) {
					var M_PI = 3.1415926535898;
					var ratio = Math.atan2( delta.y, delta.x );
					var angle = ( ratio == 0 ) ? 0 : ( ratio *180 / M_PI );

					_panningInteraction = ( Math.abs( angle ) > _slideAngle && Math.abs( angle ) < ( 180 - _slideAngle ) ) ? UIPanInteraction.Portrat : UIPanInteraction.Landscape;
					_checkInteraction = true;
				}

				if (  _enableInteraction == UIPanInteraction.Unknown || _enableInteraction == _panningInteraction ) {
					var isContains = this.isContainedView( event );

					if ( state == UIGestureRecognizerState.Possible && touch && isContains ) {
						this.translation( delta );
						
						_lastMovementTime = event.timeStamp;

						this.state( UIGestureRecognizerState.Began );

					}
					else if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
						if ( touch ) {
							if ( this._translate( delta, event ) ) {
								this.state( UIGestureRecognizerState.Changed );
							}
						} else {
							this.state( UIGestureRecognizerState.Cancelled );
						}
					}
					else {
						this.state( UIGestureRecognizerState.Cancelled );
					}

					return false;
				}

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesEnded: function( touches, event ) {
				var state = this.state();

				if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
					var touch = _currentTouch;
					var delta = { x: 0, y:0 };
					
					if ( touch ) {
						this._translate( delta, event );
						this.state( UIGestureRecognizerState.Ended );
					} else {
						this.state( UIGestureRecognizerState.Cancelled );
					}
				}
				else {
					this.state( UIGestureRecognizerState.Cancelled );
				}

				var bubbleEvent = ( _enableInteraction === _panningInteraction ) ? false : true;

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return bubbleEvent;
			},

			_discreteGestures: function( touches, event ) {

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				return true;
			},
		
			init: function( view, enableInteraction, angle ) {
				_enableInteraction = ( enableInteraction == undefined ) ? _enableInteraction : enableInteraction;
				_slideAngle =  ( angle == undefined ) ? _slideAngle : parse_int(angle);
				
				return this;
			},
			
			destroy: function() {
				this._super("destroy", arguments );
			},

			translationInView: function( view ) {
				return _translation;
			},

			_translate: function( delta, event ) {
				var timeDiff = event.timeStamp - _lastMovementTime;

				if ( ! (delta.x == 0 && delta.y == 0)  && timeDiff > 0) {
					_translation.x += delta.x;
					_translation.y += delta.y;
					_velocity.x = delta.x / timeDiff;
					_velocity.y = delta.y / timeDiff;
					_lastMovementTime = event.timeStamp;

					return true;
				}

				return true;
			},

			translation: function( translation, view ) {
				_velocity = { x:0, y: 0 };
				_translation = translation;
			},

			reset: function() {
				this._super().reset();

				_translation = { x:0, y: 0 };
				_velocity = { x:0, y: 0 };
			},

			velocityInView: function( view ) {
				return _velocity;
			}
		};
	},
	'static': {
		Interaction: UIPanInteraction
	}
}),

UISwipeGestureRecognizerDirection = {
	Right:	1 << 0,
	Left:	1 << 1,
	Up:		1 << 2,
	Down:	1 << 3	
},

UISwipeGestureRecognizer = Class({
	name: "UISwipeGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {

		var _minimumNumberOfTouches  = 1;
		var _maximumNumberOfTouches = 10;
		var _translation = { x:0, y: 0 };
		var _velocity = { x:0, y: 0 };

		var _currentPoint = { x:0, y: 0 };
		var _currentTouch = null;

		var _enableInteraction = UIPanInteraction.Landscape;
		var _panningInteraction = UIPanInteraction.Unknown;
		var _checkInteraction = false;
		var _slideAngle = 60;
		var _direction = UISwipeGestureRecognizerDirection.Right;
		var _lastMovementTime = 0;

		return {
		
			direction: function( direction ) {
				if ( arguments.length == 0 ) {
					return _direction;
				}
				
				_direction = direction;
			},
			
			_gesturesBegan: function( touches, event ) {
				var touch = new Event( touches, event );

				_currentTouch = touch;
				_currentPoint = { x: touch.offsetX, y: touch.offsetY };
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesMoved: function( touches, event ) {
				var touch = new Event( touches, event );
				var state = this.state();

				var point = { x: touch.offsetX, y: touch.offsetY };
				var delta = { x: point.x - _currentPoint.x, y:point.y - _currentPoint.y };

				_currentPoint = point;
				_currentTouch = touch;

				if ( _checkInteraction == false ) {
					var M_PI = 3.1415926535898;
					var ratio = Math.atan2( delta.y, delta.x );
					var angle = ( ratio == 0 ) ? 0 : ( ratio *180 / M_PI );

					_panningInteraction = ( Math.abs( angle ) > _slideAngle && Math.abs( angle ) < ( 180 - _slideAngle ) ) ? UIPanInteraction.Portrat : UIPanInteraction.Landscape;
					_checkInteraction = true;
				}

				if (  _enableInteraction == UIPanInteraction.Unknown || _enableInteraction == _panningInteraction ) {
					var isContains = this.isContainedView( event );

					if ( state == UIGestureRecognizerState.Possible && touch && isContains ) {
						this.translation( delta );
						
						_lastMovementTime = event.timeStamp;

						this.state( UIGestureRecognizerState.Began, true );

					}
					else if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
						if ( touch ) {
							if ( this._translate( delta, event ) ) {
								this.state( UIGestureRecognizerState.Changed, true );
							}
						} else {
							this.state( UIGestureRecognizerState.Cancelled, true );
						}
					}
					else {
						this.state( UIGestureRecognizerState.Cancelled, true );
					}

					return false;
				}

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesEnded: function( touches, event ) {
				var state = this.state();
				
				if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed || state == UIGestureRecognizerState.Possible ) {
					var touch = _currentTouch;
					var delta = { x: 0, y:0 };
					var silence = true;
					
					if ( touch ) {
						this._translate( delta, event );

						if ( Math.abs( _translation.x ) > 10 ) {
							if ( _translation.x > 0 && _direction == UISwipeGestureRecognizerDirection.Right ) {
								silence = false;
							}
							else if ( _translation.x < 0 && _direction == UISwipeGestureRecognizerDirection.Left ) {
								silence = false;
							}
						}

						this.state( UIGestureRecognizerState.Ended, silence );
					} else {
						this.state( UIGestureRecognizerState.Cancelled, true );
					}
				}
				else {
					this.state( UIGestureRecognizerState.Cancelled, true );
				}

				var bubbleEvent = ( _enableInteraction === _panningInteraction ) ? false : true;

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return bubbleEvent;
			},

			_discreteGestures: function( touches, event ) {

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				return true;
			},

			translation: function( translation, view ) {
				_translation = translation;
			},

			_translate: function( delta, event ) {
				var timeDiff = ( _lastMovementTime ) ? event.timeStamp - _lastMovementTime : 0;

				if ( ! (delta.x == 0 && delta.y == 0)  && timeDiff > 0) {
					_translation.x += delta.x;
					_translation.y += delta.y;
					_lastMovementTime = event.timeStamp;

					return true;
				}

				return true;
			},
		
			init: function( view, enableInteraction, angle ) {
				_enableInteraction = ( enableInteraction == undefined ) ? _enableInteraction : enableInteraction;
				_slideAngle =  ( angle == undefined ) ? _slideAngle : parse_int(angle);
				
				return this;
			},
			
			destroy: function() {
				this._super("destroy", arguments);
				
			}
		};
	},
	'static': {
		Direction: UISwipeGestureRecognizerDirection
	}
});
	
})(window);

(function(window, undefined) {

'use strict';

var 
/* ----- Notification ----- */
Class = UI.Class,

Notification = function( info, args ) {
	
	return {
		userInfo: info,
		arguments: args
	};
},

NotificationObserver = function( target, handler ) {

	return {
		post: function() {
			handler.apply( target, arguments );
		}
	};
},
/*
NotificationCenter.defaultCenter().addObserver( this, "TEST", function( info ) {
		
});

NotificationCenter.defaultCenter().postNotification( "TEST", {} );

*/
NotificationCenter = function() {

	var _observers = {};
	
	return {
		addObserver: function( target, name, handler ) {
			if ( name.indexOf( "" ) !== -1 ) {
				var someNames = name.split(" ");
				var self = this;
				if ( someNames.length > 1 ) {
					Array.each( someNames, function( index, someName ) {
						self.addObserver( target, someName, handler );
					});
					
					return;
				}
			}
		
			if ( _observers[name] == undefined ) {
				_observers[name] = [];
			}
			
			var observer = new NotificationObserver( target, handler );
			
			_observers[name].push( observer );
		},
		
		postNotification: function( name, info ) {
			//debug.log( this, "postNotification", name, info );
		
			if ( _observers[name] == undefined ) {
				return;
			}
		
			var args = Array.prototype.slice.call( arguments, 0 ); args.shift();
			var notification = new Notification( info, args );
			var objservers = _observers[name];
			
			Array.each( objservers, function( index, observer ) {
				observer.post.call( observer, notification );
			});
		}
	};
};

Notification.defaultCenter = new NotificationCenter();

if ( UI.Notification === undefined ) {
	UI.Notification = Notification;
}

})(window);

(function(window, undefined) {

'use strict';

var 

EscapeStrings = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
},

ReqularExpression = {
	white: /\s*/,
	space: /\s+/,
	equals: /\s*=/,
	curly: /\s*\}/,
	nonSpace: /\S/,
	variable: /\$[\w'-]*/,
	command: /if|loop|\=|\//
},

Config = {
	tags: ["{{", "}}"]
},

Context = function Context( data, parent ) {
	var 
	_data = data,
	_parent = parent;

	return {
		get: function( key ) {
			if ( isVariable(key) ) {
				key = getVariable(key);
			}

			if ( key === 'this' ) {
				return _data;
			}

			return _data[key];
		},

		convert: function( string ) {
			var match = string.match(/\$[\w'-]*/g);
			
			if ( match && match.length > 0 ) {
				var i, key, value;

				for ( i in match ) {
					key = getVariable(match[i]);
					value = this.get(key);

					if ( key === 'this' ) {
						value = _data;
					}

					if ( typeof value === 'string' ) {
						string = string.replace(match[i], "'" + value + "'");
					}
					else if ( typeof value === 'number' ) {
						string = string.replace(match[i], value );
					}
					else if ( typeof value === 'object' ) {
						
					}
				}
			}
			
			return string;
		},

		parent: function() {
			return _parent;
		},

		data: function() {
			return _data;
		},

		child: function( value ) {
			return new Context( value, this );
		}
	}
},

Template = function Template( html ) {

	var _tokens = [];

	return {
		parse: function( html, tags ) {
			// TODO: Cache
			_tokens = parseHTML(html, tags);
		},

		render: function( data ) {
			var context = new Context(data);
			return this.renderTokens( _tokens, context, 0 );
		},

		renderTokens: function( tokens, context, depth ) {
			var buffer = '';
			var self = this;
			var token, value;

			for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
				token = tokens[i];
				
				switch (token.type) {
					case 'loop':
						value = context.get(token.value);

						if (!value) {
							continue;
						}

						if (Array.isArray(value)) {
							for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
								buffer += this.renderTokens(token.data, context.child(value[j]), depth + 1);
							}
						} 
						else if (typeof value === 'object' || typeof value === 'string') {
							buffer += this.renderTokens(token.data, context.child(value), depth + 1);
						} 
						else if (isFunction(value)) {
							//if (typeof originalTemplate !== 'string') {
							//	throw new Error('Cannot use higher-order sections without the original template');
							//}

							// Extract the portion of the original template that the section contains.
							//value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

							//if (value != null) {
							//	buffer += value;
							//}
						} 
						else {
							buffer += this.renderTokens(token.data, context, depth + 1);
						}
						
						break;
					
					case 'if':
						value = context.convert(token.value);

						if ( eval(value) === true ) {
							buffer += this.renderTokens(token.data, context, depth + 1);
						}

						break;

					case '=':
					case 'name':
						value = context.get(token.value);

						if ( typeof value === 'object' ) {
							value = JSON.stringify( value );
						}

						if (value != null) {
							buffer += escapeHTML(value);
						}

					break;

					case 'text':
						buffer += token.value;

					break;
				}
			}

			return buffer;
		},

		tokens: function() {
			return _tokens;
		}
	};
},

TemplateManager = (function TemplateManager() {

	var _cached = {};

	return {
		
		get: function( selector ) {
			if ( _cached[selector] ) {
				return _cached[selector]; 
			}
			
			return _cached[selector] = $(selector).html();
		},

		parse: function( html ) {
			var template = new Template();
			template.parse( html );
			return template;
		},

		render: function( template, data ) {
			if ( typeof template === "string" ) {
				template = this.parse( template );
			}

			return template.render( data );
		}
	};
})();

// Functions
function parseHTML( html, tags ) {
	if ( !html ) {
		return [];
	}

	var sections = [];
	var tokens = [];
	var spaces = [];
	var hasTag = false;
	var nonSpace = false;
	var regExp = {}

	function stripSpace() {
		if (hasTag && !nonSpace) {
			while (spaces.length) {
				delete tokens[spaces.pop()];
			}
		} else {
			spaces = [];
		}

		hasTag = false;
		nonSpace = false;
    }

	function compileTags(tags) {
		if (typeof tags === 'string') {
			tags = tags.split(ReqularExpression.space, 2);
		}

		if ( !Array.isArray(tags) || tags.length !== 2) {
			throw new Error('Invalid tags: ' + tags);
		}

		regExp.openingTag = new RegExp(escapeRegExp(tags[0]) + '\\s*');
		regExp.closingTag = new RegExp('\\s*' + escapeRegExp(tags[1]));
		regExp.closingCurly = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
	}

    compileTags(tags || Config.tags);

    var scanner = new Scanner(html);
    var start, type, value, chr, token, openSection;

    while (!scanner.eos()) {
		start = scanner.pos;

		// Match any text between tags.
		value = scanner.scanUntil(regExp.openingTag);

		if (value) {
			for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
				chr = value.charAt(i);

				if (isWhitespace(chr)) {
					spaces.push(tokens.length);
				} 
				else {
					nonSpace = true;
				}
				
				tokens.push({
					'type': 'text',
					'value': chr,
					'start': start,
					'end': start+1
				});
			}

			start = start + 1;

			// Check for whitespace on the current line.
			if (chr === '\n') {
				stripSpace();
			}
		}

		// Match the opening tag.
		if (!scanner.scan(regExp.openingTag)) {
			break;
		}

		hasTag = true;

		// Get the tag type.
		type = scanner.scan(ReqularExpression.command) || 'name';
		scanner.scan(ReqularExpression.white);

		// Get the tag value.
		value = scanner.scanUntil(regExp.closingTag);
		
		// Match the closing tag.
		if (!scanner.scan(regExp.closingTag)) {
			throw new Error('Unclosed tag at ' + scanner.pos);
		}

		token = { 'type': type, 'value': value, 'start': start, 'end': scanner.pos };
		tokens.push(token);

		if (type === 'loop' || type === 'if') {
			sections.push(token);
		} else if (type === '/') {
			openSection = sections.pop();
		}
	}

	// Make sure there are no open sections when we're done.
	openSection = sections.pop();

	if (openSection) {
		throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
	}

	return nestTokens(squashTokens(tokens));
}

function Scanner(string) {
	this.string = string;
	this.tail = string;
	this.pos = 0;
}

Scanner.prototype.eos = function () {
	return this.tail === "";
};

Scanner.prototype.scan = function (re) {
	var match = this.tail.match(re);

	if (!match || match.index !== 0)
	  return '';

	var string = match[0];

	this.tail = this.tail.substring(string.length);
	this.pos += string.length;

	return string;
};

Scanner.prototype.scanUntil = function (re) {
	var index = this.tail.search(re), match;

	switch (index) {
		case -1:
			match = this.tail;
			this.tail = "";
			break;

		case 0:
			match = "";
			break;

		default:
		  	match = this.tail.substring(0, index);
		  	this.tail = this.tail.substring(index);
	}

	this.pos += match.length;

	return match;
};

function isFunction(object) {
	return typeof object === 'function';
}

function isWhitespace(string) {
	return ! RegExp.prototype.test.call(ReqularExpression.nonSpace, string);
}

function isVariable(string) {
	return RegExp.prototype.test.call(ReqularExpression.variable, string);
}

function getVariable(string) {
	var index = string.search(/\$/);
	if ( index > -1 ) {
		return string.substring(index+1);
	}
	return string;
}

function escapeRegExp(string) {
	return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return EscapeStrings[s];
	});
}

function nestTokens(tokens) {
	var nestedTokens = [];
	var collector = nestedTokens;
	var sections = [];
	var token, section;

	for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		switch (token.type) {
			case 'loop':
			case 'if':
				collector.push(token);
				sections.push(token);
				collector = token.data = [];
				break;

			case '/':
				section = sections.pop();

				if ( section ) {
					section.offset = token.start;
					collector = sections.length > 0 ? sections[sections.length - 1].data : nestedTokens;
				}
				break;

			default:
				collector.push(token);
		}
	}

	return nestedTokens;
}

function squashTokens(tokens) {
	var squashedTokens = [];
	var token, lastToken;

	for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		if (token) {
			if (token.type === 'text' && lastToken && lastToken.type === 'text') {
				lastToken.value += token.value;
				lastToken.end = token.end;
			} else {
				squashedTokens.push(token);
				lastToken = token;
			}
		}
	}

	return squashedTokens;
}

UI.register("Template", TemplateManager );

})(window);
(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Responder = Class.Responder,

UIPluginDragDelegate = function UIPluginDragDelegate() {
	return {
		didStartDrag: 	false,
		didDrag:		false,
		didEndDrag:		false
	};
},

UIPluginDrag = Class({
	name: "UIPluginDrag",
	parent: Responder,
	constructor: function() {
	
		var _instance, _info, _delegate, _delegateCan;
		
		_info = {
			element: undefined,
			eventHandler: undefined,
			
			interaction: {
				hasTouch: ('ontouchstart' in window) ? true : false,
				startTime: 0,
				beginPoint: {x:0, y:0},
				currentPoint: {x:0, y:0},
				dragOffset: {x:0, y:0},
				dragging: false,
				startInteraction: false,
				globalUp: false,
				globalMove: false
			}
		};
		
		_delegate = undefined;
		_delegateCan = new UIPluginDragDelegate();
		
		return {
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						//console.log( e, e.originalEvent );
					
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
		
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_info.interaction.startTime = this._timeStamp();		
				_info.interaction.beginPoint.x = _info.interaction.currentPoint.x = event.pageX;
				_info.interaction.beginPoint.y = _info.interaction.currentPoint.y = event.pageY;
				
				_info.interaction.clickable = true;
				_info.interaction.startInteraction = true;
				_info.interaction.dragOffset.x = 0;
				_info.interaction.dragOffset.y = 0;
				_info.interaction.globalUp = true;
				
				document.body.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, false);
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
			
				if ( _info.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_info.interaction.currentPoint.x, y:_info.interaction.currentPoint.y};
					
					if ( _info.interaction.dragging == false ) {
						if ( _delegateCan.didStartDrag ) {
							_delegate.didStartDrag( this );
						}
						
						this.dispatchEvent( "startDragging", this );
					}
					
					_info.interaction.clickable = false;
					_info.interaction.dragging = true;
					_info.interaction.currentPoint.x = event.pageX;
					_info.interaction.currentPoint.y = event.pageY;
					
					if ( _info.interaction.dragging == true ) {
						moveX = point.x - wasPoint.x;
						moveY = point.y - wasPoint.y;
						
						_info.interaction.dragOffset.x += moveX;
						_info.interaction.dragOffset.y += moveY;
						
						if ( _info.interaction.globalMove == false ) {
							_info.interaction.globalMove = true;
							document.body.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
						}
						
						if ( _delegateCan.didDrag ) {
							_delegate.didDrag( this, moveX, moveY );
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _info.interaction.globalMove === true ) {
					_info.interaction.globalMove = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
				}
				
				if ( _info.interaction.globalUp === true ) {
					_info.interaction.globalUp = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, false);
				}
			
				if ( _info.interaction.startInteraction ) {
					var duration, point, wasPoint, moveX, moveY, event = this._event(e);
					duration = (event.timeStamp || this._timeStamp()) - _info.interaction.startTime;
					
					if ( _info.interaction.dragging == true ) {
						_info.interaction.dragging = false;
						
						if ( _delegateCan.didEndDrag ) {
							_delegate.didEndDrag( this );
						}
						
						this.dispatchEvent( "endDragging", this, duration, leave );
					}
					
					_info.interaction.startInteraction = false;
				}
				
				return true;	
			},

		
			_eventHandler: function(e) {
				var result = true;
				
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = this._start( e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = this._move( e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = this._end( e, ( e.type === "mouseleave" ) );
					break;
				}
				
				return result;	
			},
			
			delegate: function( delegate ) {
				if ( delegate === undefined ) {
					return;
				}
			
				_delegate = delegate;
				
				_delegateCan.didStartDrag	= (typeof _delegate.didStartDrag === "function" );
				_delegateCan.didDrag		= (typeof _delegate.didDrag === "function" );
				_delegateCan.didEndDrag		= (typeof _delegate.didEndDrag === "function" );
			},
			
			setupElements: function() {
				this.delegate( _instance );
			},
			
			setupEvents: function() {
				_info.element = _instance.element();
				_info.eventHandler = this.context(this._eventHandler, this);
			
				_instance.addEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _info.eventHandler, true);
				_instance.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
				_instance.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, true);
				
				if ( _info.interaction.hasTouch ) {
					_instance.addEventListener("touchcancel", _info.eventHandler, true);
				}
				else {
					$(_info.element).bind("mousewheel", _info.eventHandler );
					$(document).bind("mouseleave", _info.eventHandler );
				}
			},
			
			destroy: function() {
				
				_instance.removeEventListener("mousedown", _info.eventHandler, true);
				_instance.removeEventListener("mousemove", _info.eventHandler, true);
				_instance.removeEventListener("mouseup", _info.eventHandler, true);
				
				_instance.removeEventListener("touchstart", _info.eventHandler, true);
				_instance.removeEventListener("touchmove", _info.eventHandler, true);
				_instance.removeEventListener("touchend", _info.eventHandler, true);
				_instance.removeEventListener("touchcancel", _info.eventHandler, true);
				
				document.body.removeEventListener("mouseup", _info.eventHandler, false);
				document.body.removeEventListener("touchend", _info.eventHandler, false);
				
				$(_info.element).unbind("mousewheel");
				$(document).unbind("touchstart" );
				$(document).unbind("mouseleave" );
				
				this._super("destroy", arguments);
			},
		
			init: function( instance ) {
				var self = this._super("init", arguments);
				if (self) {
					_instance = instance;
				
					this.setupElements();
					this.setupEvents();
					
					return this;
				}
			}
		}
	}
});

})(window);
/*! UIKit - 1.0.0.0 */

(function(window, undefined) {

'use strict';

var 

UIKitVersion = "1.0.0.0",

Class = UI.Class,
Core = UI.Core,
Helper = UI.Helper,
Element = Class.Element,
Tween = Class.Tween,

UISetting = (function UISetting( _setting ) {
var 
	_defaultOptions = _setting.defaultOptions || {}, // 기본 옵션값 정의
	_surrogateKeys = _setting.surrogateKeys || {}, // 대체키 정의
	_enumsKeys = _setting.enumsKeys || {}, // Enums 정의
	_property = _setting.property || {}; // Property 정의

	return {
		createProperties: function( context, prototype ) {

			var properties = {};

			for ( var method in _property ) {
				(function( method ) {
					var defaultValue = _property[method];
					var getter = "get" + Helper.String.ucfirst( method );
					var setter = "set" + Helper.String.ucfirst( method );
					var methodKey = "@" + method;

					context[methodKey] = defaultValue;

					prototype[getter] = function() {
						return context[methodKey];
					};

					prototype[setter] = function( value ) {
						if ( value == undefined || typeof context[methodKey] !== typeof value ) {
							console.warn( "ignore properties - method = " + value );
							return;
						}

						context[methodKey] = value;
					};
				})(method);
			}

			return properties;
		},

		convertOptions: function( userOptions ) {
			var dataOptions, surrogateKeys, defaultOptions = Helper.Object.clone( _defaultOptions );

			var getDataOption = function( options ) {
				if ( typeof options === 'object' ) {
					Helper.Object.each( options, function( key, value ) {
						var lowerCaseKey = key.toLowerCase();

						options[lowerCaseKey] = getDataOption(value);
					});
				}

				return options;
			};

			dataOptions = getDataOption( userOptions );
			surrogateKeys = getDataOption( _surrogateKeys );

			Helper.Object.each( defaultOptions, function( key, value ) {
				var originalKey, lowerCaseKey;
				lowerCaseKey = key.toLowerCase();
				
				if ( typeof surrogateKeys[lowerCaseKey] !== "undefined" ) {
					originalKey = surrogateKeys[lowerCaseKey]; // convert original key
					
					if ( defaultOptions[originalKey] === undefined ) {
						defaultOptions[originalKey] = dataOptions[lowerCaseKey];
					}
				}
				
				if ( typeof dataOptions === 'object' && typeof dataOptions[lowerCaseKey] !== "undefined" ) {

					if ( typeof defaultOptions[key] !== 'undefined' ) {

						var subDefaultOptions = defaultOptions[key];
						var subUserOptions = dataOptions[lowerCaseKey];

						if ( Helper.Array.isArray( subDefaultOptions ) ) {
							defaultOptions[key] = subUserOptions;
						}
						else if ( typeof subDefaultOptions === "object" ) {

							for ( var subKey in subDefaultOptions ) {
								var subLowerCaseKey = subKey.toLowerCase();

								if ( subUserOptions[subLowerCaseKey] ) {
									subDefaultOptions[subKey] = subUserOptions[subLowerCaseKey];
								}
							}

							defaultOptions[key] = subDefaultOptions;
						}
						else {

							defaultOptions[key] = dataOptions[lowerCaseKey];
						}
					}
				}
			});

			Helper.Object.each( userOptions, function( key, value ) {
				if ( typeof value !== 'undefined' && typeof defaultOptions[key] === 'undefined' ) {
					//defaultOptions[key] = value;
				}
			});

			return defaultOptions;
		}
	};
}),

UICore = Class({
	name:"UICore",
	parent:Element,
	constructor: function() {

		var _coreData = {
				options: {}, 
				properties: {},
				jqueryElement: []
			};
		
		var constructor = {
			__loadSettings: function( element, options ) {
				
				if ( this.__class._setting ) {
					if ( this.__parent._setting ) {
						this.__class._setting = Helper.Object.extend( this.__class._setting, this.__parent._setting );
					}

					var coreSetting = new UISetting( this.__class._setting );

					_coreData.properties = coreSetting.createProperties( this, this.__class.prototype );
					_coreData.options = coreSetting.convertOptions( options );
				}
				else if ( this.__parent._setting ) {
					var coreSetting = new UISetting( this.__parent._setting );

					_coreData.properties = coreSetting.createProperties( this, this.__parent.prototype );
					_coreData.options = coreSetting.convertOptions( options );
				}
			},

			__loadJqueryElement: function( element ) {
				if ( this.__isElement(element) ) {
					var $element = $(element);
					_coreData.jqueryElement = $element;

					var className = this.constructor.prototype.__name;
					var subName = className.substr(2);
					//var cssClassName = "ui-" + subName.toLowerCase();
					//$element.addClass(cssClassName);
				}
			},

			init: function( element ) {
				var self = this._super("init", arguments);

				if (self) {
					this.__loadSettings.apply( this, arguments );
					this.__loadJqueryElement( element );
					
					return this;
				}
			},

			_properties: function( key ) {
				if ( arguments.length > 0 ) {
					var keyComponents = [];
					if ( key.indexOf('.') !== -1 ) {
						keyComponents = key.split('.');
					}
					else {
						keyComponents.push( key );
					}

					var targetProperties = _coreData.properties;
					var propertyName = keyComponents.pop();

					while( keyComponents.length > 0 ) {
						var keyComponent = keyComponents.shift();

						if ( targetProperties[keyComponent] == undefined ) {
							targetProperties = undefined;
							break;
						}

						targetProperties = targetProperties[keyComponent];
					}

					return targetProperties && propertyName ? targetProperties[propertyName] : undefined;
				}

				return _coreData.properties;
			},

			_options: function( key ) {
				if ( arguments.length > 0 ) {
					var keyComponents = [];
					if ( key.indexOf('.') !== -1 ) {
						keyComponents = key.split('.');
					}
					else {
						keyComponents.push( key );
					}

					var targetOptions = _coreData.options;
					var optionName = keyComponents.pop();

					while( keyComponents.length > 0 ) {
						var keyComponent = keyComponents.shift();

						if ( targetOptions[keyComponent] == undefined ) {
							targetOptions = undefined;
							break;
						}

						targetOptions = targetOptions[keyComponent];
					}

					return targetOptions && optionName ? targetOptions[optionName] : undefined;
				}

				return _coreData.options;
			}
		};

		return constructor;
	}
}),

UIKit = Class({
	'name':"UIKit",
	'parent':UICore,
	'static': {
		version: UIKitVersion,
		cssPrefix: (function() {
			if ( typeof window["__UIKIT_CSS_PREFIX__"] === 'string' ) {
				return window["__UIKIT_CSS_PREFIX__"];
			}
			return "m-";
		})(window),

		apply: function( $elements, callback ) {
			var instances = {};

			if ( $elements["jquery"] == undefined || $elements.length < 1 ) {
				return;
			}

			$.each( $elements, function( index, element ) {
				var $element = $(element);

				// 중복실행 방지
				if ( $element.attr( "data-instance-id" ) ) {
					return ;
				}

				var instance = $element.instance(),
					tagName = $element.prop("tagName").toUpperCase();

				if ( ! instance && $element.attr( "data-instance" ) ) {
					var 
					className = $element.attr("data-instance"),
					id = $element.attr("id"),
					attributes = $element[0].attributes,
					options = {};

					Helper.Object.each(attributes, function( indexKey, attribute ) {
						if ( ! isNaN( parseInt(indexKey) ) ) {
							if ( attribute.name.indexOf( "data" ) === 0 ) {
								
								var nameComponents = attribute.name.split("-");
								nameComponents.shift();

								var value = attribute.value;

								if ( typeof value === "string" ) {
									try {
										value = value === "true" ? true :
												value === "false" ? false :
												value === "null" ? null :
												// Only convert to a number if it doesn't change the string
												+value + "" === value ? +value :
												/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/.test( value ) ? JSON.parse( value ) :
												value;
									} catch( e ) {}
								} 
								else {
									value = undefined;
								}

								var lastKey = nameComponents.shift();

								if ( nameComponents.length > 0 ) {
									if ( options[lastKey] == undefined ) {
										options[lastKey] = {};
									}

									var subOptions = options[lastKey];
									var key = nameComponents.pop();
									subOptions[key] = value;

									options[lastKey] = subOptions;
								}
								else {
									options[lastKey] = value;
								}
							}
						}
					});

					// Instance 생성
					if ( className ) {
						instance = $element.instance(className, options);
					}
				}

				if ( instance ) {
					if ( ! instances[tagName] ) {
						instances[tagName] = [];
					}

					instances[tagName][instances[tagName].length] = instance;
		
					if ( typeof id == "string" && id.length > 0 ) {
						instances["#"+id] = instance;
					}
				}
				
				if ( callback ) {
					callback.call(null, index, instance );
				}
			});

			return instances;
		},

		update: function( $id, callback ) {
			if ( $id == undefined ) {
				$id = $(document.body);
			}
			else if ( $id["jquery"] == undefined || $id.length < 1 ) {
				return;
			}

			var $elements = $.merge( $id.filter("[data-instance]"), $id.find("[data-instance]") );

			UIKit.apply( $elements, callback );
		}
	},
	'constructor': {}
});

window.UIKit = UIKit; 

// jQuery Instance Plugin
if ( window.jQuery !== undefined ) {
	jQuery.fn.instance = function( constructor/*, ...args */ ) {
		var args = Array.prototype.slice.call( arguments, 0 ),
			manager = UI.manager;

		// 개체가 1개인 경우
		if ( this.length === 1 ) {
			var instance, item = this.get(0);
			args.unshift( [item] );
			instance = manager.get.apply( manager, args );
			return instance;
		}

		// 개체가 여러개인 경우, jQuery 배열로 return
		var instances, items = [];
		this.each( function(idx, element) {
			items.push(element);
		});
		args.unshift( items );
		instances = manager.get.apply( manager, args );
		return $(instances);
	};
	
	jQuery.instance = UI.manager;

	$(function() {
		UIKit.apply( $("[data-instance]") );
	});
}

})(window);


(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
UICore = Class.UICore,

UIGraph = Class({
	name: "UIGraph",
	parent: UICore,
	constructor: function(  ) {
		
		var _canvas, _context;
		
		return {
			_createCanvas: function() {
				var canvas, elements = this.element().getElementsByTagName('canvas');
				if ( elements.length > 0 ) {
					canvas = elements[0];
				}
				
				if ( canvas == undefined ) {
					canvas = document.createElement("canvas");
				}
				
				var size = this.size();
				canvas.setAttribute( "width", size.width * 2);
				canvas.setAttribute( "height", size.height * 2);
				
				$(canvas).css({
					width: size.width,
					height: size.height
				});
				
				canvas.imageSmoothingEnabled= true;
				
				return canvas;
			},
			
			canvasSize: function() {
				return {
					width: _canvas.width,
					height: _canvas.height
				};
			},
		
			canvas: function() {
				return _canvas;	
			},
			
			context: function() {
				return _context;	
			},
		
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					_canvas = this._createCanvas();
					_context = _canvas.getContext("2d");
					
					if ( ! this.element().contains( _canvas ) ) {					
						this.element().appendChild(_canvas);
					}
					
					_context.clearRect(0, 0, _canvas.width, _canvas.height);
					
					return this;
				};
			},
			
			clear: function() {
				_context.clearRect(0, 0, _canvas.width, _canvas.height);
			},
			
			drawRect: function() {
				
			}
		}
	}
}),

UIGraphLine = Class({
	name: "UIGraphLine",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, 
			config = {
				scaleLineColor: "rgba(0,0,0,.05)",
				scaleLineWidth: 2,
				scaleFontStyle: "normal",
				scaleFontSize: 32,
				scaleFontFamily: "'Arial'",
				scaleFontColor: "rgba(0,0,0,.5)",
				bezierCurve: true,
				strokeWidth: 4,
				pointSize: 8,
				pointStrokeWidth: 4,
				margin: {
					top: 20,
					right: 30,
					bottom: 50,
					left: 60
				},
				scaleStepCount: 20
			}, 
			stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var xHop = Math.ceil(range.size.width/(data.length-1));
			
				for ( var i=0; i<data.length; i++ ) {
					var segment = {
						cx:(i==0) ? range.min.x : range.min.x + xHop * (i-0.5), 
						cy:(i==0) ? range.min.y : range.min.y + range.size.height - range.size.height * ((data[i-1]-range.minValue)/(range.maxValue-range.minValue)),
						x:range.min.x + (i*xHop),
						y:range.min.y + range.size.height - range.size.height * ((data[i]-range.minValue)/(range.maxValue-range.minValue))
					};
				
					segments.push( segment );
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				var yHop = range.size.height/(stepLabels.length-1);
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data );
					var lineColor, lineWidth, bezierCurve, fillColor, pointSize, pointColor;
					var valueHop = Math.ceil((range.size.width)/(segments.length-1));
					
					lineColor = dataset.strokeColor;
					lineWidth = config.strokeWidth;
					bezierCurve = config.bezierCurve;
					fillColor = dataset.fillColor;
					pointSize = config.pointSize;
					pointColor = dataset.pointColor;
					
					ctx.beginPath();
					
					segment = segments[0];
					ctx.moveTo(segment.x, segment.y);
					ctx.stroke();
					
					for (var j=1; j<segments.length; j++) {
						segment = segments[j];
						
						ctx.strokeStyle = lineColor;
						ctx.lineWidth = lineWidth;
						
						if ( bezierCurve === true ) {
							ctx.bezierCurveTo(segment.cx, segment.cy, segment.cx, segment.y, segment.x, segment.y);
						}
						else {
							ctx.lineTo(segment.x, segment.y);
						}
						
						ctx.stroke();
					}
					
					if ( fillColor !== undefined ) {
						ctx.lineTo(segment.x, range.max.y);
						ctx.lineTo(range.min.x, range.max.y);
						ctx.closePath();
					
						ctx.fillStyle = fillColor;
						ctx.fill();
					}
					else {
						ctx.closePath();
					}
						
					ctx.fillStyle = pointColor;
					ctx.strokeStyle = "rgba(255,255,255,1)";
					ctx.lineWidth = config.pointStrokeWidth;
					
					for (var j=0; j<segments.length; j++) {
						segment = segments[j];
						
						ctx.beginPath();
						ctx.arc(segment.x, segment.y, pointSize, 0, Math.PI*2, false);
						ctx.fill();
						ctx.stroke();
					}
					
					ctx.closePath();
				}
			},
			
			drawScale: function() {
				var size = this.canvasSize();
				var ctx = this.context();
				var xHop = Math.ceil(range.size.width/(graphData.labels.length-1));
				var yHop = range.size.height/(stepLabels.length-1);
				
				//X axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "center";
				
				for (var i=0; i<graphData.labels.length; i++) {
				
					ctx.fillText(graphData.labels[i], range.min.x + i*xHop, range.max.y + config.margin.bottom - 8);
	
					ctx.beginPath();
					ctx.moveTo(range.min.x + i*xHop, range.min.y);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.min.x + i*xHop, range.max.y + 8);
					ctx.stroke();
					
				}
				
				//Y axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				
				for (var j=0; j<stepLabels.length; j++) {
				
					if ( j < stepLabels.length) {
						ctx.fillText(stepLabels[j], range.min.x - (config.pointSize+5), range.max.y-j*yHop);
					}
					
					ctx.beginPath();
					ctx.moveTo(range.min.x - 8, range.max.y-j*yHop);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.max.x, range.max.y-j*yHop);
					ctx.stroke();
				}
				
				ctx.closePath();
			},
			
			calculate: function() {
				var size = this.canvasSize();
				var minValue = 0;
				var maxValue = 100;
				
				if ( graphData.range !== undefined && graphData.range.minValue !== undefined ) {
					minValue = graphData.range.minValue;
				}
				else {
					for (var i=0; i<graphData.datasets.length; i++) {
						var dataset = graphData.datasets[i];
						minValue = Math.min( Math.min.apply( dataset.data, dataset.data ), minValue );
					}
					
					minValue = Math.floor( minValue / config.scaleStepCount ) * config.scaleStepCount;
					minValue = Math.floor(minValue * 0.01) * 100;
				}
				
				if ( graphData.range !== undefined && graphData.range.maxValue !== undefined ) {
					maxValue = graphData.range.maxValue;
				}
				else {
					for (var i=0; i<graphData.datasets.length; i++) {
						var dataset = graphData.datasets[i];
						maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
					}
					
					maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
					maxValue = Math.ceil(maxValue * 0.01) * 100;
				}
				
				range = {
					min: {
						x: config.margin.left,
						y: config.margin.top,
					},
					max: {
						x: size.width - config.margin.right,
						y: size.height - config.margin.bottom
					},
					size: {
						width: size.width - config.margin.left - config.margin.right,
						height: size.height - config.margin.bottom - config.margin.top
					},
					
					minValue: minValue,
					maxValue: maxValue
				};
				
				var scaleStepHop = (maxValue-minValue) / config.scaleStepCount;
				
				stepLabels = [];
				
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = Math.ceil(minValue + i*scaleStepHop);
				}
			},
		
			init: function(  element, data  ) {
				var self = this._super("init", arguments );
				if ( self ) {
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphBar = Class({
	name: "UIGraphBar",
	parent: UIGraph,
	constructor: function() {
	
		var graphData, range, 
			config = {
				scaleLineColor: "rgba(0,0,0,.05)",
				scaleLineWidth: 2,
				scaleFontFamily: "'Arial'",
				scaleFontStyle: "normal",
				scaleFontSize: 32,
				scaleFontColor: "rgba(0,0,0,.5)",
				strokeWidth : 2,
				pointSize: 8,
				pointStrokeWidth: 4,
				margin: {
					top: 20,
					right: 30,
					bottom: 50,
					left: 60
				},
				scaleStepCount: 10
			},
			stepLabels = [];
		
		return {
			calculateSegments: function( data, dataIndex ) {
				var segments = [];
				var size = this.canvasSize();
				var xHop = Math.ceil(range.size.width/(data.length));
				var barWidth = Math.ceil(((xHop-config.scaleLineWidth*2)*0.8-((config.strokeWidth*2+4)*graphData.datasets.length)) / graphData.datasets.length);
				var barHop = (xHop - (barWidth*graphData.datasets.length)) / graphData.datasets.length;
				
				for ( var i=0; i<data.length; i++ ) {
					var segment = [
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex,
							y:range.max.y
						},
					
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex,
							y:range.max.y - range.size.height * (data[i]/range.maxValue)
						},
							
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex + barWidth,
							y:range.max.y - range.size.height * (data[i]/range.maxValue)
						},
					
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex + barWidth,
							y:range.max.y
						}
					];
				
					segments.push(segment);
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data, i );
					var strokeColor, lineWidth, fillStyle;
					
					strokeColor = dataset.strokeColor;
					lineWidth = config.strokeWidth;
					fillStyle = dataset.fillColor;
					
					for (var j=0; j<segments.length; j++) {
						ctx.beginPath();
						
						segment = segments[j][0];
						ctx.moveTo(segment.x, segment.y);
						
						for ( var k=1; k<segments[j].length; k++ ) {
							segment = segments[j][k];
							ctx.lineTo(segment.x, segment.y);
						}
						
						if ( strokeColor ){
							ctx.strokeStyle = strokeColor;
							ctx.lineWidth = lineWidth;
							ctx.stroke();
						}
						
						ctx.fillStyle = fillStyle;
						ctx.closePath();
						ctx.fill();
					}
				}	
			},
			
			drawScale: function() {
				var size = this.canvasSize();
				var ctx = this.context();
				
				//X axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "center";
				
				var xHop = Math.ceil(range.size.width/(graphData.labels.length));
				for (var i=0; i<=graphData.labels.length; i++) {
				
					if ( i < graphData.labels.length ) {
						ctx.fillText(graphData.labels[i], range.min.x + i*xHop + xHop*0.5, range.max.y + config.margin.bottom - 8);
					}
	
					ctx.beginPath();
					ctx.moveTo(range.min.x + i*xHop, range.min.y);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.min.x + i*xHop, range.max.y+8);
					
					ctx.stroke();
					
				}
				
				//Y axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				
				var yHop = range.size.height/(stepLabels.length-1);
				for (var j=0; j<stepLabels.length; j++) {
				
					if ( j > 0 ) {
						ctx.fillText(stepLabels[j], range.min.x - (config.pointSize+5), range.max.y-j*yHop);
					}
					
					ctx.beginPath();
					ctx.moveTo(range.min.x-8, range.max.y-j*yHop);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.max.x, range.max.y-j*yHop);
					ctx.stroke();
				}
				
				ctx.closePath();
			},
			
			calculate: function() {
				var size = this.canvasSize();
				var maxValue = 100;
					
				for (var i=0; i<graphData.datasets.length; i++) {
					var dataset = graphData.datasets[i];
					maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
			
				range = {
					min: {
						x: config.margin.left,
						y: config.margin.top,
					},
					max: {
						x: size.width - config.margin.right,
						y: size.height - config.margin.bottom
					},
					size: {
						width: size.width - config.margin.left - config.margin.right,
						height: size.height - config.margin.bottom - config.margin.top
					},
					maxValue: maxValue
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphPie = Class({
	name: "UIGraphPie",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, config = {
			strokeWidth : 4
		};
		
		return {
			calculateSegments: function( data ) {
				var segments = [];
				var size = this.canvasSize();
				var totalValue, cumulativeAngle;
				
				totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i].value;
				}
				
				cumulativeAngle = -Math.PI/2;
			
				for ( var i=0; i<data.length; i++ ) {
					var segmentAngle = (data[i].value/totalValue) * (Math.PI*2);
					var segmentStrokeWidth = config.strokeWidth;
					var segmentStrokeColor = "rgba(255,255,255,1)";
					
					segments.push({
						x: size.width * 0.5,
						y: size.height * 0.5,
						cumulativeAngle: cumulativeAngle,
						segmentAngle: segmentAngle,
						segmentStrokeWidth: segmentStrokeWidth,
						segmentStrokeColor: segmentStrokeColor,
						fillColor: data[i].color
					});
					
					cumulativeAngle += segmentAngle;
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				var dataset = graphData;
				var size = this.canvasSize();
				var segments = this.calculateSegments( dataset.data );
				var segment, pieRadius, fillStyle;
				
				pieRadius = Math.min(size.height*0.5, size.width*0.5) - 5;
				
				for (var i=0; i<segments.length; i++) {
					segment = segments[i];
					
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, pieRadius, segment.cumulativeAngle, segment.cumulativeAngle + segment.segmentAngle);
					ctx.lineTo(segment.x, segment.y);
					ctx.closePath();
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					if (segment.segmentStrokeWidth){
						ctx.lineWidth = segment.segmentStrokeWidth;
						ctx.strokeStyle = segment.segmentStrokeColor;
						ctx.stroke();
					}
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphRadar = Class({
	name: "UIGraphRadar",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, config = {
			strokeWidth : 2,
			pointSize: 8,
			scaleFontFamily: "'Arial'",
			scaleFontStyle: "normal",
			scaleFontSize: 24,
			scaleFontColor: "rgba(0,0,0,.5)",
			scaleLineColor: "rgba(0,0,0,.05)",
			scaleLineWidth: 2,
			scaleBackgroundColor: "rgba(255,255,255,1)",
			pointLabelFontFamily: "'Arial'",
			pointLabelFontStyle: "normal",
			pointLabelFontColor: "rgba(0,0,0,.5)",
			pointLabelFontSize: 32,
			angleShowLineOut: true,
			angleLineColor: "rgba(0,0,0,.1)",
			angleLineWidth: 1,
			scaleStepCount: 10,
			paddingSize: {
				width: 310,
				height: 310
			}
		},
		stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i];
				}
			
				for ( var i=0; i<data.length; i++ ) {
					
					segments.push({
						x: 0,
						y: (range.size.width*0.5) * (data[i]/100)*-1
					});
				}
				
				return segments;
			},
			
			drawScale: function() {
				var ctx = this.context();
				
				ctx.save();
			    ctx.translate(range.center.x, range.center.y);
				
				if (config.angleShowLineOut){
					ctx.strokeStyle = config.angleLineColor;		    	    
					ctx.lineWidth = config.angleLineWidth;
					for (var h=0; h<range.count; h++){
					    ctx.rotate(range.rotationDegree);
						ctx.beginPath();
						ctx.moveTo(0,0);
						ctx.lineTo(0,-range.maxSize);
						ctx.stroke();
					}
				}
				
				var scaleHop = range.maxSize/config.scaleStepCount;
				
				for (var i=0; i<config.scaleStepCount; i++){
					ctx.beginPath();
					
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.moveTo(0,-scaleHop * (i+1));					
					
					for (var j=0; j<range.count; j++){
					    ctx.rotate(range.rotationDegree);
						ctx.lineTo(0,-scaleHop * (i+1));
					}
					
					ctx.closePath();
					ctx.stroke();
					
					ctx.textAlign = 'center';
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily; 
					ctx.textBaseline = "middle";
					
					var textWidth = ctx.measureText(stepLabels[i+1]).width;
					ctx.fillStyle = config.scaleBackgroundColor;
					ctx.beginPath();
					ctx.rect(
						Math.round(- textWidth/2 - 2),     //X
						Math.round((-scaleHop * (i+1)) - config.scaleFontSize*0.5 - 2),//Y
						Math.round(textWidth + (2*2)), //Width
						Math.round(config.scaleFontSize + (2*2)) //Height
					);
					ctx.fill();
								
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(stepLabels[i+1],0,-scaleHop*(i+1));
				}
				
				for (var k=0; k<graphData.labels.length; k++){				
					ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
					ctx.fillStyle = config.pointLabelFontColor;
					
					var opposite = Math.sin(range.rotationDegree*k) * (range.maxSize + config.pointLabelFontSize);
					var adjacent = Math.cos(range.rotationDegree*k) * (range.maxSize + config.pointLabelFontSize);
					
					if(range.rotationDegree*k == Math.PI || range.rotationDegree*k == 0){
						ctx.textAlign = "center";
						adjacent = adjacent + config.scaleFontSize;
					}
					else if(range.rotationDegree*k > Math.PI){
						ctx.textAlign = "right";
					}
					else{
						ctx.textAlign = "left";
					}
					
					ctx.textBaseline = "middle";
					
					ctx.fillText(graphData.labels[k], opposite, -adjacent);
					
				}
				
				ctx.restore();
			},
		
			drawRect: function() {
				var ctx = this.context();
				var size = this.canvasSize();
				
				ctx.translate(range.center.x, range.center.y);
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data );
					
					ctx.save();
					
					ctx.beginPath();
					
					segment = segments[0];
					//ctx.rotate(rotationDegree);
					ctx.moveTo(0,segment.y);
					
					//We accept multiple data sets for radar charts, so show loop through each set
					for (var j=1; j<segments.length; j++){
						segment = segments[j];
						
						ctx.rotate(range.rotationDegree);
						ctx.lineTo(0, segment.y);
					}
					
					ctx.closePath();
					
					ctx.fillStyle = dataset.fillColor;
					ctx.strokeStyle = dataset.strokeColor;
					ctx.lineWidth = config.strokeWidth;
					
					ctx.fill();
					ctx.stroke();
					
					ctx.fillStyle = dataset.strokeColor;
					ctx.strokeStyle = "rgba(255,255,255,1)";
					ctx.lineWidth = 4;
					
					for (var j=0; j<segments.length; j++){
						segment = segments[j];
						
						ctx.rotate(range.rotationDegree);
						ctx.beginPath();
						ctx.arc(0, segment.y, config.pointSize, 2*Math.PI, false);
						ctx.fill();
						ctx.stroke();
					}
					
					ctx.closePath();
					
					ctx.rotate(range.rotationDegree);
					
					ctx.restore();
				}
			},
			
			calculate: function() {
				var size = this.canvasSize();
				
				size.width = size.width - config.paddingSize.width;
				size.height = size.height - config.paddingSize.height;
				
				var maxValue = 100;
				var maxCount = 0;
				var maxSize = 0;
				var rotationDegree;
					
				for (var i=0; i<graphData.datasets.length; i++) {
					var dataset = graphData.datasets[i];
					maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
					maxCount = Math.max( maxCount, dataset.data.length );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
				maxSize = (Math.min(size.width,size.height)*0.5);
				rotationDegree = (2*Math.PI)/maxCount;
			
				range = {
					center: {
						x: size.width*0.5+config.paddingSize.width*0.5,
						y: size.height*0.5+config.paddingSize.height*0.5,
					},
					size: {
						width: size.width,
						height: size.height
					},
					rotationDegree: rotationDegree,
					count: maxCount,
					maxValue: maxValue,
					maxSize: maxSize
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphDoughnut = Class({
	name: "UIGraphDoughnut",
	parent: UIGraph,
	constructor: function() {
	
		var graphData, config = {
			strokeWidth : 4,
			percentageInnerCutout : 50
		};
		
		return {
			calculateSegments: function( data ) {
				var segments = [];
				var size = this.canvasSize();
				var totalValue, cumulativeAngle;
				
				totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i].value;
				}
				
				cumulativeAngle = -Math.PI/2;
			
				for ( var i=0; i<data.length; i++ ) {
					var segmentAngle = (data[i].value/totalValue) * (Math.PI*2);
					var segmentStrokeWidth = config.strokeWidth;
					var segmentStrokeColor = "rgba(255,255,255,1)";
					
					segments.push({
						x: size.width * 0.5,
						y: size.height * 0.5,
						cumulativeAngle: cumulativeAngle,
						segmentAngle: segmentAngle,
						segmentStrokeWidth: segmentStrokeWidth,
						segmentStrokeColor: segmentStrokeColor,
						fillColor: data[i].color
					});
					
					cumulativeAngle += segmentAngle;
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				var dataset = graphData;
				var size = this.canvasSize();
				var segments = this.calculateSegments( dataset.data );
				var segment, cutoutRadius, doughnutRadius, fillStyle;
				
				doughnutRadius = Math.min(size.height*0.5, size.width*0.5) - 5;
				cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);
				
				for (var i=0; i<segments.length; i++) {
					segment = segments[i];
					
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, doughnutRadius, segment.cumulativeAngle, segment.cumulativeAngle + segment.segmentAngle, false);
					ctx.arc(segment.x, segment.y, cutoutRadius, segment.cumulativeAngle + segment.segmentAngle, segment.cumulativeAngle, true);
					ctx.closePath();
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					if (segment.segmentStrokeWidth){
						ctx.lineWidth = segment.segmentStrokeWidth;
						ctx.strokeStyle = segment.segmentStrokeColor;
						ctx.stroke();
					}
				}
			},
			
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphPolarArea = Class({
	name: "UIGraphPolarArea",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, config = {
			strokeColor: "rgba(255,255,255,1)",
			strokeWidth: 4,
			scaleFontFamily: "'Arial'",
			scaleFontStyle: "normal",
			scaleFontSize: 24,
			scaleFontColor: "rgba(0,0,0,.5)",
			scaleLineColor: "rgba(0,0,0,.05)",
			scaleLineWidth: 2,
			scaleShowLine: true,
			scaleShowLabels: true,
			scaleBackgroundColor: "rgba(255,255,255,0.5)",
			pointLabelFontFamily: "'Arial'",
			pointLabelFontStyle: "normal",
			pointLabelFontColor: "rgba(0,0,0,.5)",
			pointLabelFontSize: 32,
			scaleStepCount: 10,
			paddingSize: {
				width: 100,
				height: 100
			}
		},
		stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var startAngle, radius, angle;
				
				startAngle = -Math.PI/2;
				angle = (Math.PI*2) / data.length;
				
				for ( var i=0; i<data.length; i++ ) {
					radius = data[i].value * (range.size.height/100/2);
					
					segments.push({
						x: range.center.x,
						y: range.center.y,
						radius: radius,
						fromAngle: startAngle,
						toAngle: startAngle + angle,
						fillColor: data[i].color
					});
					
					startAngle += angle;
				}
				
				return segments;
			},
			
			drawScale: function() {
				var ctx = this.context();
				var scaleHop = range.maxSize/config.scaleStepCount;
				
				for (var i=0; i<config.scaleStepCount; i++){
				
					if (config.scaleShowLine){
						ctx.beginPath();
						ctx.arc(range.center.x, range.center.y, scaleHop * (i + 1), 0, (Math.PI * 2), true);
						ctx.strokeStyle = config.scaleLineColor;
						ctx.lineWidth = config.scaleLineWidth;
						ctx.stroke();
					}
	
					if (config.scaleShowLabels){
						ctx.textAlign = "center";
						ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
	 					var label = stepLabels[i+1];
						
						var textWidth = ctx.measureText(label).width;
						ctx.fillStyle = config.scaleBackgroundColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(range.center.x - textWidth/2 - 2),     //X
							Math.round(range.center.y - (scaleHop * (i + 1)) - config.scaleFontSize*0.5 - 2),//Y
							Math.round(textWidth + (2*2)), //Width
							Math.round(config.scaleFontSize + (2*2)) //Height
						);
						ctx.fill();
						
						ctx.textBaseline = "middle";
						ctx.fillStyle = config.scaleFontColor;
						ctx.fillText(label, range.center.x, range.center.y - (scaleHop * (i + 1)));
					}
				}
			},
		
			drawRect: function() {
				var ctx = this.context();
				var size = this.canvasSize();
				
				var segments = this.calculateSegments( graphData.data );
				var maxSize, scaleHop, steps, segment, rotationDegree = (2*Math.PI)/graphData.data.length;
				
				maxSize = Math.min(size.width, size.height) * 0.5;
				steps = config.scaleStepCount;
				scaleHop = maxSize/steps;
				
				for ( var i=0; i<segments.length; i++ ) {
					segment = segments[i];
				
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, segment.radius, segment.fromAngle, segment.toAngle, false);
					ctx.lineTo(segment.x, segment.y);
					ctx.closePath();
					
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					ctx.strokeStyle = config.strokeColor;
					ctx.lineWidth = config.strokeWidth;
					ctx.stroke();
				}
				
			},
			
			calculate: function() {
				var size = this.canvasSize();
				
				size.width = size.width - config.paddingSize.width;
				size.height = size.height - config.paddingSize.height;
				
				var maxValue = 100;
				var maxSize = 0;
					
				for (var i=0; i<graphData.data.length; i++) {
					var data = graphData.data[i];
					maxValue = Math.max( data.value, maxValue );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
				maxSize = (Math.min(size.width,size.height)*0.5);
			
				range = {
					center: {
						x: size.width*0.5+config.paddingSize.width*0.5,
						y: size.height*0.5+config.paddingSize.height*0.5,
					},
					size: {
						width: size.width,
						height: size.height
					},
					count: graphData.data.length,
					maxValue: maxValue,
					maxSize: maxSize
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawRect();
					this.drawScale();
					
					return this;
				};
			}
		}
	}
});


})(window);
(function(window, undefined) {

'use strict';
	
var 
Helper = UI.Helper,
Class = UI.Class,
Element = Class.Element,
Tween = Class.Tween,
UICore = Class.UICore,
cssPrefix = Class.UIKit.cssPrefix,

UIScrollContainer = Class({
	name: "UIScrollContainer",
	parent: Element,
	constructor: function() {
		
		return {
			
		};
	}
}),

UIScrollInfo = function UIScrollInfo( target ) {
	var info = {
		contentInset: {top:0, left:0, right:0, bottom:0},
		contentOffset: {x:0, y:0},
		contentSize: {width:0, height:0},
		frameSize: {width:0, height:0},
		pagingSize: {width:0, height:0}, 
		allowScrollOffset: {minX:0, minY:0, maxX:0, maxY:0},
		
		scrolling: false,
		scrollBounceVertical: false,
		scrollBounceHorizontal: false,
		alwaysScrollBounceVertical : false,
		alwaysScrollBounceHorizontal : false,
		
		usePaging: false,
		
		useScrollBounceVertical: false,
		useScrollBounceHorizontal: false,
		useScrollbar: false,
		useWheelMouse: false,
		useMouseLeave: false,
		useDecelerating: false,
				
		interaction: {
			hasTouch: ('ontouchstart' in window) ? true : false,
			target: target,
			startTime: 0,
			beginPoint: {x:0, y:0},
			currentPoint: {x:0, y:0},
			dragOffset: {x:0, y:0},
			dragging: false,
			startInteraction: false,
			clickable: false,
			globalUp: false,
			globalMove: false,
			wheelTimeout: null
		},

		scrollX: false,
		scrollY: true,
		fadeScrollbars: true
	};
	
	return info;
},

UIScrollBar = Class({
	name: "UIScrollBar",
	parent: UICore,
	constructor: function(  ) {
		var _thumb, _scrollInfo, _orientation;
		_thumb = new Element( "SPAN" );
		var _fadeTimer;
		return {
			init: function(element, orientation) {
				var self = this._super("init", arguments);
				if (self) {
				
					_orientation = ( typeof orientation === "string" && orientation.toLowerCase() === "horizontal" ) ? "horizontal" : "vertical";
					this.__setting();
					this.addClass(cssPrefix+"scrollbar");
					this.addClass(cssPrefix+_orientation);
					_thumb.addClass(cssPrefix+"scrollbar-thumb");
					this.append( _thumb );
					return this;
				}
			},
			
			__setting: function(){
				if ( _orientation === "horizontal" ) {
					this.scroll = this.__scrollHorizontal;
					this.update = this.__updateHorizontal;
				}else if ( _orientation === "vertical" ) {
					this.scroll = this.__scrollVertical;
					this.update = this.__updateVertical;
				}
			},

			__scrollHorizontal: function(to, scrollInfo){

				_scrollInfo = scrollInfo;
				var left = (to / ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width )) * ( _thumb.width() - this.width() ) * -1; 
				left = Math.min( Math.max(left, 0), _scrollInfo.frameSize.width- this.__precision(_thumb.css("width").replace("px", "")) );
				this.thumbCss({
					left: left
				});
			},

			__scrollVertical:function(to, scrollInfo){
				_scrollInfo = scrollInfo;
				var top = (to / ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height )) * ( _thumb.height() - this.height() ) * -1;
				top = Math.min( Math.max(top, 0), _scrollInfo.frameSize.height-this.__precision(_thumb.css("height").replace("px", "")) );
				this.thumbCss({
					top: top
				});
			},

			scroll: function( to, scrollInfo ) {},
			

			__updateHorizontal: function( scrollInfo ){
				_scrollInfo = scrollInfo;

				var left = (_scrollInfo.contentOffset.x / ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width )) * ( _thumb.width() - this.width() ) * -1;
				var ratio = Math.min( Math.max( (_scrollInfo.frameSize.width / _scrollInfo.contentSize.width), 0.1 ), 1 );
				var width = ratio * this.width();
				left = Math.min( Math.max(left, 0), _scrollInfo.frameSize.width-width );

				this.thumbCss({
					opacity: ( ratio === 1 ) ? 0 : 1,
					left: left,
					width: width
				});



				this.__setFadeScrollBar(scrollInfo.fadeScrollbars );
			},

			__updateVertical: function( scrollInfo ){
				_scrollInfo = scrollInfo;
				var top = (_scrollInfo.contentOffset.y / ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height )) * ( _thumb.height() - this.height() ) * -1;
				var ratio = Math.min( Math.max( (_scrollInfo.frameSize.height / _scrollInfo.contentSize.height), 0.1 ), 1 );
				var height = ratio * this.height();
				top = Math.min( Math.max(top, 0), _scrollInfo.frameSize.height-height );
				
				this.thumbCss({
					opacity: ( ratio === 1 ) ? 0 : 1,
					top: top,
					height: height
				});

				this.__setFadeScrollBar(scrollInfo.fadeScrollbars);
			},

			__setFadeScrollBar: function( bool ){
				if(bool==true){
					clearTimeout(_fadeTimer);
					var me = this;
					_fadeTimer = setTimeout(function(){
						me.thumbCss( {opacity: 0} );
					}, 1500 );
				}
			},

			update: function( scrollInfo ) {},
			
			__precision: function(n){
				parseFloat(n).toFixed( Helper.Number.precision(1) );
				return n;
			},

			thumbCss: function( css ) {
				var me = this;
				var obj = {};
				$.each(css, function(key, value){
					if(!isNaN(value)){
						if( key == "left" || key == "top" ){
							value = me.__precision(value);
						}
						obj[key] = value;
					}
				});

				_thumb.css( obj );
			}
		}
	}
}),

/**
 * Scroll 기능을 제공한다.
 * @class Scroll
 */
Scroll = Class({
	name: "Scroll",
	parent: UICore,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					scrollX: false,
					scrollY: true,
					useScrollbar: false,
					flexable: true,
					fadeScrollbars: true,
					useWheelMouse: true,
					useScrollBounceVertical: false,
					useScrollBounceHorizontal: false,
					alwaysScrollBounceVertical: false,
					alwaysScrollBounceHorizontal: false,
					scrolling: function(){},
					dragging: function(){},
					didStartDragging: function(){},
					didEndDragging: function(){},
					didFinishScrollingAnimation: function(){}
				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof Scroll 
	 * @param {Element} element 기준이 되는 DOM Element
	 * @param {Object} options Scroll Options 
	 * @param {Boolean} options.scrollX=false 가로 스크롤을 사용할 것인지 여부
	 * @param {Boolean} options.scrollY=true 세로 스크롤을 사용할 것인지 여부
	 * @param {Boolean} options.useScrollbar=false 스크롤바를 사용하여 화면에 노출할 것인지 여부
	 * @param {Boolean} options.fadeScrollbars=true 스크롤바를 스크롤 중에만 보이게 할 것인지 여부 
	 * @param {Boolean} options.useScrollBounceVertical=false  세로 스크롤의 위치가 끝까지 도달한 뒤에도 터치-드래그 요청이 있을시, bounce효과를 줄 것인지 여부 
	 * @param {Boolean} options.useScrollBounceHorizontal=false 가로 스크롤의 위치가 끝까지 도달한 뒤에도 터치-드래그 요청이 있을시, bounce효과를 줄 것인지 여부 
	 * @param {Boolean} options.alwaysScrollBounceVertical=false useScrollBounceVertical이 값이 true일때 사용할 수 있는 옵션으로, 콘텐츠가 Frame영역보다 작아 세로 스크롤이 생기지 않은 상태에서도 터치-드래그 요청이 있을시 bounce효과를 줄 것인지 여부 
	 * @param {Boolean} options.alwaysScrollBounceHorizontal=false useScrollBounceHorizontal 값이 true일때 사용할 수 있는 옵션으로, 콘텐츠가 Frame영역보다 작아 가로 스크롤이 생기지 않은 상태에서도 터치-드래그 요청이 있을시 bounce효과를 줄 것인지 여부
	 * @param {Function} options.scrolling scrolling되는 시점에 호출할 callback 함수
	 * @param {Function} options.dragging dragging하는 시점에 호출할 callback 함수
	 * @param {Function} options.didStartDragging drag를 시작하는 시점에 호출할 callback 함수
	 * @param {Function} options.didEndDragging drag가 끝나는 시점에 호출할 callback 함수
	 * @param {Function} options.didFinishScrollingAnimation 스크롤 애니메이션이 끝나는 시점에 호출할 callback 함수
	 * @retuns {Scroll} 
	 * @since 1.0.0
	 */
	constructor: function() {
	
		var _delegate, _delegateCan, _flexable, _container, _eventHandler, _scrollVerticalBar, _scrollHorizontalBar, _scrollContainer, _scrollInfo;
		var _options;
		_delegate = undefined;
		_delegateCan = {
			scrolling: false,
			dragging: false,
			didStartDragging: false,
			didEndDragging: false,
			didFinishScrollingAnimation: false
		};
		
		_flexable = {vertical:true, horizontal:true};
		_scrollInfo = new UIScrollInfo();
	
		return {
		
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
			
			_momentum: function (currentPoint, beginPoint, time, position) {
				var 
				deceleration = 0.0006,
				momentumInfo = {
					horizontal: {
						distance: 0,
						speed: 0,
						time: 0,
						decelerating: false
					},
					vertical: {
						distance: 0,
						speed: 0,
						time: 0,
						decelerating: false
					}
				};
				
				// top
				
				momentumInfo.vertical.distance = currentPoint.y - beginPoint.y;
				momentumInfo.vertical.speed = Math.abs(momentumInfo.vertical.distance) / time * 0.1;
				momentumInfo.vertical.to = (momentumInfo.vertical.speed * momentumInfo.vertical.speed) / (2 * deceleration) * ( momentumInfo.vertical.distance > 0 ? 1 : -1);
				momentumInfo.vertical.time = Math.round(momentumInfo.vertical.speed / deceleration);
				
				momentumInfo.top = position.y + momentumInfo.vertical.to;
				
				if ( _scrollInfo.scrollBounceVertical === false ) {
					momentumInfo.vertical.time = 0;
					momentumInfo.top = Math.min( Math.max( momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY ), _scrollInfo.allowScrollOffset.maxY );
					momentumInfo.vertical.decelerating = false;
				}
				else if ( momentumInfo.top * -1 < _scrollInfo.allowScrollOffset.minY ) {
					momentumInfo.vertical.time = 100;
					momentumInfo.top = momentumInfo.vertical.to - _scrollInfo.allowScrollOffset.minY;
					momentumInfo.vertical.decelerating = false;
				} 
				else if ( momentumInfo.top * -1 > _scrollInfo.allowScrollOffset.maxY ) {
					momentumInfo.vertical.time = 100;
					momentumInfo.top = (_scrollInfo.allowScrollOffset.maxY - momentumInfo.vertical.to) * -1;
					momentumInfo.vertical.decelerating = false;
				}
				else {
					momentumInfo.top = position.y + momentumInfo.vertical.to;
					momentumInfo.vertical.decelerating = true;
				}
				
				momentumInfo.top = ( _scrollInfo.usePaging === true ) ? Math.round(Math.round(momentumInfo.top / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height) : Math.round(momentumInfo.top);
				
				if ( _scrollInfo.useScrollBounceVertical === false ) {
					var top = Math.min( Math.max(momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY ) * -1;
					if ( momentumInfo.top !== top ) {
						momentumInfo.top = top;
						momentumInfo.vertical.decelerating = false;
					}
				}
				
				// left
				
				momentumInfo.horizontal.distance = currentPoint.x - beginPoint.x;
				momentumInfo.horizontal.speed = Math.abs(momentumInfo.horizontal.distance) / time * 0.1;
				momentumInfo.horizontal.to = (momentumInfo.horizontal.speed * momentumInfo.horizontal.speed) / (2 * deceleration) * ( momentumInfo.horizontal.distance > 0 ? 1 : -1);
				momentumInfo.horizontal.time = Math.round(momentumInfo.horizontal.speed / deceleration);
				
				momentumInfo.left = position.x + momentumInfo.horizontal.to;
				
				if ( _scrollInfo.scrollBounceHorizontal === false ) {
					momentumInfo.horizontal.time = 0;
					momentumInfo.left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
					momentumInfo.horizontal.decelerating = false;
				}
				else if ( momentumInfo.left * -1 < _scrollInfo.allowScrollOffset.minX ) {
					momentumInfo.horizontal.time = 100;
					momentumInfo.left = momentumInfo.horizontal.to - _scrollInfo.allowScrollOffset.minX;
					momentumInfo.horizontal.decelerating = false;
				} 
				else if ( momentumInfo.left * -1 > _scrollInfo.allowScrollOffset.maxX ) {
					momentumInfo.horizontal.time = 100;
					momentumInfo.top = (_scrollInfo.allowScrollOffset.maxX - momentumInfo.horizontal.to) * -1;
					momentumInfo.horizontal.decelerating = false;
				}
				else {
					momentumInfo.left = position.x + momentumInfo.horizontal.to;
					momentumInfo.horizontal.decelerating = true;
				}
				
				momentumInfo.left = ( _scrollInfo.usePaging === true ) ? Math.round(Math.round(momentumInfo.left / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width) : Math.round(momentumInfo.left);
				
				if ( _scrollInfo.useScrollBounceHorizontal === false ) {
					var left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX ) * -1;
					
					if ( momentumInfo.left !== left ) {
						momentumInfo.left = left;
						momentumInfo.horizontal.decelerating = false;
					}
				}
		
				return momentumInfo;
			},
			
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_scrollInfo.interaction.startTime = this._timeStamp();		
				_scrollInfo.interaction.beginPoint.x = _scrollInfo.interaction.currentPoint.x = event.pageX;
				_scrollInfo.interaction.beginPoint.y = _scrollInfo.interaction.currentPoint.y = event.pageY;
				
				_scrollInfo.interaction.clickable = true;
				_scrollInfo.interaction.startInteraction = true;
				_scrollInfo.interaction.dragOffset.x = 0;
				_scrollInfo.interaction.dragOffset.y = 0;
				
				_scrollContainer.killAnimation( false );
				_scrollInfo.interaction.globalUp = true;
				
				document.body.addEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
				if ( _scrollInfo.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_scrollInfo.interaction.currentPoint.x, y:_scrollInfo.interaction.currentPoint.y};
					
					if ( _scrollInfo.interaction.dragging == false ) {
						this.dispatchEvent( "startDragging", this );
					}
					
					_scrollInfo.interaction.clickable = false;
					_scrollInfo.interaction.dragging = true;
					_scrollInfo.interaction.currentPoint.x = event.pageX;
					_scrollInfo.interaction.currentPoint.y = event.pageY;
					
					if ( _scrollInfo.interaction.dragging == true ) {
						moveX = wasPoint.x - point.x;
						moveY = wasPoint.y - point.y;
						
						if ( _scrollInfo.contentOffset.x < _scrollInfo.allowScrollOffset.minX || _scrollInfo.contentOffset.x > _scrollInfo.allowScrollOffset.maxX ) {
							moveX = moveX * 0.5;
						}
						
						if ( _scrollInfo.contentOffset.y < _scrollInfo.allowScrollOffset.minY || _scrollInfo.contentOffset.y > _scrollInfo.allowScrollOffset.maxY ) {
							moveY = moveY * 0.5;
						}
						
						toX = _scrollInfo.contentOffset.x + moveX;
						toY = _scrollInfo.contentOffset.y + moveY;
						
						this.contentOffset({x:toX, y:toY}, {overflowX:_scrollInfo.useScrollBounceHorizontal, overflowY:_scrollInfo.useScrollBounceVertical} );
						
						_scrollInfo.interaction.dragOffset.x += moveX;
						_scrollInfo.interaction.dragOffset.y += moveY;
						
						if ( _scrollInfo.interaction.globalMove == false ) {
							_scrollInfo.interaction.globalMove = true;
							document.body.addEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _scrollInfo.interaction.globalMove === true ) {
					_scrollInfo.interaction.globalMove = false;
					document.body.removeEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				}
				
				if ( _scrollInfo.interaction.globalUp === true ) {
					_scrollInfo.interaction.globalUp = false;
					document.body.removeEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				}
			
				if ( _scrollInfo.interaction.startInteraction ) {
					var duration, point, wasPoint, moveX, moveY, event = this._event(e);
					duration = (event.timeStamp || this._timeStamp()) - _scrollInfo.interaction.startTime;
					
					if ( _scrollInfo.interaction.dragging == true ) {
						_scrollInfo.interaction.dragging = false;
						
						this.dispatchEvent( "endDragging", this );
						
						var position, momentumInfo;

						if ( _scrollInfo.useDecelerating === true && duration <= 500 ) {
							position = _scrollContainer.position();
							momentumInfo = this._momentum(_scrollInfo.interaction.currentPoint, _scrollInfo.interaction.beginPoint, duration, position );
							var duration = momentumInfo.vertical.time || momentumInfo.horizontal.time;
							
							if ( momentumInfo.vertical.decelerating == true || momentumInfo.horizontal.decelerating == true ) {
								_scrollContainer.animate( duration * 0.001, {
									top: momentumInfo.top,
									left: momentumInfo.left,
									inQueue: true
								});
								
								var left = Math.min( Math.max(_scrollInfo.contentOffset.x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(_scrollInfo.contentOffset.y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation({x:left, y:top}, {duration:100, inQueue:true} );
								
							} else {
								if ( _scrollInfo.contentOffset.x == (momentumInfo.left * -1) && _scrollInfo.contentOffset.y == (momentumInfo.top * -1) ) {
									duration = 0;
								}
								
								var left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation({x:left, y:top}, {duration:duration} );
							}
						} else {
							//if ( leave !== true ) {
								var cx, cy;
								if( _scrollInfo.usePaging != true){
									cx = _scrollInfo.contentOffset.x;
									cy = _scrollInfo.contentOffset.y;
								}else{
									var actDist = 70;
									position = _scrollContainer.position();
									momentumInfo = this._momentum(_scrollInfo.interaction.currentPoint, _scrollInfo.interaction.beginPoint, undefined, position );	
									
									//if( this.scrollInfo.scrollX == true){
										if( momentumInfo.horizontal.distance > actDist ){
											cx = Math.floor(_scrollInfo.contentOffset.x / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width;
										}else if( momentumInfo.horizontal.distance < -actDist ){
											cx = Math.ceil(_scrollInfo.contentOffset.x / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width;
										}else{
											cx = Math.round(_scrollInfo.contentOffset.x / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width;
										}	
									//}
									
									if( this.scrollInfo.scrollY == true){
										if( momentumInfo.vertical.distance > actDist ){
											cy = Math.floor(_scrollInfo.contentOffset.y / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height
										}else if( momentumInfo.vertical.distance < -actDist ){
											cy = Math.ceil(_scrollInfo.contentOffset.y / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height
										}else{
											cy = Math.round(_scrollInfo.contentOffset.y / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height;
										}	
									}									
								}

								var left = Math.min( Math.max(cx, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(cy, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation({x:left, y:top}, {duration:100} );
								//}
							//else {
								
							//}
						}
					}
					
					_scrollInfo.interaction.startInteraction = false;
				}
				
				return true;	
			},
			
			scrollToIndexPage: function( index, scrollAnimate ){
				if( _scrollInfo.usePaging === true){
					var left = _scrollInfo.pagingSize.width * --index;
					scrollAnimate = ( scrollAnimate == undefined ) ? true : scrollAnimate;
					this.scrollTo({x: left, y:0}, scrollAnimate, {duration: 200});
				}
			},

			_eventHandler: function(e) {
				if ( _scrollInfo.scrollBounceVertical == false && _scrollInfo.scrollBounceHorizontal == false ) {
					return true;
				}
			
				var result = true;
				
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = _scrollInfo.interaction.target._start.call( _scrollInfo.interaction.target, e );
					break;
					
					case "mousemove":
					case "touchmove":
						this._setCancelTimer();
						result = _scrollInfo.interaction.target._move.call( _scrollInfo.interaction.target, e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
						clearTimeout( this._cancelTimer );
					case "touchcancel":
						clearTimeout( this._cancelTimer );
						result = _scrollInfo.interaction.target._end.call( _scrollInfo.interaction.target, e, ( e.type === "mouseleave" ) );
					break;
					
					case "mousewheel":
					
						if ( ! _scrollInfo.interaction.startInteraction ) {
						
							var moveX = e.originalEvent.deltaX;
							var moveY = e.originalEvent.deltaY;
							
							_scrollInfo.interaction.target.contentOffset( {x:(_scrollInfo.contentOffset.x + moveX), y:(_scrollInfo.contentOffset.y + moveY) });
							//_scrollInfo.interaction.beginPoint = _scrollInfo.interaction.currentPoint;
							
							if ( _scrollInfo.usePaging ) {
							
								if ( _scrollInfo.interaction.wheelTimeout ) {
									clearTimeout( _scrollInfo.interaction.wheelTimeout );
									_scrollInfo.interaction.wheelTimeout = null;
								}
				
								_scrollInfo.interaction.wheelTimeout = setTimeout( function() {
									_scrollInfo.interaction.wheelTimeout = null;
									
									var cx = Math.round(_scrollInfo.contentOffset.x / _scrollInfo.frameSize.width) * _scrollInfo.frameSize.width;
									var cy = Math.round(_scrollInfo.contentOffset.y / _scrollInfo.frameSize.height) * _scrollInfo.frameSize.height;
									
									var left = Math.min( Math.max(cx, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
									var top = Math.min( Math.max(cy, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
									
									_scrollInfo.interaction.target.scrollToAnimation( {x:(left*-1), y:(top*-1)}, {duration:100} );
									
								}, 100);
							}
						}
						else {
							if ( _scrollInfo.interaction.wheelTimeout ) {
								clearTimeout( _scrollInfo.interaction.wheelTimeout );
								_scrollInfo.interaction.wheelTimeout = null;
							}
						}
						
						if ( _scrollInfo.scrollBounceHorizontal && Math.abs(moveX) > 0 && ( _scrollInfo.contentOffset.x == _scrollInfo.allowScrollOffset.minX || _scrollInfo.contentOffset.x == _scrollInfo.allowScrollOffset.maxX ) ) {
							result = true;
						}
						else if ( _scrollInfo.scrollBounceVertical && Math.abs(moveY) > 0 && ( _scrollInfo.contentOffset.y == _scrollInfo.allowScrollOffset.minY || _scrollInfo.contentOffset.y == _scrollInfo.allowScrollOffset.maxY ) ) {
							result = true;
						}
						else {
							result = false;
						}
						
					break;
					
					case "click":
						clearTimeout( this._cancelTimer );
						if ( _scrollInfo.interaction.clickable == false ) {
							e.stopPropagation();
							return false;
						}
					break;
				}
				
				return result;	
			},

			_setCancelTimer: function(){
				// this._cancelTimer;
				if( _scrollInfo.alwaysScrollBounceVertical ){
					clearTimeout( this._cancelTimer );
					var me = this;
					this._cancelTimer = setTimeout(function(){
						me._end( {}, true);
					}, 3000 );
				}
				
			},
			
			container: function( container ) {
				if ( arguments.length == 0 ) {
					return _container;	
				}
				
				_container = container;
				_scrollContainer = new UIScrollContainer( _container );
				
				if( _flexable.horizontal ){
					this.css({"width": "100%"})
				}

				if( _flexable.vertical ){
					this.css({"height": "100%"})
				}


				/*
				this.css({
					"width": _flexable.horizontal == false ? _scrollInfo.frameSize.width : "100%",
					"height": _flexable.vertical == false ? _scrollInfo.frameSize.height : "100%"
				});*/

				this.refresh();
			},
			
			scrollContainer: function() {
				return _scrollContainer;	
			},
			
			/** 
			 * 현재 스크롤의 정보를 Return한다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @return {Object} 현재 스크롤 정보
			 */
			scrollInfo: function() {
				return _scrollInfo;	
			},
			
			destroy: function() {
			
				this.element().removeEventListener("click", _eventHandler, true);
				this.element().removeEventListener("mousedown", _eventHandler, true);
				this.element().removeEventListener("mousemove", _eventHandler, true);
				this.element().removeEventListener("mouseup", _eventHandler, true);
				
				this.element().removeEventListener("touchstart", _eventHandler, true);
				this.element().removeEventListener("touchmove", _eventHandler, true);
				this.element().removeEventListener("touchend", _eventHandler, true);
				this.element().removeEventListener("touchcancel", _eventHandler, true);
				
				$(this.element()).off("mousewheel.scroll");
				$(this.element()).off("mouseleave.scroll" );
				$(document).off("mouseleave.scroll" );
				
				_scrollContainer.destroy.apply( _scrollContainer, arguments );
				if(_scrollVerticalBar){
					_scrollVerticalBar.destroy(true);
				}
				
				if(_scrollHorizontalBar){
					_scrollHorizontalBar.destroy(true);	
				}
				
				this._super("destroy", arguments );
			},
			
			pagingEnabled: function( pagingEnabled, pagingSize ) {
				_scrollInfo.usePaging = ( pagingEnabled === false ) ? false : true;					
				//_scrollInfo.pagingSize.width = ( pagingSize && pagingSize.width ) ? pagingSize.width : _scrollInfo.frameSize.width;
				//_scrollInfo.pagingSize.height = ( pagingSize && pagingSize.height ) ? pagingSize.height : _scrollInfo.frameSize.height;
				_scrollInfo.pagingSize.width = _scrollInfo.frameSize.width;
				_scrollInfo.pagingSize.height = _scrollInfo.frameSize.height;
				
				return this;
			},
			
			useWheelMouse: function( useWheelMouse ) {
				_scrollInfo.useWheelMouse = useWheelMouse;	
				
				if ( _scrollInfo.useWheelMouse === true ) {
					$(this.element()).on("mousewheel.scroll", _eventHandler );
				}
				else {
					$(this.element()).off("mousewheel.scroll");
				}
			},
			
			useMouseLeave: function( useMouseLeave ) {
				_scrollInfo.useMouseLeave = useMouseLeave;	
			
				$(this.element()).on("mouseleave.scroll", _eventHandler );
				$(document).on("mouseleave.scroll", _eventHandler );
			},
			
			//스크롤 감속-브라우저에서 자체 처리할 경우 오류가 있어 사용치 않음
			useDecelerating: function( useDecelerating ) {	
				_scrollInfo.useDecelerating = useDecelerating;	
			},

			useScrollbar: function( useScrollbar ) {
				if ( useScrollbar === false ) {
					_scrollInfo.useScrollbar = false;
					if(_scrollVerticalBar){
						this.remove( _scrollVerticalBar );	
					}

					if(_scrollHorizontalBar){
						this.remove( _scrollHorizontalBar );
					}					
					return;
				}
				
				_scrollInfo.useScrollbar = true;
					
				this.addClass(cssPrefix+"scrollbar-hidden");
				
				if( _scrollVerticalBar ){
					this.append( _scrollVerticalBar );
					_scrollVerticalBar.update(_scrollInfo);
				}
				
				if( _scrollHorizontalBar ){
					this.append( _scrollHorizontalBar );
					_scrollHorizontalBar.update(_scrollInfo);
				}
				
			},
			
			/** 
			 * scrollBounceVertical과 scrollBounceHorizontal를 동시에 적용한다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			scrollBounce: function( scrollBounce ) {
				this.scrollBounceVertical(scrollBounce);
				this.scrollBounceHorizontal(scrollBounce);
				return this;
			},
			

			
			
			/** 
			 * alwaysScrollBounceVertical alwaysScrollBounceHorizontal 동시에 적용합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			alwaysScrollBounce: function( scrollBounce ){
				this.scrollBounce(scrollBounce);
				
				this.alwaysScrollBounceVertical(scrollBounce);
				this.alwaysScrollBounceHorizontal(scrollBounce);
				this._allowContentOffset();
				return this;
			},

			/** 
			 * alwaysScrollBounceVertical을 인자에 따라 적용합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			alwaysScrollBounceVertical: function( scrollBounce ) {
				this.scrollBounceVertical(scrollBounce);

				_scrollInfo.alwaysScrollBounceVertical = ( scrollBounce === true ) ? true : false;	
				_scrollInfo.useScrollBounceVertical = ( scrollBounce === true ) ? true : false;	
				return this;
			},

			/** 
			 * alwaysScrollBounceHorizontal 인자에 따라 적용합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			alwaysScrollBounceHorizontal: function( scrollBounce ) {
				this.scrollBounceHorizontal(scrollBounce);

				_scrollInfo.alwaysScrollBounceHorizontal = ( scrollBounce === true ) ? true : false;	
				_scrollInfo.useScrollBounceHorizontal = ( scrollBounce === true ) ? true : false;	
				return this;
			},
			
			/** 
			 * scrollBounceVertical, scrollBounceHorizontal 인자에 따라 적용합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			scrollBounceVertical: function( scrollBounce ) {
				_scrollInfo.useScrollBounceVertical = ( scrollBounce === true ) ? true : false;	
				return this;
			},
			
			/** 
			 * scrollBounceHorizontal 인자에 따라 적용합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Boolean} scrollBounce
			 * @return {Scroll} Scroll Instance
			 */
			scrollBounceHorizontal: function( scrollBounce ) {
				_scrollInfo.useScrollBounceHorizontal = ( scrollBounce === true ) ? true : false;	
				return this;
			},

			__createScrollBar:function(){

				if( _scrollInfo.scrollY ){
					_scrollVerticalBar = new UIScrollBar( document.createElement("DIV"), "vertical" );	
				}

				if( _scrollInfo.scrollX ){
					_scrollHorizontalBar = new UIScrollBar( document.createElement("DIV"), "horizontal" );
				}
			},

			init: function( element, info ) {
				var self = this._super("init", arguments);
				if ( self ) {
					this.currentSize = {};
					

					_options = this._options();
					_scrollInfo.alwaysScrollBounceVertical = _options.alwaysScrollBounceVertical;
					_scrollInfo.alwaysScrollBounceHorizontal = _options.alwaysScrollBounceHorizontal;
					if(_scrollInfo.alwaysScrollBounceVertical == true){_options.useScrollBounceVertical = true}
					if(_scrollInfo.alwaysScrollBounceHorizontal == true){_options.useScrollBounceHorizontal = true}

					_scrollInfo.useScrollBounceVertical = _options.useScrollBounceVertical;
					_scrollInfo.useScrollBounceHorizontal = _options.useScrollBounceHorizontal;

					
					

					_scrollInfo.useScrollbar = _options.useScrollbar;

					_scrollInfo.scrollX = _options.scrollX;
					_scrollInfo.scrollY = _options.scrollY;
					_scrollInfo.fadeScrollbars = _options.fadeScrollbars;
					
					_scrollInfo.interaction.target = this;
					_scrollInfo.frameSize.width = this.width();
					_scrollInfo.frameSize.height = this.height();
					
					this.__createScrollBar();

					_container = $(element).find("."+cssPrefix+"scroll-container").first().get(0) || $(element).children().get(0);
					this.container( _container );
					_eventHandler = this.context( this._eventHandler );
					
					this.element().addEventListener("click", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
					
					if ( _scrollInfo.interaction.hasTouch ) {
						this.element().addEventListener("touchcancel", _eventHandler, true);
					}
					
					/*
					this.bind("startDragging", function() {
						if ( _delegateCan.didStartDragging ) {
							_delegate.didStartDragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("endDragging", function() {
						if ( _delegateCan.didEndDragging ) {
							_delegate.didEndDragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("finishScrollAnimation", function() {
						if ( _delegateCan.didFinishScrollingAnimation ) {
							_delegate.didFinishScrollingAnimation.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("scrolling", function() {
						if ( _delegateCan.scrolling ) {
							_delegate.scrolling.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("dragging", function() {
						if ( _delegateCan.dragging ) {
							_delegate.dragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});*/
					var me = this;
					this.bind("startDragging", function() {
						_options.didStartDragging( this, Object.clone(_scrollInfo) );
					});

					this.bind("endDragging", function() {
						_options.didEndDragging( this, Object.clone(_scrollInfo) );
					});

					this.bind("finishScrollAnimation", function() {
						_options.didFinishScrollingAnimation( this, Object.clone(_scrollInfo) );
					});

					this.bind("scrolling", function() {
						_options.scrolling( this, Object.clone(_scrollInfo) );
					});

					this.bind("dragging", function() {
						_options.dragging( this, Object.clone(_scrollInfo) );
					});


					this.useWheelMouse(_options.useWheelMouse);
					this.useMouseLeave(true);
					this.flexable(_options.flexable);
					this.refresh();

					if( _scrollInfo.useScrollbar  ){
						this.useScrollbar(true);//param false 에러
					}
					return this;
				}
			},
			
			
			flexable: function( flexable ) {
				_flexable.vertical = flexable;
				_flexable.horizontal = flexable;

				if( flexable ){
					this.css({
						"width": "100%",
						"height": "100%"
					});	
				}else{
					this.css({
						"width": "",
						"height": ""
					});	
				}
				
			},
			
			
			_allowContentOffset: function() {
				_scrollInfo.scrollBounceHorizontal = _scrollInfo.alwaysScrollBounceHorizontal === true ? true : ( _scrollInfo.frameSize.width < ( _scrollInfo.contentSize.width + _scrollInfo.contentInset.left ) ) ? true : false;
				_scrollInfo.scrollBounceVertical = _scrollInfo.alwaysScrollBounceVertical === true ? true : ( _scrollInfo.frameSize.height < ( _scrollInfo.contentSize.height + _scrollInfo.contentInset.top ) ) ? true : false;
				_scrollInfo.allowScrollOffset.minX = _scrollInfo.scrollBounceHorizontal === false ? _scrollInfo.contentInset.left * -1 : ( _scrollInfo.contentInset.left * -1 );
				_scrollInfo.allowScrollOffset.maxX = _scrollInfo.scrollBounceHorizontal === false ? _scrollInfo.allowScrollOffset.minX : Math.max( _scrollInfo.allowScrollOffset.minX, ( ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width ) + _scrollInfo.contentInset.right ) );
				_scrollInfo.allowScrollOffset.minY = _scrollInfo.scrollBounceVertical === false ? _scrollInfo.contentInset.top * -1 : ( _scrollInfo.contentInset.top * -1 );
				_scrollInfo.allowScrollOffset.maxY = _scrollInfo.scrollBounceVertical === false ? _scrollInfo.allowScrollOffset.minY : Math.max( _scrollInfo.allowScrollOffset.minY, ( ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height ) + _scrollInfo.contentInset.bottom ) );					
				
				var x = Math.min( Math.max(_scrollInfo.contentOffset.x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
				var y = Math.min( Math.max(_scrollInfo.contentOffset.y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );

				if( x != _scrollInfo.contentOffset.x || y != _scrollInfo.contentOffset.y ){
					this.contentOffset({x:x, y:y});
				}
			},
			
			/** 
			 * 스크롤컨테이너를 둘러싸서 추가되는 거리값을 변경한다. 인자 값은 Object타입으로 "top", "right", "bottom", "left" 중 변경이 필요한 값을 전달한다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Object} contentInset
			 * @return {Scroll} Scroll Instance
			 */
			contentInset: function( contentInset ) {
				if ( arguments.length == 0 ) {
					return Object.clone( _scrollInfo.contentInset );
				}
				
				for ( var key in contentInset ) {
					
					if ( _scrollInfo.contentInset[key] != undefined && ! isNaN(parseInt(contentInset[key])) ) {
						_scrollInfo.contentInset[key] = parseInt(contentInset[key]);
					}
				}
				
				this._allowContentOffset();
				return this;
			},

			contentOffset: function( pos, options ) {
				var x = pos.x;
				var y = pos.y;

				if ( _scrollInfo.interaction.wheelTimeout ) {
					clearTimeout( _scrollInfo.interaction.wheelTimeout );
					_scrollInfo.interaction.wheelTimeout = null;
				}
								
				if ( arguments.length == 0 ) {
					return Object.clone( _scrollInfo.contentOffset );
				}
				
				this.__contentOffsetX(x, options);	
				this.__contentOffsetY(y, options);
				this.dispatchEvent( "scrolling", this );
			},
			
			__contentOffsetX: function( x, options ){
				if( x != undefined && _scrollHorizontalBar ){
					if ( ! options || ! options.overflowX === true ) {
						x = Math.min( Math.max(x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
					}

					if ( this.element() && this.element().scrollLeft ) {
						this.element().scrollLeft = 0;
					}

					_scrollContainer.css({
						"left": Math.round(x*-1) + "px"
					});

					_scrollInfo.contentOffset.x = x;
					_scrollHorizontalBar.update( _scrollInfo );
				}
			},

			scrollTop: function(){
				this.__contentOffsetY(0);
			},
			__contentOffsetY: function( y,options ){
				if( y != undefined && _scrollVerticalBar ){
					if ( ! options || ! options.overflowY === true ) {
						y = Math.min( Math.max(y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
					}

					if ( this.element() && this.element().scrollTop ) {
						this.element().scrollTop = 0;
					}

					_scrollContainer.css({
						"top": Math.round(y*-1) + "px"
					});
					_scrollInfo.contentOffset.y = y;
					_scrollVerticalBar.update( _scrollInfo );
				}
			},		

			
			//스크롤 최상단으로 이동
			__scrollToTop: function( animation, options ) {
				if( animation ){
					this.scrollToAnimation({x:_scrollInfo.contentOffset.x, y:_scrollInfo.contentInset.top}, options)
				}else{
					this.contentOffset({x:_scrollInfo.contentOffset.x, y:_scrollInfo.contentInset.top}, options);	
				}
				
				//this.scrollTo( _scrollInfo.contentInset.left, _scrollInfo.contentInset.top );
			},

			__scrollToLeft: function(animation, options){
				if( animation ){
					this.scrollToAnimation({x:_scrollInfo.contentInset.left, y:_scrollInfo.contentOffset.y}, options);
				}else{
					this.contentOffset({x: _scrollInfo.contentInset.left, y:_scrollInfo.contentOffset.y}, options);	
				}				
			},

			__scrollToRight: function(animation, options){
				/*var x = Math.min( Math.max(_scrollInfo.contentOffset.x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );*/
				var x = _scrollInfo.contentSize.width - _scrollInfo.frameSize.width;
				if( x < 0 ){ x = 0 }

				if( animation ){
					this.scrollToAnimation( {x: x, y:_scrollInfo.contentOffset.y}, options);
				}else{
					this.contentOffset({x: x, y: _scrollInfo.contentOffset.y}, options);	
				}			
			},

			//스크롤 최상단으로 이동
			__scrollToBottom: function(animation, options) {
				var y = _scrollInfo.contentSize.height - _scrollInfo.frameSize.height;
				if( y < 0 ){ y = 0 }

				if( animation ){
					this.scrollToAnimation({x: _scrollInfo.contentOffset.x, y: y}, options);
				}else{
					this.contentOffset({x:_scrollInfo.contentOffset.x, y: y}, options);	
				}	
			},

			///스크롤 지정 좌표로 이동
			
			/** 
			 * 전달 받은 값의 위치로 스크롤한다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {Object|String} pos {x,y} 혹은 position String
			 * @param {Boolean} animation scroll animation 적용 여부
			 * @return {Scroll} Scroll Instance
			 */
			scrollTo: function( pos, animation, options ) {
				pos = this.__getObjectToPos(pos);				
				if( animation == true){
					this.scrollToAnimation( pos, options );
				}else{
					this.contentOffset( pos, options );		
				}	
				return this;
			},
			
			__getObjectToPos: function(pos){
				if( typeof(pos) == "string" ){
					//pos = "left", "top", "right", "bottom"
					pos = this.__getStringToPos(pos);
				}else{
					if(pos.x === "" || pos.x == undefined){
						pos.x = _scrollInfo.contentOffset.x;
					}

					if(pos.y === "" || pos.y == undefined){
						pos.y = _scrollInfo.contentOffset.y
					}
				}
				return pos;
			},

			__getStringToPos:function( str ){
				var x, y;
				if( str !== "" && typeof(str) == "string" ){
					switch( str ){
						case "top":
							x = _scrollInfo.contentOffset.x;
							y = _scrollInfo.contentInset.top
						break;
						case "right":
							x = _scrollInfo.contentSize.width - _scrollInfo.frameSize.width;
							if( x < 0 ){ x = 0 }
							y = _scrollInfo.contentOffset.y;
						break;
						case "bottom":
							var y = _scrollInfo.contentSize.height - _scrollInfo.frameSize.height;
							if( y < 0 ){ y = 0 }
							x = _scrollInfo.contentOffset.x;
						break;
						case "left":
							x = _scrollInfo.contentInset.left;
							y = _scrollInfo.contentOffset.y
						break;
					}
				}else{
					x = _scrollInfo.contentOffset.x;
					y = _scrollInfo.contentOffset.y;
				}

				return {x: x, y: y};				
			},

			//스트롤 이동 애니메이션 처리시
			/** 
			 * 전달받은 값의 위치로 애니메이션 효과와 함께 스크롤을 이동시킨다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @param {object|String} pos {x,y} 혹은 position String
			 * @param {Number} y scrollYa
			 * @return {Scroll} Scroll Instance
			 */
			scrollToAnimation: function( pos, options ) {
				if ( ! _scrollInfo.interaction.target ) {
					return;
				}
				
				var x, y;
				pos = this.__getObjectToPos(pos);
				x = pos.x;
				y = pos.y;
				
				var self = this;
				var inQueue = true;
				var duration = ( options && ! isNaN(parseInt(options["duration"])) ) ? parseInt(options["duration"]) : 300;
				
				if ( this.element().scrollTop ) {
					this.element().scrollTop = 0;
				}
				
				if ( this.element().scrollLeft ) {
					this.element().scrollLeft = 0;
				}
				
				x = Math.round(x);
				y = Math.round(y);
				
				if ( ! options || options.inQueue !== true ) {
					_scrollContainer.killAnimation( false );
					inQueue = false;
				}
				
				_scrollContainer.animate( duration*0.001, {
					left: x * -1,
					top: y * -1,
					inQueue: inQueue,
					onUpdate: function() {
					
						var cx = parseInt( _scrollContainer.css("left") ) * -1;
						var cy = parseInt( _scrollContainer.css("top") ) * -1;
						if( _scrollVerticalBar ){
							_scrollVerticalBar.scroll( cy, _scrollInfo );
						}
						
						if(_scrollHorizontalBar ){
							_scrollHorizontalBar.scroll( cx, _scrollInfo );
						}
												
						self.dispatchEvent( "scrolling", self );
					},
					onComplete: function() {
						if( _scrollVerticalBar ){
							_scrollVerticalBar.update( _scrollInfo );
						}
						
						if( _scrollHorizontalBar ){
							_scrollHorizontalBar.update( _scrollInfo );
						}
						_scrollInfo.interaction.target.dispatchEvent( "finishScrollAnimation", _scrollInfo.interaction.target );
					}
				});
				
				_scrollInfo.contentOffset.x = x;
				_scrollInfo.contentOffset.y = y;
				return this;
			},
			
			//비공개 frame size 변경
			frameSize: function( width, height ) {
				if ( arguments.length == 0 ) {
					return _scrollInfo.frameSize;
				}
				
				_scrollInfo.frameSize.width = width;
				_scrollInfo.frameSize.height = height;
			},
			
			/** 
			 * frame 사이즈와 콘텐츠 사이즈 정보를 갱신하여 스크롤을 새로 셋팅합니다.
			 * @memberof Scroll
			 * @since 1.0.0
			 * @return {Scroll} Scroll Instance
			 */
			refresh: function() {
				var size = this.size();
				size.width = ( size.width == 0 ) ? _scrollContainer.width() : size.width;
				size.height = ( size.height == 0 ) ? _scrollContainer.height() : size.height;
				
				_scrollInfo.frameSize.width = this.width();
				_scrollInfo.frameSize.height = this.height();
				
				_scrollInfo.contentSize.width = _scrollContainer.width();
				_scrollInfo.contentSize.height = _scrollContainer.height();
				
				this._allowContentOffset();
				
				if( _scrollVerticalBar ){
					_scrollVerticalBar.update( _scrollInfo );
				}
				
				if(_scrollHorizontalBar){
					_scrollHorizontalBar.update( _scrollInfo );
				}

				this.scrollTop();
				return this;
			},
			
			delegate: function( delegate ) {
				_delegate = delegate;
				
				_delegateCan.scrolling = (typeof _delegate["scrolling"] == "function" );
				_delegateCan.dragging = (typeof _delegate["dragging"] == "function" );
				_delegateCan.didStartDragging = (typeof _delegate["didStartDragging"] == "function" );
				_delegateCan.didEndDragging = (typeof _delegate["didEndDragging"] == "function" );
				_delegateCan.didFinishScrollingAnimation = (typeof _delegate["didFinishScrollingAnimation"] == "function" );
			}
		}
	}
});
	
})(window);


(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,
UISetting = Class.UISetting,
cssPrefix = Class.UIKit.cssPrefix,

UIControlEvent = {
	ChangeProperty: "UIControlEvent.ChangeProperty"
},

UIControl = Class({
	name: "UIControl",
	parent: UICore,
	constructor: function() {
	
		var _currentEvent;
		var _propertyChangeEventTimeout;
		var _$element;
		return {
			_didChangeProperty: function(e) {
				var self = this;
				
				if ( _propertyChangeEventTimeout ) {
					clearTimeout(_propertyChangeEventTimeout);
					_propertyChangeEventTimeout = null;
				}
			
				_propertyChangeEventTimeout = setTimeout(function() {
					self.dispatchEvent( UIControlEvent.ChangeProperty );
					_propertyChangeEventTimeout = null;
				}, 10);
			},
			
			destroy: function() {
				
				$(this.element()).unbind("propertychange.UIControl keydown.UIControl keyup.UIControl input.UIControl paste.UIControl change.UIControl click.UIControl UIControlEvent.ChangeProperty");
				
				this._super("destroy", arguments );
			},
			
			init: function( element ) {				
				var self = this._super("init", arguments);
				if ( self ) {
					_$element = $(element);
					_$element.bind("propertychange.UIControl keydown.UIControl keyup.UIControl input.UIControl paste.UIControl change.UIControl click.UIControl UIControlEvent.ChangeProperty", this.context(function(e) {
						return this._didChangeProperty(e);
					}));
					
					return this;
				}
			},
			
			isDisabled: function() {
				return this.element().disabled;
			},
			
			disabled: function( flag ) {
				this.element().disabled = flag;				
				_$element.attr("disabled", flag);
				this._didChangeProperty();
			}
		}
	}
}),

UIButton = Class({
	name: "UIButton",
	parent: UIControl,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UIButton") ) {
						this.addClass("UIButton");
					}
					
					return this;
				}
			}
		}
	}
}),

UICheckBox = Class({
	name: "UICheckBox",
	parent: UIControl,
	constructor: function() {
	
		var UICheckBoxStatus = {
			UNSET:	0,
			NONE:	1,
			PART:	2,
			ALL:	3
		};
	
		var _group = "";
		var _whole = false;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				
				if ( self ) {
					if ( ! this.hasClass("UICheckBox") ) {
						this.addClass("UICheckBox");
					}
					
					if ( $(element).data("group") ) {
						_group = $(element).data("group");
						
						UICheckBox.group(_group, this);
					}
					
					if ( $(element).data("group-whole") ) {
						_group = $(element).data("group-whole");
						_whole = true;
						
						UICheckBox.groupWhole(_group, this);
					}
					
					this.bind(UIControlEvent.ChangeProperty, this.context(function(e) {
						this.didChangeProperty();
					}));
					
					if ( _whole === false ) {
						UICheckBox.groupWhole(_group).delegate()._didUpdateGroupWhole();
					}
				}
				return this
			},
			
			_status: function() {
				var groupWhole, allClear = true, allChecked = true;
				
				groupWhole = UICheckBox.groupWhole(_group);
				
			
				$( groupWhole.group().list() ).each(function(idx, instance) {
				
					if ( ! instance.isDisabled() ) {
						if ( instance.isChecked() ) {
							allClear = false;
						}
						else {
							allChecked = false;
						}
					}
				});
				
				
				if ( allClear === true ) {
					return UICheckBoxStatus.NONE;
				}
				else if ( allChecked === true ) {
					return UICheckBoxStatus.ALL;
				}
				
				return UICheckBoxStatus.PART;
			},
			
			_didUpdateGroupWhole: function() {
				if ( _whole === false ) {
					return;
				}
				
				var status, groupWhole;
				
				status = this._status();
				groupWhole = UICheckBox.groupWhole(_group);
				
				switch( status ) {
					default:
					case UICheckBoxStatus.UNSET:
					case UICheckBoxStatus.NONE:
						
						this.checked( false, {ignoreEvent:true, isPart:false} );
					
						break;
					
					case UICheckBoxStatus.PART:
					
						this.checked( false, {ignoreEvent:true, isPart:true} );
					
						break;
					
					case UICheckBoxStatus.ALL:
					
						this.checked( true, {ignoreEvent:true, isPart:false} );
					
						break;
				}
			},
			
			didChangeProperty: function() {
				
				var checked, groupWhole;
				
				checked = this.isChecked();
				groupWhole = UICheckBox.groupWhole(_group);
					
				if ( _whole === true ) {
					this.removeClass("part");
				
					$( groupWhole.group().list() ).each(function(idx, instance) {
						instance.checked( checked, {ignoreEvent:true} );
					});
				}
				else {
					groupWhole.delegate()._didUpdateGroupWhole();
				}
			},
			
			isChecked: function() {
				return this.element().checked;	
			},
			
			checked: function( flag, options ) {
				if ( arguments.length == 0 ) {
					return this.isChecked();	
				}
				
				if ( this.isDisabled() ) {
					return;
				}
				
				this.element().checked = flag;
				this.attribute("checked", flag);
				
				if ( options && options.isPart !== undefined ) {
					if ( options.isPart === true ) {
						this.addClass("part");
					}
					else if ( options.isPart === false ) {
						this.removeClass("part");
					}
				}
				
				if ( ! options || options.ignoreEvent !== true ) {
					$(this.element()).trigger("UIControlEvent.ChangeProperty");
				}
			}
		}
	},
	
	'static': function() {
		
		var UICheckBoxGroup = function( whole ) {
			
			var _list = [], _whole = whole;
			
			return {
				add: function( instance ) {
					Array.add( _list, instance );
				},
				
				remove: function( instance ) {
					Array.remove( _list, instance );
				},
				
				list: function() {
					return _list;
				}
			}
		};
		
		var UICheckBoxGroupWhole = function() {
			
			var _group, _delegate;
			
			_delegate = {
				_didUpdateGroupWhole: function() {
					
				}
			};
			
			return {
				init: function() {
					_group = new UICheckBoxGroup( this );
				},
			
				group: function() {
					return _group;
				},
				
				delegate: function( delegate ) {
					if ( arguments.length == 0 ) {
						return _delegate;
					}
					
					_delegate = delegate;
				}
			};
		};
		
		var _groupData = {};
	
		return {
			group: function( key, instance ) {
				if ( arguments.length == 0 ) {
					return _groupData;
				}
				
				var groupWhole = _groupData[key];
				
				if ( ! groupWhole ) {
					groupWhole = new UICheckBoxGroupWhole(key);
					groupWhole.init();
					
					_groupData[key] = groupWhole;
				}
				
				if ( ! instance ) {
					return groupWhole.group();
				}
				
				groupWhole.group().add( instance );
			},
			
			groupWhole: function( key, instance ) {
				if ( arguments.length == 0 ) {
					return _groupData;
				}
				
				var groupWhole = _groupData[key];
				
				if ( ! groupWhole ) {
					groupWhole = new UICheckBoxGroupWhole(key);
					groupWhole.init();
					
					_groupData[key] = groupWhole;
				}
				
				if ( ! instance ) {
					return groupWhole;
				}
				
				groupWhole.delegate( instance );
			}
		}
	}
}),

UIRadio = Class({
	name: "UIRadio",
	parent: UIControl,
	constructor: function() {
		
		return {
			init: function(element) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UIRadio") ) {
						this.addClass("UIRadio");
					}
				}
				return this
			}
		}
	}
}),

/**
 * Switch 버튼 기능을 제공한다.
 * @class Switch
 */
Switch = Class({
	name: "Switch",
	parent: UIControl,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					"selectors":{
						"handle": ".m-switch-handle",
						"field": "input"						
					},

					"isOn": false,
					"disabled": false,
					"transition": true,
					"labelNames": ["ON", "OFF"],
					"change": function(){}

				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof Switch 
	 * @param {Element} element 기준이 되는 DOM Element
	 * @param {Object} options.selectors 
	 * @param {String} options.selectors.handle=".switch-handle" switch handle button 
	 * @param {String} options.selectors.field=".input" switch input field
	 * @param {Boolean} options.state switch=false 상태 값
	 * @param {Boolean} options.disabled=false 활성/비활성 상태
  	 * @param {Boolean} options.transition=true switch on/off시 transition 사용 여부
	 * @param {Boolean} options.change switch 상태 변경시 호출되는 callback 함 
	 * @retuns {Switch} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var $el, $handle, $field, 
			_flag = false,
			_disabled, _groupName, _options, _isCheckbox;

		var template =  '<span class="'+cssPrefix+'switch-label">'+
							'<span></span><span></span>'+
						'</span>'+
						'<span class="'+cssPrefix+'switch-handle"><span>&nbsp;</span></span>';
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_options = this._options();
					$el = $(element);
					this.__createElement();
					$handle = $el.find(_options.selectors.handle);
					$field = $el.find(_options.selectors.field);
					this.__bindEvent();
				}

				this.__setting();
				return this;
			},
			
			__createElement: function(){
				$el.prepend( template );
				var $label = $el.find("."+cssPrefix+"switch-label span");
				$label.eq(0).html( _options.labelNames[0] );
				$label.eq(1).html( _options.labelNames[1] );
			},

			__setting: function(){
				_isCheckbox = ($field.attr("type") == "checkbox")? true : false;
				if( $el.hasClass(cssPrefix+"on") ){
					this.on(false);
				}else{
					if( _options.isOn ){
						this.on(false);
					}else{
						_flag = true;
						this.off(false);
					}
				}

				if( $el.hasClass("disabled") || _options.disabled == true ){
					this.disable();						

				}else{
					this.enable();	
				}

				setTimeout(function(){
					var className = cssPrefix+"switch-animate";
					if( _options.transition ){
						$el.addClass( className );
					}else{
						$el.removeClass( className );
					}
				}, 1 );
			},

			__unbindEvent: function(){
				var me = this;
				if( _isCheckbox ){
					this.unbind("changeState."+this.instanceID);
				}else{
					$field.off("release."+this.instanceID);
				}
				$handle.off("click."+this.instanceID);
				$el.off("mousedown."+this.instanceID+" touchstart."+this.instanceID );
				$el.off("touchmove."+this.instanceID+" touchcancel."+this.instanceID+" touchend."+this.instanceID+" mouseleave."+this.instanceID );
			},

			__bindEvent: function(){
				var me = this;
				if( _isCheckbox ){
					this.bind("changeState."+this.instanceID, function(data){
						if( data.checked ){
							this.on();
						}else{
							this.off();
						}
					}.bind(this));					
				}else{
					_groupName = $field.attr("name");					
					
					$field.on("release."+this.instanceID, function(){
						this.off();
					}.bind(this));
				}

				$handle.on("click."+this.instanceID, function(){
					if( $el.hasClass(cssPrefix+"on") ){
						this.off();
					}else{
						this.on();
					}
				}.bind(this));


				//gesture on/off control
				var posX;
				$el.on("mousedown."+this.instanceID+" touchstart."+this.instanceID, function(e){
					if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]){
						posX = e.originalEvent.touches[0].pageX;
					}
				});				
				
				$el.on("touchmove."+this.instanceID+" touchcancel."+this.instanceID+" touchend."+this.instanceID+" mouseleave."+this.instanceID, function(e){
					if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]){
						//on - off +
						var dist = posX - e.originalEvent.touches[0].pageX;
						if( Math.abs(dist) > 20 ){
							if( dist < 0 ){//on
								me.on();
							}else{//off
								me.off();
							}
						}

					}
				});
			},

			__changeSwitch: function( bool, triggerEvent ){
				_flag = bool;
				$field.prop("checked", bool);	
				if(triggerEvent === false){return}
				this.__triggerChange();

			},

			toggle: function( isOn, force ){
				if(isOn || _flag === false){
					this.on( undefined, force);
				}else{
					this.off( undefined, force);
				}
			},
			
			/**
			 * Switch 상태를 on 시킨다
			 * @memberof Switch
			 * @since 1.0.0 
			 * @return {Switch}
			 */
			on: function(triggerEvent, force){
				if( (_disabled && force !== true) || _flag ){return;}
				this.__changeSwitch(true, triggerEvent);				
				$el.addClass(cssPrefix+"on");
				if( !_isCheckbox ){
					$("input[name="+_groupName+"]").not($field).prop("checked", false).trigger("release");
				}
				return this;
			},

			/**
			 * Switch 상태를 off 시킨다
			 * @memberof Switch
			 * @since 1.0.0 
			 * @return {Switch}
			 */
			off: function(triggerEvent, force){
				if( (_disabled && force !== true) || _flag === false ){return;}
				this.__changeSwitch(false, triggerEvent);	
				$el.removeClass(cssPrefix+"on");
				return this;
			},

			
			__triggerChange: function(){
				(_options.change.bind(this))(this, _flag, $el.get(0));
				//_options.change();
				this.dispatchEvent( "uiswitchchange", this, _flag, $el.get(0) );
			},

			/**
			 * Switch의 Checked 상태를 반환한다.
			 * @memberof Switch
			 * @since 1.0.0 
			 * @return {Boolean}
			 */
			getChecked: function(){
				return _flag;
			},

			/**
			 * Switch를 비활성화 시킨다.
			 * @memberof Switch
			 * @since 1.0.0 
			 * @return {Switch}
			 */
			disable: function(){
				$el.addClass(cssPrefix+"disabled");
				$field.attr("disabled", "disabled");
				_disabled = true;
				return this;
			},

			/**
			 * Switch를 활성화 시킨다.
			 * @memberof Switch
			 * @since 1.0.0 
			 * @return {Switch}
			 */
			enable: function(){
				$el.removeClass(cssPrefix+"disabled");
				$field.removeAttr("disabled");
				_disabled = false;
				return this;
			},

			destroy: function() {			
				this.__unbindEvent();
				this._super("destroy", arguments );
			},

		}
	}
}),

UITab = Class({
	name: "UITab",
	parent: UIControl,
	constructor: function() {
		var _$items;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_$items = $(element).find("a");
					_$items.bind("click", function(e) {
						_$items.removeClass("on").eq( $(this).index() ).addClass("on");
					});
				}
				return this
			}
		}
	}
}),

UISegment = Class({
	name: "UISegment",
	parent: UIControl,
	constructor: function(  ) {

		var _index = -1, _$items = [];
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);

				if ( self ) {
					self = this;

					_$items = $(element).find("a");
					_$items.bind("click", function(e) {
						var index = $(this).index();
						self.index( index );
					});

					this.index( this._options().index );
				}
				return this
			},

			index: function( index ) {
				if ( arguments.length == 0 ) {
					return _index;
				}

				this.setIndex( index );
			},

			setIndex: function( index ) {
				_index = index;

				_$items.removeClass("on").eq(index).addClass("on");
				
				this.dispatchEvent("changeIndex", index);
			}
		};
	},
	'static': function() {

		return {
			_setting:{
				defaultOptions: {
					'index': 0,
					'type': 'DEFAULT'
				},
				surrogateKeys: {
					'startindex': 'index'
				},
				enumsKeys: {
					'type': {
						'DEFAULT': 0,
						'BEST': 1
					}
				}
			}
		}
	}
}),














UISliderInfo = function UISliderInfo(target){
	var info = {
		trackOffset: {x:0, y:0},

		minimumTrackOffset: {x:0, y:0},
		maximumTrackOffset: {x:0, y:0},

		allowMinimumTrackOffset: {minX:0, minY:0, maxX:100, maxY:100},
		allowMaximumTrackOffset: {minX:0, minY:0, maxX:100, maxY:100},

		allowTrackOffset: {
			minX:0, minY:0, maxX:100, maxY:100
		},
		
		stepGapSize: {width:0, height:0},
		minValue:0,
		maxValue:0,
		value: 0,
		values: [0,0],
		interaction: {
			hasTouch: ('ontouchstart' in window) ? true : false,
			target: target,
			startTime: 0,
			beginPoint: {x:0, y:0},
			currentPoint: {x:0, y:0},
			//dragOffset: {x:0, y:0},
			dragging: false,
			startInteraction: false,
			globalMove: false
		}
	};
	
	return info;
},

/**
 * single slider와 twin slider 기능을 제공한다.
 * @class Slider
 */
Slider = Class({
	name: "Slider",
	parent: UIControl,

	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					animate: true,
					disabled: false,
					range: false,
					min: 0,
					max: 100,
					orientation:"horizontal",
					value: 0,
					step: 0,
					values: [0, 100],

					change: function(){},
					start: function(){},
					stop: function(){},
					slide: function(){}
				}
			}
		}
	},
	
	/**
	 * @constructor
	 * @memberof Slider 
	 * @param {Element} 기준이 되는 DOM Element
	 * @param {Boolean} options.animate=true, slider를 이동시킬 때, 애니메이션을 사용할 것인지에 대한 여부
	 * @param {Boolean} options.disabled=false	비활성화 시킬 것인지에 대한 여부 
	 * @param {Boolean|String} options.range=false Boolean: twin slider를 사용할 것인지에 대한 여부, 
	 *											   String: "min" 또는 "max" 값을 적용하여 슬라이더의 시작 기점을 minmum 또는 maximum으로 결정합니다.
	 * @param {Number} options.min=0 슬라이더의 최소값  
	 * @param {Number} options.max=0 슬라이더의 최대값  
	 * @param {String} options.orientation="horizontal" 슬라이더의 가로/세로 방향
	 * @param {Number} options.step=0 슬라이더 값의 최소 이동 범위
	 * @param {Number} options.value=0 슬라이더의 시작시 위치시킬 값
	 * @param {Array} options.values=[min value, max value] Twin Slider 시작시 위치시킬 값
	 * @retuns {Slider} Slider instance 
	 * @since 1.0.0
	 */	 
	constructor: function() {		
		var _track, _info;
		var _options, _stepData, _currentStepData, _range;
		var _$element, _$thumbValue, _$maximumTrack, _$minimumTrack, _$thumb, _$minimumValue, _$maximumValue, _$minimumThumb, _$maximumThumb, _$targetThumb,
			_$doc, _$body, _$targetThumb;
		
		return {
			_createElement: function($el, range, orientation){
				var template = {
								"slider":
									[ '<span class="'+cssPrefix+'minimum-value">0</span>',
										'<div class="'+cssPrefix+'maximum-track">',
											'<div class="'+cssPrefix+'minimum-track"></div>',
											'<button class="'+cssPrefix+'slider-thumb '+cssPrefix+'minimum-thumb"><span class="'+cssPrefix+'thumb-value">0</span></button>',
										'</div>',
									'<span class="'+cssPrefix+'maximum-value">0</span>'
									].join(""),
								"maxThumb": '<button class="'+cssPrefix+'slider-thumb '+cssPrefix+'maximum-thumb"><span class="'+cssPrefix+'thumb-value">0</span></button>'
							}
				$el.html(template.slider);
				if(range === true){
					$el.find("."+cssPrefix+"maximum-track").append(template.maxThumb);
				}

				if(orientation == "vertical"){
					$el.addClass(cssPrefix+"vertical-slider");
				}
			},

			init: function( element, info ) {
				if(info == undefined){info = {}}
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("ui-slider") ) {
						this.addClass("ui-slider");
					}
					_options = this._options();
					_range = info.range;



					if(_range == true && info.values == undefined){
						_options.values[0] = _options.min;
						_options.values[1] = _options.max;
					}

					_$element = $(element);
					this._createElement(_$element, _range, _options.orientation);

					_$maximumTrack = _$element.find("."+cssPrefix+"maximum-track");
					_$minimumTrack = _$element.find("."+cssPrefix+"minimum-track");

					_$minimumValue = _$element.find("."+cssPrefix+"minimum-value").html(_options.min);
					_$maximumValue = _$element.find("."+cssPrefix+"maximum-value").html(_options.max);
					
					_track = new Element( _$minimumTrack.get(0) );	
					_$thumb = _$element.find("."+cssPrefix+"slider-thumb"); 	

					if(_options.range === true){
						_$minimumThumb = _$thumb.filter("."+cssPrefix+"slider-thumb."+cssPrefix+"minimum-thumb");
						_$maximumThumb = _$thumb.filter("."+cssPrefix+"slider-thumb."+cssPrefix+"maximum-thumb");
					}else{
						_$targetThumb = _$thumb;	
					}
					
					_$doc = $(document);	
					_$body = $("body");

					_info = new UISliderInfo(element);
					_info.minValue = _options.min;
					_info.maxValue = _options.max;

					this.__setting(_options.orientation);								
					this.__bindEvent();

					if( _range === true ){////////////////
						var ary = [];
						ary[0] = _options.values[0];
						ary[1] = _options.values[1];
						_options.values = ary;
						this.values(_options.values);
					}else{
						this.value(_options.value);
					}	

					if(_options.disabled){
						this.disable();
					}
				}
				return this;
			},

			/** 
			 * slider를 비활성화 한다.
			 * @memberof Slider
			 * @since 1.0.0
			 * @return {Slider} Slider instance
			 */
			disable: function(){
				this.disabled(true);
				return this;
			},

			/** 
			 * slider를 활성화 한다.
			 * @memberof Slider
			 * @since 1.0.0
			 * @return {Slider} Slider instance
			 */
			enable: function(){
				this.disabled(false);
				return this;
			},

			__bindEvent: function(){			
				$(window).on("resize."+this.instanceID, this._resizeHandler.bind(this));	
				_$thumb.on(_info.interaction.hasTouch ? "touchstart."+this.instanceID : "mousedown."+this.instanceID, this._eventHandler.bind(this));
				_$thumb.on(_info.interaction.hasTouch ? "touchmove."+this.instanceID : "mousemove."+this.instanceID, this._eventHandler.bind(this));
				_$thumb.on(_info.interaction.hasTouch ? "touchend."+this.instanceID : "mouseup."+this.instanceID, this._eventHandler.bind(this));
				if ( _info.interaction.hasTouch ) {	_$thumb.on("touchcancel."+this.instanceID, this._eventHandler.bind(this));}	
				_$maximumTrack.on("click."+this.instanceID, this.__maximumTrackClickHandler.bind(this));
			},

			__unbindEvent: function(){
				$(window).off("resize."+this.instanceID);	
				_$thumb.off(_info.interaction.hasTouch ? "touchstart."+this.instanceID : "mousedown."+this.instanceID);
				_$thumb.off(_info.interaction.hasTouch ? "touchmove."+this.instanceID : "mousemove."+this.instanceID);
				_$thumb.off(_info.interaction.hasTouch ? "touchend."+this.instanceID : "mouseup."+this.instanceID);
				if ( _info.interaction.hasTouch ) { _$thumb.off("touchcancel."+this.instanceID); }	
				_$maximumTrack.off("click."+this.instanceID );
			},

			__setting: function(orientation){		
				_info.trackOffset.x = 0;
				_info.trackOffset.y = 0;
				_info.allowTrackOffset.minX = 0;
				_info.allowTrackOffset.maxX = 0;
				_info.allowTrackOffset.minY = 0;
				_info.allowTrackOffset.maxY = 0;

				switch( orientation ){
				case "vertical":
					this.__movePos = this.__movePosY;
					this.__calcTrackOffset = this.__calcTrackOffsetY;
					this.__exeTrackAnimation = this.__exeTrackAnimationY;
					
					_info.trackOffset.y = _$minimumTrack.height();
					_info.allowTrackOffset.maxY = _$maximumTrack.height();
					if( _options.range === true ){
						_info.allowMinimumTrackOffset.maxY = _info.allowMaximumTrackOffset.maxY = _info.allowTrackOffset.maxY;
					}
					
					this.__setStepData();					

					this.__maximumTrackClickHandler = function(e){
						if(e.target == _$minimumTrack.get(0) || e.target == _$maximumTrack.get(0)){
							var offsetY = e.offsetY;
							var y=0, maxY = _$element.height();
							if( e.target == _$maximumTrack.get(0)){
								y = maxY - offsetY;
							}else if(e.target == _$minimumTrack.get(0) ){
								var n = maxY-(_$minimumTrack.height()+parseInt(_$minimumTrack.css("bottom")));
								y = maxY - (offsetY + n);
							}
							
							if( _options.range === true ){								
								var minDist = Math.abs( parseInt(_$minimumThumb.css("bottom")) - y);
								var maxDist = Math.abs( parseInt(_$maximumThumb.css("bottom")) - y);

								if(minDist<maxDist){
									this.__changeTargetThumb( _$minimumThumb );
								}else{
									this.__changeTargetThumb( _$maximumThumb );
								}
							}

							this.trackTo(y);
						}
					}

				break;
				default:
					this.__movePos = this.__movePosX;
					this.__calcTrackOffset = this.__calcTrackOffsetX;
					this.__exeTrackAnimation = this.__exeTrackAnimationX;
					
					_info.trackOffset.x = _$minimumTrack.width();
					_info.allowTrackOffset.maxX = _$maximumTrack.width();
					if( _options.range === true ){
						_info.allowMinimumTrackOffset.maxX = _info.allowMaximumTrackOffset.maxX = _info.allowTrackOffset.maxX;
					}
											
					this.__setStepData();
					this.__maximumTrackClickHandler = function(e){
						if(e.target == _$minimumTrack.get(0) || e.target == _$maximumTrack.get(0)){
							var offsetX = e.offsetX;
							if(e.target == _$minimumTrack.get(0)){
								offsetX += parseInt(_$minimumTrack.css("left"));
							}
							if( _options.range === true ){
								var minDist = Math.abs( parseInt(_$minimumThumb.css("left")) - offsetX);
								var maxDist = Math.abs( parseInt(_$maximumThumb.css("left")) - offsetX );

								if(minDist<maxDist){
									this.__changeTargetThumb( _$minimumThumb );
								}else{
									this.__changeTargetThumb( _$maximumThumb );
								}
							}

							this.trackTo(offsetX);
						}
					}
				}
			},


			__maximumTrackClickHandler: function(){},

			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {					
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
			
			_timeStamp: function() {
				return (new Date()).getTime();
			},

			_resizeHandler: function(){
				var n = _info.maxValue-_info.minValue;
				var v = _info.value-_info.minValue;

				if(_options.orientation == "horizontal"){
					if( _range ){
						v = _info.values[0]-_info.minValue;
						_info.minimumTrackOffset.x = Math.round(_$element.width()*(v/n));
						v = _info.values[1]-_info.minValue;
						_info.maximumTrackOffset.x = Math.round(_$element.width()*(v/n));		
						_info.allowMinimumTrackOffset.maxX = _info.maximumTrackOffset.x;
						_info.allowMaximumTrackOffset.maxX = _$element.width();	
					}else{
						_info.trackOffset.x = Math.round(_$element.width()*(v/n));
						_info.allowTrackOffset.maxX = _$element.width();	
					}
				}else{					
					if( _range ){
						v = _info.values[0]-_info.minValue;
						_info.minimumTrackOffset.y = Math.round(_$element.height()*(v/n));
						v = _info.values[1]-_info.minValue;
						_info.maximumTrackOffset.y = Math.round(_$element.height()*(v/n));	
						_info.allowMinimumTrackOffset.maxY = _info.maximumTrackOffset.y;
						_info.allowMaximumTrackOffset.maxY = _$element.height();	
					}else{
						_info.trackOffset.y = Math.round(_$element.height()*(v/n));
						_info.allowTrackOffset.maxY = _$element.height();	
					}
				}
			},
			
			__changeTargetThumb: function( target ){
				if( target == _$minimumThumb || target == _$minimumThumb.get(0) ){
					_$maximumThumb.removeClass(cssPrefix+"target-thumb");
					_$targetThumb = _$minimumThumb.addClass(cssPrefix+"target-thumb");
					_info.allowTrackOffset = _info.allowMinimumTrackOffset;
					_info.trackOffset = _info.minimumTrackOffset;
				}else{
					_$minimumThumb.removeClass(cssPrefix+"target-thumb");
					_$targetThumb = _$maximumThumb.addClass(cssPrefix+"target-thumb");
					_info.allowTrackOffset = _info.allowMaximumTrackOffset;
					_info.trackOffset = _info.maximumTrackOffset;
				}
			},

			_start: function(e) {
				var event = this._event(e);
				if(_options.range === true ){
					if( e.target == _$minimumThumb.get(0) ){
						this.__changeTargetThumb( _$minimumThumb );
					}else{
						this.__changeTargetThumb( _$maximumThumb );
					}
				}
 				
				_info.interaction.target = e.target || e.srcElement;
				_info.interaction.startTime = this._timeStamp();		
				_info.interaction.beginPoint.x = _info.interaction.currentPoint.x = event.pageX;
				_info.interaction.beginPoint.y = _info.interaction.currentPoint.y = event.pageY;
				
				_info.interaction.clickable = true;
				_info.interaction.startInteraction = true;
				//_info.interaction.dragOffset.x = 0;
				//_info.interaction.dragOffset.y = 0;
				
				_track.killAnimation( false );
				_$doc.off("mouseup."+this.instanceID).on("mouseup."+this.instanceID, this._eventHandler.bind(this) );
				_$doc.off("mouseleave."+this.instanceID).on("mouseleave."+this.instanceID, this._eventHandler.bind(this) );
				
							
				return true;
			},

			__getRangeValue: function(){
				if( _range === true ){
					return _info.values;
				}else{
					return _info.value;
				}
			},

			__movePos: function(){},
			__movePosX: function(point, wasPoint){
				/*var moveX, toX;
				moveX = ( wasPoint.x - point.x ) * -1;
				if ( _info.trackOffset.x < _info.allowTrackOffset.minX || _info.trackOffset.x > _info.allowTrackOffset.maxX ) {
					moveX = 0;
				}
				toX = _info.trackOffset.x + moveX;//	
				this.trackOffset( toX, {overflowY:true} );
				_info.interaction.dragOffset.x += moveX;
				*/
				var toX = point.x-_$element.offset().left;
				this.trackOffset( toX, {overflowY:true} );
			},

			__movePosY:function(point, wasPoint){
				/*var moveY, toY;
				moveY = ( wasPoint.y - point.y );
				if ( _info.trackOffset.y < _info.allowTrackOffset.minY || _info.trackOffset.y > _info.allowTrackOffset.maxY ) {
					moveY = 0;
				}

				toY = _info.trackOffset.y + moveY;
				this.trackOffset( toY, {overflowX:true} );
				_info.interaction.dragOffset.y += moveY;*/
				var toY = _info.allowTrackOffset.maxY-(point.y-_$element.offset().top);
				this.trackOffset( toY, {overflowX:true} );
			},

			
			_move: function(e) {
				e.preventDefault();			
				if ( _info.interaction.startInteraction ) {					
					var point, wasPoint, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_info.interaction.currentPoint.x, y:_info.interaction.currentPoint.y};
					if ( _info.interaction.dragging == false ) {
						this.dispatchEvent( "start", this, this.__getRangeValue(), _$targetThumb.get(0) );
						_options.start( this, this.__getRangeValue(), _$targetThumb.get(0) );	
					}
					
					_info.interaction.clickable = false;
					_info.interaction.dragging = true;
					_info.interaction.currentPoint.x = event.pageX;
					_info.interaction.currentPoint.y = event.pageY;

					if ( _info.interaction.dragging == true ) {
						this.__movePos(point, wasPoint);						
						if ( _info.interaction.globalMove == false ) {
							_info.interaction.globalMove = true;
							_$body.on( "touchmove."+this.instanceID+", "+"mousemove."+this.instanceID, this._eventHandler.bind(this) );
						}
						
						this.dispatchEvent( "slide", this, this.__getRangeValue(), _$targetThumb.get(0) );
						_options.slide( this, this.__getRangeValue(), _$targetThumb.get(0) );	
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {	
				if ( _info.interaction.globalMove == true ) {
					_info.interaction.globalMove = false;
					_$body.off("touchmove."+this.instanceID+", "+"mousemove."+this.instanceID);
					_$doc.off("mouseup."+this.instanceID );
					_$doc.off("mouseleave."+this.instanceID );
				}
			
				if ( _info.interaction.startInteraction ) {
					
					if ( _info.interaction.dragging == true ) {
						_info.interaction.dragging = false;
						
						this.dispatchEvent( "stop", this, this.__getRangeValue(), _$targetThumb.get(0) );
						_options.stop( this, this.__getRangeValue(), _$targetThumb.get(0) );	
					}
					
					_info.interaction.target = undefined;
					_info.interaction.startInteraction = false;
				}
				
				return true;	
			},
			
			_eventHandler: function(e) {	
				var result = undefined;
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = this._start.call( this, e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = this._move.call( this, e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = this._end.call( this, e, ( e.type === "mouseleave" ) );
					break;
					case "mousewheel":
						if ( ! _info.interaction.startInteraction ) {						
							var moveX = e.originalEvent.deltaX;
							var moveY = e.originalEvent.deltaY;							
							this.contentOffset( _info.contentOffset.x + moveX, _info.contentOffset.y + moveY );
						}
						
						result = false;
					break;
				}
				return result;	
			},
			
			_info: function() {
				return _info;	
			},
			
			
			destroy: function() {			
				this.__unbindEvent();
				if ( !_info.interaction.hasTouch ) {
					_$doc.off("mouseup."+this.instanceID );
					_$doc.off("mouseleave."+this.instanceID );
				}
				
				_$maximumTrack.off("click."+this.instanceID);
				_track.destroy(true);				
				this._super("destroy", arguments );
			},

			__calcTrackOffset: function(){},

			__calcTrackOffsetX: function(x, options){
				var oldX = x;
				if ( ! options || ! options.overflowX === true ) {
					x = Math.min( Math.max(x, _info.allowTrackOffset.minX), _info.allowTrackOffset.maxX );
				}

				var elementWid = _$element.width();
				_info.trackOffset.x = x;
				
				var perX = Math.round((x/elementWid)*100);				
				if(_options.step){
					perX = this.__setSliderStep(perX).pos;
				}

				var trackWidth;
				if(_options.range === true){
					if( _$targetThumb == _$minimumThumb ){
						trackWidth = (parseInt(_$maximumThumb.css("left"))/elementWid*100)-perX;
						_track.css({left: perX+"%"});
						_info.allowMaximumTrackOffset.minX = elementWid/100*perX;
					}else{
						trackWidth = (perX- (parseInt(_$minimumTrack.css("left"))/elementWid*100));						
						_$targetThumb.css({left: perX+"%"})
						_info.allowMinimumTrackOffset.maxX = elementWid/100*perX;
					}
					trackWidth = Math.min(Math.max(trackWidth,0), elementWid);
					_track.css({width: trackWidth+"%"});
				}else{
					if(_range != "max"){
						var l = parseInt(_$minimumTrack.css("left"))/elementWid*100;
						trackWidth = parseInt(perX-parseInt(l));
					}else{
						_track.css({left: perX+"%"});
						trackWidth = parseInt(100-perX);
					}
					trackWidth = Math.min(Math.max(trackWidth,0), elementWid);
					_track.css({width: trackWidth+"%"});
				}
				_$targetThumb.css({left: perX+"%"});
			},


			__calcTrackOffsetY: function(y, options){
				if ( ! options || ! options.overflowY === true ) {
					y = Math.min( Math.max(y, _info.allowTrackOffset.minY), _info.allowTrackOffset.maxY );
				}

				_info.trackOffset.y = y;
				var elementHei = _$element.height();
				var perY = Math.round((y/elementHei)*100);

				if(_options.step){
					perY = this.__setSliderStep(perY).pos;
				}

				if( _range === true){
					var trackHeight, h;
					if( _$targetThumb == _$minimumThumb ){
						h = (parseInt(_$maximumThumb.css("bottom"))/ elementHei*100)-perY;
						trackHeight = Math.min(Math.max( parseInt(h), 0), elementHei);
						_track.css({bottom: perY+"%", height: trackHeight+"%"});
						_info.allowMaximumTrackOffset.minY = _$element.height()/100*perY;
					}else{
						h = parseInt(perY-(parseInt(_$minimumTrack.css("bottom"))/elementHei*100));
						trackHeight = Math.min( Math.max( h, 0 ), elementHei );
						_track.css({height: trackHeight+"%"});
						_info.allowMinimumTrackOffset.maxY = elementHei/100*perY;
					}
				}else{
					if( _range != "max"){
						var hei =  Math.min(Math.max(parseInt((parseInt(_$targetThumb.css("bottom"))/elementHei*100)-perY),0), elementHei );
						_track.css({height: perY+"%"});	
					}else{
						_track.css({bottom: perY+"%", height: (100-perY)+"%"});	
					}
				}

				_$targetThumb.css({bottom: perY+"%"})
			},	
			

			trackOffset: function( pos, options ) {
				if ( this.isDisabled() ) {return;}
				
				if ( arguments.length == 0 ) {
					return Object.clone( _info.contentOffset );
				}
				
				this.__calcTrackOffset(pos, options);
				this._updateValue();
				//this.dispatchEvent( "tracking", this );
			},

			trackTo: function( pos ) {
				if ( this.isDisabled() ) {return;}
				pos = Math.round(pos);

				if(_options.animate){
					this.trackToAnimation(pos);
				}else{
					this.trackOffset( pos );	
				}
			},
			
			__exeTrackAnimationX:function( x, duration){
				var me=this;
				_track.killAnimation( false );
				var elementWid = _$element.width();
				var posX = ((x/elementWid)*100);

				if(_options.step){
					posX = this.__setSliderStep(posX).pos;
				}				
				var aniObj = {};
				if(_options.range === true){
					var l;
					if( _$targetThumb == _$minimumThumb ){
						if( _$minimumTrack.data("maxLeft") != undefined ){
							l = _$minimumTrack.data("maxLeft");//animate중 애니메이션..
						}else{
							l = parseInt(parseInt(_$maximumThumb.css("left"))/elementWid*100);
						}
						var wid = l-posX;
						aniObj = {left: posX+"%", width: wid+"%"};
						_info.allowMaximumTrackOffset.minX = _$element.width()/100*posX;
					}else{
						if( _$minimumTrack.data("minLeft") != undefined ){
							l = _$minimumTrack.data("minLeft");
							aniObj.left = l+"%";
						}else{
							l = parseInt(parseInt(_$minimumThumb.css("left"))/elementWid*100);
						}
						aniObj.width = (posX-l)+"%";
						_info.allowMinimumTrackOffset.maxX = _$element.width()/100*posX;
					}
				}else{
					if( _range != "max"){
						aniObj = {width: posX+"%"};						
					}else{
						aniObj = {left: posX+"%", width: (100-posX)+"%"};						
					}
				}
				
				_$targetThumb.stop().animate({left: posX+"%"}, 300);
				_$minimumTrack.stop().animate(aniObj, 300, function(){
					_track.dispatchEvent( "finishTrackAnimation", _track );
					_$minimumTrack.data("minLeft", undefined);
					_$minimumTrack.data("maxLeft", undefined);
					me._updateValue();
				});

				_$minimumTrack.css("overflow", "visible");		
				_info.trackOffset.x = x;
			},

			__exeTrackAnimationY:function( y, duration ){
				var me=this;
				_track.killAnimation( false );
				var elementHei = _$element.height();
				var posY = (y/_$element.height())*100;
				if(_options.step){
					posY = this.__setSliderStep(posY).pos;
				}

				var aniObj;
				if(_options.range === true){
					var b;
					if( _$targetThumb == _$minimumThumb ){
						if( _$minimumTrack.data("maxBottom") != undefined ){
							b = _$minimumTrack.data("maxBottom");//animate중 애니메이션..
						}else{
							b = (parseInt(_$maximumThumb.css("bottom"))/ elementHei*100)-posY;
						}

						b = parseInt(b);

						aniObj = {bottom: posY+"%", height: b+"%"};
						_info.allowMaximumTrackOffset.minY = elementHei/100*posY;
						_$minimumTrack.data({"minBottom": posY});
					}else{
						aniObj = {}
						if( _$minimumTrack.data("minBottom") != undefined ){
							b =  _$minimumTrack.data("minBottom");
							aniObj.bottom = b+"%"
						}else{
							b = parseInt(posY-(parseInt(_$minimumThumb.css("bottom"))/ elementHei*100) );
						}
						aniObj.height = (posY-b)+"%";
						_info.allowMinimumTrackOffset.maxY = elementHei/100*posY;
						_$minimumTrack.data({"maxBottom": b});
					}
				}else{
					if( _range != "max"){
						aniObj = {height: posY+"%"};
					}else{
						aniObj = {bottom: posY+"%", height: (100-posY)+"%"};
					}
				}					

				_$targetThumb.stop().animate({bottom: posY+"%"}, 300);
				_$minimumTrack.stop().animate( aniObj, 300, function(){
					_track.dispatchEvent( "finishTrackAnimation", _track );
					_$minimumTrack.data("minBottom", undefined);
					_$minimumTrack.data("maxBottom", undefined);
					me._updateValue();
				});

				_$minimumTrack.css("overflow", "visible");
				_info.trackOffset.y = y;
			},

			__exeTrackAnimation: function(pos, duration){},
					
			trackToAnimation: function( pos, options ) {
				if ( this.isDisabled() ) {return;}
				pos = Math.round(pos);
				var duration = ( options && ! isNaN(parseInt(options["duration"])) ) ? parseInt(options["duration"]) : 300;	
				this.__exeTrackAnimation(pos, duration*0.001);				
				this._updateValue();
			},
			
			_updateValue: function() {	
				var oldVal;
				var isChange = true;
				var value = Math.round(this.value());
				if( _range === true ){
					if(_$targetThumb.get(0) == _$minimumThumb.get(0)){
						oldVal = _info.values[0];
						if( oldVal == value ){isChange = false}
						_info.values[0] = value;
						_$minimumTrack.data({"minLeft": value});
					}else{
						oldVal = _info.values[1];
						if( oldVal == value ){isChange = false}
						_info.values[1] = value;
						_$minimumTrack.data("maxLeft", value);
					}

				}else{
					oldVal = _info.value;
					if( oldVal == value ){
						isChange = false
					}else{
						_info.value = value;					
					}
				}

				_$targetThumb.find("."+cssPrefix+"thumb-value").html(value);
				if( isChange == false ){return;}
				
				this.dispatchEvent("change", this, this.__getRangeValue() );
				_options.change(this, this.__getRangeValue());	
			},
			
			/** 
			 * twin slider values를 변경하거나 값을 리턴한다.
			 * @memberof Slider
			 * @since 1.0.0
			 * @param {Array} [values] 변경할 values 
			 * @param {Boolean} [animated] value 변경시 핸들을 animate시킬것인지 여부
			 * @return {Array|Slider} valuse 혹은 Slider instance
			 */
			values: function(values, animated){
				if ( arguments.length == 0 ){ 
					return _info.values; 
				}

				if ( this.isDisabled() ) {return;}
				if( _range === true && values && values.length == 2 ){
					if( values[0] > values[1] ){
						var v = values[0];
						values[0] = values[1];
						values[1] = v;
					}

					if( _options.orientation == "vertical" ){
						_info.allowMinimumTrackOffset.maxY = _$element.height();
						_info.allowMaximumTrackOffset.minY = 0;
					}else{
						_info.allowMinimumTrackOffset.maxX = _$element.width();
						_info.allowMaximumTrackOffset.minX = 0;
					}

					this.__changeTargetThumb(_$minimumThumb);
					this.value(values[0], animated);
					this.__changeTargetThumb(_$maximumThumb);
					this.value(values[1], animated);
				}
				return this;
			},

			/** 
			 * slider value를 변경하거나 값을 리턴한다.
			 * @memberof Slider
			 * @since 1.0.0
			 * @param {Number} [value] 변경할 value 
			 * @param {Boolean} [animated] value 변경시 핸들을 animate시킬것인지 여부
			 * @return {Array|Slider} valuse 혹은 Slider instance
			 */
			value: function( value, animated ) {
				if ( arguments.length == 0 ){ 
					if( _options.step ){
						return _currentStepData.value;
					}
					var v;
					if( _options.orientation == "horizontal" ){
						v = ( _info.maxValue - _info.minValue ) / ( 100 - 0 ) * ( ((_info.trackOffset.x/_$element.width())*100) - 0 ) + _info.minValue;
					}else{
						v = ( _info.maxValue - _info.minValue ) / ( 100 - 0 ) * ( ((_info.trackOffset.y/_$element.height())*100) - 0 ) + _info.minValue;
					}

					v = Math.min( Math.max(v, _info.minValue), _info.maxValue );
					return v; 
				}
				if ( this.isDisabled() ) {return;}
				var pos = ( 100 - 0 ) / ( _info.maxValue - _info.minValue ) * ( value - _info.minValue ) + 0;
				pos = Math.min( Math.max(pos, 0), 100);
				if( _options.orientation == "horizontal" ){
					pos = _$element.width()/100*pos;
				}else{
					pos = _$element.height()/100*pos;	
				}
				
				if ( animated === true ) {
					this.trackToAnimation( pos, {duration:300} );	
				} else {
					this.trackOffset( pos );
				}
				this._updateValue();
			},

			__setSliderStep:function(pos){
				if( _options.step ){			
					_currentStepData = _stepData[0];
					var resultPos = _stepData[0].pos;
					var len = _stepData.length;
					var dist = Math.abs(_stepData[1].pos - _stepData[0].pos);
					for( var i=1; i<len; i++ ){
						if(resultPos < pos){
							var prevPos = _stepData[i-1].pos;
							var currentPos = _stepData[i].pos;

							var prevDist = Math.abs( prevPos-pos );
							var currentDist = Math.abs( currentPos-pos );
							//3은 오차범위 처리를 위한 값						
							if( (prevDist-3) <= dist && (currentDist-3) <= dist ){
								if( currentDist < prevDist ){
									resultPos = currentPos;
									_currentStepData = _stepData[i];
								}else{
									resultPos = prevPos;
									_currentStepData = _stepData[i-1];
								}
								break;
							}
						}
					}				
					return _currentStepData;
				}
			},
			
			__setStepData:function(){
				if( _options.step ){
					_stepData = [];
					var len = Math.ceil((_info.maxValue-_info.minValue)/_options.step);
					var x = Math.round(100/len);	
					_currentStepData = { value: _info.minValue, pos: 0 };
					_stepData.push(_currentStepData);
					for( var i=1; i<len; i++ ){
						var v = _info.minValue+(_options.step*i);
						_stepData.push({value: v, pos: Math.round(x*i) });
					}
					_stepData.push({ value: _info.maxValue, pos: 100  });
				}
			}
			
		}
	}
})


})(window);



(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
UICore = Class.UICore,
cssPrefix = Class.UIKit.cssPrefix,

UIInput = Class({
	name: "UIInput",
	parent: UICore,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					return this;
				};
			},
			
			focus: function() {
				this.element().focus();
			}
		}
	}
}),

UITextArea = Class({
	name: "UITextArea",
	parent: UICore,
	constructor: function(  ) {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					return this;
				};
			}
		}
	}
}),

/**
 * Spinner 기능을 제공한다.
 * @class Spinner
 */
Spinner = Class({
	name: "Spinner",
	parent: UICore,
	
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					"selectors":{
						"btnUp": "."+cssPrefix+"btn-up",
						"btnDown": "."+cssPrefix+"btn-down",
						"field": "input"						
					},
					"value": 0,
					"max": 1000,
					"min": 0,
					"step": 1,
					"disabled" : false,
					"change": function(){}
				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof Spinner 
	 * @param {Element} element 기준이 되는 DOM Element
	 * @param {Object} options.selectors 
	 * @param {String} options.selectors.btnUp=".btn-up" stepUp button 
	 * @param {String} options.selectors.btnDown=".btn-down" stepDown button
	 * @param {String} options.selectors.field="input" Spinner field
	 * @param {Number} options.value Spinner value
	 * @param {Number} options.max=1000 Spinner 최대값
	 * @param {Number} options.min=0 Spinner 최소값
	 * @param {Number} options.step=1 1step당 증감하는 값 
	 * @param {Boolean} options.disabled=false 활성/비활성화 상태
	 * @retuns {Spinner} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var $el, $minusButton, $plusButton, $input;
		var _value, _options, _step, _isDisable;
		var _autoStepTimer;
		return {
			_createElement: function($el){
				var frontTemplate = '<span class="'+cssPrefix+'set-btn">'+
										'<button class="'+cssPrefix+'btn-down" type="button"><span></span></button>'+
									'</span>';

				var backTemplate = 	'<span class="'+cssPrefix+'set-btn">'+
										'<button class="'+cssPrefix+'btn-up" type="button"><span></span></button>'+
									'</span>';

				$el.prepend(frontTemplate);
				$el.append(backTemplate);
			},

			init: function( element, options ) {						
				var self = this._super("init", arguments);
				_options = this._options();
				$el = $(element);
				this._createElement($el);
				if ( self ) {
					$minusButton = $el.find("."+cssPrefix+"btn-down");
					$plusButton = $el.find("."+cssPrefix+"btn-up");
					$input = $el.find("input");
					this.__setting();
					this.__bindEvent();
					return this;
				};
			},

			__setting: function(){
				var val = parseFloat(parseFloat( $input.val() ).toFixed( this._precision()));
				
				if( isNaN(val) ){
					this.value(_options.value);
				}else{
					this.value(val);
				}
				
				if( $el.hasClass("disabled") || _options.disabled ){
					this.disable();
				}else{
					this.enable()
				}
			},

			__setAutoTimer: function( handler, time ){
				this.__clearAutoTimer();
				var me = this;
				var count = 0;
				_autoStepTimer = setInterval(function(){
					if( _autoStepTimer == undefined ){return;}
					if(time != 50){
						count++;
						if(count > 5){
							me.__setAutoTimer(handler, 50);
						}
					}
					
					handler();
					//handler().bind(me); error

				}, time);
			},

			__clearAutoTimer: function(){
				clearInterval(_autoStepTimer);
				_autoStepTimer = undefined;
			},

			__bindEvent: function(){
				var autoStepTimer;
				var time = 200;

				$minusButton.add($plusButton).on("touchend, mouseup, touchcancel", function(){
					this.__clearAutoTimer();
				}.bind(this));

				$minusButton.on("touchstart, mousedown", function(e){
					this.__setAutoTimer(this.stepDown, time);
				}.bind(this));

				$plusButton.on("touchstart, mousedown", function(e){
					this.__setAutoTimer(this.stepUp, time);
				}.bind(this));

				$minusButton.on("click", function(e) {
					this.__clearAutoTimer();
					this.stepDown();
				}.bind(this));
				
				$plusButton.on("click", function(e) {
					this.__clearAutoTimer();
					this.stepUp();
				}.bind(this));

				$input.on("focusout", function(){
					this.__clearAutoTimer();
					var fieldNum = parseFloat($input.val());
					var value = ( isNaN( fieldNum ) ) ? 0 : fieldNum;
					this.value(value);
				}.bind(this));
			},

			//소수즘 증가, 감소시 chrome버그 부분 해결 
			_precision: function() {
				var precision = this._precisionOf( _options.step );
				precision = Math.max( precision, this._precisionOf( _options.min ) );
				return precision;
			},

			_precisionOf: function( num ) {
				var str = num.toString(),
					decimal = str.indexOf( "." );
				return decimal === -1 ? 0 : str.length - decimal - 1;
			},

			/** 
			 * Spinner의 max값을 변경한다.
			 * @memberof Spinner
			 * @param {Number} [value] 변경할 max 값
			 * @since 1.0.0
			 * @return {Spinner|Number} 변경 값이 있을경우 Spinner instance, 없을경우 max값을 리턴함.
			 */
			max: function( value ){
				if( value != undefined ){
					_options.max = parseFloat(parseFloat(value).toFixed( this._precision()));	
					this.value(_value);
					return this;
				}else{
					return _options.max;
				}
			},

			/** 
			 * Spinner의 min값을 변경한다.
			 * @memberof Spinner
			 * @param {Number} [value] 변경할 min 값
			 * @since 1.0.0
			 * @return {Spinner|Number} 변경 값이 있을 경우 Spinner instance, 없을 경우 min값을 리턴함.
			 */
			min: function( value ){
				if( value != undefined ){
					_options.min = parseFloat(parseFloat(value).toFixed( this._precision()));	
					this.value(_value);
					return this;
				}else{
					return _options.min;
				}
			},

			/** 
			 * Spinner의 값을 1step 증가 시킨다.
			 * @memberof Spinner
			 * @param {Number} [step] 증가시킬 step count, 생략시 옵션 값을  적용함.
			 * @since 1.0.0
			 * @return {Spinner} 변Spinner instance
			 */
			stepUp: function( step ){
				var stepValue = ( isNaN( step ) ) ? _options.step  : step;
				var upValue = _value + stepValue;			
				this.value( upValue );
				return this;
			},

			/** 
			 * Spinner의 값을 1step 감소 시킨다.
			 * @memberof Spinner
			 * @param {Number} [step] 증가시킬 step count, 생략시 옵션 값을  적용함.
			 * @since 1.0.0
			 * @return {Spinner} 변Spinner instance
			 */
			stepDown: function( step ){
				var stepValue = ( isNaN( step ) ) ? _options.step  : step;
				var downValue = _value - stepValue			
				this.value( downValue );
				return this;
			},			

			/**
			 * Spinner value값을 변경한다.
			 * @memberof Spinner
			 * @param {Number} [value] 변경할 값 
			 * @since 1.0.0 
			 * @return {Spinner|Number} 변경 값이 있을 경우 Spinner instance, 없을 경우 value 값을 리턴함
			 */
			value: function(value){
				if( _isDisable ){return;}
				if( value != undefined ){
					value = parseFloat(parseFloat(value).toFixed( this._precision()));
					value = Math.min( Math.max( value, _options.min ), _options.max );
					$input.val(value);	
					if( _value != value ){
						_value = value;
						this.__triggerChange();
					}
					return this;
				}else{
					return _value;
				}
			},

			__triggerChange: function(){
				_options.change( this, _value, $el.get(0) );
				this.dispatchEvent("uiSpinnerchange", this, _value, $el.get(0));
			},


			/**
			 * Spinner을 비활성화 시킨다.
			 * @memberof Spinner
			 * @since 1.0.0 
			 * @return {Spinner}
			 */
			disable: function(){
				_isDisable = true;
				$minusButton.add($plusButton).add($input).attr("disabled", "disabled");				
				return this;
			},

			/**
			 * Spinner을 활성화 시킨다.
			 * @memberof Spinner
			 * @since 1.0.0 
			 * @return {Spinner}
			 */
			enable: function(){
				_isDisable = false;
				$minusButton.add($plusButton).add($input).removeAttr("disabled");
				return this;
			}			
		}
	}
});

})(window);

(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,
UIControl = Class.UIControl,

UISelectOption = Class({
	name: "UISelectOption",
	parent: Element,
	constructor: function() {
	
		var _option, _selected;
	
		return {
			init: function( element, option, label, value, selectBox ) {
				var self = this._super("init", arguments );
				if (self) {
				
					var that = this;
					
					_option = option;
				
					this.html(label);
					this.data("value", value);
					this.addClass("UISelectOption");
					
					this.bind("click", function(e) {
						selectBox.selectOption( that );
						
						e.stopPropagation();
						return false;
					});
				
					return this;	
				}
			},
			
			destroy: function() {
				this.unbind("click");
				
				this._super("destroy", arguments);
			},
			
			option: function() {
				return _option;	
			},
			
			label: function() {
				return this.element.html();	
			},
			
			value: function( value ) {
				if ( arguments.length === 0 ) {
					return this.data("value");
				}
				
				this.data("value", value);
			},
			
			selected: function( selected ) {
				_selected = selected;
				
				if ( _selected == true ) {
					$(_option).attr("selected", true);
					
					this.addClass("selected");
				}
				else {
					$(_option).removeAttr("selected");
					
					this.removeClass("selected");
				}
			}
		}
	}
}),

UISelectBox = Class({
	name: "UISelectBox",
	parent: Element,
	constructor: function() {
	
		var _currentSelect, _that, _content, _container, _items = [];
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments );
				if (self) {
					
					_that = this;
					
					if ( $(element).find("DIV.UISelectContent").get(0) ) {
						_content = new Element($(element).find("DIV.UISelectContent").get(0));
					}
					else {
						_content = new Element("DIV");
						_content.addClass("UISelectContent");
					}
					
					if ( $(element).find("UL.UISelectOptions").get(0) ) {
						_container = new Element($(element).find("UL.UISelectOptions").get(0));
					}
					else {
						_container = new Element("UL");
						_container.addClass("UISelectOptions");
					}
					
					//this.attr("id", "__UISelectBox__" + time());
					this.addClass("UISelectBox");
					
					_content.append( _container );
					
					this.append(_content);
					
					$(document).bind("click", function(e) {
						_that.close();
					});
					
					return this;
				}
			},
			
			destroy: function() {
			
				$(document).unbind("click.UISelect");
				
				_container.destroy(true);
				_content.destroy(true);
				
				this._super("destroy", arguments);		
			},
			
			clear: function() {
				while( _items.length > 0 ) {
					var item = _items.shift();
					item.destroy(true);
				}
				
				_items = [];
			
				_container.empty();	
			},
			
			selectOption: function( option ) {
				Array.each( _items, function( index, item ) {
					item.selected( ( item === option ) ? true : false );
				});
				
				if ( _currentSelect ) {
					
					$(_currentSelect.element()).trigger("change");
				
					var selectedTitle = _currentSelect.selectedTitle();
					_currentSelect.label().html( selectedTitle );
					_currentSelect.dispatchEvent( "change", _currentSelect );
					_currentSelect.close();
				}
			},
			
			open: function( select ) {
				_currentSelect = select;
								
				this.clear();
				
				var options = select.options();
				var selectedIndex = select.selectedIndex();
				var selectElement = this;
				
				Array.each( options, function( index, option ) {
					var label = option.innerHTML;
					var value = option.getAttribute("value");
				
					var item = new UISelectOption( "LI", option, label, value, selectElement);
					item.selected( (( selectedIndex === index ) ? true : false) );
					
					_items.push( item );
					_container.append( item );
				});
				
				// TODO : scroll
				this.addClass("open");
			},
			
			close: function( select ) {
				this.removeClass("open");
			}
		}	
	}
}),

UISelectLink = Class({
	name: "UISelectLink",
	parent: Element,
	constructor: function() {
	
		var _select, _label, _arrow;
		
		return {
			
		
			init: function( element, select ) {
				var self = this._super("init", arguments);
				if (self) {
				
					_select = select;
					
					if ( $(element).find("span.UISelectLabel").get(0) ) {
						_label = new Element($(element).find("span.UISelectLabel").get(0));
					}
					else {
						_label = new Element("span");
						_label.addClass("UISelectLabel");
					}
					
					if ( $(element).find("span.UISelectArrow").get(0) ) {
						_label = new Element($(element).find("span.UISelectArrow").get(0));
					}
					else {
						_arrow = new Element("span");
						_arrow.addClass("UISelectArrow");
					}
					
					this.addClass("UISelect");
					this.attr("href", "javascript:void(0);");
					
					this.append(_label);
					this.append(_arrow);
					
					this.bind("click", function(e) {
						_select.open();
						e.stopPropagation();
						return false;
					});
					
					return this;
				}
			},
			
			label: function() {
				return _label;	
			},
			
			outerHeight: function() {
				return $(this.element()).outerHeight();	
			},
			
			destroy: function() {
				this.unbind("click");
			
				_label.destroy(true);
				_arrow.destroy(true);
				
				this._super("destroy", arguments);	
			}
		};
	}
}),

UISelect = Class({
	name: "UISelect",
	parent: UIControl,
	constructor: function() {
		
		var _selectBox;
		var _selectLink;
		
		return {
			options: function() {
				return this.find("option");
			},
			
			selectedIndex: function() {
				return this.element().selectedIndex;	
			},
			
			selectedTitle: function() {
				var options = this.options();
				var selectedIndex = this.selectedIndex();
			
				if ( options[selectedIndex] ) {
					return options[selectedIndex].innerHTML;
				}
				
				return undefined;
			},
			
			clear: function() {
				this.empty();
			},
			
			addOption: function( text, value ) {
				var option = document.createElement("OPTION");
				option.text = text;
				option.value = value;
				
				this.element().appendChild( option );
			},
			
			label: function() {
				return _selectLink.label();	
			},
			
			open: function() {
			
				var position = {
					x:_selectLink.offset().x,
					y:(_selectLink.offset().y + _selectLink.outerHeight())
				};
			
				_selectBox.css({
					//"-webkit-transform": "translateX(" + _selectLink.offset().x + "px) translateY(" + (_selectLink.offset().y + _selectLink.outerHeight()) + "px) translateZ(0px)"
					left: position.x, 
					top: position.y
				});
				
				_selectBox.open( this );
			},
			
			close: function() {
				
				_selectBox.close( this );	
			},
			
			val: function() {
				var options = this.options();	
				var selectedIndex = this.selectedIndex();
			
				if ( options[selectedIndex] && options[selectedIndex].value ) { 
					return options[selectedIndex].value;
				}
				
				return null;
			},
			
			destroy: function() {
			
				_selectLink.destroy(true);
				
				this._super("destroy", arguments );	
			},
		
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UISelect") ) {
						this.addClass("UISelect");
					}
					
					var selectBoxClass = $(element).attr("data-class-select-box");
					var selectBoxSelector = $(element).attr("data-selector-select-target");
					
					if ( selectBoxSelector && $(selectBoxSelector).get(0) ) {
					
						if ( $(selectBoxSelector).instance() ) {
							_selectBox = $(selectBoxSelector).instance();
						}
						else {
							_selectBox = new UISelectBox( $(selectBoxSelector).get(0) );
						}
					}
					else if ( selectBoxClass !== "UISelect" ) {
						_selectBox = new UISelectBox( "DIV" );
					}
					else {
						_selectBox = UISelect.selectBox();
					}
					
					_selectBox.addClass(selectBoxClass);
					
					_selectLink = new UISelectLink("A", this);
					_selectLink.label().html( this.selectedTitle() );
					
					this.insertAfter( _selectLink );
					
					_selectLink.addClass( this.element().className );
					if ( $(element).attr("style") ) {
						_selectLink.attr("style", $(element).attr("style"));
					}

					
					//if ( $(document.body).contains( _selectBox.element() ) ) {
						$(document.body).append( _selectBox.element() );
					//}
					
					return this;
				};
			}
		}
	},
	'static': function() {
	
		var _selectBox;
		
		return {
			selectBox: function() {
				if ( _selectBox === undefined ) {
					_selectBox = new UISelectBox("DIV");
				}
				
				return _selectBox;
			}
		}
	}
});
	
})(window);

(function(window, undefined) {

'use strict';

var
Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,
cssPrefix = Class.UIKit.cssPrefix,

/**
 * page indicator 기능을 제공한다.
 * @class PageIndicator
 */
PageIndicator = Class({
	name: "PageIndicator",
	parent: UICore,
	constructor: function(  ) {
		var _numberOfPages = 0;
		var _currentPage = 0;
		var _items = [];
		var _delegate = undefined;
		var _delegateCan = {
			didSelectPage: false	
		};
		
		var _$element;
		return {
			init: function( element, container ) {
				var self = this._super("init", arguments);
				if (self) {
					_$element = $(element);
					this.__bindEvent();
					return this;
				}
			},
			
			destroy: function() {
				_container.destroy(true);				
				this._super("destroy", arguments );
			},
			
			__bindEvent: function(){
				var me = this;
				_$element.on("click", "[data-page]", function(){
					var index = $(this).attr("data-page");
					me.dispatchEvent("selectPage", index);
					if ( _delegateCan.didSelectPage ) {
						_delegate.didSelectPage( self, _currentPage );
					}
				});
			},

			delegate: function( delegate ) {
				_delegate = delegate;
				_delegateCan.didSelectPage = ( typeof _delegate["didSelectPage"] === "function" );	
			},
			
			setNeedsDisplay: function() {
				var self = this;
				_items = [];
				var contentStr = '<ul>';
				for ( var page=1; page<=_numberOfPages; page++ ) {
					contentStr += '<li data-page='+page+'><span>'+page+'</span></li>'
				}
				contentStr += "</ul>";
				_$element.html(contentStr);
			},
			

			currentPage: function( page ) {
				if(arguments.length == 0){return _currentPage;}
				_currentPage = Math.min(Math.max(1, page), _numberOfPages);
				_$element.find("[data-page='"+page+"']").addClass(cssPrefix+"active")
				.siblings().removeClass(cssPrefix+"active");
			},
			
			numberOfPages: function( count ) {
				_numberOfPages = count;
				this.setNeedsDisplay();
			}
		};
	}
}),


/**
 * loading spinner 기능 제공한다.
 * @class LoadingSpinner
 */
LoadingSpinner=Class({
	name: "LoadingSpinner",
	parent: UICore,
	'static': {
		_setting:{
			defaultOptions: {	
				"labelData":{
					"txt": undefined,
					"loadingTxt": undefined,//txt값만 있을경우 txt값을 복사함
					"spinPosition": "left",//right//top//bottom//
					"isLabelHide": false//감출때 라벨값도 함께 감출것인
				},

				"isAnimate": true
			}
		}
	},

	/**
	 * @constructor
	 * @memberof LoadingSpinner
	 * @param {Element} 기준이 되는 DOM Element
	 * @param {Object} options 
	 * @param {Object} options.labelData label이 있는 loading spinner를 생성할때 필요한 데이터
	 * @param {String} options.labelData.txt label의 텍스트 정보
	 * @param {String} options.labelData.loadingTxt=labeldata.txt spinner 아이콘 노출시 출력되는 텍스트 정보
	 * @param {String} options.labelData.spinPosition="left" spinner 아이콘의 노출 위치 type: "left", "right", "top", "bottom"
	 * @param {Boolean} options.labelData.isLabelHide=false hide 메소드 호출 시 label까지 감출것인지에 대한 true/false 값
	 * @param {Boolean} options.isAnimate=true spinner 아이콘 show/hide시 애니메이션을 적용할 것인지 여
	 */
	constructor: function(){
		var _$element, _$spinner, _$labelTxt;
		var _options, _isShow, _isLabelType=false;

		return {
			init: function( element, info ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_options = this._options();
					//_options = $.extend(true, {}, _options, info);
					
					if( _options.labelData.txt != undefined ){
						_isLabelType = true;
						if( _options.labelData.loadingTxt == undefined ){
							_options.labelData.loadingTxt = _options.labelData.txt;
						}
					}
					//console.log(_options.labelData.loadingTxt);
					_$element = $(element);
					this.__settingElement();
					this.__settingEvents();
					this.show();
					_$element.on("click", function(){
						return;
						if(_isShow){
							this.hide();
						}else{
							this.show();
						}
					}.bind(this));
					return this;
				}
			},

			__settingElement: function(){
				if( _isLabelType == false ){
					var $spin;
					$spin = $('<div class="'+cssPrefix+'spn '+cssPrefix+'spinner-icon '+cssPrefix+'draw"></div>');	
					_$element.html($spin);					
					_$spinner = $spin;
				}else{
					var spin="";
					spin = '<div class="'+cssPrefix+'spn '+cssPrefix+'spinner-icon"><span class="'+cssPrefix+'draw"></span></div>';
					
					var txt = '<span class="'+cssPrefix+'txt">'+_options.labelData.labelTxt+'</span>';
					var addEl = "";
					if( _options.labelData.spinPosition == "left" || _options.labelData.spinPosition == "top"){
						addEl = spin+txt;
					}else if( _options.labelData.spinPosition == "right" || _options.labelData.spinPosition == "bottom"){
						addEl = txt+spin;
					}

					_$element.addClass(cssPrefix+_options.labelData.spinPosition).html(addEl);
					_$spinner = _$element.find("."+cssPrefix+"spn");
					_$labelTxt = _$element.find("."+cssPrefix+"txt");
				}
			},

			__settingEvents: function(){
				var me = this;
				if( !_options.isAnimate ){return;}
				var targetSelector = "."+cssPrefix+"draw";
				if( _isLabelType ){
					targetSelector = "."+cssPrefix+"spinner-icon";
				}
				_$element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
					targetSelector,
					function(){
					if( !_isShow ){
						me.__spinnerHide();
					}
				});
			},

			__spinnerShow: function(){
				if( _isLabelType && !_options.labelData.isLabelHide ){
					_$spinner.removeClass("hide");
				}else{
					_$element.removeClass("hide");	
				}
			},

			__spinnerHide: function(){
				if( _isLabelType && !_options.labelData.isLabelHide ){
					_$spinner.addClass("hide");
				}else{
					_$element.addClass("hide");	
				}
			},

			__setLabelTxt:function( isLoading ){
				if( !_isLabelType ){return;}
		
				if( isLoading ){
					_$labelTxt.html(_options.labelData.loadingTxt);
				}else{
					_$labelTxt.html(_options.labelData.txt);
				}
			},

			/** 
			 * Loading Spinner를 화면에 노출 한다.
			 * @memberof LoadingSpinner
			 * @since 1.0.0
			 * @return {LoadingSpinner} LoadingSpinner instance
			 */
			show: function(){
				if( _isShow ){return this;}
				_isShow = true;
				this.__spinnerShow();
				this.__setLabelTxt(true);

				if(_options.isAnimate){
					_$element.addClass(cssPrefix+"ani")
					var me = this;
					setTimeout(function(){
						//timer delay중 hide 요청이 있었을 경우 
						if( _isShow ){
							_$element.removeClass(cssPrefix+"spinner-hide");		
						}else{
							me.hide();
						}
					}, 50);
				}
				return this;
			},

			/** 
			 * Loading Spinner 화면에서 감춘다. option값에 따라 label을 함께 감출 것인지 결정한다.
			 * @memberof LoadingSpinner
			 * @since 1.0.0
			 * @return {LoadingSpinner} LoadingSpinner instance
			 */
			hide: function(){
				if( !_isShow ){return this;}
				_isShow = false;
				this.__setLabelTxt(false);
				if( _options.isAnimate ){
					if( _isLabelType ){
						_$element.removeClass(cssPrefix+"ani");
					}
					_$element.addClass(cssPrefix+"spinner-hide");	
				}else{
					this.__spinnerHide();
				}
				return this;
			}
		}
	}
});
})(window);


(function(window, undefined) {
'use strict';
var
Class = UI.Class,
UICore = Class.UICore,
Scroll = Class.Scroll,
cssPrefix = Class.UIKit.cssPrefix,
/**
 * scroll swipe 기능을 제공한다.
 * @class ScrollSwipe
 */
ScrollSwipe = Class({
	name: "ScrollSwipe",
	parent: UICore,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					itemsSelector: "."+cssPrefix+"scroll-container>ul>li",
					page: 1,
					continuous: false,
					useScrollBounce: false,
					alwaysScrollBounce: false, 
					autoSwipe: false,
					autoSwipeTime: 5000,
					autoResize: false,
					usePageIndicator: true,
					usePrevNextButton: false,
					activeIndicator: false,
					onlyLeftToRight: false,
					change: function(){},
					finishScrollAnimation: function(){}
				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof ScrollSwipe 
	 * @param {Element} element 기준이 되는 DOM Element
	 * @param {Object} options ScrollSwipe Options 
	 * @param {String} options.itemsSelector=".scroll-conteianer>ul>li" swipe할 아이템 리스트 셀렉터
	 * @param {Boolean} options.page=1 처음 노출시킬 swipe 페이지 인덱스
	 * @param {Boolean} options.continuous=false 스크롤이 끝까지 도달한 뒤에도 연속해서 swipe를 하게 할 것인지 여부
	 * @param {Boolean} options.autoSwipe=false 자동으로 콘텐츠를 swipe 시킬것인지 여부
	 * @param {Number} options.autoSwipeTime=5000 자동으로 콘텐츠를 swipe시킬때 interval time
	 * @param {Boolean} options.useScrollBounce=false 스크롤의 위치가 끝까지 도달한 뒤에도 터치 드래그 상태가 지속될 때 bounce효과를 줄 것인지에 여부 
	 * @param {Boolean} options.autoResize=false 화면 리사이즈시 자동으로 refresh() 메소드를 호출할 것인지 여부 
	 * @param {Boolean} options.usePageIndicator=true 페이지 indicator를 사용할 것인지 여부 
	 * @param {Boolean} options.usePrevNextButton=false prev button과 next button을 사용할 것인지 여부 
	 * @param {Boolean} options.activeIndicator=false indicator를 선택하여 페이지를 이동시킬것인지 여부 
	 * @retuns {ScrollSwipe} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var _scroll, _pageIndicator, _options, itemsLen, _currentPage,
			_$element, _$items, _$win;
		var isScrolling = false;
		var _continuous = false, maxPage, minPage;
		var _autoSwipe, timer, _resizeTimer;
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_options = this._options();
					_$win = $(window);
					_$element = $(element);
					this.__setDisplay();
					this.__createPageIndicator();
					this.__setting();
					this.__createScroll();	
					this.continuous(_options.continuous);
					this.autoSwipe(_options.autoSwipe);
					this.__bindEvent();
					this.page(_options.page, false);
					return this;
				};
			},
			
			totalPage: function(){
				return itemsLen;
			}, 

			scroll: function(){
				return _scroll;
			},

			/** 
			 * 자동으로 슬라이드쇼를 할 것인지를 결정한다.
			 * @memberof ScrollSwipe
			 * @param {Boolean} bool 자동 슬라이드쇼를 할것인지 여부 
			 * @since 1.0.0
			 * @return {ScrollSwipe} ScrollSwipe instance
			 */
			autoSwipe: function(bool){
				_autoSwipe = bool;
				this.__setAutoSwipeTimer();
				return this;
			},

			__setting: function(pageIndex){
				if( pageIndex == undefined ){
					pageIndex = 0;
				}

				var $container = _$element.find("."+cssPrefix+"scroll-container");
				$container.css("width", "");
				
				$container.find(["data-clone-item"]).remove();
				_$items = _$element.find(_options.itemsSelector).css("width", "");
				itemsLen = _$items.length;
				_pageIndicator.numberOfPages(itemsLen);
				_pageIndicator.currentPage(pageIndex);

				var wid;
				var itemOuterWid = _$items.eq(0).outerWidth();
				var itemWid = _$items.eq(0).width();
				if(_options.continuous === true ){
					var $firstItem = _$items.eq(0).clone().attr("data-clone-item", "");
					var $lastItem = _$items.last().clone().attr("data-clone-item", "");
					_$items.parent().prepend( $lastItem );
					_$items.parent().append( $firstItem );
					wid = itemOuterWid*(itemsLen+2);
				}else{
					wid = itemOuterWid*itemsLen;
				}

				_$element.find(_options.itemsSelector).width(itemWid);
				$container.width(wid);
			},

			__setDisplay: function(){
				var $indicatorContain = $('<div class="'+cssPrefix+'page-indicator"></div>');
				_$element.append( $indicatorContain );
				if( !_options.usePageIndicator ){
					$indicatorContain.css("display", "none");
				}

				if( _options.usePrevNextButton ){
					var str = '<div class="'+cssPrefix+'swipe-btn"><button class="'+cssPrefix+'prev-btn"><span>prev</span></button><button class="'+cssPrefix+'next-btn"><span>next</span></button></div>';
					_$element.append( str );
				}
			},

			/** 
			 * contents 개수가 변경되거나 사이즈가 변경될 경우 콘텐츠 정보를 다시 셋팅한다.
			 * @memberof ScrollSwipe
			 * @since 1.0.0
			 * @return {ScrollSwipe} ScrollSwipe instance
			 */
			refresh: function(){
				_scroll.scrollInfo().allowScrollOffset.minX = 0;

				this.__setting(_currentPage);
				this.continuous(_continuous);
				
				_scroll.refresh();
				_scroll.pagingEnabled(true);
				_scroll.scrollToIndexPage(_currentPage, false);

				this.__checkOnlyLeftToRight();

				return this;
			},


			/** 
			 * 스크롤이 끝까지 도달한 뒤에도 연속해서 swipe를 하게 할 것인지를 결정한다.
			 * @memberof ScrollSwipe
			 * @param {Boolean} 연속 swipe를 할 것인지 여 
			 * @since 1.0.0
			 * @return {ScrollSwipe} ScrollSwipe instance
			 */
			continuous: function(bool){
				_continuous = bool;
				maxPage = itemsLen;
				minPage = 1;

				if( bool == true ){
					maxPage++;
					minPage--;
				}
			},

			__createScroll: function(){
				_scroll = _$element.find("."+cssPrefix+"scroll").instance("Scroll",{
					useScrollBar: false,
					scrollX: true,
					scrollY: false,
					useWheelMouse: false,
					onlyLeftToRight: _options.onlyLeftToRight,
					useScrollBounceHorizontal: _options.useScrollBounce,
					alwaysScrollBounceHorizontal: _options.alwaysScrollBounce
				}).pagingEnabled(true);
			},

			__createPageIndicator: function(){
				_pageIndicator = _$element.find("."+cssPrefix+"page-indicator").instance("PageIndicator");
			},

			__bindEvent: function(){
				var me = this;
				_scroll.bind("finishScrollAnimation", function(){
					isScrolling = false;
					var currentPage = me.__calcCurrentPage();
					if( currentPage != _currentPage ){
						me.page(currentPage, false);
					}
					if( _continuous ){
						if( currentPage == 0 ){
							me.page( itemsLen, false );
						}else if( currentPage > itemsLen ){
							me.page(1, false);
						}	
					}

					if( _currentPage != _pageIndicator.currentPage() ){						
						_pageIndicator.currentPage(_currentPage );	
					}

					_options.finishScrollAnimation( me, _currentPage );
					//indicator가 있으면 event 발생시키지 않음... 수정 필요
					//me.dispatchEvent("change", me, _currentPage );
					me.__checkOnlyLeftToRight();
				});

				_scroll.bind("dragging", function(){
					me.__setAutoSwipeTimer();
				})
				_$element.on("click", "."+cssPrefix+"next-btn", function(){
					me.next();
				});

				_$element.on("click", "."+cssPrefix+"prev-btn", function(){
					me.prev();
				});

				if(_options.activeIndicator){
					_pageIndicator.bind("selectPage", function(page){
						me.page(page, false);
					});	
				}
				

				if(_options.autoResize){
					var resizeTimer;
					_$win.on("resize."+this.instanceID, function(){
						clearTimeout(_resizeTimer);
						resizeTimer = setTimeout(function(){
							if(_resizeTimer == undefined){return}
							me.refresh();
						}, 30);
					});
				}
			},

			__unbindEvent: function(){
				var me = this;
				_scroll.unbind("finishScrollAnimation."+this.instanceID);
				_scroll.unbind("dragging."+this.instanceID);
				_$element.off("click."+this.instanceID);
				_$element.off("click."+this.instanceID);

				if(_options.activeIndicator){
					_pageIndicator.unbind("selectPage."+this.instanceID);	
				}				

				if(_options.autoResize){
					_$win.off("resize."+this.instanceID);
				}
			},

			__checkOnlyLeftToRight: function(){
				if( _options.onlyLeftToRight ){
					_scroll.scrollInfo().allowScrollOffset.minX=(_currentPage-1)*_$element.width();
				}
			},

			/** 
			 * 다음 콘텐츠로 이동한다.
			 * @memberof ScrollSwipe
			 * @since 1.0.0
			 * @return {ScrollSwipe} ScrollSwipe instance
			 */
			next: function(){
				var index = Math.min( _currentPage+1, maxPage);
				this.page(index);	
				return this;
			},

			/** 
			 * 이전 콘텐츠로 이동한다.
			 * @memberof ScrollSwipe
			 * @since 1.0.0
			 * @return {ScrollSwipe} ScrollSwipe instance
			 */
			prev: function(){
				var index = Math.max( _currentPage-1, minPage);
				this.page(index);
				return this;
			},

			__setAutoSwipeTimer: function(){
				var me = this;
				if( _autoSwipe ){
					clearTimeout(timer);
					var me = this;
					timer = setTimeout(function(){
						if( timer == undefined ){return;}
						if( _autoSwipe ){
							me.next();	
						}
					}, _options.autoSwipeTime );
				}
			},

			__dispatchChangeEvent: function(page){
				_options.change(this, page);
				this.dispatchEvent("change", this, page);
			},

			__calcCurrentPage: function(){
				var scrollInfo = _scroll.scrollInfo();
				var pageWidth = scrollInfo.frameSize.width;
				var x = scrollInfo.contentOffset.x;
				if( _options.continuous ){
					 x -= pageWidth;
				}
				var page = Math.round(x/pageWidth)+1;
				return page;
			},


			/** 
			 * param 값이 없을 경우 현재 page 정보를 return하고, param 값이 있을 경우 해당 index의 콘텐츠로 이동시킨다.
			 * @memberof ScrollSwipe
			 * @param {Number} index 이동할 페이지 인덱스
			 * @param {Boolean} scrollAnimate 스크롤 슬라이드 애니메이션을 적용할 것인지 여부
			 * @since 1.0.0
			 * @return {Index|ScrollSwipe} 현재 페이지 index | ScrollSwipe instance
			 */
			page: function(index, scrollAnimate) {				
				if(arguments.length==0){
					return _currentPage;
				}else{
					var oldIndex = _currentPage;
					if( isScrolling == true ){return;}
					if( scrollAnimate != false ){
						isScrolling = true;
					}
					_currentPage = parseInt(index);
					_pageIndicator.currentPage(index);
					if( _continuous == true ){
						index++;
					}
					_scroll.scrollToIndexPage(index, scrollAnimate);
					this.__setAutoSwipeTimer();
					if( oldIndex != Math.max( Math.min(_currentPage, itemsLen), 1)){
						this.__dispatchChangeEvent( _currentPage );
					}
				}

				return this;
			},

			destroy: function(){
				this._super( "destroy", arguments );
				this.__unbindEvent();
				clearTimeout(timer);
				clearTimeout(_resizeTimer);
				timer = _resizeTimer = undefined;
				_$element =  _$items =  _$win = _options = undefined;
				_scroll.destroy();
				_pageIndicator.destroy();
				_scroll = _pageIndicator = undefined;
			}
		}
	}
});
})(window);
(function(window, undefined) {

'use strict';

var
Class = UI.Class,
UICore = Class.UICore,

UILayerContent = Class({
	name: "UILayerContent",
	parent: UICore,
	constructor: function(  ) {
	
		var _layer;
		
		return {
			init: function( element, layer ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					_layer = layer;
					
					var data = this.data();
					var contentSize = {
						width: parseInt(data["width"]),
						height: parseInt(data["height"])
					}
					
					this.css({
						marginLeft: contentSize.width * -0.5,
						marginTop: 100,
						width: contentSize.width,
						height: contentSize.height
					});
					
					return this;
				}
			}
		}
	}
}),

UILayer = Class({
	name: "UILayer",
	parent: UICore,
	constructor: function(  ) {
	
		var _modal;
		var _content;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					_modal = $(element).find(".UIModal").instance(UIModal);
					_content = $(element).find(".UILayerContent").instance(UILayerContent, this);
					
					return this;
				}
			},
			
			show: function() {
				_modal.show();
				
				$( this.element() ).show();
			},
			
			hide: function() {
				_modal.hide();
				
				$( this.element() ).hide();
			},
			
			content: function() {
				return _content;	
			},
			
			modal: function(){
				return _modal;
			}
		}
	}
}),

UIModal = Class({
	name: "UIModal",
	parent: UILayer,
	constructor: function(  ) {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
				
					return this;
				}
			},
			
			show: function() {
				this._super("show", arguments);
				
				$("body").css({
					height:"100%",
					overflow:"hidden"
				});
			},
			
			hide: function() {
				this._super("hide", arguments);
				
				$("body").css({
					height:"",
					overflow:""
				});
			}
		}
	}
});

})(window);


(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Responder = Class.Responder,

UIComponent = Class({
	name:"UIComponent",
	parent:Responder,
	constructor: function() {
	
		var _view;
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
				
					return this;	
				}
			},
			
			view: function( view ) {
				if ( arguments.length === 0 ) {
					return _view;
				}
				
				_view = view;
			}
		};
	}
});

})(window);

(function(window, undefined) {

'use strict';

var 

Class = UI.Class,
cssPrefix = Class.UIKit.cssPrefix,

/**
 * Datepicker 기능을 제공한다.
 * @class Datepicker
 */
Datepicker = Class({
	name: "Datepicker",
	parent: "UICore",
	'static': {
		_setting:{
			defaultOptions: {	
				format: "yyyy-mm-dd",
				iconTemplate: '<a href="#"><span></span></a>',
				useCalendarIcon: false,
				calendarOptions: {},
				disabled: false,
				changeHandler: function(){}
			},

			
		}
	},

	/**
	 * @constructor
	 * @memberof Datepicker 
	 * @param {Element} 기준이 되는 DOM Element
	 * @param {String} options.format input 요소에 표기할 date fotmat
	 * @param {String} options.iconTemplate	icon을 사용할 경우 사용되는 기본 아이콘 태그 요소를 대체할 태그 요소 String 값( 반드시 태그에 "calendar-icon", "input-group-addon" 클래스 삽입 )
	 * @param {Boolean} options.useCalendarIcon icon이 있는 Datepicker를 사용할 것인지 여부
	 * @param {Object} options.calendarOptions Calendar에 적용할 options 
	 * @param {Function} options.changeHandler 선택 날짜가 변경될 경우 호출되는 callback 함수
	 * @retuns {Datepicker} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var _calendar, _inputs = [];
		var _$element, _$input;
		var _format, calendar;
		var _currentValue;
		var _isShow;
		var _$doc;
		var isDisable;
		var _options;

		return {

			init: function( element, info ) {	
				var self = this._super("init", arguments);
					if (self) {
					_options = this._options();
					_$element = $(element);
					_$input = _$element.find("input");
					isDisable = _options.disabled;
					this.__setupElements();
					this.__setupFormat();
					this.__setupEvents();				
					
					return this;
				}
			},

			__setupElements: function(){
				_$doc = $(document);
				if( _options.useCalendarIcon ){
					var $iconEl = $(_options.iconTemplate).addClass(cssPrefix+"calendar-icon");
					var $inputWrap = $('<div class="'+cssPrefix+'set-field"></div>');
					$inputWrap.html($iconEl);
					_$element.prepend($inputWrap);
					_$input.before($inputWrap);
					$inputWrap.prepend(_$input);
					_$element.attr("data-type", "icon");
				}else{
					_$element.attr("data-type", "field");
				}

				if( _$input.attr("placeholder") == undefined ){
					_$input.attr("placeholder", _options.format );	
				}
				
				this.__createCalendar();
				if( isDisable == true || isDisable == "true" ){
					//this.disable();
				}
			},

			__createCalendar: function(){
				var $el = $('<div class="'+cssPrefix+'calendar"></div>');
				_$element.append($el);
				calendar = $el.instance("Calendar", _options.calendarOptions);	
			},

			__setupFormat:function(){
				_format = this.__parseFormat(_options.format);
			},

			__setupEvents: function() {
				var me = this;
				calendar.bind("selected", function(ui, date){
					me.__changeValue(date);	
					me.hideCalendar();					
				});

				_$input.on("focusin", function(){
					me.showCalendar();
				});

				_$input.on("focusout blur keyup", function(){
					var val = _$input.val();
					if( _$input.val().length>4  && val != _currentValue ){
						var date = me.__parseDate(val);
						me.__calendarSelect( date.getFullYear(), date.getMonth()+1, date.getDate() );
						me.__setCurrentValue( date );
					}
				});

				_$element.on("click", "."+cssPrefix+"calendar-icon", function(e){
					e.preventDefault();
					if( _isShow ){
						me.hideCalendar();
					}else{
						me.showCalendar();	
					}
				});
			},

			disable: function(){
				isDisable = true;
				this.hideCalendar();
				_$input.attr("disabled", "disabled");
			},

			enable: function(){
				isDisable = false;
				_$input.removeAttr("disabled");
			},


			/** 
			 * calendar를 화면에 노출 시킨다.
			 * @memberof Datepicker
			 * @since 1.0.0
			 * @return {Datepicker} Datepicker instance
			 */
			showCalendar: function(){
				if( isDisable==true || isDisable == "true" ){return;}
				calendar.show();
				calendar.gotoSelectedMonth();
				_isShow = true;
				_$doc.on('mousedown.calendar', function(ev){
					if ($(ev.target).closest('[data-instance-id="'+_$element.attr("data-instance-id")+'"]').length == 0) {
						this.hideCalendar();
						_$doc.off('mousedown.calendar');
					}
				}.bind(this));
				return this;
			},

			/** 
			 * calendar를 화면에서 감춘다.
			 * @memberof Datepicker
			 * @since 1.0.0
			 * @return {Datepicker} Datepicker instance
			 */
			hideCalendar: function(){
				_isShow = false;
				calendar.hide();
				_$doc.off('mousedown.calendar');
			},


			__calendarSelect: function( year, month, date ){				
				calendar.ignoreEvent(true);
				calendar.select( year, month, date );
				this.__dispatchDatepickerEvent("change", new Date(year, month-1, date));	
				calendar.ignoreEvent(false);
			},

			__dispatchDatepickerEvent: function( eventStr, params ){
				this.dispatchEvent( eventStr, this, params );
				if(_options[eventStr+"Handler"]){
					_options[eventStr+"Handler"]( this, params );
				};
			},

			/** 
			 * date 값을 변경한다. 
			 * @memberof Datepicker
			 * @since 1.0.0
			 * @return {Datepicker} Datepicker instance
			 */
			changeDate: function( date ){
				this.__calendarSelect( date.getFullYear(), date.getMonth()+1, date.getDate() );
				this.__changeValue( date );			
				return this;	
			},

			__setCurrentValue: function( date ){
				_currentValue = this.__formatDate(date);
			},

			__changeValue: function( date ){
				this.__setCurrentValue(date);
				_$input.val(_currentValue);	
				this.__dispatchDatepickerEvent("change", date);	
			},

			__parseFormat: function(format){
				var separator = format.match(/[.\/\-\s].*?/),
					parts = format.split(/\W+/);
				if (!separator || !parts || parts.length === 0){
					throw new Error("Invalid date format.");
				}

				return {separator: separator, parts: parts};
			},
			//
			__parseDate: function(date) {
				var parts = date.split(_format.separator),
					date = new Date(),
					val;
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				if (parts.length === _format.parts.length) {
					var year = date.getFullYear(), day = date.getDate(), month = date.getMonth();
					for (var i=0, cnt = _format.parts.length; i < cnt; i++) {
						val = parseInt(parts[i], 10)||1;
						switch(_format.parts[i]) {
							case 'dd':
							case 'd':
								day = val;
								date.setDate(val);
								break;
							case 'mm':
							case 'm':
								month = val - 1;
								date.setMonth(val - 1);
								break;
							case 'yy':
								year = 2000 + val;
								date.setFullYear(2000 + val);
								break;
							case 'yyyy':
								year = val;
								date.setFullYear(val);
								break;
						}
					}
					date = new Date(year, month, day, 0 ,0 ,0);
				}
				return date;
			},
			//
			__formatDate: function(date){
				var val = {
					d: date.getDate(),
					m: date.getMonth() + 1,
					yy: date.getFullYear().toString().substring(2),
					yyyy: date.getFullYear()
				};
				val.dd = (val.d < 10 ? '0' : '') + val.d;
				val.mm = (val.m < 10 ? '0' : '') + val.m;
				var date = [];
				for (var i=0, cnt = _format.parts.length; i < cnt; i++) {
					date.push(val[_format.parts[i]]);
				}

				return date.join(_format.separator);
			},

			/** 
			 * calendar instance를 전달한다.
			 * @memberof Datepicker
			 * @since 1.0.0
			 * @return {Calendar} Calendar instance
			 */
			calendar: function() {
				return calendar;	
			}
			
		}
	}
}),
/**
 * 달력 기능을 제공한다.
 * @class Calendar
 */
Calendar = Class({
	name: "Calendar",
	parent: "UICore",
	'static': {
		_setting:{
			defaultOptions: {			
				monthNames: [],
				dayNames: [],
				
				shortMonthNames: false,
				shortDayNames: true,			

				active: true,
				showOtherMonths: false,
				hidePrevNextButton: false,
				
				summary: "",
				caption: "",

				minDate: undefined,
				maxDate: undefined,

				today: undefined,
				ignoreEvent: false,

				changeMonth: false,
				changeYear: false,
				firstDay: 0, //Sunday is 0, Monday is 1

				"selectedHandler": function(){},
				"changedHandler": function(){},
				"canceledSelectHandler": function(){}	
			}
		}
	},

	/**
	 * @constructor
	 * @memberof Calendar
	 * @param {Element} 기준이 되는 DOM Element
	 * @param {Object} options 
	 * @param {Array} options.monthNames=["January","February","March","April","May","June", "July","August","September","October","November","December"]
	 * @param {Array} options.dayNames=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	 * @param {Boolean} options.shortMonthNames=false month 이름을 줄여서 출력할 것인지 여부 ex) "Jan", "Feb", "Mar"...
	 * @param {Boolean} options.shortDayNames=false Day 이름을 줄여서 출력할 것인지 여부 ex) "Sun", "Mon", "Tue"...
	 * @param {Boolean} options.minDayNames=true Day 이름을 shortDayNames 옵션보다 더 줄여서 것인지 여부 ex) "Su", "Mo", "Tu"...
	 * @param {Boolean} options.active=true 달력 날짜 필드를 사용자가 선택할 수 있게 할것인지 여부
	 * @param {Boolean} options.showOtherMonths=true 현재 달력의 비어있는 필드에 이전, 다음 달의 날짜를 보여줄 것인지 여부
	 * @param {Boolean} options.hidePrevNextButton=false 이전, 다음달로 이동할 수 있는 버튼을 감출 것인지 여부
	 * @param {String} options.summary="" 달력 테이블의 summary 정보
	 * @param {String} options.caption="" 달력 테이블의 caption 정보
	 * @param {Date} options.minDate=undefined minmum 선택 날짜
	 * @param {Date} options.maxDate=undefined maxmum 선택 날짜
	 * @param {Date} options.today=local date 현재 오늘 날짜의 Date 정보 설정하지 않을경우 사용자의 local Date 정보를 이용한다
	 * @param {Boolean} options.ignoreEvent=false event를 사용 여부
	 * @param {Function} options.selectHandler 날짜 select시 호출할 callback 함수
	 * @param {Function} options.changeHandler 달력 change시 호출할 callback 함수
	 * @param {Function} options.cancelSelectHandler 선택한 날짜를 선택 취소할 경우 호출할 callback 함
	 * @retuns {Calendar} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var _$element, _$header, _$content, 
			_calendarInfo;

		var template = {
             	header : '<div class="'+cssPrefix+'calendar-header">'+
						 '<a data-action="prev" title="Prev"><span></span><em>prev</em></a>'+
					 	 '<a data-action="next" title="Next"><span></span><em>next</em></a>'+
						 '<div class="'+cssPrefix+'calendar-title"><span class="'+cssPrefix+'calendar-month"></span>&nbsp;<span class="'+cssPrefix+'calendar-year"></span></div>'+
						 '</div>'
        }
         
		 var _options;		 	
		 var _delegate, _delegateCan = {
		 	validDate: false
		 };
	
		var _oldYear;
		return {
			init: function( element, info ) {
				var self = this._super("init", arguments);
				if (self) {
					_options = this._options();
					if(info && info.today){
						console.log("options", info.today, _options.today);	
					}
					
					this.__setCaleanarStr();
					this.__setCalendarInfo();
					
					this.setupElements( element );
					this.setupEvents();
					
					
					//오늘 날짜를 처음에 보여주지만.. maxDate값이 오늘보다 작을경우 maxDate를 처음으로 셋
					if( _options.maxDate != undefined && _calendarInfo.today > _options.maxDate ){
						this.change( _options.maxDate.getFullYear(), _options.maxDate.getMonth()+1);
					}else{
						this.gotoCurrent();
					}
					
					return this;
				}
			},

			/** 
			 * calendar를 화면에 노출 한다.
			 * @memberof Calendar
			 * @since 1.0.0
			 * @return {Calendar} Calendar instance
			 */
			show: function(){
				_$element.show();
				return this;
			},

			/** 
			 * calendar를 화면에서 감춘다.
			 * @memberof Calendar
			 * @since 1.0.0
			 * @return {Calendar} Calendar instance
			 */
			hide: function(){
				_$element.hide();
				return this;
			},

			__setCaleanarStr: function(){
				if( !_options.dayNames.length ){//사용자가 별도의 이름을 설정하지 않았을때
					if( _options.shortDayNames ){
						_options.dayNames = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
						//_options.dayNames = [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ];
					}else{
						_options.dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
					}
				}

				if( !_options.monthNames.length){
					if( _options.shortMonthNames ){
						_options.monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
					}else{
						_options.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
					}	
				}

				if( _options.firstDay == 1 ){
					var day = _options.dayNames.shift();
					_options.dayNames.push(day);
				}
			},

			__setCalendarInfo: function(){
				if( _options.today == undefined ){
					_options.today = new Date();
				}

				_calendarInfo = {
					today: _options.today,
					date: _options.today,
					year: _options.today.getFullYear(),
					month: (_options.today.getMonth()+1),
					selectDay: undefined,
					//day: _options.today.getDate(),
					lastDay: _options.lastDay,
					ignoreEvent: _options.ignoreEvent			
				}
			},

			/**
			 * minmum 선택 날짜를 변경한다.
			 * @memberof Calendar
			 * @since 1.0.0 
			 * @param {Date} [date] 변경할 minmum Date 정보 
			 * @return {Calendar|Date} 변 값이 있을 경우 Calendar Instance, 없을 경우 설정 돼 있는 minDate 값을 리턴함.
			 */
			minDate: function( date ){
				if( date != undefined ){
					_options.minDate = date;	
					this.__checkSelectDate();
					
					var y = _calendarInfo.year, m = _calendarInfo.month;

					if( !this.__vaildDate(y, m) ){
						//y가 유효하면 달만 바꿔서 적용
						if( this.__vaildDate( _calendarInfo.year, date.getMonth()+1 ) ){
							m = date.getMonth()+1;	
						}else{
							y = date.getFullYear();
							m = date.getMonth()+1;
						}
					}

					this.__setYearSelect();
					this.__setMonthSelect( y );
					
					this.change( y, m );
				}else{
					return _options.minDate;
				}
				return this;
			},

			/**
			 * maxmum 선택 날짜를 변경한다.
			 * @memberof Calendar
			 * @since 1.0.0 
			 * @param {Date} [date] 변경할 maxmum Date 정보 
			 * @return {Calendar|Date} 옵션 값이 있을 경우 Calendar Instance, 없을 경우 설정 돼 있는 maxDate 값을 리턴함.
			 */
			maxDate: function( date ){
				if( date != undefined ){
					_options.maxDate = date;
					this.__checkSelectDate();					
					var y = _calendarInfo.year, m = _calendarInfo.month;
					if( !this.__vaildDate(y, m) ){
						//y가 유효하면 달만 바꿔서 적용
						if( this.__vaildDate( _calendarInfo.year, date.getMonth()+1 ) ){
							m = date.getMonth()+1;	
						}else{
							y = date.getFullYear();
							m = date.getMonth()+1;
						}
					}

					this.__setYearSelect();
					this.__setMonthSelect(y);
					this.change(y, m);

				}else{
					return _options.maxDate;
				}
				return this;
			},

			__checkSelectDate: function(){
				if( _calendarInfo.selectedDate && !this.__vaildDate(_calendarInfo.selectedDate.getFullYear(), _calendarInfo.selectedDate.getMonth()+1, _calendarInfo.selectedDate.getDate())){
					this.cancelSelect();
				}
			},

			/**
			 * 선택한 날짜를 선택 취소 한다.
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @return {Calendar} Calendar Instance
			 */
			cancelSelect: function(){
				if( _calendarInfo.selectedDate ){
					var  eventDate = new Date(_calendarInfo.selectedDate.getFullYear(), _calendarInfo.selectedDate.getMonth(),  _calendarInfo.selectedDate.getDate() );
					_calendarInfo.selectedDate = undefined;
					_$content.find("."+cssPrefix+"select").removeClass(cssPrefix+"select");

					this.__dispatchCalendarEvent("canceledSelect", eventDate );	
				}
				return this;
			},

			/**
			 * 선택한 날짜가 있는 달로 이동
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @return {Calendar} Calendar Instance
			 */
			gotoSelectedMonth: function(){
				if( !_options.active ){return;}
				if( _calendarInfo.selectedDate == undefined ){
					this.gotoCurrent();
					return this;
				}
				
				this.change( _calendarInfo.selectedDate.getFullYear(), _calendarInfo.selectedDate.getMonth()+1 );
				return this;
			},

			/**
			 * 현재 날짜(today)가 있는 달로 이동
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @return {Calendar} Calendar Instance
			 */
			gotoCurrent: function() {
				this.change( _calendarInfo.today.getFullYear(), _calendarInfo.today.getMonth()+1 );
				return this;
			},

			/**
			 * 이전 달로 이동
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @return {Calendar} Calendar Instance
			 */
			prevMonth: function() {
				var prevMonth = this.__getPrevMonth();				
				this.change( prevMonth.year, prevMonth.month );	
				return this;
			},
			
			/**
			 * 다을 달로 이동
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @return {Calendar} Calendar Instance
			 */
			nextMonth: function() {
				var nextMonth = this.__getNextMonth();
				this.change( nextMonth.year, nextMonth.month );	
				return this;
			},
			
			__getPrevMonth: function(){
				var month = parseInt(_calendarInfo.month);
				var year = parseInt(_calendarInfo.year);
				
				if ( month <= 1 ) {
					month = 12;
					year -= 1;
				} else {
					month--;	
				}

				return { "year": year, "month": month };
			},

			__getNextMonth: function(){
				var month = parseInt(_calendarInfo.month);
				var year = parseInt(_calendarInfo.year);

				if ( month >= 12 ) {
					month = 1;
					year += 1;
				}else {
					month++;
				}

				return { "year": year, "month": month };
			},

			__isToday: function( year, month, day ) {
				return (_calendarInfo.today.getFullYear() == year && _calendarInfo.today.getMonth() == (month-1) && _calendarInfo.today.getDate() == day) ? true : false;
			},
			
			info: function() { 
				return _calendarInfo;	
			},
			
			/**
			 * 날짜 선택(param 값이 하나 일 경우 현재 달을 기준으로 날짜를 선택한다)
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @param {Number|String} year 
			 * @param {Number|String} [month]
			 * @param {Number|String} [day]
			 * @return {Calendar} Calendar Instance
			 */
			select: function( year, month, day ) {					
				if( !_options.active ){return;}
				if( arguments.length == 0 ){
					return _calendarInfo.selectedDate;
				}else if( arguments.length == 1){
					if( typeof(year) == "object" ){
						// year이 date일때
						var date = year;
						year = date.getFullYear();
						month = date.getMonth()+1;
						day = date.getDate();
					}else{
						//date 정보가 하나일때, year 인자를 day로 처
						day = year;
						year = _calendarInfo.year;
						month = _calendarInfo.month;	
					}					
				};

				if( !this.__vaildDate( year, month, day ) ){
					return undefined;
				}

				if ( _calendarInfo.month !== month || _calendarInfo.year !== year ) {
					this.change( year, month );
				}
				
				var $currentMonthDaysEl = _$content.find("tbody td[data-current-month][data-day]");
				
				$currentMonthDaysEl.filter("."+cssPrefix+"select").removeClass(cssPrefix+"select");
				$currentMonthDaysEl.filter("[data-day="+day+"]").addClass(cssPrefix+"select");
				
				_calendarInfo.selectedDate = new Date( year, month-1, day );
				
				var eventDate = new Date( year, month-1, day );
				this.__dispatchCalendarEvent("selected", eventDate );
				return this;
			},


			ignoreEvent: function( bool ){
				if( bool == undefined ){
					return _calendarInfo.ignoreEvent;
				}

				_calendarInfo.ignoreEvent = bool;
				return this;
			},

			__dispatchCalendarEvent: function( eventStr, params ){
				if ( _calendarInfo.ignoreEvent !== true ) {
					this.dispatchEvent( eventStr, this, params );
				}else {
					debug.log( "ignore "+eventStr+" event" );
				}

				if(_options[eventStr+"Handler"]){
					_options[eventStr+"Handler"]( this, params );
				};
			},

			__getDisit: function(num){
				var n = num.toString();
				if( n.length < 2 ){
					n = "0"+n;
				}
				return n;
			},

			__setYearSelect: function(){
				if( !_options.changeYear ){return;}
				var yearSelect = _$header.find("select."+cssPrefix+"calendar-year");
				var yearsStr="";
				var me = this;
				
				var startYear = parseInt(_calendarInfo.today.getFullYear())-10;
				var endYear = parseInt(_calendarInfo.today.getFullYear())+10;
				
				if( _options.minDate ){
					startYear = parseInt(_options.minDate.getFullYear());
				}

				if( _options.maxDate ){
					endYear = parseInt(_options.maxDate.getFullYear());
				}

				endYear++;
				var y = startYear;
				var yearStr = "";
				while( y < endYear ){
					yearStr+='<option value='+(y.toString())+'>'+y.toString()+'</option>';
					y++;
				}

				yearSelect.html(yearStr);
			},

			__setMonthSelect: function( year ){
				if( !_options.changeMonth ){return;}
				
				var monthSelect = _$header.find("select."+cssPrefix+"calendar-month");
				var monthsStr="";
				var me = this;
				
				$.each(_options.monthNames, function( index, value){
					if( me.__vaildDate( year, index+1 )){
						monthsStr+='<option value='+(index+1)+'>'+value+'</option>';
					}
				});

				monthSelect.html(monthsStr);
			},

			__vaildDate: function( year, month, date ){
				if ( arguments.length == 3 ) {
					if ( _delegateCan.validDate ) {
						return _delegate.validDate( year, month, date );
					}	
				}

				var current = year.toString() + this.__getDisit(month);
				if( date != undefined ){
					current += this.__getDisit( date );
				}

				current = parseInt(current);

				if( _options.minDate ){
					var min = _options.minDate.getFullYear().toString() + this.__getDisit(_options.minDate.getMonth()+1);
					if( date != undefined  ){
						min += this.__getDisit( _options.minDate.getDate() );
					}

					min = parseInt(min);

					if( min > current ){
						//console.log("min false", min, current );
						return false;
					}
				}

				if( _options.maxDate ){
					var max = _options.maxDate.getFullYear().toString() + this.__getDisit(_options.maxDate.getMonth()+1);
					if( date != undefined ){
						max += this.__getDisit( _options.maxDate.getDate() ); 
					}

					max = parseInt( max );

					if( max < current ){
						return false;
					}
				}

				return true;
			},

			/**
			 * 달 변경
			 * @memberof Calendar
			 * @since 1.0.0  
			 * @param {Number|String} year 
			 * @param {Number|String} month
			 * @return {Calendar} Calendar Instance
			 */
			change: function( year, month ) {
				var validDate = this.__vaildDate( year, month );

				if( !validDate ){
						if( _options.changeYear ){
							//select box이고 min, max 값이 있을경우 mont값을 조정해 주어야함
							//ex) min 값이 2015년 7월인데 2016년 5월인 상태에서 2015년으로 year를 변경할 경우 month를 5월에서 7월로 조정해 주어야함
							if( _$header.find("."+cssPrefix+"calendar-year option[value="+year+"]").length ){
								var m = 1;
								if( _options.minDate && (parseInt(month)-1) <_options.minDate.getMonth()){
									m = _options.minDate.getMonth()+1;
								}else if(_options.maxDate && (parseInt(month)-1)>_options.maxDate.getMonth() ){
									m = _options.maxDate.getMonth()+1;
								}

								this.change( year, m );
							}
							//this.change()
						}
					return;
				}

				_calendarInfo.year = year;
				_calendarInfo.month = month;

				var that = this;
				var day = 0;
				var lastDay = (new Date(_calendarInfo.year, month, 0)).getDate();
				var firstWeek = (new Date(_calendarInfo.year, month-1, 1)).getDay()-_options.firstDay;
				if(_options.firstDay == 1 && firstWeek == -1){firstWeek=6}

				_calendarInfo.lastDay = lastDay;
								
				var prevLastDay = new Date(year, month-1, 0).getDate()-firstWeek;
				var lastFieldIndex;
				var nextDay = 1;
				var tbodyHtml = "";
				var dayElFrontStr='<span>', dayElBackStr='</span>';
				
				var isSelectDateMonth = false;//select한 날짜가 있으면 표

				if( _calendarInfo.selectedDate && _calendarInfo.selectedDate.getFullYear() == year && _calendarInfo.selectedDate.getMonth()+1 == month ){
					isSelectDateMonth = true;
				}

				if( _options.active ){
					dayElFrontStr = '<a href="#">';
					dayElBackStr = '</a>';
				}


				for ( var i=0; i<6; i++ ) {
					var tableRow = '<tr>';
					var hasLastDay = false;

					$.each(_options.dayNames, function( idx, name ) {
						if ( day == 0 ) {
							if ( idx >= firstWeek ) { day = 1;}
						}else {
							if ( day < lastDay ) { 
								day = day + 1; 
							}else {
								hasLastDay = true;

								if(lastFieldIndex == undefined){//마지막 필드..tr태그 체크
									lastFieldIndex=i;
								}
							}
						}						
						//lastday고 마지막 필드이면
						if(hasLastDay && lastFieldIndex != i || hasLastDay && idx == 0){ return false;}

						var selectedClassStr = '';
						if( isSelectDateMonth && _calendarInfo.selectedDate.getDate() == day ){
							selectedClassStr = cssPrefix+'select';
						}

						
						var isDisable = false;
						var disabledStr = "";
						var dayHtml = '<td></td>'; 

						
						if ( day == 0 ) {
							if( _options.showOtherMonths ){
								var prevMonthDate = ++prevLastDay;
								var prevMonth = that.__getPrevMonth();
								isDisable = !that.__vaildDate( prevMonth.year, prevMonth.month, prevMonthDate );
								if( isDisable ){
									disabledStr = "disabled";
								}							

								dayHtml = '<td data-prev-month data-action="none" '+disabledStr+' data-day="'+prevMonthDate+'">'+dayElFrontStr+prevMonthDate+dayElBackStr+'</td>';
							}							
						}else if(hasLastDay){		
							if( _options.showOtherMonths ){					
								var nextMonth = that.__getNextMonth();
								isDisable = !that.__vaildDate( nextMonth.year, nextMonth.month, nextDay );
								if( isDisable ){
									disabledStr = "disabled";
								}
								dayHtml = '<td data-next-month data-action="none" '+disabledStr+' data-day="'+nextDay+'">'+dayElFrontStr+nextDay+dayElBackStr+'</td>';
								nextDay++;
							}
						}else{
							isDisable = !that.__vaildDate( year, month, day );
							if( isDisable ){
								disabledStr = "disabled";
							}
							var todayClassData = "";
							if ( that.__isToday( _calendarInfo.year, _calendarInfo.month, day ) ) {
								todayClassData = cssPrefix+'today ';
							}
							dayHtml = '<td data-current-month data-action="day" '+disabledStr+' class="'+todayClassData+selectedClassStr+'" data-day="'+day+'">'+dayElFrontStr+day+dayElBackStr+'</td>';
						}

						tableRow += dayHtml;
					});
				
					tableRow += '</tr>';
					if( tableRow != "<tr></tr>" ){
						tbodyHtml += tableRow;						
					}
				}
				
				_$content.find("tbody").html( tbodyHtml );

				if( _options.changeMonth ){
					if( year != _oldYear ){
						this.__setMonthSelect( year );						
					}
					if( this.__vaildDate( year, month ) ){
						_$header.find("."+cssPrefix+"calendar-month").val(month);
					}else{
						_$header.find("."+cssPrefix+"calendar-month").val( _$header.find("."+cssPrefix+"calendar-month option:first").val());
					}
					
				}else{
					var monthName = _options.monthNames[month-1];
					_$header.find("."+cssPrefix+"calendar-month").html( monthName );
				}

				if( _options.changeYear ){
					_$header.find("."+cssPrefix+"calendar-year").val(year);
				}else{
					_$header.find("."+cssPrefix+"calendar-year").html( year );
				}


				this.__dispatchCalendarEvent("changed", {"year": _calendarInfo.year, "month": _calendarInfo.month});
				_oldYear = year;
				return this;
			},

			delegate: function( delegate ) {
				_delegate = delegate;
				_delegateCan.validDate = ( typeof _delegate["validDate"] === 'function' ) ? true : false;
			},
			
			setupElements: function( element ) {				
				_$element = $(element);
				_$header = $(template.header);
				if( _options.hidePrevNextButton ){
					_$header.find('[data-action="prev"]').add( _$header.find('[data-action="next"]') ).remove();;
				}
				
				var html = '<div class="'+cssPrefix+'calendar-content"><table "summary"='+_options.summary+'>';
				html +=	'<caption>'+_options.caption+'</caption>';
				
				var i, len;
				
				html +='<thead><tr>';
				for(i=0, len=Object.keys(_options.dayNames).length; i<len; i++) {
					var title = _options.dayNames[i];
					var week = '<th><sapn title='+title+'>'+title;
					week += '</span></th>';
					html += week;
				}

				
				html += '</tr></thead><tbody></tbody></table></div>';


				if( _options.changeMonth ){
					_$header.find("."+cssPrefix+"calendar-title ."+cssPrefix+"calendar-month").remove();
					_$header.find("."+cssPrefix+"calendar-title").prepend('<select class="'+cssPrefix+'calendar-month"></select>' );				
					this.__setMonthSelect( _calendarInfo.year );
				}

				if( _options.changeYear ){
					_$header.find("."+cssPrefix+"calendar-title ."+cssPrefix+"calendar-year").remove();
					_$header.find("."+cssPrefix+"calendar-title").append('<select class="'+cssPrefix+'calendar-year"></select>' );				
					this.__setYearSelect();
				}

				_$content = $( html );
				_$element.append( _$header );
				_$element.append(_$content);
			},
			
			setupEvents: function() {
				var that = this;		
				if( !_options.hidePrevNextButton ){
					_$element.on("click", "[data-action='prev']", function(){
						that.prevMonth();
					});

					_$element.on("click", "[data-action='next']", function(){
						that.nextMonth();
					});		
				}

				if( _options.active ){
					_$element.on("click", "tbody [data-action]", function(e){
						e.preventDefault();
						var $t = $(this);
						if( $t.hasClass(cssPrefix+"select") || $t.attr("disabled") != undefined ){return;}
						
						var day = parseInt( $t.data("day") );	
						if( $t.attr("data-prev-month") != undefined ){
							that.prevMonth();
							that.select( day );
						}else if( $t.attr("data-next-month") != undefined ){
							that.nextMonth();
							that.select( day );
						}else{
							that.select( day );
						}					
					}); 
				}

				if( _options.changeMonth ){
					_$element.on("change", "select."+cssPrefix+"calendar-month", function(e){
						that.change( _calendarInfo.year, this.value);
					});
				}

				if( _options.changeYear ){
					_$element.on("change", "select."+cssPrefix+"calendar-year", function(e){
						that.change( this.value, _calendarInfo.month );
					});
				}
			}
		
		}
	}
});

})(window);

(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Element = Class.Element,
UIComponent = UI.Class.UIComponent,

UITreeData = function( __data, parent, depth, rootTree ) {

	var _data, _itemName, _tree, _parent, _options, _depth = depth, _rootTree = rootTree;
	
	_data = __data.data || {};
	_itemName = __data.itemName;
	_parent = parent;
	_options = {
		foldering: ( __data.foldering === true ) ? true : false,
		closed: ( __data.closed === false ) ? false : true
	};
	_tree = new UITree( parent, _depth + 1, _rootTree );
	
	if ( Array.isArray( __data.subTree ) ) {
		Array.each( __data.subTree, function( idx, item ) {
			_tree.add( item );
		});
	}
	
	return {
		itemName: _itemName,
		
		data: function(key, value) {
			if ( arguments.length == 0 ) {
				return _data;
			}
			
			if ( value === undefined ) {
				return _data[key];
			}
			
			_data[key] = value;
		},
		
		depth: function() {
			return _depth;	
		},
		
		options: function() {
			return _options;	
		},
		
		parent: function() {
			return _parent;	
		},
		
		rootTree: function() {
			return _rootTree;
		},
		
		tree: function() {
			return _tree;
		},
		
		toJSON: function() {
			var subTree = [];
			
			_tree.each( function( idx, treeData ) {
				subTree.push( treeData.toJSON() );
			});
		
			return {
				itemName: this.itemName,
				data: _data,
				subTree: subTree
			};
		}
	};
},

UITree = Class({
	name: "UITree",
	parent: UIComponent,
	constructor: function(  ) {
	
		var _container, _dataItems, _parent, _rootTree, _depth, _delegate, _delegateCan;
		
		_container = new Element( "UL" );
		_container.addClass("UITree");
		
		_parent;
		_rootTree;
		_depth = 0;
		_dataItems = [];
		
		_delegate = {};
		_delegateCan = {
			didSelectTreeItem: false
		};
		
		return {
			init: function( parent, depth, rootTree ) {
				var self = this._super("init", arguments );
			
				if ( self ) {
					_parent = parent;
					_depth = depth || 0;
					_rootTree = rootTree;
				
					if ( _parent === undefined && _rootTree === undefined ) {
						_parent = _rootTree = this;
					}
				
					return this;
				}
			},
			
			destroy: function() {
			
				_container.destroy.apply( _container, arguments );
				
				this._super().destroy.apply( this._super(), arguments );	
			},
			
			element: function() {
				return _container.element();
			},
			
			make: function( listData ) {
				var that = this;
			
				Array.each( listData, function( index, data ) {
					that.add( data );
				});
			},
			
			add: function( data ) {
				if ( Array.isArray( data.subTree ) ) {
					if ( data.foldering === undefined ) {
						data.foldering = true;
					}
					
					if ( data.closed === undefined ) {
						data.closed = true;
					}
				}
				
				var treeData = new UITreeData( data, this, _depth, _rootTree );
				var error = {};
				
				_dataItems = Array.add( _dataItems, treeData, error );
				
				return treeData;
			},
			
			remove: function( treeData ) {
				_dataItems = Array.remove( _dataItems, treeData );
			},
			
			removeAtIndex: function( index ) {
				var error = {};
				
				_dataItems = Array.removeAtIndex( _dataItems, index, error );
				
				if ( error.code ) {
					
				}
			},
			
			dataItems: function() {
				return _dataItems;	
			},
			
			each: function( handler ) {
				Array.each( _dataItems, handler, this );	
			},
			
			load: function() {
				
				$(_container.element()).empty();
			
				this.each( function( idx, itemData ){
					
					// TODO : use UITreeItem and manager event
					// TODO : Template
					var $item = $("<LI />");
					var $itemBullet = $("<span class='item-bullet'></span>");
					var $itemName = $("<span class='item-name'></span>").text( itemData.itemName );
					var hasSubTree = false;
					
					itemData.tree().delegate( _delegate );
					itemData.tree().load();
					
					$item.append( $itemBullet );
					$item.append( $itemName );
					$item.data( itemData.data() );
					
					if ( itemData.tree().dataItems().length > 0 ) {
						hasSubTree = true;
					}
					
					if ( hasSubTree === true || itemData.options().foldering === true ) {
						
						$item.get(0).appendChild( itemData.tree().element() );
						$item.addClass("list");
						
						if ( itemData.options().closed === true ) {
							$item.addClass("closed");
						}
					}
					
					$item.bind("click", function(e) {
						if ( _delegate.didSelectTreeItem ) {
							_delegate.didSelectTreeItem.call( _delegate, itemData.tree(), _depth, idx, itemData );
						}
					
						if ( itemData.tree().dataItems().length > 0 ) {
							hasSubTree = true;
						}
						
						//if ( hasSubTree == true ) {	
							if ( $item.hasClass("closed") ) {
								$item.removeClass("closed");
							}
							else {
								$item.addClass("closed");
							}
						//}
						
						return false;
					});
					
					_container.element().appendChild( $item.get(0) );
				});
				
				
			},
			
			parent: function() {
				return _container.parent();	
			},
			
			container: function() {
				return _container;
			},
			
			delegate: function( delegate ) {
				_delegate = delegate;
			}
		}
	}
});

})(window);

(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Template = UI.Template,
Element = Class.Element,
UIButton = Class.UIButton,
UIComponent = Class.UIComponent,
UICore = Class.UICore,
Scroll = Class.Scroll,
cssPrefix = Class.UIKit.cssPrefix,

UITableColumnGroup = function( table ) {

	var _table = table, _data = {}, _keys = [];

	return {
		_setData: function( data ) {
			Array.each( data, function(idx, info) {				
				var colInfo = {
					key: info.key,
					title: info.title,
					width: info.width,
					textAlign: info.align
				};
				
				_keys.push( info.key );
				_data[info.key] = colInfo;
			});
		},
		
		_set: function( key, data ) {	
			_keys.push( key );
			_data[key] = data;
		},
	
		data: function( key ) {
		
			if ( _data[key] ) {
				return _data[key];
			}
			
			return _data;
		},
		
		keys: function() {
			return _keys;	
		},
		
		count: function() {
			return _keys.length;	
		},
		
		title: function( key ) {
			return this.data(key).title;	
		},

		width: function( key ) {
			var width = this.data(key).width;	
			var defaultCount = 0;
			var totalCount = 0;
			var fixedWidth = 0;
			var ratioWidth = 0;
			var ratioCount = 0;
			
			this.each( function( idx, key, option ) {
				if ( option.width === "default" || option.width === "auto" || option.width === "" || option.width == undefined ) {
					defaultCount = defaultCount + 1;
				}
				else if ( option.width.indexOf('%') !== -1 ) {
					ratioWidth = ratioWidth + parseInt(option.width);
					ratioCount = ratioCount + 1;
				}
				else {
					fixedWidth = fixedWidth + parseInt( option.width );
				}
				
				totalCount = totalCount + 1;
			});
			
			var tableWidth = $(_table.element()).parent().width()
			var defaultWidth = (tableWidth - fixedWidth - ((ratioWidth / 100) * tableWidth)) / defaultCount;
			
			if ( width === "default" || width === "auto" || width === "" || width == undefined ) {
				return defaultWidth; //( / tableWidth) * 100 + "%";
			}
			else if ( width.indexOf('%') !== -1 ) {
				return width;
			}
			
			return parseInt(width); //( parseInt(width) / tableWidth) * 100 + "%";
		},
		
		resizeInfo: function() {
			var resizeInfo = {};
			var that = this;
			
			Array.each( _keys, function( idx, key ) {
				resizeInfo[key] = that.width( key );
			});	
			
			return resizeInfo;
		},

		keyAtIndex: function( index ) {
			return _keys[index];
		},
		
		each: function( handler, context ) {
			context = context || this;
			Array.each( _keys, function( idx, key ) {
				handler.call( context, idx, key, _data[key] );
			}, context);
		}
	};	
},

UITableColumn = Class({
	name: "UITableColumn",
	parent: Element,
	constructor: function() {
	
		var _key, _group, _span;
	
		return {
			init: function( element, key, html, group ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_key = key;
					_group = group;

					this.html(html);

					return this;
				}
			},
			
			key: function() {
				return _key;	
			},
			
			resize: function(resizeInfo) {
				var width = resizeInfo[_key];
				this.css({
					width: width
				});
			}
		};
	}
}),

UITableRow = Class({
	name: "UITableRow",
	parent: Element,
	constructor: function( ) {
		
		var _cols = [], _group, _width;
		
		return {
			init: function( element, group ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_group = group;
					
					return this;
				}
			},
			
			resize: function(resizeInfo) {
				Array.each( _cols, function( idx, column ) {
					column.resize(resizeInfo);
				});
			},
			
			columns: function() {
				return _cols;	
			},
			
			each: function( handler, context ) {
				context = context || this;			
				Array.each( _cols, function( idx, column ) {
					handler.call( context, idx, column );
				}, context);
			},
			
			addColumn: function( key, value ) {
				var td = document.createElement("TD");
				var column = new UITableColumn( td, key, value, _group );
				_cols.push( column );
				this.append(column);
				return column;
			},

			loadDOM: function() {
				var that = this;
				$(this.element()).find("th,td").each( function( idx, col ) {
					var key = _group.colgroup().keyAtIndex(idx);
					var column = new UITableColumn( col, key, $(col).html(), _group );
					_cols.push( column );
				});
			}
		};
	}
}),

UITableGroup = Class({
	name: "UITableGroup",
	parent: UICore,
	constructor: function(  ) {
		var _that;
		var _rows = [];
		var _table;
		var _$element, _$contain;
		var _colgroup;
		var _$table;
		return {
			init: function(element, colgroup) {
				var self = this._super("init", arguments);
				if ( self ) {
					_$element = $(element);
					_$table = _$element.find("table");
					_$contain = _$table.children().eq(0);
					_that = this;
					_colgroup = colgroup;
					//_table = table;
					return this;
				}
			},
			
			resize: function(resizeInfo) {
				Array.each( _rows, function( idx, row ) {
					row.resize(resizeInfo);
				});
			},
			
			addTableClass: function( className ){
				_$table.addClass(className);
			},
			/*table: function() {
				return _table;	
			},*/
			
			/*colgroup: function() {
				return _table.colgroup();	
			},*/
			
			colgroup:function(){
				return _colgroup;
			},

			firstRow: function() {
				return _rows.length > 0 ? _rows[0] : null;	
			},
			
			rows: function() {
				return _rows;	
			},
			
			each: function( handler, context ) {
				context = context || this;
				Array.each( _rows, function( idx, row ) {
					handler.call( context, idx, row );
				}, context);
			},
			
			clear: function(){
				_$contain.empty();
			},

			addBlankRow: function( message ) {
				var tr = document.createElement("TR");
				var row = new UITableRow( tr, this );
				var colgroup = _table.colgroup();
				var td = document.createElement("TD");
				var column = new UITableColumn( td, "", message, this );
				column.attr("colspan", colgroup.count() );
				row.addClass("blank");
				row.append( column );
				_$contain.append( row );				
				return row;
			},
			
			addRow: function( rowData ) {
				var tr = document.createElement("TR");
				var row = new UITableRow( tr, this );
				var colgroup = _colgroup;//_table.colgroup();
				colgroup.each( function( idx, key, option ) {
					row.addColumn( key, rowData[key] || "" );
				});
				
				_rows.push( row );
				_$contain.append(row.element());
				
				return row;
			},

			loadDOM: function() {
				var that = this;
				_$contain.find("tr").each( function( idx, row ) {
					var row = new UITableRow( row, that );
					row.loadDOM();
					_rows.push( row );
				});
			},

			setColgroup: function( key, data ){
				_colgroup._set(key, data);
			}
		}
	}
}),

UITableHead = Class({
	name: "UITableHead",
	parent: UITableGroup,
	constructor: function( ) {
		var _$element;
		var _$rowContain;
		return {
			init: function(element, colgroup) {
				_$element = $(element);
				_$element.html("<table><thead></thead></table>");
				var self = this._super("init", arguments);				
				if ( self ) {
					return this;
				}
			},
			
			addRow: function( rowData ) {
				var row = this._super("addRow", [rowData] );
				var colgroup = this.colgroup();
				if ( row === this.firstRow() ) {
					row.each( function( idx, column ) {
						var colKey = column.key();
						var data = colgroup.data(colKey);
						for ( var key in data ) {
							column.data( key, data[key] );
						}
					});
				}
				return row;
			},
			
			headData: function() {
				var headData = {};
				this.colgroup().each( function( idx, key, option ) {
					headData[key] = option.title;
				});
				
				return headData;
			}
		}
	}
}),

UITableBody = Class({
	name: "UITableBody",
	parent: UITableGroup,
	

	constructor: function( ) {
		var _$element;
		var _scroll;
		var _options;
		var useScroll=true;
		var scrollOptions = {
			useScrollBar: true,
			fadeScrollbars: false,
			useScrollBounceVertical: false,
			flexable: false
		};

		return {
			init: function(element, colgroup, options) {
				_$element = $(element);
				_$element.html("<table><tbody></tbody></table>");
				
				var self = this._super("init", arguments);
				if ( self ) {
					useScroll = options.useScroll;
					scrollOptions = $.extend(true, {}, scrollOptions, options.scrollOptions);
			
					this.__createScroll();
					return this;
				}
			},

			__createScroll: function() {
				if( useScroll == false ){return;}
				_$element.addClass(cssPrefix+"scroll");
				_$element.find("table").addClass(cssPrefix+"scroll-container");
				_scroll = _$element.instance( "Scroll", scrollOptions);
			},

			scrollRefresh: function(){
				if( _scroll ){
					_scroll.refresh();	
				} 
			}
		}
	}
}),

UITable = Class({
	name: "UITable",
	parent: UICore,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					scheme: {},
					fields:[],
					addTableClass: "table",
					useScroll: true,
					scrollOptions: {}
				}
			}
		}
	},

	constructor: function() {		
		var _head, _body, _colgroup;
		
		var _$element;
		var _options;
		var headHtml;
		return {
			init: function(element, options) {
				var self = this._super("init", arguments);
				if ( self ) {
					_options = this._options();
					//_options.scheme = options.scheme;
					_$element = $(element);
										
					this.__creatContents();							
					this._createHead(_options.fields);
					return this;
				}
			},



			__creatContents: function(){
				_colgroup = new UITableColumnGroup( this );
				
				var $headContainer = $('<div class="'+cssPrefix+'head-container"></div>');
				var $bodyContainer = $('<div class="'+cssPrefix+'body-container"></div>');

				_$element.html($headContainer.add($bodyContainer));		
				_head = new UITableHead( $headContainer, _colgroup );
				
				_body = new UITableBody( $bodyContainer, _colgroup, {
					useScroll: _options.useScroll, 
					scrollOptions: _options.scrollOptions 
				});

				_head.addTableClass( _options.addTableClass );	
				_body.addTableClass( _options.addTableClass );
			},

			/*__drawHead: function(){
				if( _$element.find("table tr").length ){
					this._loadFromHead(_options.fields);	
				}else{
					this._createHead(_options.fields);	
				}
			},

			_loadFromHead: function() {
				var me = this;
				var $table = _$element.find("table");
				var $rows = _$element.find("thead tr");
				var fields = [];

				$rows.each(function(){
					fields.push($(this).data());
				});

				$table.remove();
				this._createHead(fields);
			},*/

			_createHead: function( fields ) {	
				var me = this;
				var $row = $("<tr></tr>");
				var row = $row.instance(UITableRow, _head);
				_$element.find("thead").append( $row );
				_head.rows().push( row );
				$(fields).each( function( indx, field ) {
					var $th = $("<th></th>");
					for ( var k in field ) {
						$th.attr( "data-"+k, field[k] );
					}
					
					var rowData = {};
					var column = $th.instance(UITableColumn, field.key, field.title, _head);
					if( field.sortable == true ){
						column.bind("click", function(e) {							
							var key = column.key();
							me.dispatchEvent("selectHeadColumn", key);
						});
					}			

					$row.append( $th );					
					row.columns().push( column );					
					_head.setColgroup( field.key, field );
				});
			},

			
			head: function() {
				return _head;
			},
			
			body: function() {
				return _body;
			},

			resize: function() {
				var resizeInfo = _colgroup.resizeInfo();
				_head.resize( resizeInfo );
				_body.resize( resizeInfo );	
				_body.scrollRefresh();
			},
			
			colgroup: function( data ) {
				if ( arguments.length === 0 ) {
					return _colgroup;
				}
				_colgroup._setData( data );
			},
			
			clear: function() {
				_body.clear();
			},
			
			makeRows: function( listData ) {
				Array.each( listData, function( idx, rowData ) {
					_body.addRow( rowData );
				});
			}
		};
	}
}),

/**
 * data grid 기능을 제공한다.
 * @class DataGrid
 */
DataGrid = Class({
	name: "DataGrid",
	parent: UICore,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					scheme:{},
					fields: [],
					width: "100%",
					height: "200px",
					data:[],
					pageSize: 20,
					page:1,	
					autoResize: false,
					addTableClass: "table",
					useScroll: true,
					scrollOptions: {},
					usePagination: true,
					paginationOptions: {},
					change: function(){}
				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof DataGrid 
	 * @param {Element} 기준이 되는 DOM Element
	 * @param {Object} options DataGrid 옵션 데이터 입니다.
	 * @param {String} options.scheme field정보를 전달합니다.
	 * @param {String} options.width="100%" 테이블의 width 값입니다.
	 * @param {String} options.height="200px" 테이블의 height 값입니다.
	 * @param {String} options.data 테이블을 그리기 위한 데이터 정보입니다.
	 * @param {String} options.data.items 테이블 데이터 리스트 정보 입니다.
	 * @param {String} options.pageSize 한 페이지에 출력할 row개수 입니다.
	 * @param {String} options.page 현재 페이지 값입니다.
	 * @param {Boolean} options.autoResize=false 화면 리사이즈시 자동으로 사이즈를 조정할 것인지에 대한 값입니다.
	 * @param {Boolean} options.addTableClass="table" 생성된 테이블에 추가할 class 정보 입니다.
	 * @param {Object} options.useScroll=true 콘텐츠 높이가 테이블 높이보다 클 경우 UIScroll을 생성하여 적용할 것인지에 대한 값입니다.
	 * @param {Function} options.scrollOptions UIScroll에 적용할 options 정보입니다.
	 * @param {Object} options.usePagination=true Pagination을 적용할 것인지에 대한 값입니다.
	 * @param {Function} options.paginationOptions Pagination 적용할 options 정보입니다
	 * @param {Boolean} options.autoResize=false 화면 리사이즈시 자동으로 사이즈를 조정할 것인지에 대한 값입니다.
	 * @retuns {DataGrid} 
	 * @since 1.0.0
	 */
	constructor: function() {
		var _scroll, _table, _pagination,
			_template,
			_listData = [], _sortKey = "", _sortType = "", _sort, _page = 1, _totalPage = 1, _pageSize = 10;
		var _$element, _$tableContainer, _options;
		var _resizeTimer;
		return {
			init: function( element, gridData ) {
				var self = this._super("init", arguments);
				if ( self ) {
					var that = this;
					_options = this._options();
					_$element = $(element);
					this.__loadDomData();
					

					this.__createSortElement();
					this.__setAutoResize();
					this.__createTable();
					
					this.size(_options.width, _options.height);
					
					_page = _options.page;					
					_pageSize = _options.pageSize;
					
					/*if ( gridData.columns ) {
						this.colgroup( gridData.columns );
					}

					if ( gridData.delegate ) {
						this.delegate( gridData.delegate );
					}*/	
								
					this._createPagination();

					this.resetData( {data: _options.data, pageSize: _options.pageSize, page: _options.page} );
					_table.resize();					
					return this;
				}
			},

			__loadDomData: function(){
				if( _options.fields.length == 0 ||  _$element.find("thead tr").length > 1){
					_options.fields = this.__getHeadDOMData();	
				}

				if( _options.data.length == 0 ||  _$element.find("tbody tr").length > 1){
					_options.data = this.__getBodyDOMData();	
				}

				_$element.find("table").remove();
			},

			__getHeadDOMData: function(){
				var me = this;
				var $table = _$element.find("table");
				var $columns = _$element.find("thead td");
				var fields = [];
				$columns.each(function(){
					var $t = $(this);
					var title = $t.html();
					var data = $t.data();
					if(title != ""){
						data.title = title;
					}

					fields.push(data);
				});

				return fields;
			},

			__getBodyDOMData: function() {
				var $rows = _$element.find("tbody tr");
				var list = [];
				$rows.each(function(){
					var obj = {};
					$(this).find("td").each(function(index, value){
						var $t = $(value);
						obj[_options.fields[index].key] = $t.html();
					});
					list.push(obj);
				});

				return list;
			},

			/**
			 * 테이블 width,height 값을 변경합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
 			 * @param {String|Number} width table width
 			 * @param {String|Number} height table height
			 * @return {DataGrid} DataGrid Instance
			 */
			size: function( width, height ){
				_$element.width(width);
				_$tableContainer.height(height);
				this.resize();
				return this;
			},

			__setAutoResize: function(){
				if( _options.autoResize == false ){return;}
				var that = this;	
				$(window).on("resize."+this.instanceID, function() {
					clearTimeout(_resizeTimer);				
					_resizeTimer = setTimeout( function() {
						that.resize();
					}, 100 );
				});
			},

			__createSortElement: function(){
				_sort = new Element("SPAN");
				_sort.addClass("sort-arrow");
			},


			__createTable: function(){
				if( _options.usePagination == true ){
					_$tableContainer = $('<div></div>');
					_$element.html(_$tableContainer);
				}else{
					_$tableContainer = _$element;
				}

				_$tableContainer.addClass(cssPrefix+"table-container");
				_table = new UITable( _$tableContainer.get(0), _options );
				var me = this;
				_table.bind("selectHeadColumn", function(key){
					me.sortByKey( key );
				});
			},

			_createPagination: function(){
				if( _options.usePagination != true ){return;}
				var me = this;
				var $paginationContain = $('<nav class="'+cssPrefix+'pagination"></nav>');
				_$tableContainer.after( $paginationContain );
				_pagination = $paginationContain.instance("Pagination", {				
					usePrevNextListButton: _options.paginationOptions.usePrevNextListButton,
					useFirstLastButton: _options.paginationOptions.useFirstLastButton,
					visiblePage: _options.paginationOptions.visiblePage,
					changePage: function(ui, page){						
						me.__movePage( page );
					}
				});
			},
			
			

			/**
			 * 테이블 사이즈를 다시 계산합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @return {DataGrid} DataGrid Instance
			 */
			resize: function(){
				_table.resize();
				return this;
			},

			table: function() {
				return _table;
			},
			
			colgroup: function( colgroup ) {
				var row, that = this;				
				_table.colgroup( colgroup );
				_table.head().addRow( _table.head().headData() ).each( function( idx, column ) {
					column.bind("click."+that.instanceID, function(e) {
						var key = column.key();
						that.sortByKey( key );
					});
				});
			},
			
			sortByKey: function( key ) {
				if ( _sortKey === key ) {
					if ( _sortType === "" ) {
						_sortType = "ASC";
					}
					else if ( _sortType === "ASC" ) {
						_sortType = "DESC";
					}	
					else if ( _sortType === "DESC" ) {
						_sortType = "";
					}
				}
				else {
					_sortKey = key;
					_sortType = "ASC";
				}
				
				this.render();
			},

			listData: function() {
				if ( _listData.length === 0 ) {return [];}

				var listData = [];
				if ( _sortType !== "" ) {
					var sortedListData = Array.copy( _listData );
				
					Array.sort( sortedListData, function( targetData, nextData ) {
						var targetValue = targetData[_sortKey];
						var nextValue = nextData[_sortKey];
						
						if ( ! isNaN(parseInt(targetValue)) && ! isNaN(parseInt(nextValue)) ) {
							targetValue = parseInt( targetValue );
							nextValue = parseInt( nextValue );
						}
					
						if ( _sortType == "DESC" && targetValue < nextValue ) {
							return _sortType;
						}
						else if ( _sortType == "ASC" && targetValue > nextValue ) {
							return _sortType;
						}
					});

					listData = sortedListData;
				}else {
					listData = _listData;
				}

				return listData;
			},
			
			render: function( html ) {
				var headRow = _table.head().firstRow();
				if ( headRow ) {
					var columns = headRow.columns();

					Array.each( columns, function( idx, column ) {
						if ( column.key() === _sortKey ) {
							_sort.removeClass("DESC ASC");
							_sort.addClass( _sortType );
							column.append( _sort );
							return false;
						}
					});
				}

				var listData = this.listData();
				var dataItems = [];
				
				Array.each( listData, function( idx, itemData ) {
					if ( idx < ( _page * _pageSize ) && idx >= ( (_page - 1) * _pageSize ) ) {
						dataItems.push( itemData );
					}
				});

				_table.clear();
				
				if ( html || _template ) {
					if ( html !== undefined ) {
						_template = Template.parse(html);
					}

					var html = _template.render( {items: dataItems} );
					_table.body().html(html);
					_table.body().loadDOM();
				}else {
					_table.makeRows( dataItems );	
				}
				
				this.resize();				
				this.dispatchEvent( "change", this, _page );
				_options.change(this, _page);
			},

			clearData: function() {
				_listData = [];
				_totalPage = 1;
			},
			
			/**
			 * 한 페이지에 출력할 row개수를 변경 합니다. 인자 값이 없을 경우 현재 page size를 리턴합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @param {Number} pageSize 변경할 row 개수
			 * @return {DataGrid|Number} DataGrid Instance |  현재 pageSize
			 */
			pageSize: function( pageSize ) {
				if( arguments.length==0 ){
					return _pageSize;
				}
				_pageSize = pageSize;	
				this.render();
				return this;
			},
			

			/**
			 * 현재 페이지 정보를 반환합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @return {Number} 현재 페이지
			 */
			page: function() {
				return _page;	
			},
			
			/**
			 * 총 페이지 수를 반환합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @return {Number} 총 페이지 
			 */
			totalPage: function() {
				return _totalPage;	
			},
			
			/**
			 * 다음 페이지 리스트로 이동합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @return {DataGrid} DataGrid Instance
			 */
			nextPage: function() {
				this.movePage( _page + 1 );	
				return this;
			},

			/**
			 * 이전 페이지 리스트로 이동합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
			 * @return {DataGrid} DataGrid Instance
			 */
			prevPage: function() {
				this.movePage( _page - 1 );	
				return this;
			},
			
			__movePage: function(page){
				page = parseInt(page);
				page = Math.min( Math.max( page, 1), _totalPage );
				if ( _page === page ) {
					return;
				}
				_page = page;
				this.render();
			},

			/**
			 * 전달 받은 인자값의 페이지 리스트로 이동합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
 			 * @param {Number} page 변경할 page 번호	
			 * @return {DataGrid} DataGrid Instance
			 */
			movePage: function( page ) {
				page = Math.min( Math.max( page, 1), _totalPage );
				this.__movePage(page);
				if(_pagination){
					_pagination.page( page, true );//true=ignoreEvent
				}
				return this;
			},
			
			/**
			 * 테이블 데이터를 새로운 데이터로 변경합니다.
			 * @memberof DataGrid
			 * @since 1.0.0  
 			 * @param {Array} 테이블 row 데이터
			 * @return {DataGrid} DataGrid Instance
			 */
			resetData: function(data, html ){
				this.data(data, html);
				this.render();
				return this;
			},


			data: function( data, html ) {
				_listData = data.data;
				_pageSize = data.pageSize;
				
				if( data.totalPage ){
					_totalPage = data.totalPage;
				}else{
					_totalPage = ( _listData.length == 0 ) ? 1 : Math.ceil(_listData.length / _pageSize);		
				}		
				
				_page = data.page;	

				if( _pagination ){
					_pagination.pageData({
						totalPage: _totalPage,
						page: data.page
					});	
				}

				if ( html === true ) {
					this.render( html );
				}
			},

			destroy: function(){
				this._super("destroy", arguments);
			}
		}
	}
}),

Pagination = Class({
	name: "Pagination",
	parent: UICore,
	'static': function(){
		return {
			_setting:{
				defaultOptions: {
					totalPage: 1,
					visiblePage: 5,
					page:1,
					usePrevNextListButton: true,
					useFirstLastButton: true,
					changePage: function(){}
				}
			}
		}
	},

	/**
	 * @constructor
	 * @memberof Pagination 
	 * @param {Element} element 기준이 되는 DOM Element instance입니다.
	 * @param {Object} options Pagination 옵션 데이터 입니다.
	 * @param {String} options.totalPage=1 총 페이지 수 입니다.
	 * @param {String} options.visiblePage=5 최대 노출되는 페이지 버튼 개수 입니다.
	 * @param {String} options.page=1 현재 페이지의 값 입니다.
	 * @param {Number} options.usePrevNextListButton=true 이전 페이지 리스트, 다음 페이지 리스트로 이동하는 버튼을 사용할 것인지에 대한 값입니다.
	 * @param {Number} options.useFirstLastButton=true 첫페이지와 마지막페이지로 이동하는 버튼을 사용할 것인지에 대한 값입니다.
	 * @retuns {Pagination} 
	 * @since 1.0.0
	 */
	constructor: function() {	
		var _list = [], _page, _totalPage;
		var _$element;
		var _visiblePage, _currentStartPage, _lastStartPage;
		var _options;
		var _isNewData = true;

		return {			
			init: function( element, options ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_options = this._options();
					_$element = $(element);
					
					this.pageData({
						totalPage: _options.totalPage,
						visiblePage: _options.visiblePage,
						page: _options.page,
					});
										
					this.__bindEvent();
					return this;
				}
			},

			__makeButtons: function( start ) {
				_currentStartPage = start;
				var pageButtons = '<ul>';

			    if( _options.useFirstLastButton == true ){
			    	pageButtons +='<li><a data-page="first-page" href="#" aria-label="first">&laquo;</a></li>';	
			    }
			    
			    if( _options.usePrevNextListButton ){
			    	pageButtons +='<li><a data-page="prev-list" href="#" aria-label="prev">&lsaquo;</a></li>';	
			    }

			    var len = Math.min(start+_visiblePage, _totalPage+1);
				for ( var page=start; page<len; page++ ) {
					pageButtons+='<li><a data-page="'+page+'" href="#">'+page+'</a></li>';
				}

				if( _options.usePrevNextListButton == true ){
					pageButtons+= '<li><a data-page="next-list" href="#" aria-label="next">&rsaquo;</a></li>';	
				}

				if( _options.useFirstLastButton ){
					pageButtons += '<li><a data-page="last-page" href="#" aria-label="last">&raquo;</a></li>';
				}
				
				pageButtons+='</ul>';
				_$element.html(pageButtons);
			},
		

			__getPage: function( str ){
				var page;
					switch( str ){
						case "next-list":
							var nextStart = _currentStartPage+_visiblePage; 
							if( nextStart > _lastStartPage ){
								page = _page;
							}else{
								page = nextStart;
							}
						break;
						case "prev-list":
							var prevStart = _currentStartPage - _visiblePage;
							if( _currentStartPage == 1 ){
								page = _page
							}else{
								page = Math.max(_currentStartPage-_visiblePage, 1);	
							}
						break;
						case "first-page":
							page = 0;
						break;
						case "last-page":
							page = _totalPage;
						break;
						default:
						page = str;
					}

				return page;
			},

			__getCurrentPage: function(page){
				var count = Math.ceil(_totalPage/_visiblePage);
				for( var i=1, len=count; i<=count; i++ ){
					var checkNum = (i*_visiblePage);				
					if( page <= checkNum){
						break;
					}
				}
				return Math.min(checkNum-_visiblePage+1, _totalPage);
			},

			__unbindEvent: function(){
				_$element.off("click."+this.instanceID);
			},

			__bindEvent: function(){
				var me = this;
				_$element.on("click."+this.instanceID, "[data-page]", function(e) {
					e.preventDefault();
					var pageStr = $(this).attr("data-page");
					var page = me.__getPage( pageStr );
					me.page( page ); 
				});
			},
			
			/** 
			 * 인자가 없을경우 페이지 정보를 리턴하고, 인자가 있을경우 페이지 정보를 해당 인자 값으로 변경합니다.
			 * @memberof Pagination
			 * @param {Object} [value] 변경할 페이지 정보
			 * @since 1.0.0
			 * @return {Pagination|Object} 변경 값이 있을경우 Pagination instance, 없을 경우 현재 페이지 정보 리턴함.
			 */
			pageData: function(data){
				if( arguments.length == 0 ){
					return {
						totalPage: _totalPage,
						visiblePage : _visiblePage,
						page: _page
					}
				}

				_totalPage = parseInt(data.totalPage);
				_visiblePage = (data.visiblePage) ? parseInt(data.visiblePage) : _visiblePage;				
				_lastStartPage = (Math.ceil(_totalPage/_visiblePage)-1)*_visiblePage;
				_lastStartPage += 1;
				
				_page = (data.page) ? data.page : 1;
				
				_isNewData = true;
				this.page(_page);
				return this;
			},

			/** 
			 * 인자가 없을 경우 현재 페이지 값을 리턴하고, 인자가 있을경우 전달 받은 페이지를 선택 상태로 변경합니다.
			 * @memberof Pagination
			 * @param {Object} [value] 변경할 페이지 정보
			 * @since 1.0.0
			 * @return {Pagination|Number} 변경 값이 있을경우 Pagination instance, 없을 경우 현재 페이지를 리턴함.
			 */
			page: function( page, ignoreEvent ) {
				if( arguments.length == 0 ){return _page;}

				var wasPage = _page;
				var currentPage = this.__getCurrentPage( page );
				if( _currentStartPage != currentPage || _isNewData == true ){
					this.__makeButtons( currentPage );
				}

				_page = Math.min( Math.max( page, 1 ), _totalPage );

				_$element.find("[data-page="+_page+"]").parent().addClass(cssPrefix+"active")
				.siblings().removeClass(cssPrefix+"active");
			
				if ( ignoreEvent != true || wasPage !== _page ) {
					this.dispatchEvent( "changePage", this, _page );	
					_options.changePage( this, _page );	
				}

				_isNewData = false;
				return this;
			},

			destroy: function(){
				this._super("destroy", arguments);
				this.__unbindEvent();
			}	
		}	
	}
});

})(window);