
(function(window, undefined) {

'use strict';

var 
Class = UI.Class,

DataHelper = {
    convertDate: function( dateString ) {
        dateString = dateString.replace(" ", "T");

        if ( dateString.indexOf("T") !== -1 ) {
            var utc = new Date( dateString );
            return new Date((utc.getTime() + utc.getTimezoneOffset()*60000));   
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
			},

			get: function( key ) {
				if ( _restored == false ) {
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

			data: function( data ) {
				this.restoreData( true );

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
							console.error( "key (" + key + ") of data is not valid type", typeof data[key], data );
						}
					}
				}

				this.saveData();
			},

			clear: function() {
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
			}
		};
	}
}),

DatabaseConfig = Class({
	name: "DatabaseConfig",
	parent: "IObject",
	constructor: {},
	staticConstructor: function() {

		return {
			databaseName: function() {
				return "bang" + "." + this.userKey() + "." + this.monthKey();
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

			data: function( data ) {
				if ( arguments.length === 0 ) {
					return _data;
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
						_data[key] = data[key];
					}
					else {
						if ( data[key] !== undefined ) {
							console.error( "key (" + key + ") of data is not valid type", typeof data[key], validType, data );
						}
					}
				}
			},

			remove: function() {
				this.prototype.__class.remove( this.seq() );
			}
		};
	},
	staticConstructor: function() {
		var 
		self,
		queryQueue = [],
		queryTimer = null,
		constructor = {
			init: function() {
				self = this;

				return self;
			},

			databaseName: function() {
				return DatabaseConfig.databaseName();
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

			createDatabase: function() {
				return M.db.create( this.databaseName() );
			},

			openDatabase: function() {
				return M.db.open( this.databaseName() );
			},

			closeDatabase: function() {
				return M.db.close( this.databaseName() );	
			},

			executeQueries: function() {
				var queries = queryQueue.join(";");
				queryQueue = [];

				var result = M.db.execute({
					path: this.databaseName(),
					query: queries,
					async: true,
					multiple: true
				});
			},

			execute: function( query, async ) {
				var self = this;
				if ( async == true ) {
					queryQueue.push( query );

					if ( queryTimer != null ) {
						clearTimeout( queryTimer );
						queryTimer = null;
					}

					if ( queryQueue == 180 ) {
						this.executeQueries();
					}
					else {
						queryTimer = setTimeout( function() {
							self.executeQueries();
						}, 500);
					}

					return {status:"SUCCESS"};
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
							callback.call( self, i, item );
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

				var query = "DROP TABLE IF EXISTS " + this.tableName() + ";";
				var result = this.execute( query );

				console.log( this.prototype.__name, "drop", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return result.status === "SUCCESS" ? true : false;
			},

			create: function( callback ) {
				this.createDatabase();

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

				console.log( this.prototype.__name, "create", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return result.status === "SUCCESS" ? true : false;
			},

			insertItem: function( item, sync ) {

				return this.insert( null, item.data(), sync );
			},

			insert: function( callback, data, sync ) {

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

				var result = this.execute( query, sync );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				if ( result.status === "SUCCESS" ) {
					return new this( data, this.scheme() );
				}

				return null;
			},

			updateItem: function( item, sync ) {

				return this.update( null, item.data(), sync );
			},

			update: function( callback, data, sync ) {

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
				
				var result = this.execute( query, sync );

				//console.log( this, "update", result );

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

				var count = 0;
				if ( result.rows.length > 0 ) {
					count = result.rows[0].count ;
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
				
				var result = this.execute( query );

				console.log( this.prototype.__name, "select", result );

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

				console.log( this.__name, "remove", result );

				if ( typeof callback === "function" ) {
					callback.call( this, result );
				}

				return ( result.status === "SUCCESS" ) ? true : false;
			},

			removeAll: function( callback ) {

				var query = "DELETE FROM " + this.tableName() + ";";
				
				var result = this.execute( query );

				console.log( this.__name, "remove all", result );

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
            	return ( date.getHours() < 12 ) ? true : false;
            },

            sleepDateKey: function() {
            	var date = self.date();
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
                return DataHelper.convertDate( this.datetime() );
            },

            time: function() {
                return this.date().getTime();
            },

            timeKey: function( startTime ) {
                var diffTime = this.time() - startTime;

                return Math.round(diffTime*0.001/60) + '';
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
    			var items = this.select( "1", "datetime", "desc");
    			this.each( this.prototype.__name, "all - ", items, callback );
    			return items;
    		},

    		list: function( date, callback ) {
    			var recordCount = this.selectCount( "datetime >= '" + date + " 00:00' AND datetime <= '" + date + " 24:00'" );
    			var limitCount = 800;
    			var totalPage = recordCount > 0 ? Math.ceil(recordCount / limitCount) : 0;
    			var items = [];
    			
    			if ( ! isNaN(totalPage) && totalPage > 0 ) {
    				for ( var page=0; page<totalPage; page++ ) {
    					var resultItems = this.select( "datetime >= '" + date + " 00:00' AND datetime <= '" + date + " 24:00'", "datetime", "DESC", page * limitCount, limitCount );
    					items = items.concat( resultItems );
    				}
    			}

    			console.log( this.prototype.__name, "list - ", totalPage, recordCount, items.length );
    			
    			this.each( items, callback );
    			return items;
    		},

			seek: function( start, end, callback ) {
				var items = this.select( "datetime >= '" + start + "' AND datetime <= '" + end + "'", "datetime", "DESC");

				console.log( this.prototype.__name, "seek - ", start, end, items, items.length );

    			this.each( items, callback );
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
            sleepBadCount: function() {
                return 60;
            },

            sleepSosoCount: function() {
                return 20;
            },

            sleepBadValue: function() {
                return 11; // >= 40
            },

            sleepSosoValue: function() {
                return 2; // >= 5
            },

            rebonMaxCount: function() {
            	return 7;
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
        		return this.get("date");
        	},

	        isToday: function() {
	            return this.dateKey() == DataHelper.dateFormat("YYYY-MM-DD", new Date() );
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

            value: function() {
            	return this.steps();
            },
        };
    },
    staticConstructor: function() {
    	return {

    		list: function( callback ) {
    			var items = this.select( "1", "date", "desc");
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
					"date": "@string",
					"synced": "boolean",
					"am_soso_count": "integer",
                    "am_soso_sleeps": "integer",
                    "am_bad_count": "integer",
                    "am_bad_sleeps": "integer",
                    "pm_soso_count": "integer",
                    "pm_soso_sleeps": "integer",
                    "pm_bad_count": "integer",
                    "pm_bad_sleeps": "integer",
					"steps": "integer"
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

SampleGroupDAO = Class({
    name: "SampleGroupDAO",
    parent: DataAccessObject,
    constructor: function() {

        return {
        	dateKey: function() {
            	return this.get("datetime").substr(0,10);
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
                    itemData["code"] = itemData["datetime"] + itemData["type"];
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
				return "SampleGroup";
			},

			createInstance: function( data ) {
				return new SampleGroupDAO( data, this.scheme() );
			},

			scheme: function() {
				return {
					"code": "@string",
                    "type": "string",
                    "datetime": "string",
                    "am_soso_count": "integer",
                    "am_soso_value": "integer",
                    "am_bad_count": "integer",
                    "am_bad_value": "integer",
                    "pm_soso_count": "integer",
                    "pm_soso_value": "integer",
                    "pm_bad_count": "integer",
                    "pm_bad_value": "integer",
                    "am_count": "integer",
                    "pm_count": "integer",
                    "average": "float",
                    "count": "integer",
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
                    "paired_band_name": "string"
				};

				var options = { useStorage:true };

				this._super("init", ["DeviceInfo", scheme, options]);

				this.createMethods();
			},

			mapData: function() {
				return {
					"sleep_start": ["sleep_start"],
					"sleep_end": ["sleep_end"],
					"paired_band_uuid": ["paired_band_uuid", "uuid"],
					"paired_band_name": ["paired_band_name", "name"]
				};
			},
            
            bandUUID: function() {
                return this.get("paired_band_uuid");
            },
            
			hasPairedBand: function() {
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
                this.clear();
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
				if ( userKey && userKey.indexOf("R") !== -1 ) {
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
				this.clear();
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

CompositInfo = Class({
    name: "CompositInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( key ) {
                var scheme = {
                    "basal_metabolism": "number",
                    "bmi": "number",
                    "datetime": "string",
                    "fat_amount": "number",
                    "fat_rate": "number",
                    "height": "number",
                    "weight": "number",
                    "muscle": "number"
                };

                var options = {
                    useStorage:false
                };

                this._super("init", [null, scheme, options]);

                this.createMethods();
            },

            dateKey: function() {
            	return this.get("datetime").substr(0,10);
            },

            mapData: function() {
                return {
                    "basal_metabolism": ["basal_metabolism"],
                    "bmi": ["bmi"],
                    "datetime": ["datetime"],
                    "fat_amount": ["fat_amount"],
                    "fat_rate": ["fat_rate"],
                    "height": ["height"],
                    "weight": ["weight"],
                    "muscle": ["muscle"]
                };
            }
        };
    },
    staticConstructor: function() {
    	var _data = [];
    	var _items = [];
    	var _constructor = {

    		init: function() {
    			var data = M.data.global("CompositInfo-Data") || {};

    			setTimeout( function() {
			    	_constructor.data( data );
    			}, 0);

		    	return this;
    		},

			each: function( items, callback ) {

				var self = this;
				for ( var i=0; i<items.length; i++ ) {
					(function(i, item) {
						if ( callback ) {
							callback.call( self, i, item );
						}
					})(i, items[i]);
				}
			},

    		list: function( callback ) {
    			var items = this.items();
    			this.each( items, callback );
    			return items;
    		},

    		data: function( data ) {

    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return;
    			}

    			this.clear( true );

    			for ( var i=0; i<data.length; i++ ) {
    				var itemData = data[i];
    				var item = new CompositInfo( "Index" + i );
    				item.data( itemData );

    				_data.push( itemData );

    				this.addItem( item, true );
    			}

    			this.saveData();
    		},

    		dateKeys: function( capSize ) {
    			var temp, dateKeys = [];
    			for ( var i=0; i<_items.length; i++ ) {
    				var item = _items[i];
    				if ( dateKeys.contain( item.date() ) ) {
    					dateKeys.push( item.date() );
    				}
    			}

    			for ( var i=0; i<dateKeys.length; i++ ) {
    				for ( var j=i+1; j<dateKeys.length; j++ ) {
    					if ( dateKeys[i] > dateKeys[j] ) {
    						temp = dateKeys[i];
    						dateKeys[i] = dateKeys[j];
    						dateKeys[j] = temp;
    					}
    				}
    			}

    			if ( capSize === undefined ) {
    				return dataKeys;
    			}

    			if ( dateKeys.length <= capSize ) {
    				return dateKeys.slice(0, capSize);
    			}

    			return dateKeys.slice(dateKeys.length-capSize, dateKeys.length);
    		},

        	addItem: function( item, ignoreSave ) {
				_items.push( item );

				if ( !!ignoreSave ) {
					this.saveData();
				}
        	},

        	saveData: function() {
				M.data.global( "CompositInfo-Data", _data );
        	},

        	count: function() {
        		return _items.length;
        	},

            items: function() {
                return _items;
            },

            clear: function() {
            	_items = [];
            	M.data.removeGlobal("CompositInfo-Data");
            }
        };

    	return _constructor.init();
    }
}),

MeasureInfo = Class({
    name: "MeasureInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( key ) {
                var scheme = {
                    "type": "string",
                    "measure": "string",
                    "datetime": "string",
                    "value": "number"
                };

                var options = {
                    useStorage:false
                };

                this._super("init", [null, scheme, options]);

                this.createMethods();
            },

            dateKey: function() {
            	return this.get("datetime").substr(0,10);
            },

            mapData: function() {
                return {
                    "type": ["type"],
                    "measure": ["measure"],
                    "datetime": ["datetime"],
                    "value": ["value"]
                };
            }
        };
    },
    staticConstructor: function() {
    	var _data = [];
    	var _items = [];
    	var _constructor = {

    		init: function() {
    			var data = M.data.global("MeasureInfo-Data") || {};

    			setTimeout( function() {
			    	_constructor.data( data );
    			}, 0);

		    	return this;
    		},

			each: function( items, callback ) {

				var self = this;
				for ( var i=0; i<items.length; i++ ) {
					(function(i, item) {
						if ( callback ) {
							callback.call( self, i, item );
						}
					})(i, items[i]);
				}
			},

    		list: function( callback ) {
    			var items = this.items();
    			this.each( items, callback );
    			return items;
    		},

    		data: function( data ) {

    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return;
    			}

    			this.clear( true );

    			for ( var i=0; i<data.length; i++ ) {
    				var itemData = data[i];
    				var item = new MeasureInfo( "Index" + i );
    				item.data( itemData );

    				_data.push( itemData );

    				this.addItem( item, true );
    			}

    			this.saveData();
    		},

    		dateKeys: function( capSize ) {
    			var temp, dateKeys = [];
    			for ( var i=0; i<_items.length; i++ ) {
    				var item = _items[i];
    				if ( dateKeys.contain( item.date() ) ) {
    					dateKeys.push( item.date() );
    				}
    			}

    			for ( var i=0; i<dateKeys.length; i++ ) {
    				for ( var j=i+1; j<dateKeys.length; j++ ) {
    					if ( dateKeys[i] > dateKeys[j] ) {
    						temp = dateKeys[i];
    						dateKeys[i] = dateKeys[j];
    						dateKeys[j] = temp;
    					}
    				}
    			}

    			if ( capSize === undefined ) {
    				return dataKeys;
    			}

    			if ( dateKeys.length <= capSize ) {
    				return dateKeys.slice(0, capSize);
    			}

    			return dateKeys.slice(dateKeys.length-capSize, dateKeys.length);
    		},

        	addItem: function( item, ignoreSave ) {
				_items.push( item );

				if ( !!ignoreSave ) {
					this.saveData();
				}
        	},

        	saveData: function() {
				M.data.global( "MeasureInfo-Data", _data );
        	},

        	count: function() {
        		return _items.length;
        	},

            items: function() {
                return _items;
            },

            clear: function() {
            	_items = [];
            	M.data.removeGlobal("MeasureInfo-Data");
            }
        };

    	return _constructor.init();
    }
}),

SampleInfo = Class({
    name: "SampleInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( key ) {
                var scheme = {
                    "type": "string",
                    "datetime": "string",
                    "value": "number"
                };

                var options = {
                    useStorage:false
                };

                this._super("init", [null, scheme, options]);

                this.createMethods();
            },

            date: function() {
                return DataHelper.convertDate( this.datetime() );
            },

            time: function() {
                return this.date().getTime();
            },

            timeKey: function( startTime ) {
                var diffTime = this.time() - startTime;

                return Math.round(diffTime*0.001/60) + '';
            },

            mapData: function() {
                return {
                    "type": ["type"],
                    "datetime": ["datetime"],
                    "value": ["value"]
                };
            }
        };
    },
    staticConstructor: function() {
    	var _data = [];
    	var _items = {};
    	var _timeKeys = [];
    	var _constructor = {

    		init: function() {
    			var data = M.data.global("SampleInfo-Data") || {};

    			setTimeout( function() {
			    	_constructor.append( data );
    			}, 0);

		    	return this;
    		},

    		append: function( data ) {
    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return;
    			}

    			var timeKeys = _timeKeys;

    			for ( var i=0; i<data.length; i++ ) {
    				var itemData = data[i];
    				itemData.value = parseInt( itemData );
    				var timeKey = itemData.datetime;
    				
    				var item = new SampleInfo( "Index" + timeKey );
					item.data( itemData );
	    			
	    			_items[timeKey] = item;

	    			if ( ! UI.Helper.Array.inArray( timeKeys, timeKey ) ) {
	    				timeKeys.push( timeKey );
	    			}
    			}

    			_timeKeys = timeKeys.sort();

    			var data = [];

    			for ( var k=0; k<_timeKeys.length; k++ ) {
    				var timeKey = _timeKeys[k];
    				var item = _items[timeKey];

    				data.push( item.data() );
    			}

    			_data = data;


    		},

    		data: function( data ) {

    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return;
    			}

    			this.append( data );

    			this.saveData();
    		},

    		dateKeys: function( capSize ) {
    			var temp, dateKeys = [];
    			for ( var i=0; i<_timeKeys.length; i++ ) {
    				var timeKey = _timeKeys[i];
    				var item = _items[itemKey];
    				if ( ! UI.Helper.Array.inArray( dateKeys, item.date() ) ) {
    					dateKeys.push( item.date() );
    				}
    			}

    			for ( var i=0; i<dateKeys.length; i++ ) {
    				for ( var j=i+1; j<dateKeys.length; j++ ) {
    					if ( dateKeys[i] > dateKeys[j] ) {
    						temp = dateKeys[i];
    						dateKeys[i] = dateKeys[j];
    						dateKeys[j] = temp;
    					}
    				}
    			}

    			if ( capSize === undefined ) {
    				return dataKeys;
    			}

    			if ( dateKeys.length <= capSize ) {
    				return dateKeys.slice(0, capSize);
    			}

    			return dateKeys.slice(dateKeys.length-capSize, dateKeys.length);
    		},

        	saveData: function() {
				M.data.global( "SampleInfo-Data", _data );
        	},

        	count: function() {
        		return _timeKeys.length;
        	},

            items: function() {
                return _items;
            },

            loadItems: function( startDateTime, endDateTime ) {
            	var filtedItems = [];
                for ( var i=0; i<_timeKeys.length; i++ ) {
                	var timeKey = _timeKeys[i];
                    var item = _items[timeKey];

                    if ( item.time() >= startDateTime && item.time() <= endDateTime ) {
                        filtedItems.push( item );
                    }
                }

            	return filtedItems;
            }
        };

    	return _constructor.init();
    }
}),

SampleGroupInfo = Class({
    name: "SampleGroupInfo",
    parent: DataModel,
    constructor: function() {

        return {
            init: function( key ) {
                var scheme = {
                    "type": "string",
                    "datetime": "string",
                    "average": "number",
                    "count": "number",
                    "value": "number"
                };

                var options = {
                    useStorage:false
                };

                this._super("init", [null, scheme, options]);

                this.createMethods();
            },

            dateKey: function() {
            	return this.datetime().substr(0,10);
            },

            mapData: function() {
                return {
                    "type": ["type"],
                    "datetime": ["datetime"],
                    "average": ["avg"],
                    "count": ["count"],
                    "value": ["value"]
                };
            }
        };
    },
    staticConstructor: function() {
    	var _data = [];
    	var _items = [];
    	var _constructor = {

    		init: function() {
    			var data = M.data.global("SampleGroupInfo-Data") || {};

    			setTimeout( function() {
			    	_constructor.data( data );
    			}, 0);

		    	return this;
    		},

    		data: function( data ) {

    			if ( ! UI.Helper.Array.isArray( data ) ) {
    				return;
    			}

    			this.clear( true );

    			for ( var i=0; i<data.length; i++ ) {
    				var itemData = data[i];
    				itemData.value = parseInt( itemData.value );
    				var item = new SampleGroupInfo( "Index" + i );
    				item.data( itemData );

    				_data.push( itemData );

    				this.addItem( item, true );
    			}

    			this.saveData();
    		},

    		dateKeys: function( capSize ) {
    			var temp, dateKeys = [];
    			for ( var i=0; i<_items.length; i++ ) {
    				var item = _items[i];
    				if ( dateKeys.contain( item.date() ) ) {
    					dateKeys.push( item.date() );
    				}
    			}

    			for ( var i=0; i<dateKeys.length; i++ ) {
    				for ( var j=i+1; j<dateKeys.length; j++ ) {
    					if ( dateKeys[i] > dateKeys[j] ) {
    						temp = dateKeys[i];
    						dateKeys[i] = dateKeys[j];
    						dateKeys[j] = temp;
    					}
    				}
    			}

    			if ( capSize === undefined ) {
    				return dataKeys;
    			}

    			if ( dateKeys.length <= capSize ) {
    				return dateKeys.slice(0, capSize);
    			}

    			return dateKeys.slice(dateKeys.length-capSize, dateKeys.length);
    		},

        	addItem: function( item, ignoreSave ) {
				_items.push( item );

				if ( !!ignoreSave ) {
					this.saveData();
				}
        	},

        	saveData: function() {
				M.data.global( "SampleGroupInfo-Data", _data );
        	},

        	count: function() {
        		return _items.length;
        	},

            items: function() {
                return _items;
            },

            clear: function() {
            	_items = [];
            	M.data.removeGlobal("SampleGroupInfo-Data");
            }
        };

    	return _constructor.init();
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
                };
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

window.DataHelper = DataHelper;
	
})(window);