
(function(window, undefined) {

'use strict';

var debug = window.debug;

var 
Class = UI.Class,

DataHelper = {

    convertDate: function( dateString ) {
    	if ( dateString === "TODAY" ) {
    		debug.log('dateString Today :', dateString);
    		return new Date();
    	}

    	if ( dateString.indexOf("D") !== -1 ) {
    		var offset = parseInt( dateString );
    		var today = new Date();
    		debug.log('dateString dateString.indexOf("D") :', dateString);
    		
            return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset );
    	}
    	
    	  if ( M.navigator.os("ios") ) {
	        dateString = dateString.replace(" ", "T");
	        debug.log('IOS : ', dateString);
	
	        if ( dateString.indexOf("T") !== -1 ) {
	            var utc = new Date( dateString );
	            return new Date((utc.getTime() + utc.getTimezoneOffset()*60000));   
	        }
	      //안드로이드 일떄
	      //데이트 String형식에 T문자가 있을 시 공백으로 교체 후 DATE형태로 리턴.
    	  }else if( M.navigator.os("android")){  
    		  if ( dateString.indexOf("T") !== -1 ) {
    			  dateString = dateString.replace("T", " ");
    		  }
    	  }

        return new Date( dateString );
    },
            
    timeFormat: function( format, timeData ) { 
        var hour = timeData.hour;
        var minute = timeData.minute;

        format = format.replace('hh', this.str2num(hour) );
        format = format.replace('h', hour );
        format = format.replace('mm', this.str2num(minute) );
        format = format.replace('m', minute);

        return format;
    },

    numberFormat: function( num, unit ) {
        num = parseInt(num);
        if ( isNaN(num) ) {
            num = 0;
        }

        return UI.Helper.Number.format( num ) + "" + (( ! unit ) ? "" : unit);
    },

    dateFormat: function( format, dateString ) {
    	var date = typeof dateString == "string" ? this.convertDate(dateString) : dateString;

    	if ( date == null ) {
    		return "";
    	}
    	
    	if ( isNaN(date) ) {
    		return "Invalid Date";
    	}

        var year = date.getFullYear() + '';
        var month = (date.getMonth()+ 1) + ''; 
        var day = date.getDate() + '';
        var hour = date.getHours() + '';
        var minute = date.getMinutes() + '';

        var weekKorNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]; 
        var weekKorName = weekKorNames[date.getDay()];
        var weekEngNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]; 
        var weekEngName = weekEngNames[date.getDay()];

        format = format.replace('YYYY', year);
        format = format.replace('YY', year.substr(2,2));
        format = format.replace('MM', this.str2num( month ) );
        format = format.replace('M', month);
        format = format.replace('DD', this.str2num( day ) );
        format = format.replace('D', day);
        format = format.replace('hh', this.str2num( hour ) );
        format = format.replace('hh', hour);
        format = format.replace('mm', this.str2num( minute ) );
        format = format.replace('m', minute);
        format = format.replace('KWW', weekKorName);
        format = format.replace('KW', weekKorName.substr(0,1));
        format = format.replace('EWW', weekEngName);
        format = format.replace('EWS', weekEngName.substr(0,3).toLowerCase());
        format = format.replace('EW', weekEngName.substr(0,3));

        return format;
    },

    str2num: function( str ) {
        str = str + '';
        return str.length == 1 ? '0' + str : str;
    },
},

DataModel = Class({
	name: "DataModel",
	parent: "IObject",
	constructor: function() {

		var 
		_modelKey,
		_scheme = {},
		_data = {},
		_restored = false,
		_useStorage = false;

		return {
			init: function( modelKey, scheme, options ) {
				var self = this;

				_modelKey = modelKey;
				_data = {};
				_useStorage = (options||{}).useStorage == true ? true : false;

				for ( var key in scheme ) {
					_scheme[key] = scheme[key];
				}

				if ( _modelKey ) {
					DataModel.register( _modelKey, this );
				}

				this.restoreData();
			},

			createMethods: function() {
				var self = this;

				for ( var key in _scheme ) {
					(function(key) {
						var method = String.camelize(key);

						if ( self[method] === undefined ) {
							self[method] = function() {
								return self.get(key);
							}
						}
					})(key);
				}
			},

			scheme: function() {
				return _scheme;
			},

			modelKey: function() {
				return _modelKey;
			},

			set: function( key, value ) {
				if ( value === null ) {
					//delete _data[key];
					_data[key] = null;
				}
				else {
					_data[key] = value;
				}

                this.saveData();
			},

			get: function( key ) {
				if ( _restored === false ) {
					this.restoreData();
				}

				return _data[key];
			},

			isValidType: function( value, type ) {
				//M.tool.log( "isValidType", value, type );

				if ( value !== undefined && typeof value === type ) {
					return true;
				}
				else if ( type === "array" && Array.isArray( value ) ) {
					return true;
				}

				return false;
			},

			mapData: function() {
				return {};
			},

			mappingHandler: function( key, value ) {
				return value;
			},

			data: function( data, restore ) {

				if ( arguments.length === 0 ) {
					return _data;
				}

				var key, index, mapKeys, mapKey,
                    self = this,
					mapData = self.mapData(),
					mappingHandler = self.mappingHandler;

				for ( key in mapData ) {
					mapKeys = mapData[key];
					for ( index in mapKeys ) {
						mapKey = mapKeys[index];

						if ( data[mapKey] ) {
							data[key] = data[mapKey];
						}
					}
				}

				for ( var key in _scheme ) {
					var validType = _scheme[key];

					if ( validType == "number" ) {
						var temp = parseInt( data[key] );
						if ( ! isNaN(temp) ) {
							data[key] = temp;
						}
					}

					if ( data[key] === undefined ) {
						continue;
					}

					if ( this.isValidType( data[key], validType ) ) {
						_data[key] = mappingHandler( key, data[key] );
					}
					else {

						if ( data[key] !== undefined ) {
							debug.warn( "key (" + key + ") of data is not valid type", typeof data[key], data );
						}
					}
				}

				this.saveData();
			},

			truncate: function() {
				_data = {};
				
				this.saveData();
			},

			restoreData: function() {
				if ( _modelKey == null ) {
					return;
				}

				if ( _useStorage == true ) {
					_data = M.data.storage( "DataModel-" + _modelKey ) || {};
				}
				else {
					_data = M.data.global( "DataModel-" + _modelKey ) || {};
				}

                _restored = true;

				return _data;
			},

			saveData: function() {
				if ( _modelKey == null ) {
					return;
				}

				if ( _useStorage == true ) {
					M.data.storage( "DataModel-" + _modelKey, _data );
				}
				else {
					M.data.global( "DataModel-" + _modelKey, _data );
				}

                _restored = false;
			}
		};
	},
	staticConstructor: function() {
		var _modelMap = {}, _needToUpdate = false;

        return {
            register: function( key, model ) {
            	if ( _modelMap[ key ] ) {
            		debug.warn( "model " + key + " is exists !!" );
            	}

                _modelMap[ key ] = model;
            },

            models: function() {
            	return _modelMap;
            },

            needToSave: function() {
            	if ( _needToUpdate == true ) {
            		return;
            	}

            	_needToUpdate = true;

            	for ( var key in _modelMap ) {
            		var model = _modelMap[key];
            		model.saveData();
            	}
            },

            needToRestore: function() {
            	if ( _needToUpdate == false ) {
            		return;
            	}

            	_needToUpdate = false;

            	for ( var key in _modelMap ) {
            		var model = _modelMap[key];
            		model.restoreData();
            	}
            }
        }
	}
}),

DatabaseConfig = Class({
	name: "DatabaseConfig",
	parent: "IObject",
	constructor: {},
	staticConstructor: function() {

		var _defaultSchemeVersion = "1.5"; // Scheme 가 바뀐 경우 해당 버전 값을 올림

		return {
			databaseName: function() {
				if ( this.deviceType() == "D" ) {
					return "bang" + "." + this.userKey() + "." + this.monthKey();
				}

				return "bang" + "." + this.userKey() + "." + this.monthKey() + ".Device";
			},

			currentSchemeVersion: function() {
				var schemeVersion = M.data.storage("_DB_CONFIG_SCHEME_VERSION_");

				if ( ! schemeVersion ) {
					return "0";
				}

				return schemeVersion;
			},

			defaultSchemeVersion: function() {
				return _defaultSchemeVersion;
			},

			migration: function() {

				debug.log( "migration" );

				var currentSchemeVersion = DatabaseConfig.currentSchemeVersion();

				if ( currentSchemeVersion < _defaultSchemeVersion ) { 
					// Scheme Version 이 다른 경우 Database 를 Reset
					// 단, Reset 된 경우 동기화가 다시 처음부터 시작됨

					DatabaseManager.sharedManager().recreateDatabase();
					DatabaseManager.sharedManager().openDatabase();

					M.data.storage("_DB_CONFIG_SCHEME_VERSION_", _defaultSchemeVersion );
				}
			},

			hasBand: function() {
				return DeviceInfo.sharedInfo().hasPairedBand();
			},

			deviceType: function() {
				return DeviceInfo.sharedInfo().deviceType();
			},

			userKey: function() {
				return UserInfo.sharedInfo().userKey();
			},

			monthKey: function() {
				return DataHelper.dateFormat("YYYY-MM", new Date());
			}
		}
	}
}),

DatabaseManager = Class({
	name: "DatabaseManager",
	parent: "IObject",
	constructor: function() {

		return {

			databaseName: function() {
				return DatabaseConfig.databaseName();
			},

			status: function() {
				var status = M.data.global("_DATABASE_STATUS_");

				return status ? status : "UNKNOWN";
			},

			isCreated: function() {
				var databaseName = this.databaseName();

				if ( M.file.info( databaseName + ".db" ).status === "SUCCESS" ) {
					return true;
				}

				return false;
			},

			isOpened: function() {
				var status = this.status();
				
				return ( status === "OPENED" ) ? true : false;
			},

			initialize: function() {
				// Dababase Migration
				DatabaseConfig.migration();

				if ( ! this.isCreated() ) {
					this.createDatabase();
				}

				if ( ! this.isOpened() ) {
					this.openDatabase();
				}
			},

			recreateDatabase: function() {
				this.closeDatabase();
				this.removeDatabase();
				this.createDatabase();
			},

			createDatabase: function() {
				if ( this.isCreated() == true ) {
					return true;
				}

				M.data.global("_DATABASE_STATUS_", "CREATED");

				var result = M.db.create( this.databaseName() );
				
				if ( result.status == "SUCCESS" ) {
					return true;
				}

				return false;
			},

			removeDatabase: function() {
				M.data.global("_DATABASE_STATUS_", "REMOVED");

				var result = M.db.remove( this.databaseName() );
				
				if ( result.status == "SUCCESS" ) {
					return true;
				}

				return false;
			},

			openDatabase: function() {
				if ( this.isOpened() ) {
					return true;
				}

				M.data.global("_DATABASE_STATUS_", "OPENED");

				var result = M.db.open( this.databaseName() );
				
				if ( result.status == "SUCCESS" ) {
					return true;
				}

				return false;
			},

			closeDatabase: function() {

				M.data.global("_DATABASE_STATUS_", "CLOSED");

				var result = M.db.close( this.databaseName() );	
				
				if ( result.status == "SUCCESS" ) {
					return true;
				}

				return false;
			},
		}
	},
	staticConstructor: function() {
		var _instance;

        return {
            sharedManager: function() {
                if ( _instance === undefined ) {
                    _instance = new DatabaseManager();
                }
                return _instance;
            }
        }
	}
}),

DataAccessObject = Class({
	name: "DataAccessObject",
	parent: "IObject",
	constructor: function() {

		var 
		_primaryKey = "",
		_scheme = {},
		_data = {};

		return {
			init: function( data, scheme ) {
				var self = this;

				for ( var key in scheme ) {
					var type = scheme[key];
					if ( type.indexOf("@") === 0 ) {
						_primaryKey = key; 
						type = type.substr(1);
					}

					_scheme[key] = type;
				}

				this.data( data );
				this.createMethods();

				return self;
			},

			createMethods: function() {
				var self = this;

				for ( var key in _scheme ) {
					(function(key) {
						var method = String.camelize(key);

						if ( self[method] === undefined ) {
							self[method] = function() {
								return self.get(key);
							}
						}
					})(key);
				}
			},

			key: function() {
				return _primaryKey;
			},

			keyValue: function() {
				return this.get(_primaryKey);
			},

			scheme: function() {
				return _scheme;
			},

			set: function( key, value ) {
				_data[key] = value;
			},

			get: function( key ) {

				var value = _data[key];
				var validType = _scheme[key];

				if ( validType == "integer" || validType == "float" ) {
					return value || 0;
				}

				return value;
			},

			isValidType: function( value, type ) {
				//M.tool.log( "isValidType", value, type );

				if ( value !== undefined && typeof value === type ) {
					return true;
				}
				else if ( type === "array" && Array.isArray( value ) ) {
					return true;
				}

				return false;
			},

			data: function( data ) {
				if ( arguments.length === 0 ) {
					return _data;
				}

				var changed = false;

				if ( data === undefined ) {
					return changed;
				}

				for ( var key in _scheme ) {
					var validType = _scheme[key];

					if ( validType == "integer" || validType == "float" ) {
						if ( typeof data[key] === "string" ) {
							if ( validType == "integer" ){
								data[key] = parseInt(data[key]);
								if ( isNaN(data[key]) ) {
									data[key] = 0;
								}
							}
							else if ( validType == "float" ){
								data[key] = parseFloat(data[key]);
								if ( isNaN(data[key]) ) {
									data[key] = 0;
								}
							}
						}

						validType = "number";
					}

					if ( validType == "boolean" ) {
						if ( typeof data[key] === "string" ) {
							data[key] = (data[key].toLowerCase() === "true" || data[key].toLowerCase() === "t" || data[key].toLowerCase() === "yes" || data[key].toLowerCase() === "y" || data[key] === "1" ) ? true : false;	
						}
						else if ( typeof data[key] === "number" ) {
							data[key] = ( data[key] === 1 ) ? true : false;
						}
						else if ( typeof data[key] === "boolean" ) {
							data[key] = ( data[key] === true ) ? true : false;
						}
					}

					if ( this.isValidType( data[key], validType ) ) {
						var wasData = _data[key];

						_data[key] = data[key];

						if ( wasData !== _data[key] ) {
							changed = true;
						}
					}
					else {
						if ( data[key] !== undefined ) {
							debug.warn( "key (" + key + ") of data is not valid type", typeof data[key], validType, data );
						}
					}
				}

				return changed;
			},

			update: function( data, async ) {

				if ( ! this.data( data ) ) { // no change data
					debug.log( "no changed" );
					return false;
				}

				this.constructor.prototype.__class.updateItem( this, async );
				return true;
			},

			remove: function() {
				this.constructor.prototype.__class.remove( this.data() );
			}
		};
	},
	staticConstructor: function() {
		var 
		self,
		queryQueue = [],
		queryTimer = null,
		databaseManager = DatabaseManager.sharedManager(),
		constructor = {
			init: function() {
				self = this;

				return self;
			},

			databaseName: function() {
				return DatabaseManager.sharedManager().databaseName();
			},

			tableName: function() {
				return "table";
			},

			scheme: function() {
				// 한번 fix 되면 바뀌면 안되고, 바뀔시에는 DB 제거후 재실행
				return {
					"idx": "@integer"
				};
			},

			columns: function() {
				var scheme = this.scheme();
				var columns = [];

				for ( var key in scheme ) {
					var type = scheme[key];
					var primary = false;

					if ( type.indexOf("@") === 0 ) {
						primary = true;
						type = type.substr(1);
					}

					columns.push({
						primary: primary,
						key: key,
						type: type,
						dataType: this.dataType( type )
					});
				}

				return columns;
			},	

			dataType: function( type ) {
				if ( type === "number" || type === "integer" ) {
					return " INTEGER ";
				}
				else if ( type === "boolean" ) {
					return " INTEGER ";	
				}
				else if ( type === "float" ) {
					return " REAL ";
				}
				else if ( type === "string" ) {
					return " VARCHAR(255) ";
				}

				return " TEXT ";
			},

			executeQueries: function( queries ) {
				
				if ( ! databaseManager.isCreated() ) {
					databaseManager.createDatabase();
				}

				if ( ! databaseManager.isOpened() ) {
					databaseManager.openDatabase();
				}

				debug.log( this.prototype.__name, "executeQueries", queries.length );

				var executeQuery = queries.join(";");

				if ( queries.length > 100 ) {
					var groupQueries = [];

					while( queries.length > 100 ) {
						var query = queries.shift();

						groupQueries.push( query );

						if ( groupQueries.length == 100 ) {
							//debug.log( "async query execute", groupQueries.length );

							executeQuery = groupQueries.join(";");
							groupQueries = [];

							var result = M.db.execute({
								path: this.databaseName(),
								query: executeQuery,
								async: true,
								multiple: true
							});	
						}
					}

					if ( groupQueries.length > 0 ) {
						while (groupQueries.length > 0 ) {
							var query = groupQueries.pop();
							queries.unshift( query );
						}
					}
				}

				//debug.log( "async query execute", queries.length );

				executeQuery = queries.join(";");

				var result = M.db.execute({
					path: this.databaseName(),
					query: executeQuery,
					async: true,
					multiple: true
				});	
			},

			execute: function( query, async ) {

				var self = this;

				if ( async === true ) {
					queryQueue.push( query );

					if ( queryTimer != null ) {
						clearTimeout( queryTimer );
						queryTimer = null;
					}

					queryTimer = setTimeout( function() {
						self.executeQueries( queryQueue );
						queryQueue = [];
					}, 500);

					return {status:"SUCCESS"};
				}

				if ( ! databaseManager.isCreated() ) {
					databaseManager.createDatabase();
				}

				if ( ! databaseManager.isOpened() ) {
					databaseManager.openDatabase();
				}

				var result = M.db.execute({
					path: this.databaseName(),
					query: query
				});

				return result;
			},

			each: function( items, callback ) {

				var self = this;
				for ( var i=0; i<items.length; i++ ) {
					(function(i, item) {
						if ( callback ) {
							callback.call( item, i, item );
						}
					})(i, items[i]);
				}
			},

			addQuotes: function( value, dataType ) {
				if ( dataType === "number" || dataType === "integer" ) {
					value = parseInt( value );
					return isNaN(value) ? 0 : value;
				}
				else if ( dataType === "float" ) {
					value = parseFloat( value );
					return isNaN(value) ? 0 : value;	
				}
				else if ( dataType === "boolean" ) {
					if ( typeof value === "string" ) {
						return (value.toLowerCase() === "true" || value.toLowerCase() === "t" || value.toLowerCase() === "yes" || value.toLowerCase() === "y" || value === "1") ? 1 : 0;
					}
					else if ( typeof value === "number" ) {
						return parseInt(value) === 1 ? 1 : 0;
					}
					else if ( typeof value === "boolean" ) {
						return value === true ? 1 : 0;
					}

					return 0;
				}

				return '"' + value + '"';
			},

			drop: function( callback ) {
				if ( ! databaseManager.isOpened() ) {
					databaseManager.openDatabase();
				}

				var query = "DROP TABLE IF EXISTS " + this.tableName() + ";";
				var result = this.execute( query );

				debug.log( this.prototype.__name, "drop", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return result.status === "SUCCESS" ? true : false;
			},

			truncate: function( callback ) {

				var query = "DELETE FROM " + this.tableName() + ";";
				
				var result = this.execute( query );

				debug.log( this.prototype.__name, "truncate", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return ( result.status === "SUCCESS" ) ? true : false;
			},

			create: function( callback ) {

				var query = "CREATE TABLE IF NOT EXISTS " + this.tableName() + " ( ";
				var columns = this.columns();
				var primaryKey = "";

				for ( var i=0; i<columns.length; i++ ) {
					var column = columns[i];
					query += column.key + " " + column.dataType;

					if ( column.primary == true ) {
						query += " PRIMARY KEY ";
					}

					if ( i == columns.length - 1 ) {
						query += ");";
					}
					else {
						query += ", ";
					}
				}
				
				var result = this.execute( query );

				debug.log( this.prototype.__name, "create", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return result.status === "SUCCESS" ? true : false;
			},

			insertItem: function( item, async ) {
				return this.insert( null, item.data(), async );
			},

			insert: function( callback, data, async ) {

				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "object" ) {
					return this.insert( null, arguments[0], arguments[1] );
				}

				var query = "INSERT OR REPLACE INTO " + this.tableName() ;
				var columns = this.columns();
				var fields = [];
				var values = [];

				for ( var i=0; i<columns.length; i++ ) {
					var column = columns[i];
					fields.push( column.key );
					values.push( this.addQuotes( data[column.key], column.type ) );
				}

				query +=  " ( " + fields.join(", ") + " ) ";
				query +=  " VALUES ( " + values.join(", ") + " );";

				var result = this.execute( query, async );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				if ( result.status === "SUCCESS" ) {
					return new this( data, this.scheme() );
				}

				debug.error( result.error );

				return null;
			},

			updateItem: function( item, data, async ) {
				return this.update( null, item.data(), async );
			},

			update: function( callback, data, async ) {

				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "object" ) {
					return this.update( null, arguments[0], arguments[1] );
				}

				var query = "UPDATE " + this.tableName() + " SET ";
				var columns = this.columns();
				var primaryColumn;
				var firstColumn = true;

				for ( var i=0; i<columns.length; i++ ) {
					var column = columns[i];

					if ( column.primary == true ) {
						primaryColumn = column;
					}
					else {
						if ( data[column.key] !== undefined ) { 
							if ( firstColumn == true ) {
								firstColumn = false;
								query += " ";
							}
							else {
								query += ", ";
							}

							query += column.key + " = " + this.addQuotes( data[column.key], column.type );
						}
					}
				}

				query += " WHERE ";
				query += " " + primaryColumn.key + " = " + this.addQuotes( data[primaryColumn.key], primaryColumn.type );
				query += ";";
				
				var result = this.execute( query, async );

				//debug.log( this.prototype.__name, "update", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				if ( result.status === "SUCCESS" ) {
					return new this( data, this.scheme() );
				}

				return null;
			},

			selectCount: function( callback, condition ) {
				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "string" ) {
					return this.selectCount( null, arguments[0] )
				}

				var query = "SELECT COUNT(*) as count FROM " + this.tableName() + " ";

				if ( condition ) {
					query += " WHERE " + condition;
				}
				else {
					query += " WHERE 1 ";
				}

				query += ";";
				
				var result = this.execute( query );

				debug.log( this.prototype.__name, "selectCount", result );

				var count = 0;
				if ( result.rows && result.rows.length > 0 ) {
					count = parseInt( result.rows[0].count );
				}

				if ( isNaN(count) ) {
					count = 0;
				}

				if ( result.status === "SUCCESS" ) {
					if ( typeof callback === "function" ) {
						callback.call( this, {count:count} );
					}
				}

				return count;
			},

			createInstance: function( data ) {
				return new this( data, this.scheme() );
			},

			select: function( callback, condition, order, sort, start, count ) {

				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "string" ) {
					return this.select( null, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4] )
				}

				var query = "SELECT * FROM " + this.tableName() + " ";

				if ( condition ) {
					query += " WHERE " + condition;
				}
				else {
					query += " WHERE 1 ";
				}

				if ( order  && sort ) {
					query += " ORDER BY " + order + " " + sort;
				}

				if ( ! ( isNaN(start) || isNaN(count) ) ) { 
					query += " LIMIT " + start + ", " + count;
				}

				query += ";";
				
				debug.log('query: ', query);
				
				var result = this.execute( query );

				debug.log( this.prototype.__name, "select", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				if ( result.status === "SUCCESS" ) {
					var self = this;
					var items = [];

    				if ( result.rows.length > 0 ) {
                        for ( var i=0; i<result.rows.length; i++ ) {
                        	(function(row) {
								var item = self.createInstance( row );
	                            items.push( item );
                        	})(result.rows[i]);
                        }
                    }

                    return items;
				}

				return [];
			},

			selectItems: function( callback, condition, order, sort ) {
				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "string" ) {
					return this.selectItems( null, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4] )
				}

				var recordCount = this.selectCount( condition );
    			var limitCount = 200;
    			var totalPage = recordCount > 0 ? Math.ceil(recordCount / limitCount) : 0;
    			var items = [];
    			
    			if ( ! isNaN(totalPage) && totalPage > 0 ) {
    				for ( var page=0; page<totalPage; page++ ) {
    					var resultItems = this.select( condition, order, sort, page * limitCount, limitCount );
    					items = items.concat( resultItems );
    				}
    			}

    			debug.log( this.prototype.__name, "selectItems - ", totalPage, recordCount, items.length );

				if ( typeof callback === "function" ) {
					callback.call( this, items );
				}

				return items;
			},

			remove: function( callback, data ) {

				if ( arguments[0] != null && typeof arguments[0] !== "function" && typeof arguments[0] === "object" ) {
					return this.remove( null, arguments[0] );
				}

				var query = "DELETE FROM " + this.tableName() + " ";
				var columns = this.columns();
				var primaryColumn;

				for ( var i=0; i<columns.length; i++ ) {
					var column = columns[i];

					if ( column.primary == true ) {
						primaryColumn = column;
						break;
					}
				}

				query += " WHERE ";
				query += " " + primaryColumn.key + " = " + this.addQuotes( data[primaryColumn.key], primaryColumn.type );
				
				var result = this.execute( query );

				debug.log( this.prototype.__name, "remove", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return ( result.status === "SUCCESS" ) ? true : false;
			}
		};

		return constructor.init();
	}
}),

SampleDAO = Class({
    name: "SampleDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {

            isSynced: function() {
            	return this.get("synced");
            },

            isAM: function() {
            	var date = this.date();
            	debug.log("##############################")
            	debug.log('date', date);
            	debug.log('date.getHours', date.getHours());
            	var upDown = ( date.getHours() < 12 ) ? true : false;
            	debug.log('date 12 Up And Down', upDown);
            	debug.log("##############################")
            	return ( date.getHours() < 12 ) ? true : false;
            },

            sleepDateKey: function() {
            	var date = this.date();
            	var yesterday = date.getHours() > 12 ? 1 : 0;

            	return DataHelper.dateFormat("YYYY-MM-DD", DataHelper.convertDate(date.getFullYear(), date.getMonth(), date.getDate() - yesterday));
            },

            sleepStatus: function() {
            	var value = this.value();
            		
	            if ( value >= FitConfig.sleepBadValue() ) {
	            	return "bad";
	            }
                else if ( value >= FitConfig.sleepSosoValue() ) {
                    return "soso";
                }

                return "good";
            },

            date: function() {
            	//debug.log('datetime', this.datetime());
            	//debug.log('datetime convertDate', DataHelper.convertDate( this.datetime() ));
                return DataHelper.convertDate( this.datetime() );
            },

            key: function() {
            	return this.time() + '';
            },

            time: function() {
                return this.date().getTime();
            },

            timeKey: function( startTime ) {
                var diffTime = this.time() - startTime;
                var timeIndex = Math.round(diffTime*0.001/60);

                if ( timeIndex % 2 == 1 ) {
                    timeIndex = timeIndex - 1;
                }

                return timeIndex + '';
            },

            value: function() {
            	var value = parseInt( this.get("value") );
            	return ( isNaN(value) ) ? 0 : value;
            },

            sampleData: function() {
            	var itemData = this.data();
            	itemData["value"] = this.value(); 

            	return itemData;
            },
        };
    },
    staticConstructor: function() {
    	return {

    		all: function( callback ) {
    			var items = this.selectItems( "1", "datetime", "DESC" );
    			this.each( items, typeof callback === 'function' ? callback : function() { debug.log( this.data() ); } );
    			return items;
    		},

    		list: function( date, callback ) {
    			var items = this.selectItems( "datetime >= '" + date + " 00:00' AND datetime <= '" + date + " 24:00'", "datetime", "ASC" );
    			this.each( items, typeof callback === 'function' ? callback : function() { debug.log( this.data() ); } );
    			return items;
    		},

			seek: function( type, start, end, callback ) {
				var items = this.selectItems( "type = '" + type + "' AND datetime >= '" + start + "' AND datetime <= '" + end + "'", "datetime", "ASC" );
    			this.each( items, typeof callback === 'function' ? callback : function() { debug.log( this.data() ); } );
    			return items;
			},

			tableName: function() {
				return "Sample";
			},

			createInstance: function( data ) {
				return new SampleDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"datetime": "@string",
					"type": "string",
                    "device": "string",
					"active": "string",
					"synced": "boolean",
					"value": "integer"
				};
			}
    	}
    }
}),

FitConfig = Class({
    name: "FitConfig",
    parent: "IObject",
    constructor: {},
    staticConstructor: function() {

        return {
            sleepBadWakeCount: function() {
                return 3;
            },

            sleepSosoWakeCount: function() {
                return 1;
            },
            
            sleepBadTimeRate: function() {
                return 0.2;
            },

            sleepSosoTimeRate: function() {
                return 0.06;
            },

            sleepBadValue: function() {
                return 11; // >= 40
            },

            sleepSosoValue: function() {
                return 2; // >= 5
            },

            rebonMaxCount: function() {
            	return 7;
            },

            syncCount: function() {
            	return 30 * 24;
            }
        }
    }
}),

SampleGroupDAO = Class({
    name: "SampleGroupDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {
        	dateKey: function() {
        		return this.get("sync_date");
        	},

	        isToday: function() {
	            return this.dateKey() == DataHelper.dateFormat("YYYY-MM-DD", new Date() );
	        },

	        isYesterday: function() {
	        	return this.dateKey() == DataHelper.dateFormat("YYYY-MM-DD", "-1D" );
	        },

	        isBeforeYesterday: function() {
	        	return this.dateKey() == DataHelper.dateFormat("YYYY-MM-DD", "-2D" );
	        },

        	prevDateKey: function() {
        		var date = this.date();
        		return DataHelper.dateFormat("YYYY-MM-DD", new Date( date.getFullYear(), date.getMonth(), date.getDate() - 1 ));
        	},

        	nextDateKey: function() {
        		var date = this.date();
        		return DataHelper.dateFormat("YYYY-MM-DD", new Date( date.getFullYear(), date.getMonth(), date.getDate() + 1 ));
        	},

        	date: function() {
        		return DataHelper.convertDate( this.dateKey() );
        	},

            isSynced: function() {
            	return this.get("synced");
            },

            step: function() {
            	return this.value();
            },

            elapsedSyncTime: function() {
            	var syncedTimeString = this.syncedTime();
            	var now = new Date();
                var syncedTime = DataHelper.convertDate( syncedTimeString ? syncedTimeString : "TODAY" );
                
                debug.log('elapsedSyncTime SyncedTimeString', syncedTimeString);
                debug.log('elapsedSyncTime SyncedTime', syncedTime)
                var diff = (now.getTime() - syncedTime.getTime());
                
                debug.log('elapsedSyncTime DIFF', diff);
                debug.log('elapsedSyncTime DIFF * 0.001', diff * 0.001);
                return diff * 0.001;
            },

            average: function() {
            	var value = this.value();
            	var count = this.count();
            	
            	if ( value <= 0 || count <= 0 ) {
            		return 0;
            	}

            	return parseFloat((value / count).toFixed(5));
            }, 

            sampleCount: function() {
	            var sampleCount = SampleDAO.selectCount( "datetime >= '" + this.dateKey() + " 00:00' AND datetime <= '" + this.dateKey() + " 24:00'" );

	            return sampleCount;
            },

            sleepAverage: function() {
            	var value = this.sleepValue();
            	var count = this.sleepCount();
            	
            	if ( value <= 0 || count <= 0 ) {
            		return 0;
            	}

            	return parseFloat((value / count).toFixed(5));
            },

            sleepStatus: function() {
            	var badCount = this.badCount();

                var badTime = this.badCount() * 2;
                var sosoTime = this.sosoCount() * 2;
                var goodTime = this.goodCount() * 2;
                var sleepTime = goodTime + sosoTime;
                var totalTime = goodTime + sosoTime + badTime;

                debug.log( "sleepStatus", this.data() );
                
                if ( badCount >= FitConfig.sleepBadWakeCount() || ((totalTime - goodTime) / totalTime) >= FitConfig.sleepBadTimeRate() ) {
                    return "bad";
                }
                else if ( badCount >= FitConfig.sleepSosoWakeCount() || ((totalTime - goodTime) / totalTime) >= FitConfig.sleepSosoTimeRate() ) {
                    return "soso";
                }

                return "good";
            },

        	deepCount: function() {
        		var sleepCount = this.sleepCount();
        		var sosoCount = this.sosoCount();
        		var badCount = this.badCount();

        		return sleepCount - (sosoCount + badCount);
        	},

            deepSleepRate: function() {
            	var goodCount = this.goodCount();
            	var totalCount = this.sleepCount();

            	return ( goodCount == 0 || totalCount == 0 ) ? 0 : ( (totalCount - goodCount) / totalCount);
            },

        	sleepData: function() {
        		var targetDate = DataHelper.convertDate( this.nextDateKey() );
        		var sleepStart = this.sleepStart();
                var sleepEnd = this.sleepEnd();
                var offset = (sleepStart.split(":")[0] >= "12" ) ? -1 : 0;
                var start = DataHelper.dateFormat("YYYY-MM-DD", new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()+offset)) + " " + sleepStart;
                var end = DataHelper.dateFormat("YYYY-MM-DD", new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())) + " " + sleepEnd;

                var startDateTime = DataHelper.convertDate( start );
                var endDateTime = DataHelper.convertDate( end );
                var total = (endDateTime.getTime() - startDateTime.getTime())*0.001;

                return {
                    start: start,
                    end: end,
                    sleepStart: sleepStart,
                    sleepEnd: sleepEnd,
                    offset: offset,
                    startDate: DataHelper.convertDate( start ),
                    endDate: DataHelper.convertDate( end ),
                    total: total <= 0 ? 0 : parseFloat(total / 120)
                };
        	},

            sleepStart: function( meridian ) {
            	return DeviceInfo.sharedInfo().sleepStart( meridian );

                var sleepStart = this.get("sleep_start");

                if ( meridian === "AM/PM" ) {
                    if ( ! sleepStart || sleepStart.indexOf(":") === -1 ) {
                        return "PM 11:00";
                    }

                    var timeComponents = sleepStart.split(":");
                    var hour = parseInt(timeComponents[0]);
                    var minute = parseInt(timeComponents[1]);

                    if ( hour <= 12 ) {
                        return "AM " + DataHelper.str2num(hour) + ":" + DataHelper.str2num(minute);
                    }
                    
                    return "PM " + DataHelper.str2num(( hour > 12 ) ? hour - 12 : hour) + ":" + DataHelper.str2num(minute);
                }

                if ( ! sleepStart ) {
                    return DeviceInfo.sharedInfo().sleepStart();
                }
                
                return sleepStart;
            },

            sleepEnd: function( meridian ) {
            	return DeviceInfo.sharedInfo().sleepEnd( meridian );

                var sleepEnd = this.get("sleep_end");

                if ( meridian === "AM/PM" ) {
                    if ( ! sleepEnd || sleepEnd.indexOf(":") === -1 ) {
                        return "AM 07:00";
                    }

                    var timeComponents = sleepEnd.split(":");
                    var hour = parseInt(timeComponents[0]);
                    var minute = parseInt(timeComponents[1]);

                    if ( hour <= 12 ) {
                        return "AM " + DataHelper.str2num(hour) + ":" + DataHelper.str2num(minute);
                    }
                    
                    return "PM" + DataHelper.str2num(( hour > 12 ) ? hour - 12 : hour) + ":" + DataHelper.str2num(minute);
                }

                return ( sleepEnd ) ? sleepEnd : DeviceInfo.sharedInfo().sleepEnd();
            },

            sleepSamples: function( callback ) {
            	var sleepData = this.sleepData();

            	debug.log( "sleepData", sleepData );

            	var items = SampleDAO.seek( "SLEEP", sleepData.start, sleepData.end, callback );
                return items;
            },

            sleepSampleCount: function() {
            	var sleepData = this.sleepData();
            	var sleepSampleCount = SampleDAO.selectCount(  "type = 'SLEEP' AND datetime >= '" + sleepData.start + "' AND datetime <= '" + sleepData.end + "'" );

	            return sleepSampleCount;
            },

            sleepNeedCount: function() {
            	var sleepData = this.sleepData();
            	return Math.floor( sleepData.total );
            },

            isSyncedSleepSamples: function() {
            	var sleepSampleCount = this.sleepSampleCount();
            	var needCount = this.sleepNeedCount();

            	if ( sleepSampleCount == needCount && this.sleepCount() == sleepSampleCount ) {
            		return true;
            	}

            	return false;
            }
        };
    },
    staticConstructor: function() {
    	return {

    		list: function( callback ) {
    			var items = this.select( "1", "sync_date", "DESC" );
    			this.each( items, callback );
    			return items;
    		},

    		item: function( dateKey ) {
    			var items = this.select( "sync_date = '" + dateKey + "'", "sync_date", "DESC", 0, 1 );
    			if ( items.length > 0 ) {
    				return items[0];
    			}

    			return null;
    		},

			tableName: function() {
				return "SampleGroup";
			},

			createInstance: function( data ) {
				return new SampleGroupDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"sync_date": "@string",
					"device_type": "string",
					"synced": "boolean",
					"synced_time": "string",

                    "sleep_start": "string",
                    "sleep_end": "string",
                    "goal_step": "integer",
					
					// 동기화로 저장되는 값
					"count": "integer",
					"value": "integer",
					"am_soso_count": "integer",
		            "am_soso_value": "integer",
		            "am_bad_count": "integer",
		            "am_bad_value": "integer",
		            "am_sleep_count": "integer",
		            "am_sleep_value": "integer",
		            "pm_soso_count": "integer",
		            "pm_soso_value": "integer",
		            "pm_bad_count": "integer",
		            "pm_bad_value": "integer",
		            "pm_sleep_count": "integer",
		            "pm_sleep_value": "integer",

		            // 정리된 Sleep 합계데이타
					"sleep_value": "integer",
					"sleep_count": "integer",
					"soso_count": "integer",
                    "soso_value": "integer",
                    "bad_count": "integer",
                    "bad_value": "integer",
                    "good_count": "integer",
                    "good_value": "integer"
				};
			}
    	}
    }
}),

SampleDashboardDAO = Class({
    name: "SampleDashboardDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {
        	dateKey: function() {
        		var dateString = this.get("sync_date");

            	return dateString ? dateString.substr(0,10) : "";
            },

        	prevDateKey: function() {
        		var date = this.date();
        		return DataHelper.dateFormat("YYYY-MM-DD", new Date( date.getFullYear(), date.getMonth(), date.getDate() - 1 ));
        	},

        	nextDateKey: function() {
        		var date = this.date();
        		return DataHelper.dateFormat("YYYY-MM-DD", new Date( date.getFullYear(), date.getMonth(), date.getDate() + 1 ));
        	},

        	date: function() {
        		return DataHelper.convertDate( this.dateKey() );
        	},

            step: function() {
                return this.value();
            },

            sleepStatus: function() {
            	var badCount = this.badCount();
                var badTime = this.badCount() * 2;
                var sosoTime = this.sosoCount() * 2;
                var goodTime = this.goodCount() * 2;
                var sleepTime = goodTime + sosoTime;
                var totalTime = goodTime + sosoTime + badTime;
                
                if ( badCount >= FitConfig.sleepBadWakeCount() || ((totalTime - goodTime) / totalTime) >= FitConfig.sleepBadTimeRate() ) {
                    return "bad";
                }
                else if ( badCount >= FitConfig.sleepSosoWakeCount() || ((totalTime - goodTime) / totalTime) >= FitConfig.sleepSosoTimeRate() ) {
                    return "soso";
                }

                return "good";
            },

            deepSleepRate: function() {
            	if ( this.type() === "SLEEP" ) {
	            	var goodCount = this.goodCount();
	            	var totalCount = this.count();

	            	return ( goodCount == 0 || totalCount == 0 ) ? 0 : ( goodCount / totalCount);
	            }

	            return 0;
            }
        };
    },
    staticConstructor: function() {
    	var _loaded = false;

    	return {

    		loadData: function( data ) {
    			debug.warn( "SampleDashboardDAO - loadData", data );

    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return [];
    			} 

    			var self = this;
    			var items = [];
                for ( var i=0; i<data.length; i++ ) {
                    var itemData = data[i];
                    
                    itemData["code"] = itemData["sync_date"] + itemData["type"];
                    itemData["average"] = parseFloat( itemData["avg"] );
                    itemData["goal_step"] = itemData["goal_val"] || FitInfo.sharedInfo().goalStep();
                    itemData["sleep_start"] = itemData["sleep_start"] || DeviceInfo.sharedInfo().sleepStart();
                    itemData["sleep_end"] = itemData["sleep_end"] || DeviceInfo.sharedInfo().sleepEnd();

                    itemData["good_count"] = itemData["good_count"] || 0;
                    itemData["good_value"] = itemData["good_value"] || 0;
                    itemData["soso_count"] = itemData["soso_count"] || 0;
                    itemData["soso_value"] = itemData["soso_value"] || 0;
                    itemData["bad_count"] = itemData["bad_count"] || 0;
                    itemData["bad_value"] = itemData["bad_value"] || 0;
                    
                    itemData["average"] = (function( value ) {  var numValue = parseFloat(value); return isNaN(numValue) ? 0 : numValue; })(itemData["sync_step_average"]);
                    itemData["count"] = itemData["sync_step_average"] || 0;

                    var item = self.insert(itemData);

                    items.push( item );
                }

                _loaded = true;

                return items;
    		},

    		isLoaded: function() {
    			return _loaded;
    		},

    		list: function( type, callback ) {
    			var items = this.select( "type = '" + type + "'", "sync_date", "DESC" );
    			this.each( items, callback );
    			return items;
    		},

			tableName: function() {
				return "SampleDashboard";
			},

			createInstance: function( data ) {
				return new SampleDashboardDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"code": "@string",
                    "type": "string",
                    "sync_date": "string",
                    "sleep_start": "string",
                    "sleep_end": "string",
                    "goal_step": "integer",
                    "good_count": "integer",
                    "good_value": "integer",
                    "bad_count": "integer",
                    "bad_value": "integer",
                    "soso_count": "integer",
                    "soso_value": "integer",
                    "average": "float",
                    "count": "integer",
                    "value": "integer"
				};
			}
    	}
    }
}),

CompositDAO = Class({
    name: "CompositDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {
        	dateKey: function() {
            	return this.get("datetime").substr(0,10);
            }
        };
    },
    staticConstructor: function() {
    	return {

    		loadData: function( data ) {
    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return [];
    			} 

    			var self = this;
    			var items = [];
                for ( var i=0; i<data.length; i++ ) {
                    var itemData = data[i];
                    itemData["code"] = itemData["datetime"];

                    var item = self.insert(itemData);
                    items.push( item );
                }
                return items;
    		},

    		list: function( callback ) {
    			var items = this.select( "1", "datetime", "desc");
    			this.each( items, callback );
    			return items;
    		},

			tableName: function() {
				return "Composit";
			},

			createInstance: function( data ) {
				return new CompositDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"code": "@string",
                    "datetime": "string",
					"basal_metabolism": "integer",
                    "bmi": "float",
                    "fat_amount": "float",
                    "fat_rate": "float",
                    "height": "float",
                    "weight": "float",
                    "muscle": "float"
				};
			}
    	}
    }
}),

MeasureDAO = Class({
    name: "MeasureDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {
        	dateKey: function() {
            	return this.get("datetime").substr(0,10);
            }
        };
    },
    staticConstructor: function() {
    	return {

    		loadData: function( data ) {
    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return [];
    			} 

    			var self = this;
    			var items = [];
                for ( var i=0; i<data.length; i++ ) {
                    var itemData = data[i];
                    itemData["code"] = itemData["datetime"] + itemData["type"] + itemData["measure"];
                    itemData["average"] = parseFloat( itemData["avg"] );

                    var item = self.insert(itemData);
                    items.push( item );
                }
                return items;
    		},

    		list: function( callback ) {
    			var items = this.select( "1", "datetime", "desc");
    			this.each( items, callback );
    			return items;
    		},

			tableName: function() {
				return "Measure";
			},

			createInstance: function( data ) {
				return new MeasureDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"code": "@string",
                    "datetime": "string",
					"type": "string",
                    "measure": "string",
                    "value": "integer"
				};
			}
    	}
    }
}),

DeviceInfo = Class({
	name: "DeviceInfo",
	parent: DataModel,
	constructor: function() {

		return {
			init: function( ) {
				var scheme = {
					"sleep_start": "string",
					"sleep_end": "string",
                    "paired_band_uuid": "string",
                    "paired_band_name": "string",
                    "device_type": "string",
                    "skip_band": "string",
                    "paired_band_devicename": "string",
                    "paired_band_version" : "string"
				};

				var options = { useStorage:true };

				this._super("init", ["DeviceInfo", scheme, options]);

				this.createMethods();
				
				if ( ! this.deviceType() ) {
					if ( this.hasPairedBand() ) {
						this.set("device_type", "B");
					}
					else {
						this.set("device_type", "D");	
					}
				}
			},

			mapData: function() {
				return {
					"sleep_start": ["sleep_start"],
					"sleep_end": ["sleep_end"],
					"paired_band_uuid": ["paired_band_uuid", "uuid"],
					"paired_band_name": ["paired_band_name", "name"],
                    "device_type": "string",
					"skip_band": ["skip_band"],
					"paired_band_devicename": ["paired_band_devicename"],
					"paired_band_version": ["paired_band_version"]
				};
			},
            bandDeviceName: function(){
            	  return this.get("paired_band_devicename");
            },
            
            bandUUID: function() {
                return this.get("paired_band_uuid");
            },
            
            bandVersion: function() {
                return this.get("paired_band_version");
            },
			hasPairedBand: function() {
                // 다른 페이지에서 동기화가 되는 경우 때문에 항상 restore 함

                if ( !(this.bandUUID() == null || this.bandUUID() == "") ) {
					return true;
				}

				return false;
			},

            sleepStart: function( meridian ) {
                var sleepStart = this.get("sleep_start");

                if ( meridian === "AM/PM" ) {
                    if ( ! sleepStart || sleepStart.indexOf(":") === -1 ) {
                        return "PM 11:00";
                    }

                    var timeComponents = sleepStart.split(":");
                    var hour = parseInt(timeComponents[0]);
                    var minute = parseInt(timeComponents[1]);

                    if ( hour <= 12 ) {
                        return "AM " + DataHelper.str2num(hour) + ":" + DataHelper.str2num(minute);
                    }
                    
                    return "PM " + DataHelper.str2num(( hour > 12 ) ? hour - 12 : hour) + ":" + DataHelper.str2num(minute);
                }

                if ( ! sleepStart ) {
                    return "23:00";
                }
                
                return sleepStart;
            },

            sleepEnd: function( meridian ) {
                var sleepEnd = this.get("sleep_end");

                if ( meridian === "AM/PM" ) {
                    if ( ! sleepEnd || sleepEnd.indexOf(":") === -1 ) {
                        return "AM 07:00";
                    }

                    var timeComponents = sleepEnd.split(":");
                    var hour = parseInt(timeComponents[0]);
                    var minute = parseInt(timeComponents[1]);

                    if ( hour <= 12 ) {
                        return "AM " + DataHelper.str2num(hour) + ":" + DataHelper.str2num(minute);
                    }
                    
                    return "PM" + DataHelper.str2num(( hour > 12 ) ? hour - 12 : hour) + ":" + DataHelper.str2num(minute);
                }

                return ( sleepEnd ) ? sleepEnd : "07:00";
            },

            sleepData: function( targetDate ) {

                var sleepStart = this.sleepStart();
                var sleepEnd = this.sleepEnd();
                var offset = (sleepStart.split(":")[0] >= "12" ) ? -1 : 0;
                var start = DataHelper.dateFormat("YYYY-MM-DD", new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()+offset)) + " " + sleepStart;
                var end = DataHelper.dateFormat("YYYY-MM-DD", new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())) + " " + sleepEnd;

                return {
                    start: start,
                    end: end,
                    sleepStart: sleepStart,
                    sleepEnd: sleepEnd,
                    offset: offset,
                    startDate: DataHelper.convertDate( start ),
                    endDate: DataHelper.convertDate( end )   
                };
            },

			sleepTime: function( type ) {
				var sleepData = this.sleepData( new Date() );

				var diffTime = sleepData.endDate.getTime() - sleepData.startDate.getTime();
				var sleepTime = diffTime <= 0 ? 0 : diffTime * 0.001 / 60;

				var sleepHour = Math.floor(sleepTime / 60);
				var sleepMinute = sleepTime % 60;

				if ( typeof type == "string" ) {
					if ( type.toUpperCase() == "HOUR" ) {
						return sleepHour == 24 && sleepMinute == 0 ? 0 : sleepHour;
					}
					else if ( type.toUpperCase() == "MINUTE" ) {
						return sleepMinute;
					}
				}

				return [((sleepHour+"").length == 1 ? "0" : "" ) + sleepHour, ((sleepMinute+"").length == 1 ? "0" : "" ) + sleepMinute].join(":");
			},
            
            pair: function( result ) {
                this.data( result );
            },
            
            unpair: function() {
                this.truncate();
            },
		};
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInfo: function() {
				if ( _instance === undefined ) {
					_instance = new DeviceInfo();
				}
				return _instance;
			}
		}
	}
}),

UserInfo = Class({
	name: "UserInfo",
	parent: DataModel,
	constructor: function() {

		return {
			init: function( ) {
				var scheme = {
                    "login_time": "number",
                    "auth_token": "string",
                    "user_key": "string",
					"user_id": "string",
					"user_email": "string",
					"user_name": "string",
					"user_phone": "string",
					"user_date_created": "string"
				};

				var options = {
					useStorage:true
				};

				this._super("init", ["UserInfo", scheme, options]);

				this.createMethods();
			},

			mapData: function() {
				return {
					"login_time": ["login_time"],
					"auth_token": ["auth_token"],
                    "user_key": ["user_key"],
                    "user_id": ["user_id"],
					"user_email": ["user_email"],
                    "user_name": ["user_name"],
                    "user_phone": ["user_phone"],
                    "user_date_created": ["user_date_created"]
				};
			},

			isLogin: function() {
				var currentTime = +new Date;

				if ( !! this.authToken() ) {
					return true;
				}

				return false;
			},

			isRebonUser: function() {
				var userKey = this.userKey();
				
                if ( userKey && userKey.indexOf("R") !== -1 ) { // Posco Apartment - Ribon
					return true;
				}
                
                if ( userKey && userKey.indexOf("B") !== -1 ) { // BRC - HealWay
					return true;
				}
                
				return false;
			},

			elapsedTime: function() {
				var loginTime = parseInt(this.loginTime());

				if ( isNaN(loginTime) ) {
					return 9007199254740991;
				}

				return +new Date - loginTime;
			},

			auth: function( data ) {
				data = data || {};
				data.login_time = +new Date;

                if ( data.user_name === null ) {
                    data.user_name = "";
                } 

				this.data( data );

				if ( this.isLogin() ) {
					return true;
				}

				return false;
			},

			logout: function() {
				this.truncate();
			}
		};
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInfo: function() {
				if ( _instance === undefined ) {
					_instance = new UserInfo();
				}
				return _instance;
			}
		}
	}
}),

ProfileInfo = Class({
    name: "ProfileInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( ) {
                var scheme = {
                    "body_height": "string",
                    "body_weight": "string",
                    "user_birth": "string",
                    "user_profile_url": "string",
                    "gender": "string",
                    "user_phone": "string"
                };

                var options = {
                    useStorage:true
                };

                this._super("init", ["ProfileInfo", scheme, options]);

                this.createMethods();
            },

            mapData: function() {
                return {
                    "body_height": ["body_height"],
                    "body_weight": ["body_weight"],
                    "user_birth": ["user_birth"],
                    "user_profile_url": ["user_profile_url"],
                    "gender": ["gender", "user_gender"],
                    "user_phone": ["user_phone"]
                };
            },

            age: function() {
            	var birthDateComponents = this.userBirth().split("-");
				var year = parseInt( birthDateComponents[0] );
				var thisYear = ( new Date() ).getFullYear();

				if ( isNaN( year ) ) {
					return 0;
				}

				return thisYear - year;
            },

            bodyHeight: function( userUnit ) {
            	userUnit = userUnit || "CM";

            	var userData = this.get("body_height");
				var value = parseInt( userData );
            	var valueUnit = userData ? (userData+'').replace(/[0-9]/g, '').toUpperCase() : "CM";

            	if ( isNaN(value) ) {
            		value = 0;
            	}
            	
            	if ( valueUnit.toUpperCase() == userUnit.toUpperCase() ) {
            		return value;
            	}

            	return value;
            },

            bodyWeight: function( userUnit ) {
            	userUnit = userUnit || "KG";

            	var userData = this.get("body_weight") + '';
				var value = parseInt( userData );
            	var valueUnit = userData ? (userData+'').replace(/[0-9]/g, '').toUpperCase() : "KG";

            	if ( isNaN(value) ) {
            		value = 0;
            	}
            	
            	if ( valueUnit.toUpperCase() == userUnit.toUpperCase() ) {
            		return value;
            	}

            	return value;
            }
        };
    },
    staticConstructor: function() {
        var _instance;

        return {
            sharedInfo: function() {
                if ( _instance === undefined ) {
                    _instance = new ProfileInfo();
                }
                return _instance;
            }
        }
    }
}),

FitInfo = Class({
    name: "FitInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( ) {
                var scheme = {
                	"current_calorie": "number",
                	"current_distance": "number",
                    "current_step": "number",
                    "total_step": "number",
                    "total_sleep": "number",
                    "goal_weight": "string",
                    "goal_step": "number",
                    "synced_date": "string",
                    "synced_time": "string",
                    "device_history_key" : "string"
                };

                var options = {
                    useStorage:true
                };

                this._super("init", ["FitInfo", scheme, options]);

                this.createMethods();
            },

            mapData: function() {
                return {
                	"current_calorie": ["current_calorie"],
                	"current_distance": ["current_distance"],
                    "current_step": ["current_step"],
                    "total_step": ["total_step", "total_steps"],
                    "total_sleep": ["total_sleep", "total_sleeps"],
                    "goal_weight": ["goal_weight", "goal_body_weight"],
                    "goal_step": ["goal_step", "goal_fit_step"],
                    "synced_date": ["synced_date"],
                    "synced_time": ["synced_time"],
                    "device_history_key" : ["device_history_key"]
                };
            },
            
            getDeviceHistoryKey : function(){
            	return this.get("device_history_key");
            },
            
            setDeviceHistoryKey : function(format){
            	this.set("device_history_key", format);
            },
            
            today: function() {
            	return DataHelper.dateFormat( "YYYYMMDD", new Date() );
            },

            isSynced: function() {
            	if ( this.get("synced_date") != this.today() ) {
            		return false;
            	}

            	if ( ! this.get("synced_time") ) {
            		return false;
            	}

            	var syncedTimeString = this.syncedTime();
            	var now = new Date();
                var syncedTime = DataHelper.convertDate( syncedTimeString ? syncedTimeString : "TODAY" );
                var diff = (now.getTime() - syncedTime.getTime());

                if ( diff * 0.001 > 60*60 ) {
                	return false;
                }

                return true;
            },

            synced: function() {
            	var syncedTime = DataHelper.dateFormat("YYYY-MM-DDThh:mm", new Date());

            	this.set("synced_date", this.today() );
            	this.set("synced_time", syncedTime );
            },

            unsynced: function() {
            	this.set("synced_date", "" );
            	this.set("synced_time", "" );
            },

            currentCalorie: function( format ) {
            	var value = this.get("current_calorie");
            	return isNaN( parseInt(value) ) ? 0 : parseInt( value );
            },

            currentDistance: function( format ) {
            	var value = this.get("current_distance");
            	return isNaN( parseInt(value) ) ? 0 : parseInt( value );
            },

            currentStep: function( format ) {
            	var value = this.get("current_step");
            	return isNaN( parseInt(value) ) ? 0 : parseInt( value );
            },

            goalWeight: function( userUnit ) {
            	userUnit = userUnit || "KG";

            	var userData = this.get("goal_weight") + '';
				var value = parseInt( userData );
            	var valueUnit = userData ? (userData+'').replace(/[0-9]/g, '').toUpperCase() : "KG";

            	if ( isNaN(value) ) {
            		value = 0;
            	}
            	
            	if ( valueUnit.toUpperCase() == userUnit.toUpperCase() ) {
            		return value;
            	}

            	return value;
            },

            goalStep: function( format ) {
            	var value = this.get("goal_step");
            	return isNaN( parseInt(value) ) ? 10000 : parseInt( value );
            }
        };
    },
    staticConstructor: function() {
        var _instance;

        return {
            sharedInfo: function() {
                if ( _instance === undefined ) {
                    _instance = new FitInfo();
                }
                return _instance;
            }
        }
    }
});

DeivceSettingInfo = Class({
    name: "DeivceSettingInfo",
    parent: DataModel,
    constructor: function() {
	  return {
          init: function( ) {
              var scheme = {
              	"direction": "number",
              	"dateDisplay": "number",
                  "uiType": "number",
                  "screenChange": "number",
                  "notmove": "number",
                  "interrupt": "number"
              };

              var options = {
                  useStorage:true
              };

              this._super("init", ["DeivceSettingInfo", scheme, options]);

              this.createMethods();
          },

          mapData: function() {
              return {
              	"direction": ["direction"],
              	"dateDisplay": ["dateDisplay"],
                  "uiType": ["uiTypep"],
                  "screenChange": ["screenChange"],
                  "notmove": ["notmove"],
                  "interrupt": ["interrupt"]
              };
          },
            info: function() {
                return DeivceSettingInfo.sharedInfo();
            },
            setDirection: function(direction) {
            	this.set("direction", direction );
            },
            getDirection: function() {
                return this.get("direction");
            },
            setDateDisPlay: function(dateDisplay){
            	this.set("dateDisplay", dateDisplay );
            },
            getDateDisPlay: function(){
            	 return this.get("dateDisplay");
            },
            setUiType: function(uiType){
            	this.set("uiType", uiType );
            },
            getUiType: function(){
            	 return this.get("uiType");
            },
            setScreenChange: function(screenChange){
            	this.set("screenChange", screenChange );
            },
            getScreenChange: function(){
            	return this.get("screenChange" );
            },
            setNotmove: function(notmove){
            	this.set("notmove", notmove );
            },
            getNotmove: function(){
            	return this.get("notmove");
            },
            setInterrupt: function(interrupt){
            	this.set("interrupt", interrupt );
            },
            getInterrupt: function(){
            	return this.get("interrupt");
            }
        };

       
  },
    staticConstructor: function() {
        var _instance;

        return {
            sharedInfo: function() {
                if ( _instance === undefined ) {
                    _instance = new DeivceSettingInfo();
                }
                return _instance;
            }
        }
    }
}),

DeivceAlarmInfo = Class({
    name: "DeivceAlarmInfo",
    parent: DataModel,
    constructor: function() {
	  return {
          init: function( ) {
              var scheme = {
              	"listData": "string"
              };
              
              var options = {
                      useStorage:true
                  };
              
              this._super("init", ["DeivceAlarmInfo", scheme, options]);

              this.createMethods();
              
          },

          mapData: function() {
              return {
              	"listData": ["listData"]
              };
          },
          info: function() {
              return DeivceAlarmInfo.sharedInfo();
          },
          setListData: function(listData){
          	this.set("listData", listData );
          },
          getListData: function(){
          	return this.get("listData");
          },
          
        };
  },  staticConstructor: function() {
      var _instance;

      return {
          sharedInfo: function() {
              if ( _instance === undefined ) {
                  _instance = new DeivceAlarmInfo();
              }
              return _instance;
          }
      }
  }

}),

DeviceDisturbInfo = Class({
    name: "DeviceDisturbInfo",
    parent: DataModel,
    constructor: function() {
	  return {
          init: function( ) {
              var scheme = {
              	"listData": "string"
              };
              
              var options = {
                      useStorage:true
                  };
              
              this._super("init", ["DeviceDisturbInfo", scheme, options]);

              this.createMethods();
              
          },

          mapData: function() {
              return {
              	"listData": ["listData"]
              };
          },
          info: function() {
              return DeivceAlarmInfo.sharedInfo();
          },
          setListData: function(listData){
          	this.set("listData", listData );
          },
          getListData: function(){
          	return this.get("listData");
          },
          
        };
  },  staticConstructor: function() {
      var _instance;

      return {
          sharedInfo: function() {
              if ( _instance === undefined ) {
                  _instance = new DeviceDisturbInfo();
              }
              return _instance;
          }
      }
  }

}),
window.DataHelper = DataHelper;
	
})(window);