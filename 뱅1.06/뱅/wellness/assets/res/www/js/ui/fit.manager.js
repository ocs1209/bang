
// Fit Manager   //////////////////////////////////////new

(function(window, undefined) {

'use strict';

var debug = window.debug;

var 
Class = UI.Class,
UserInfo = Class.UserInfo,
DeviceInfo = Class.DeviceInfo,
ProfileInfo = Class.ProfileInfo,
DatabaseConfig = Class.DatabaseConfig,
DatabaseManager = Class.DatabaseManager,
SampleDAO = Class.SampleDAO,
SampleGroupDAO = Class.SampleGroupDAO,
SampleDashboardDAO = Class.SampleDashboardDAO,
CompositDAO = Class.CompositDAO,
MeasureDAO = Class.MeasureDAO,
CompositInfo = Class.CompositInfo,
MeasureInfo = Class.MeasureInfo,
FitInfo = Class.FitInfo,
FitConfig = Class.FitConfig,

SyncCell = function( item ) {

    if ( ! item ) {
        console.trace();
        debug.error( "item is null" );
        return {};
    }

    debug.log( "Create SyncCell ", item, item.dateKey() );

    var 
    self,
    _finishHandler,
    _controller = MainController.sharedInstance(),
    _delegate = null,
    _item = item,
    _device = item.deviceType(),
    _cancelled = false,
    _deviceSyncData = null,
    _updatingHistory = false,
    _syncing = false,
    _macro = new Macro(),
    _itemMap = {},
    _timoutException = null;

    var _constructor = {

        item: function() {
            return _item;
        },

        timeKeys: function() {
            var timeKeys = []; 
            
            for ( var timeKey in _itemMap ) { 
                timeKeys.push( timeKey ); 
            } 
            
            timeKeys = timeKeys.sort();

            return timeKeys;
        },

        init: function() {
            self = this;
            self.initialize();

            return this;
        },

        initialize: function() {

            var dateKey = this.dateKey();

            _macro.register( "restore.data", function() {

                var commnandObject = this;

                self.restoreData( function() {
                    debug.log( "SyncCell." + self.dateKey(), "callback - restoreData", dateKey, commnandObject );

                    commnandObject.complete();
                });
            });

            _macro.register( "load.device.data", function() {

                var commnandObject = this;

                self.loadFromDevice( function() {
                    debug.log( "SyncCell." + self.dateKey(), "callback - loadFromDevice", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "update.device.data", function() {

                var commnandObject = this;

                if ( _deviceSyncData == null ) {
                    debug.log( "SyncCell." + self.dateKey(), "device sync data is null - ", dateKey, _deviceSyncData, commnandObject.command() );

                    commnandObject.complete();
                    return;
                }

                self.updateFromDevice( _deviceSyncData, function() {
                    debug.log( "SyncCell." + self.dateKey(), "callback - updateFromDevice", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "arrange.sync.data", function() {

                var commnandObject = this;

                self.arrangeWithSyncData( function() {
                    debug.log( "SyncCell." + self.dateKey(), "callback - arrangeWithSyncData", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });
        },

        dateKey: function() {
            return _item == null ? "" : _item.dateKey();
        },

        isToday: function() {
            return _item == null ? false : _item.isToday();
        },

        isYesterday: function() {
            return _item == null ? false : _item.isYesterday();
        },

        isBeforeYesterday: function() {
            return _item == null ? false : _item.isBeforeYesterday();
        },

        isSleepTime: function( time ) {
            var fitManager = _controller.fitManager();
            var sleepData = _item.sleepData();
            var sleepStart = _item.sleepStart();
            var sleepEnd = _item.sleepEnd();

            var startDate = DataHelper.convertDate( this.dateKey() + " " + sleepStart );
            var endDate = DataHelper.convertDate( this.dateKey() + " " + sleepEnd );
            
//            debug.log('isSleepTime sleepData', sleepData);
//            debug.log('isSleepTime sleepData.offset', sleepData.offset);
//            debug.log('isSleepTime startDate', startDate);
//            debug.log('isSleepTime endDate', endDate);
            
            if ( sleepData.offset == -1 ) {

                // 수면시간
                if ( time >= startDate.getTime() || time < endDate.getTime() ) { 
                    return true;
                }

            }
            else if ( sleepData.offset == 0 ) {

                // 수면시간
                if ( time >= startDate.getTime() && time < endDate.getTime() ) { 
                    return true;
                }
            }

            return false;
        },

        isFuture: function( date ) {
            var now = new Date();
            var currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() );

            if ( date.getTime() >= currentDate.getTime() ) {
                return true;
            }

            return false;
        },

        isWakeTime: function( date, offset ) {
            offset = isNaN(parseInt(offset)) ? 0 : parseInt(offset) * 1000;
            var sleepEnd = _controller.deviceInfo().sleepEnd();
            var lastWakeTime = DataHelper.convertDate( DataHelper.dateFormat( "YYYY-MM-DD", new Date() ) + " " + sleepEnd );

            if ( (date.getTime()+offset) > lastWakeTime.getTime() ) {
                return true;
            }

            return false;
        },

        cancel: function() {
            //debug.trace();
            debug.log( "SyncCell." + self.dateKey(), "cancel" );

            _cancelled = true;
            _syncing = false;
            _macro.cancel();
        },

        cancelModule: function() {
            _updatingHistory = false;

            self.stopExceptionTimeout();

            _controller.fitManager().synchronizeManager().cancel();
        },

        shouldUpdate: function() {
            debug.warn( "SyncCell." + self.dateKey(), "shouldUpdate", _item.isSynced(), _item.get("synced"), JSON.stringify(_item.data()) );

            if ( _item.isSynced() === false ) {
                return true;
            }
            else if ( _item.isSynced() === true ) {

                if ( _item.isToday() === true ) {
                	//앱 최초구동시에는 동기화 무조건 탐.
                    //최초 구동시는  _firstExecute==true;
                    //동기화 한번돌면  _firstExecute==false;
                   if(_firstExecute == false){
	                	if ( _item.elapsedSyncTime() > 60*60 ) {
	                        return true;
	                    }
                   }
                }
                else if ( _item.isYesterday() === true ) {
                    if ( _item.sleepCount() < 0 ) {
                        return true;
                    }
                }
            }

            return false;
        },

        synchronize: function( delegate, callback ) {
            self.startExceptionTimeout();

            debug.log( "SyncCell." + self.dateKey(), "data", _item.data() );

            if ( _syncing == true ) {
                debug.log( "SyncCell." + self.dateKey(), "it's already synchronizing..." );
                return;
            }

            debug.log( "SyncCell." + self.dateKey(), "synchronize" );

            _syncing = true;
            _delegate = delegate;

            _itemMap = {};

            _macro.clear();

            if ( ! this.shouldUpdate() ) {
                var finished = true;

                self.stopExceptionTimeout();

                _syncing = false;

                debug.log( "SyncCell." + self.dateKey(), "sync cell is finished! ", finished );

                callback( finished );
                return;
            }

            _delegate._progress( DataHelper.dateFormat("M월 D일 - 동기화 중...", this.dateKey() ) );

            _macro.delay( 1 );
            _macro.add("restore.data");
            _macro.add("load.device.data");
            _macro.add("update.device.data");
            _macro.add("arrange.sync.data");
            _macro.delay( 1 );
            
            _macro.finishHandler( function( finished ) {
                self.stopExceptionTimeout();

                _syncing = false;

                debug.log( "SyncCell." + self.dateKey(), "sync cell is finished! ", finished );

                callback( finished );
            });

            _macro.start();
        },

        stopExceptionTimeout: function() {
            if ( _timoutException != null ) {
                clearTimeout( _timoutException );
                _timoutException = null;
            }

            $(".btn_setting").removeClass("delay");
        },

        startExceptionTimeout: function() {
            this.stopExceptionTimeout();

            _timoutException = setTimeout( function() {
                $(".btn_setting").addClass("delay");

                M.pop.instance("동기화 중 오류가 발생되었습니다.\n기기 상태를 확인해주세요.");
            }, 30000);
        },

        restoreData: function( callback ) {
            this.startExceptionTimeout();

            debug.log( "SyncCell." + self.dateKey(), "restoring data..." );

            _delegate._progress( DataHelper.dateFormat("M월 D일 - 백업된 데이타 복원 중...", self.dateKey() ) );

            SampleDAO.list( this.dateKey(), function( idx, item ) { 
                var key = item.key();

                if ( _itemMap[key] ) {
                    return;
                }

                _itemMap[key] = item;
            });

            debug.log( "SyncCell." + self.dateKey(), "Loaded Local Backup Data - ", self.timeKeys().length );

            callback();
        },

        loadFromDevice: function( callback ) {
            this.startExceptionTimeout();

            var dateKey = this.dateKey();

            debug.log( "SyncCell." + self.dateKey(), "load from history" );

            if ( this.timeKeys().length >= FitConfig.syncCount() ) {
                debug.log( "SyncCell." + self.dateKey(), "sync data is synced");
                callback();
                return;
            }

            if ( _updatingHistory == true && _deviceSyncData != null ) {
                debug.log( "SyncCell." + self.dateKey(), "already updating device - " );
                callback();
                return;
            }

            _updatingHistory = true;
            
            debug.log( "SyncCell." + dateKey, "load history - " );

            if ( _item.isSynced() === true ) {
                _delegate._progress( DataHelper.dateFormat("M월 D일 - Band 에서 데이타를 다시 불러오는 중...", self.dateKey() ) );
            }
            else {
                _delegate._progress( DataHelper.dateFormat("M월 D일 - Band 에서 데이타 불러오는 중...", self.dateKey() ) );
            }

            _controller.fitManager().history( dateKey, function( result ) {
                debug.log( "SyncCell." + dateKey, "result", result.error );

                if ( result.error ) {
                    _updatingHistory = false;

                    _controller.fitManager().unpair( function() {} );  // Reset Module

                    M.pop.instance( result.error );
                    
                    self.cancelModule();
                    return;
                }

                _updatingHistory = false;
                _deviceSyncData = [];

                var items = result.list;
                var sumItems =0; 
                
                for ( var i=0;i<items.length; i++ ) {
                	debug.log( "SyncCell." + self.dateKey() + ", " + i, "Loaded History Data from Band", items[i] ); //단말기에서 로드한 데잍 확인
                	var itemData = items[i];
                	sumItems += itemData.value;
                    _deviceSyncData.push( itemData );
                }

                debug.log( "SyncCell." + self.dateKey(), "Loaded History Data", _deviceSyncData.length, sumItems );

                callback();
            });
        },
 
        deviceType: function() {
            return _controller.fitManager().deviceType();
        },
 
        updateFromDevice: function( data, callback ) {
            this.startExceptionTimeout();

            debug.log( "SyncCell." + self.dateKey(), "update from device - ", data.length );

            if ( data == null || ! UI.Helper.Array.isArray( data ) ) {
                debug.log( "SyncCell." + self.dateKey(), "data is invalid" );
                callback();
                return;
            }

            _delegate._progress( DataHelper.dateFormat("M월 D일 - 데이타 업데이트 중...", self.dateKey() ) );

            var createCount = 0;

            for ( var i=0; i<data.length; i++ ) {
                var itemData = data[i];
                var timeKey = itemData["date"] + " " + itemData["time"];
                var date = DataHelper.convertDate( timeKey );
                var key = date.getTime() + '';

                if ( self.isFuture(date) ) {
                    debug.log( "SyncCell." + date , "datetime is future. - ", date );
                    continue;
                }

                if ( _itemMap[key] ) {
                    // alread has data
                    var item = _itemMap[key];
                    debug.log( "already SyncCell." + self.dateKey(), "_itemMap[key] yn",_itemMap[key] );
                }
                else {

                    var item = SampleDAO.insert({
                        "synced": false,
                        "device": self.deviceType(),
                        "type": self.isSleepTime( date.getTime() ) ? "SLEEP": "STEP",
                        "datetime": itemData.date + " " + itemData.time,
                        "active": itemData.active,
                        "value": itemData.value
                    }, true);

                    createCount ++;

                    _itemMap[key] = item;
                }
                debug.log('finally arrangeSyncData: ', _itemMap[key]);
            }
            		
            debug.log( "SyncCell." + self.dateKey(), "New Updated History Data - ", createCount, self.timeKeys().length );

            callback();
        },

        arrangeWithSyncData: function( callback ) {
            this.startExceptionTimeout();

            if ( _item.isSynced() ) {
                debug.log( "SyncCell." + self.dateKey(), "is synced" );
                callback();
                return;
            }

            debug.log( "SyncCell." + self.dateKey(), "arrange with sync data ", _itemMap );

            _delegate._progress( DataHelper.dateFormat("M월 D일 - 데이타 계산 중...", self.dateKey() ) );

            var count = 0;
            var steps = 0;
            var synced = false;
            var sleep_count = 0;
            var sleep_value = 0;
            var am_soso_count = 0;
            var am_soso_value = 0;
            var am_bad_count = 0;
            var am_bad_value = 0;
            var am_sleep_count = 0;
            var am_sleep_value = 0;
            var pm_soso_count = 0;
            var pm_soso_value = 0;
            var pm_bad_count = 0;
            var pm_bad_value = 0;
            var pm_sleep_count = 0;
            var pm_sleep_value = 0;
            var timeKeys = self.timeKeys();
            
            for ( var i=0; i<timeKeys.length; i++ ) {
                var key = timeKeys[i];
                var item = _itemMap[key];
                var itemData = item.data();

                debug.warn( "Sync ", item.datetime(), item.value(), item.type(), item.isAM(), item.sleepStatus() );

                if ( item.type() === "SLEEP" ) {

                    if ( item.isAM() ) {

                        if ( item.sleepStatus() === "bad" ) {
                            am_bad_count ++;
                            am_bad_value += item.value();

                            //debug.warn( "SyncCell." + self.dateKey(), timeKey, "bad", item.value() );
                        } 
                        else if ( item.sleepStatus() === "soso" ) {
                            am_soso_count ++;
                            am_soso_value += item.value();

                            //debug.warn( "SyncCell." + self.dateKey(), timeKey, "soso", item.value() );
                        }

                        am_sleep_value += item.value();
                        am_sleep_count ++;
                    }
                    else {

                        if ( item.sleepStatus() === "bad" ) {
                            pm_bad_count ++;
                            pm_bad_value += item.value();

                            //debug.warn( "SyncCell." + self.dateKey(), timeKey, "soso", item.value() );
                        } 
                        else if ( item.sleepStatus() === "soso" ) {
                            pm_soso_count ++;
                            pm_soso_value += item.value();   

                            //debug.warn( "SyncCell." + self.dateKey(), timeKey, "bad", item.value() );
                        }

                        pm_sleep_value += item.value();
                        pm_sleep_count ++;   
                    }
                }

                steps += item.value();
                count ++;
            }

            debug.log( "SyncCell." + self.dateKey(), "Count -", count, "Steps - ", steps );

            var syncedTime = DataHelper.dateFormat("YYYY-MM-DDThh:mm", new Date());
            var data = {
                "synced_time": syncedTime,
                "count": count,
                "value": steps,
                "am_soso_count": am_soso_count,
                "am_soso_value": am_soso_value,
                "am_bad_count": am_bad_count,
                "am_bad_value": am_bad_value,
                "am_sleep_count": am_sleep_count,
                "am_sleep_value": am_sleep_value,
                "pm_soso_count": pm_soso_count,
                "pm_soso_value": pm_soso_value,
                "pm_bad_count": pm_bad_count,
                "pm_bad_value": pm_bad_value,
                "pm_sleep_count": pm_sleep_count,
                "pm_sleep_value": pm_sleep_value
            };

            var sampleCount = self.sampleCount();

            if ( sampleCount >= FitConfig.syncCount() ) {
                data["synced"] = true;
            }

            debug.warn( "SyncCell." + self.dateKey(), "Update Data", data, sampleCount );

            _item.update(data);

            callback();
        },

        sampleCount: function() {
            var sampleCount = _item.sampleCount();

            debug.log( "SyncCell." + self.dateKey(), "SampleCount", sampleCount );

            return sampleCount;
        },

        deviceSyncData: function() {
            return _deviceSyncData;
        },

        isSynced: function() {
            return _item == null ? false: _item.isSynced();
        }
    };

    return _constructor.init();
},

SynchronizeManager = Class({
    name: "SynchronizeManager",
    parent: "IObject",
    constructor: function() {

        var 
        self, 
        _controller, 
        _fitInfo = FitInfo.sharedInfo(),
        _progresshandler,
        _finishHandler,
        _enabled = false,
        _cancelled = false,
        _firstExecute = true,
        _syncing = false,
        _syncedKey = "",
        _updating = false,
        _currentDateKey = "",
        _lastRemainDateKey = "",
        _startDateKey = "",
        _endDateKey = "",
        _itemMap = {},
        _syncedQueue = [],
        _syncedKeys = [],
        _syncedCommandObject = {},
        _sendQueue = [],
        _macro = new Macro(),
        _deviceType = "B";
 
        return {

            dateKeys: function() {
                var dateKeys = []; 
                
                for ( var dateKey in _itemMap ) { 
                    dateKeys.push( dateKey ); 
                } 
                
                dateKeys = dateKeys.sort();

                return dateKeys;
            },

            isSynced: function() {
            	if(_firstExecute == true ){ //어플최초 구동시는 무조건 true
            		return false;
            	}
            	return _fitInfo.isSynced();
            },

            isFirstExecute: function() {
                return _firstExecute;
            },

            isSyncing: function() {
                return _syncing;
            },

            isCancelled: function() {
                return _cancelled;
            },

            onProgress: function( handler ) {
                _progresshandler = handler;
            },

            onFinish: function( handler ) {
                _finishHandler = handler;
            },

            _progress: function( message ) {
                if ( self.isSynced() === true ) {
                    return;
                }

                var ratio = (function( syncedCount, historyCount ) {

                    if (syncedCount == 0 && historyCount == 0) {
                        return 0;
                    }

                    if ( syncedCount == 0 ) {
                        return 1;
                    }

                    if ( syncedCount === historyCount ) {
                        return 0;
                    }

                    return Math.max( 0, Math.min(1, ( 1 - (syncedCount / historyCount) ) ));
                })( _syncedQueue.length, _syncedKeys.length );

                if ( typeof _progresshandler === "function" ) {
                    _progresshandler( 0.1 + (0.89 * ratio), message );
                }
            },

            _finish: function() {

                debug.log( "SynchronizeManager finish - ", _cancelled );

                _firstExecute = false;

                if ( typeof _finishHandler === "function" ) {
                    setTimeout( function() {
                        _finishHandler( _cancelled );
                    }, 0);
                }
            },

            init: function() {
                self = this;

                _enabled = true;
                _controller = MainController.sharedInstance();
     
                return self;
            },
     
            initialize: function() {
                SampleDAO.create();
                SampleGroupDAO.create();

                _macro.register( "sync.initialize", function() {

                    var commnandObject = this;

                    _deviceType = _controller.fitManager().deviceType();
                    _itemMap = {};
                    _syncedQueue = [],
                    _syncedKeys = [],
                    _syncedCommandObject = {},
                    _sendQueue = [],
                    _currentDateKey = "";
                    _lastRemainDateKey = DataHelper.dateFormat("YYYY-MM-DD", "-7D");
                    _startDateKey = DataHelper.dateFormat("YYYY-MM-DD", "-6D");
                    _endDateKey = DataHelper.dateFormat("YYYY-MM-DD", "TODAY");

                    commnandObject.complete();
                });

                _macro.register( "restore.group", function() {

                    var commnandObject = this;

                    self.restoreGroup( function() {

                        commnandObject.complete();
                    });
                });

                _macro.register( "load.server.summary", function() {

                    var commnandObject = this;

                    self.loadSummary( function() {

                        commnandObject.complete();
                    });
                });

                _macro.register( "load.device.history", function() {

                    var commnandObject = this;

                    self.loadHistory( function() {

                        commnandObject.complete();
                    });
                });

                _macro.register( "sync.start.queue", function() {

                    var commnandObject = this;

                    self.startUpdate( commnandObject );

                    // complete 은 finish queue 가 실행
                });

                _macro.register( "arrange.sync.summary", function() {

                    var commnandObject = this;

                    self.arrangeSyncSummary( function() {
                        commnandObject.complete();
                    });
                });

                _macro.register( "send.server.summary", function() {

                    var commnandObject = this;

                    self.sendSummary( function() {
                        commnandObject.complete();
                    });
                });
            },

            retry: function() {
                debug.log( "SynchronizeManager retry", _cancelled );

                if ( _cancelled !== true ) {
                    return;
                }

                _cancelled = false;

                this.synchronize();
            },

            cancel: function() {

                if ( self.isSynced() == true ) {
                    return;
                }

                if ( _cancelled == true ) {
                    return;
                }

                _cancelled = true;
                _syncing = false;
                _macro.clear();

                for ( var index in _syncedQueue ) {
                    var dateKey = _syncedQueue[index];
                    var syncCell = _itemMap[dateKey];

                    if ( syncCell ) {
                        syncCell.cancel();
                    }
                }

                _syncedQueue = [];
                _syncedKeys = [];

                self._finish();
            },

            reset: function() {
                this.cancel();

                SampleGroupDAO.truncate();
                SampleDAO.truncate();
            },

            synchronize: function() {
                debug.log( this, "SynchronizeManager synchronize" );

                if ( _enabled == false ) {
                    _syncing = false;

                    this._finish();
                    return;   
                }
                //앱 최초구동시에는 동기화 무조건 탐.
                //최초 구동시는  _firstExecute==true;
                //동기화 한번돌면  _firstExecute==false;
               if(_firstExecute == false){
	                if ( this.isSynced() ) {
	                    _cancelled = false;
	                    self._finish();
	                    debug.log( this, "SynchronizeManager sync-data is synchronized." );
	                    return;
	                }
               }

                if ( _syncing == true && _syncedQueue.length > 0 ) {
                    _cancelled = false;
                    this.executeUpdate();
                    return;
                }

                SampleDAO.create();
                SampleGroupDAO.create();

                _syncing = true;
                _cancelled = false;
                _macro.clear();

                this._progress("동기화 준비중...");

                _macro.delay( 0.3 );

                _macro.add("sync.initialize");
                _macro.add("restore.group")
                _macro.add("load.server.summary");
                _macro.add("load.device.history");
                _macro.add("sync.start.queue");
                _macro.add("arrange.sync.summary");
                _macro.add("send.server.summary");
            
                _macro.finishHandler( function( finished ) {
                    
                    self.finishUpdate( finished );
                });

                _macro.start();
            },

            restoreGroup: function( callback ) {
                
                self._progress( "백업된 데이타를 가져오는 중..." );

                SampleGroupDAO.list( function( idx, item ) {
                	
                	debug.log('SampleGroupDAO list', item);
                    var dateKey = item.dateKey();

                    if ( ! dateKey || dateKey === "undefined" || dateKey === "Invalid Date" ) {
                        item.remove();
                        return;
                    }

                    if ( dateKey < _lastRemainDateKey ) { //7일전날짜.
                        item.remove();
                        return;
                    }

                    if ( _itemMap[dateKey] ) {
                        return; // 중복 제거
                    }

                    var cell = new SyncCell( item );

                    _itemMap[dateKey] = cell;
                });

                callback();
            },

            loadSummary: function( callback ) {
                var self = this;
                var popupController = PopupController.sharedInstance();
                        
                self._progress( "서버에서 데이타를 가져오는 중..." );

                _controller.execute("fit.sync.summary.load", { "device": _deviceType, "start": _startDateKey, "end": _endDateKey }, {
                    showIndicator:false,
                    callback: function( event ) { 

                        if ( event.error ) {
                            debug.warn( "SynchronizeManager error loading summary from server - ", event.error );
                            
                            popupController.toast( event.error );
                            popupController.confirm(
                                "데이타를 가져올 수 없습니다.\n다시 시도하시겠습니까", 
                                ["취소", "다시 시도"],
                                function( buttonIndex ) {
                                    if ( buttonIndex === 1 ) {
                                        _controller.retry( event );
                                    }
                                    else {
                                        self.cancelUpdate();
                                    }
                                }
                            );

                            return;
                        }
                        
                        debug.log( "SynchronizeManager Server Summary Items - ", event.result.items );

                        var items = event.result.items;
                        var updateCount = 0;

                        debug.warn( "Sync Load Summary - items ", items );

                        for ( var i=0; i<items.length; i++ ) {

                            var itemData = items[i];
                            var dateKey = itemData["sync_date"];
                            var cell = _itemMap[dateKey];

                            if ( ! cell ) {
                                continue;
                            }

                            if ( ! dateKey || dateKey === "undefined" || dateKey === "Invalid Date" ) {
                                continue;
                            }

                            if ( itemData["device"] !== _deviceType ) {
                                continue;
                            }

                            var sleepStart = itemData["sleep_start"] || DeviceInfo.sharedInfo().sleepStart();
                            var sleepEnd = itemData["sleep_end"] || DeviceInfo.sharedInfo().sleepEnd();
                            var goalStep = itemData["goal_val"] || FitInfo.sharedInfo().goalStep();
                            var synced = cell.item() ? cell.item().isSynced() : false;

                            if ( dateKey == DataHelper.dateFormat("YYYY-MM-DD", "TODAY") ) {
                                sleepStart = DeviceInfo.sharedInfo().sleepStart();
                                sleepEnd = DeviceInfo.sharedInfo().sleepEnd();
                                goalStep = FitInfo.sharedInfo().goalStep();
                            }

                            var stepCount = itemData["sync_step_count"] || 0;
                            var sleepCount = itemData["sync_sleep_count"] || 0;
                            var sleepValue = itemData["sync_sleep_value"] || 0;

                            if ( stepCount >= FitConfig.syncCount() && sleepCount > 0 ) {
                                debug.log( "Sync dateKey", dateKey, stepCount, sleepCount );
                                
                                //서버데이터 기준 720 row 이상 시 동기화 되었다고판단, 동기화 안함.
                                if ( ! (cell.isToday() || cell.isYesterday()) ) {
                                    synced = true;
                                }
                            }

                            if ( cell ) {

                                cell.item().update({
                                    "sleep_start": sleepStart,
                                    "sleep_end": sleepEnd,
                                    "goal_step": goalStep,
                                    "count": itemData["sync_step_count"] || 0,
                                    "value": itemData["sync_step_value"] || 0,
                                    "sleep_count": itemData["sync_sleep_count"] || 0,
                                    "sleep_value": itemData["sync_sleep_value"] || 0,
                                    "soso_count": itemData["soso_count"] || 0,
                                    "soso_value": itemData["soso_value"] || 0,
                                    "bad_count": itemData["bad_count"] || 0,
                                    "bad_value": itemData["bad_value"] || 0,
                                    "good_count": itemData["good_count"] || 0,
                                    "good_value": itemData["good_value"] || 0,
                                    "synced": synced
                                });

                                continue;
                            }

                            var item = SampleGroupDAO.insert({
                                "sync_date": dateKey,
                                "device_type": itemData["device"],
                                "synced": synced,
                                "synced_time": "",
                                "sleep_start": sleepStart,
                                "sleep_end": sleepEnd,
                                "goal_step": goalStep,
                                "count": itemData["sync_step_count"] || 0,
                                "value": itemData["sync_step_value"] || 0,
                                "sleep_count": itemData["sync_sleep_count"] || 0,
                                "sleep_value": itemData["sync_sleep_value"] || 0,
                                "soso_count": itemData["soso_count"] || 0,
                                "soso_value": itemData["soso_value"] || 0,
                                "bad_count": itemData["bad_count"] || 0,
                                "bad_value": itemData["bad_value"] || 0,
                                "good_count": itemData["good_count"] || 0,
                                "good_value": itemData["good_value"] || 0,
                                "am_soso_count": 0,
                                "am_soso_value": 0,
                                "am_bad_count": 0,
                                "am_bad_value": 0,
                                "pm_soso_count": 0,
                                "pm_soso_value": 0,
                                "pm_bad_count": 0,
                                "pm_bad_value": 0
                            });

                            var cell = new SyncCell( item );

                            _itemMap[dateKey] = cell;
                        }

                        callback();
                    }
                });
            },

            loadHistory: function( callback ) {
                // 시작과 마지막 날 동기화 데이타가 있으면 Table Load Skip
                debug.log( "SynchronizeManager loadHistory", _itemMap, _startDateKey, _endDateKey );

                debug.log( "_firstExecute", _firstExecute );

                if ( _firstExecute === false ) {
                    if ( _itemMap[_startDateKey] && _itemMap[_endDateKey] ) {
                        var startCell = _itemMap[_startDateKey];
                        var endCell = _itemMap[_endDateKey];
                        
                        if ( startCell.isSynced() && endCell.isSynced() ) {
                            _syncedQueue = [_endDateKey];
                            _syncedKeys = [_endDateKey];

                            callback();
                            return;
                        }
                    }
                }

                debug.log( "SynchronizeManager pairing..." );
                        
                self._progress( "Band 에 저장된 데이타 확인 중..." );

                _controller.fitManager().historyTable( function( result ) {

                    if ( result.error ) {
                        debug.log( "SynchronizeManager fail history table..." );

                        _controller.fitManager().unpair( function() {} ); // Reset Module

                        M.pop.instance( result.error );

                        self.cancelUpdate();
                        
                        return;
                    }

                    var syncedQueue = [];
                    var syncedKeys = [];
                    
                   
                    var historyKeys = result.list;
                    debug.log('SynchronizeManager loadhistory key', historyKeys);
                    historyKeys = historyKeys.sort();
                    
                    var _deviceHistoryDataKey = historyKeys;
                    
                    debug.log('SynchronizeManager _deviceHistoryDataKey', _deviceHistoryDataKey);
                    FitInfo.sharedInfo().setDeviceHistoryKey(_deviceHistoryDataKey);
                    debug.log('SynchronizeManager _get deviceHistoryDataKey', FitInfo.sharedInfo().getDeviceHistoryKey());
                    for ( var i=(historyKeys.length-1); i>=0; i-- ) {
                    	
                        var dateKey = historyKeys[i];
                        
                         /*if ( M.navigator.os("android") ){ 
	                        if(dateKey.length < 10) {
	                        
	                        	var strArray = dateKey.split("-");
	                        	var date1="";
	                        	var date2="";
	                        	if(strArray[1]<2){date1= "0"+strArray[1]; }
	                        	if(strArray[2]<2){date2= "0"+strArray[2]; }
	                        	
	                        	dateKey = strArray[0]+date1+date2;
	                        }
                         }*/

                        if ( dateKey < _controller.userInfo().userDateCreated() ) {
                            continue;
                        }

                        if ( isNaN( DataHelper.convertDate( dateKey ) ) ) {
                            continue;
                        }

                        syncedQueue.push( dateKey );
                        syncedKeys.push( dateKey );
                        
                        if ( _itemMap[dateKey] ) {
                            continue;
                        }

                        var item = SampleGroupDAO.insert({
                            "sync_date": dateKey,
                            "device_type": _deviceType,
                            "synced": false,
                            "synced_time": "",
                            "sleep_start": DeviceInfo.sharedInfo().sleepStart(),
                            "sleep_end": DeviceInfo.sharedInfo().sleepEnd(),
                            "goal_step": FitInfo.sharedInfo().goalStep(),
                            "count": 0,
                            "steps": 0,
                            "soso_count": 0,
                            "soso_value": 0,
                            "bad_count": 0,
                            "bad_value": 0,
                            "good_count": 0,
                            "good_value": 0
                        });

                        var cell = new SyncCell( item );

                        _itemMap[dateKey] = cell;
                    }

                    _syncedQueue = syncedQueue.sort().reverse();
                    _syncedKeys = syncedKeys.sort();

                    callback();
                });
            },

            startUpdate: function( commandObject ) {
                
                _syncedCommandObject = commandObject;

                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                debug.log( "SynchronizeManager startUpdate" );
                        
                self._progress( "동기화 중..." );

                
                debug.log( "SynchronizeManager syncedQueue", _syncedQueue );

                this.nextUpdate();
            },

            nextUpdate: function() {
                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                if ( _syncedQueue.length == 0 ) {
                    this.finishQueue();
                    return;
                }

                _currentDateKey = _syncedQueue.pop();

                if ( isNaN( DataHelper.convertDate( _currentDateKey ) ) ) {
                    debug.log( "SynchronizeManager current date key" + _currentDateKey, "is Invalid" );
                    self.cancelUpdate();
                    return;
                }

                var syncCell = _itemMap[_currentDateKey];

                debug.log( "SynchronizeManager nextUpdate", _currentDateKey, syncCell );

                if ( ! syncCell ) {
                    debug.log( "SyncCell." + self.dateKey(), "is Undefined" );
                    self.cancelUpdate();
                    return;
                }

                this.executeUpdate();
            },

            executeUpdate: function() {
                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                var syncCell = _itemMap[_currentDateKey];

                debug.log( "SynchronizeManager executeUpdate", _currentDateKey );

                if ( ! syncCell ) {
                    debug.log( "SynchronizeManager SyncCell is Undefined" );
                    return;
                }

                debug.log( "syncCell", syncCell, _itemMap );

                syncCell.synchronize( this, function( finished ) {
                    if ( finished === false ) {
                        self.cancelUpdate();
                        return;
                    }

                    setTimeout( function() {
                        self.nextUpdate();
                    }, 0);
                });
            },

            finishQueue: function() {
                debug.log( "SynchronizeManager finishQueue" );

                //var commandObject = _macro.get("sync.start.queue");
                //commandObject.complete();
                setTimeout( function() {
                    if ( typeof _syncedCommandObject["complete"] === "function" ) {
                        _syncedCommandObject.complete();
                    }
                    else if ( _macro.isProgressing() === true ) {
                        _macro.next();
                    }
                    
                }, 0); // 5000
            },

            arrangeSyncSummary: function( callback ) {

                debug.log( "SynchronizeManager Arrange Sync Summary ..." );
                        
                self._progress( "동기화된 데이타 계산 중..." );

                var dateKeys = this.dateKeys();

                for ( var i=dateKeys.length-1; i>0; i-- ) {
                    var dateKey = dateKeys[i];
                    var cell = _itemMap[dateKey];
                    var item = cell.item();

                    var prevDateKey = item.prevDateKey();
                    var prevCell = _itemMap[prevDateKey];

                    if ( !prevCell ) {
                        continue;
                    }

                    var prevItem = prevCell.item();

                    var sleep_count = item.amSleepCount() + prevItem.pmSleepCount();
                    var sleep_value = item.amSleepValue() + prevItem.pmSleepValue();
                    var soso_count = item.amSosoCount() + prevItem.pmSosoCount();
                    var soso_value = item.amSosoValue() + prevItem.pmSosoValue();
                    var bad_count = item.amBadCount() + prevItem.pmBadCount();
                    var bad_value = item.amBadValue() + prevItem.pmBadValue();
                    var good_count = sleep_count - soso_count - bad_count;
                    var good_value = sleep_value - soso_value - bad_value;


                    if ( sleep_count === 0 && prevItem.sleepCount() > 0 ) {
                        sleep_count = prevItem.sleepCount();
                        sleep_value = prevItem.sleepValue();
                        soso_count = prevItem.sosoCount();
                        soso_value = prevItem.sosoValue();
                        bad_count = prevItem.badCount();
                        bad_value = prevItem.badValue();
                        good_count = prevItem.goodCount();
                        good_value = prevItem.goodValue();
                    }

                    var itemData = {
                        "sleep_count": sleep_count,
                        "sleep_value": sleep_value,
                        "soso_count": soso_count,
                        "soso_value": soso_value,
                        "bad_count": bad_count,
                        "bad_value": bad_value,
                        "good_count": good_count,
                        "good_value": good_value
                    };

                    var sampleCount = prevCell.sampleCount();

                    if ( sampleCount >= FitConfig.syncCount() ) {
                        itemData["synced"] = true;
                    }

                    debug.warn( "prevItem update", prevItem, prevItem.data(), itemData );

                    prevItem.update(itemData);
                }

                setTimeout( function() {
                    _controller.macro().execute("fit.show.dashboard" );
                }, 0);

                callback();
            },

            sendSummary: function( callback ) {
                var self = this;
                var popupController = PopupController.sharedInstance();

                debug.log( "SynchronizeManager Send Summary..." );
                        
                self._progress( "서버로 데이타 동기화 중..." );

                var items = [];
                var dateKeys = _syncedKeys;

                /*
                var dateKeys = [];

                for ( var dateKey in _itemMap ) {
                    dateKeys.push( dateKey );
                }

                dateKeys = dateKeys.sort();
                */

                for ( var i=0; i<dateKeys.length; i++ ) {
                    var cell = _itemMap[dateKeys[i]];
                    var item = cell.item();
                    
                    var stepData = {
                        "sync_date": item.dateKey(),
                        "datetime": item.dateKey(),
                        "type": "STEP",
                        "count": item.count(),
                        "value": item.value(),
                        "average": item.average(),
                        "device": item.deviceType(),
                        "soso_count": 0,
                        "bad_count": 0,
                        "good_count": 0,
                        "soso_value": 0,
                        "bad_value": 0,
                        "good_value": 0
                    };

                    items.push( stepData );

                    var sleepData = {
                        "sync_date": item.dateKey(),
                        "datetime": item.dateKey(),
                        "type": "SLEEP",
                        "count": item.sleepCount(),
                        "value": item.sleepValue(),
                        "average": item.sleepAverage(),
                        "device": item.deviceType(),
                        "soso_count": item.sosoCount(),
                        "bad_count": item.badCount(),
                        "good_count": item.goodCount(),
                        "soso_value": item.sosoValue(),
                        "bad_value": item.badValue(),
                        "good_value": item.goodValue()
                    };

                    items.push( sleepData );
                }

                debug.warn( "Sync Send Summary - items ", items );

                debug.log( "SynchronizeManager items", items );

                _controller.execute("fit.sync.summary.send", { "items": items, "device": _deviceType }, {
                    showIndicator:false,
                    callback: function( event ) { 

                        if ( event.error ) {
                            debug.error( "SyncManager error loading summary from server - ", event.error );
                            
                            popupController.toast( event.error );
                            
                            /*
                            popupController.confirm(
                                "데이타를 가져올 수 없습니다.\n다시 시도하시겠습니까", 
                                ["다시 시도"],
                                function( buttonIndex ) {
                                    _controller.retry( event );
                                }
                            );
                            */

                            callback();

                            return;
                        }
                        
                        debug.log( "SynchronizeManager Server Summary Items - ", event.result );

                        callback();
                    }
                });

            },

            finishUpdate: function( finished ) {

                if ( finished === false ) {
                    this.cancelUpdate();
                    return;
                }

                console.trace();
                debug.log( "SynchronizeManager finishUpdate" );

                _syncing = false;

                /*
                var todayItem = SampleGroupDAO.item( DataHelper.dateFormat("YYYY-MM-DD", "TODAY") );
                var sleepItem = SampleGroupDAO.item( DataHelper.dateFormat("YYYY-MM-DD", "-1D") );

                if ( ! sleepItem ) {

                }
                else if ( sleepItem && sleepItem.isSyncedSleepSamples() == false  ) {
                    sleepItem.update({"synced":false});
                    todayItem.update({"synced":false});
                }
                else {
                    
                }
                */

                _fitInfo.synced();

                this._progress("동기화가 완료되었습니다.");
                this._finish();

                debug.log( "SynchronizeManager is finished! ", finished );
            },

            cancelUpdate: function() {
                console.trace();
                debug.log( "SynchronizeManager cancelUpdate" );

                if ( _cancelled === true ) {
                    debug.log( "it is already cancelled." );
                    return;
                }

                _syncing = false;
                _cancelled = true;
                _macro.cancel();

                this._progress("동기화가 취소되었습니다.");
                this._finish();
            },

            saveData: function() {
                M.data.storage("SyncInfo-TableData", _syncedTable);
            }
        };
    },
    staticConstructor: function() {
        var _instance;

        return {
            defaultManager: function() {
                if ( _instance === undefined ) {
                    _instance = new SynchronizeManager();
                }
                return _instance;
            }
        }
    }
}),

FitManager = Class({
    name: "FitManager",
    parent: "IObject",
    constructor: function() {

        var 
        self, 
        _dashboard = {},
        _targetDateString = M.data.global("TARGET_DATE") || "TODAY",
        _controller = MainController.sharedInstance(),
        _synchronizeManager = new SynchronizeManager();

        return {

            userInfo: function() {
                return UserInfo.sharedInfo();
            },

            deviceInfo: function() {
                return DeviceInfo.sharedInfo();
            },

            profileInfo: function() {
                return ProfileInfo.sharedInfo();
            },

            info: function() {
                return FitInfo.sharedInfo();
            },
     
            synchronizeManager: function() {
                return _synchronizeManager;
            },

            isPaired: function() {
                return this.deviceInfo().hasPairedBand() ? true : false;
            },

            deviceType: function() {
                return this.deviceInfo().deviceType();    
            },

    		init: function() {
                self = this;

                return self;
    		},

            initialize: function() {
                DatabaseManager.sharedManager().initialize();

                CompositDAO.create();
                MeasureDAO.create();
                SampleDashboardDAO.create();

                _synchronizeManager.initialize();

                return self;
            },

            currentStep: function() {
                return self.info().currentStep();
            },

            currentDistance: function() {
                return self.info().currentDistance();
            },

            currentCalorie: function() {
                return self.info().currentCalorie();
            },

            caloriesByGoalStep: function( ) {
                var goalStep = self.info().goalStep();
                var currentStep = self.currentStep();
                
                if ( goalStep <= 0 ) {
                    return 0;
                }

                if ( currentStep <= 0 || currentStep >= goalStep ) {
                    return this.caloriesBySteps( goalStep );
                }

                var bodyWeight = self.profileInfo().bodyWeight("KG");
                var bodyHeight = self.profileInfo().bodyHeight("CM");
                var currentDistance = Math.floor((bodyHeight * 0.415 * currentStep ) / 100);
                var currentCalorie = ((bodyWeight * 1036 * currentDistance ) * 0.000001);

                var reverseCalorie = (currentCalorie * goalStep) / currentStep;

                return parseInt( Math.ceil(reverseCalorie) );
            },

            distancesByGoalStep: function( ) {
                var goalStep = self.info().goalStep();
                var currentStep = self.currentStep();

                if ( goalStep <= 0 ) {
                    return 0;
                }

                if ( currentStep <= 0 || currentStep >= goalStep ) {
                    return this.distancesBySteps( goalStep );
                }

                var bodyHeight = self.profileInfo().bodyHeight("CM");
                var currentDistance = (bodyHeight * 0.415 * currentStep ) / 100;
                var reverseDistance = (currentDistance * goalStep) / currentStep;

                return parseInt( Math.ceil(reverseDistance) );
            },

            caloriesBySteps: function( step ) {
                var bodyWeight = self.profileInfo().bodyWeight("KG");
                var distance = self.distancesBySteps( step );
                // 2Mph
                //var calories = step <= 0 ? 0 : (bodyWeight * 2.20462 * 0.57 / 2200 * step);

                // 3.5Mph
                //var calories = step <= 0 ? 0 : (bodyWeight * 2.20462 * 0.5 / 1400 * step);

                // Vidonn
                var calories = step <= 0 ? 0 : (bodyWeight * 1036 * distance) * 0.000001;

                return isNaN(Math.floor( calories ) ) ? 0 : Math.floor( calories ) ;
            },

            distancesBySteps: function( step ) {
            	debug.log('distancesBySteps step', step);
                var bodyHeight = self.profileInfo().bodyHeight("CM");
                var distances = step <= 0 ? 0 : ((bodyHeight * 0.415 * step ) / 100);

                return isNaN(Math.floor( distances ) ) ? 0 : Math.floor( distances ) ;
            },

            timeDataByMinute: function( min ) {
                var hour = Math.floor(min / 60);
                var minute = min % 60;
                return {
                    hour: hour,
                    minute: minute,
                    time: DataHelper.str2num( hour ) + ":" + DataHelper.str2num( minute )
                };
            },

            convertDate: function( dateString ) {
                return DataHelper.convertDate( dateString );
            },

            dateFormat: function( format, dateString ) {
                return DataHelper.dateFormat( format, dateString );
            },

            timeFormat: function( format, timeData ) { 
                return DataHelper.timeFormat( format, timeData );
            },

            numberFormat: function( num, unit ) {
                return DataHelper.numberFormat( num, unit );
            },

            str2num: function( str ) {
                return DataHelper.str2num();
            },
     
            today: function() {
                return new Date();
            },

    		todayFormat: function( format ) {
                return self.dateFormat( format, this.today() );
    		},

            targetDate: function() {
                if ( _targetDateString === "TODAY" ) {
                    return new Date();
                }

                return DataHelper.convertDate( _targetDateString );
            },

            setTargetDate: function( dateString ) {

                var date = DataHelper.convertDate( dateString );

                if ( isNaN(date) ) {
                    debug.warn( "target date is invalid." );
                    return;
                }

                _targetDateString = dateString;

                M.data.global( "TARGET_DATE", _targetDateString );
            },

            targetDateFormat: function( format ) {
                return this.dateFormat( format, this.targetDate() );
            },
     
            startDate: function() {
                var targetDate = this.targetDate();
                var date = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
                var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()-(date.getDay()===0 ? 7 : date.getDay())+1 );
                var year = startDate.getFullYear() + '';
                var month = startDate.getMonth() + 1 + '';
                var day = startDate.getDate() + '';
     
     			return [year, DataHelper.str2num( month ), DataHelper.str2num( day )].join("-");
            },
     
            endDate: function() {
                var targetDate = this.targetDate();
                var date = new Date(targetDate.getFullYear(),targetDate.getMonth(), 1);
                var endDate = new Date(date.getFullYear(),date.getMonth()+1,"");
                var year = endDate.getFullYear() + '';
                var month = endDate.getMonth() + 1 + '';
                var day = endDate.getDate() + '';
     
                return [year, DataHelper.str2num( month ), DataHelper.str2num( day )].join("-");
            },

            isEqualDate: function( d1, d2 ) {
                return (
                    d1.getFullYear() === d1.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate()
                );
            },

            sortKeys: function( array, handler, sort ) {

                for ( var i=0; i<array.length-1; i++ ) {
                    for ( var j=i+1; j<array.length; j++ ) {
                        var sortResult = handler( array[i], array[j] );

                        if ( sort == 1 && sortResult === 1 ) {
                            var temp = array[i];
                            array[i] = array[j];
                            array[j] = temp;
                        }
                        else if ( sort == -1 && sortResult === -1 ) {
                            var temp = array[j];
                            array[j] = array[i];
                            array[i] = temp;
                        }
                    }
                }

                return array;
            },

            thisWeeklyKeys: function( offset ) {
                offset = offset === undefined ? 1 : offset;
                var targetDate = this.targetDate();
                var startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()-(targetDate.getDay()===0 ? 7 : targetDate.getDay()) + offset );
                var weeklyKeys = [];

                for ( var i=0; i<7; i++ ) {
                    var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+i);
                    var year = date.getFullYear() + '';
                    var month = date.getMonth() + 1 + '';
                    var day = date.getDate() + '';
                    var dateKey = [year, DataHelper.str2num(month), DataHelper.str2num(day)].join("-");
                
                    weeklyKeys.push( dateKey );

                    if ( self.isEqualDate( this.today(), date ) ) {
                        break;
                    }
                }

                return weeklyKeys;
            },

            thisMonthlyKeys: function() {
                var targetDate = this.targetDate();
                var startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
                var endDate = new Date(startDate.getFullYear(),startDate.getMonth()+1,"");
                var days = endDate.getDate();
                var monthlyKeys = [];

                for ( var i=0; i<days; i++ ) {
                    var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+i);
                    var year = date.getFullYear() + '';
                    var month = date.getMonth() + 1 + '';
                    var day = date.getDate() + '';
                    var dateKey = [year, DataHelper.str2num(month), DataHelper.str2num(day)].join("-");
                
                    monthlyKeys.push( dateKey );

                    if ( self.isEqualDate( this.today(), date ) ) {
                        break;
                    }
                }

                return monthlyKeys;
            },

            thisMonthlyGroupKeys: function() {
                var monthlyGroupKeys = [];
                var targetDate = this.targetDate();
                var firstDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
                var startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1 - (firstDate.getDay() - 1));
                var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1,"");
                var days = endDate.getDate() + ( startDate.getDay() - 1 ) + ( 7 - endDate.getDay() );

                for ( var i=0; i<days; i++ ) {
                    var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+i);
                    var year = date.getFullYear() + '';
                    var month = date.getMonth() + 1 + '';
                    var day = date.getDate() + '';
                    var dateKey = [year, DataHelper.str2num(month), DataHelper.str2num(day)].join("-");
                
                    monthlyGroupKeys.push( dateKey );

                    if ( self.isEqualDate( this.today(), date ) ) {
                        break;
                    }
                }

                return monthlyGroupKeys;
            },

            connect: function( callback, force ) {
                      
            	debug.log('###Blue Tooth pair'); 
            	var isConnected = false;
            	setTimeout(function(){ 
            		if(isConnected == false){
            			var result = {
            				error:"band not connected"
                		};
            		  callback( result );
            		}
            	}, 10000);
                if ( ! M.fit.bluetooth.enabled() ) {
                    if ( M.navigator.os("ios") ) {
                        M.pop.instance( "Bluetooth is disabled." );

                        callback({
                           status: 'FAIL',
                           error: 'bluetooth is disabled.'
                        });
                    }
                    else {
                        M.pop.alert({
                            message:'블루투스가 비활성화 되어있습니다. 활성화 할까요?',
                            buttons: ["취소", "활성화"],
                            onclick: function( buttonIndex ) {
                                if ( buttonIndex == 1 ) {
                                    M.fit.bluetooth.enabled(true);

                                    self.connect( callback, force );
                                }
                                else {
                                    M.pop.instance( "Bluetooth is disabled." );

                                    callback({
                                       status: 'FAIL',
                                       error: 'bluetooth is disabled.'
                                    });
                                }
                            }
                        });
                    }
                }   
                else {
                		//활성됬을경우
                    if ( force !== true && this.isPaired() ) {
                        callback({
                           status: 'SUCCESS',
                           uuid: self.deviceInfo().bandUUID()
                        });
                        return;
                    }

                    ////////////////////////////////////////////////////
                    if ( M.navigator.os("android") || (M.data.global("CONNECT_PAGE")  == "N" && M.navigator.os("ios")) ){
                    M.fit.bluetooth.pair({
                        timeout: 15000,
                        onconnect: function( result ) {

                            if ( result.state === "DISABLED" ) {

                                if ( M.navigator.os("ios") ) {
                                    M.pop.instance( "Bluetooth is disabled." );

                                    callback({
                                       status: 'FAIL',
                                       error: 'bluetooth is disabled.'
                                    });
                                }
                                else {
                                    M.pop.alert({
                                        message:'블루투스가 비활성화 되어있습니다. 활성화 할까요?',
                                        buttons: ["취소", "활성화"],
                                        onclick: function( buttonIndex ) {
                                            if ( buttonIndex == 1 ) {
                                                M.fit.bluetooth.enabled(true);

                                                self.connect( callback, force );
                                            }
                                            else {
                                                M.pop.instance( "Bluetooth is disabled." );

                                                callback({
                                                   status: 'FAIL',
                                                   error: 'bluetooth is disabled.'
                                                });
                                            }
                                        }
                                    });
                                }

                                return;
                            }

                            if ( result.error ) {
                                M.pop.instance( "Pairing is fail." );

                                self.unpair( function() {} );
                                
                                callback( result );
                                return;
                            }

                            $(".btn_setting").removeClass("on");
                            M.db.close( DatabaseConfig.databaseName() );
                            
                            self.deviceInfo().restoreData();
                            self.deviceInfo().set("paired_band_uuid", result.uuid);
                            self.deviceInfo().set("paired_band_devicename", result.devicename);
                            self.deviceInfo().saveData();
                            self.deviceInfo().restoreData();

                            M.db.create( DatabaseConfig.databaseName() );
                            debug.log('DatabaseConfig.databaseName= ', DatabaseConfig.databaseName());
                            M.db.open( DatabaseConfig.databaseName() );
                            
                            isConnected = true;

                            callback( result );
                        }
                    });
                    }
                    //////////////////////////////////////////////////////////////////
                    else if( M.data.global("CONNECT_PAGE")  == "Y" && M.navigator.os("ios")  ){
                    	//WN2Common("ex2PluginShowBandList");
                    	setTimeout(function(){
                    		WN2Common("ex2PluginShowBandList");
                    	}, 500);
                    }
                }
            },
            
            initBandData: function(){
            	 M.fit.clock.set({
                     datetime:"NOW",
                     callback: function( result ) {
                    	 WN2Common("ex2PluginWriteBandInit");
                     }
                 });
            	
            },
            
            showBandListClose: function(){
            	setTimeout(function(){
            		WN2Common("ex2PluginShowBandListClose");
            	}, 500);
            	
            	//WN2Common("ex2PluginShowBandListClose");
            },
            
            

            pair: function( callback ) {
                self.unpair( function() {
                    self.connect( callback, true );    
                }, true );
            },

            unpair: function( callback, force ) {
                //debug.trace();

                $(".btn_setting").addClass("on");
                
                debug.log('###Blue Tooth Unpair ');
                debug.log('###Blue Tooth Unpair ',  force);
               
                if ( M.navigator.os("android") ) { force=true;}

                var bandUUID = self.deviceInfo().bandUUID();
                var onDisconnect = function(  ) {
                    debug.log('###Blue Tooth Unpair OnDisConnect');
                	self.deviceInfo().restoreData();
                    self.deviceInfo().set("paired_band_uuid", null);
                    self.deviceInfo().saveData();

                    if ( typeof callback === "function" ) {
                        callback( {
                            status: 'SUCCESS',
                            uuid: bandUUID
                        });
                    }
                };


                if ( force === true ) {
                    M.fit.bluetooth.unpair({
                        ondisconnect: function(  ) {
                            onDisconnect(  );
                        }
                    });
                }
                else {
                    onDisconnect(  );
                }
            },
            firmwareUpgrade: function( callback ) {
                debug.log( "FitManager -  firmwareUpgrade" );
                if ( this.deviceType() === "B" ) {
                        debug.log( "FitManager firmwareUpgrade START" );
                        M.fit.firmwareUpgrade( callback );
                }
                
            },	
            firmwareUpgradeReady: function( callback ) {
                debug.log( "FitManager -  firmwareUpgradeReady" );
                if ( this.deviceType() === "B" ) {
                        debug.log( "FitManager firmwareUpgradeReady START" );
                        M.fit.firmwareUpgradeReady( callback );
                }
                
            },
            firmwareVersion: function(callback){
            	 debug.log( "FitManager -  firmwareVersion" );
            	 if ( this.deviceType() === "B" ) {
                     M.fit.system.version(callback);
            	 }
            },
            historyTable: function( callback ) {
                debug.log( "FitManager -  historyTable" );

                if ( this.deviceType() === "B" ) {
                    this.connect( function(result) {
                        if ( result.error ) {
                            _synchronizeManager.cancel();

                            M.pop.instance( result.error  );
                            
                            callback({
                                "status": "FAIL",
                                "error": "Pairing is fail"
                            });
                            debug.log( "SynchronizeManager load history table fail..." );	
                            return;
                        }

                        debug.log( "SynchronizeManager load history table..." );

                        M.fit.historyTable( callback );
                    });
                }
                else {
                    M.motion.historyTable( callback );
                }
            },

            history: function( dateKey, callback ) {
                debug.log( "FitManager -  history", dateKey );

                if ( this.deviceType() === "B" ) {
                    debug.log( "FitManager.pairing for history " + dateKey + " ..." );

                    this.connect( function( result ) {
                        if ( result.error ) {
                            _synchronizeManager.cancel();

                            M.pop.instance( result.error  );
                            
                            callback({
                                "status": "FAIL",
                                "error": "Pairing is fail"
                            });
                            return;
                        }

                        M.fit.history({
                            date:[dateKey],
                            callback: function( result ) {
                                callback( result );
                            }
                        });
                    });
                }
                else {
                    M.motion.history({
                        date:[dateKey],
                        callback: function( result ) {
                            callback( result );
                        }
                    });
                }
            },

            updateProfile: function( result, callback ) {

                debug.log( "FitManager.updateProfile");

                self.connect(function( result ) {
                    if ( result.error ) {
                        //M.pop.instance( "Pairing is fail." );
                        callback();
                        return;
                    }

                    var age = self.profileInfo().age();
                    var bodyHeight = self.profileInfo().bodyHeight("CM");
                    var bodyWeight = self.profileInfo().bodyWeight("KG");
                    var gender = self.profileInfo().gender() == "M" ? "MALE" : "FEMALE";
                    
                    debug.log('profile- set age', age);
                    debug.log('profile- set bodyHeight', bodyHeight);
                    debug.log('profile- set bodyWeight', bodyWeight);
                    debug.log('profile- set gender', gender);

                    M.fit.profile.set({
                        age: age,
                        height: bodyHeight,
                        weight: bodyWeight,
                        gender: gender,
                        callback: function( result ) {
                        	debug.log('profile- set yn', result );
                            callback();
                        }
                    }); 
                });
            },

            updateGoal: function( result, callback ) {
                debug.log( "FitManager -  updateGoal", result );

                self.connect(function( result ) {
                    if ( result.error ) {
                        //M.pop.instance( "Pairing is fail." );
                        
                        callback();
                        return;
                    }

                    var goalStep = self.info().goalStep();
                    M.data.storage( "goal_step", goalStep);

                    M.fit.dailyStep.set({
                        step: goalStep,
                        callback: function( result ) {
                            callback();
                        }
                    }); 
                    
                });
            },

            updateHistory: function( result, callback ) {
                debug.log( "FitManager - updateHistory", result );

                callback( result );
            },

            updateDashboardWithSampleData: function( result ) {
                debug.log( "FitManager - updateDashboardWithSampleData", result );

            	_dashboard = result;

                self.profileInfo().data({
                    "user_profile_url": result.user_profile_url,
                    "user_birth": result.user_birth,
                    "gender": result.gender,
                    "body_height": typeof result.body_height == "string" ? result.body_height : result.body_height + "CM",
                    "body_weight": typeof result.body_weight == "string" ? result.body_weight : result.body_weight + "KG"
                });

                var fitInfo = {
                    "total_step": parseInt(result.total_steps),
                    "total_sleep": parseInt(result.total_sleeps),
                    "goal_step": parseInt(result.goal_step),
                    "goal_weight": typeof result.goal_weight == "string" ? result.goal_weight : result.goal_weight + "KG"
                };

                self.info().data(fitInfo);

                SampleDashboardDAO.truncate();
                SampleDashboardDAO.loadData( result.samples );
            },

            updateDashboardWithRebonData: function( result ) {
                debug.log( "FitManager - updateDashboardWithRebonData", result );
                
                CompositDAO.truncate();
                CompositDAO.loadData( result.composit );

                MeasureDAO.truncate();
                MeasureDAO.loadData( result.measures );

                //CompositInfo.data( result.composit );
                //MeasureInfo.data( result.measures );
            },

            isGoalCompleted: function() {
                var goalStep = self.info().goalStep();
                var todayStep = self.currentStep();

                return goalStep <= 0 ? false : ( todayStep >= goalStep ? true : false );
            },

            remainGoalStep: function() {
                var goalStep = M.data.storage("goal_step");
                var todayStep = self.currentStep();
                
                debug.log("hyjeon","골스텝이 얼마냐고 ? 2: " +  goalStep);

                return ( todayStep < goalStep ) ? goalStep - todayStep : 0;
            },

            sleepData: function( targetDate ) {
                return this.deviceInfo().sleepData( targetDate );
            },

            sleepTime: function() {
                var hour = this.deviceInfo().sleepTime("HOUR");
                var minute = this.deviceInfo().sleepTime("MINUTE");
                return hour * 60 + minute;
            },

            dashboardData: function() {
                FitInfo.sharedInfo().restoreData(true);
                ProfileInfo.sharedInfo().restoreData(true);

                var goalWeight = self.info().goalWeight("KG");
                var goalDiffWeight = goalWeight - self.profileInfo().bodyWeight("KG");
                var goalStep = self.info().goalStep();
                var todayStep = UI.Helper.Number.parseInt( self.currentStep() );
                var todayDistance = UI.Helper.Number.parseInt( self.currentDistance() );
                var todayCalorie = UI.Helper.Number.parseInt( self.currentCalorie() );
                var overGoalStep = ( todayStep > goalStep ) ? todayStep - goalStep : 0;
                var sleepDashboardData = self.sleepDashboardData();
                var sleepTimeData = sleepDashboardData.timeData.sleep;
                var sleepStatus = sleepDashboardData.status.toUpperCase(); 

                debug.warn( "sleepDashboardData", sleepDashboardData );

                var rebonNotice = [];

                if ( self.userInfo().isRebonUser() ) {
                    var bloodPressureData = self.bloodPressureData();
                    var bloodSugarData = self.bloodSugarData();

                    if ( bloodPressureData.lastData.status != "normal" ) {
                        var rebonMessage = "";

                        if ( bloodPressureData.lastData.status == "lower" ) {
                            rebonMessage = "혈압 수치 낮음";
                        }
                        else if ( bloodPressureData.lastData.status == "warn" ) {
                            rebonMessage = "혈압 수치 주의";
                        }
                        else if ( bloodPressureData.lastData.status == "high" ) {
                            rebonMessage = "혈압 수치 높음";
                        }
                        else if ( bloodPressureData.lastData.status == "danger" ) {
                            rebonMessage = "혈압 수치 위험";
                        }

                        if ( rebonMessage != "" ) {
                            rebonNotice.push({
                                message: rebonMessage,
                                link: "dashboard.blood.pressure.html"
                            });
                        }
                    }

                    if ( bloodSugarData.lastData.status != "normal" ) {
                        var rebonMessage = "";

                        if ( bloodSugarData.lastData.status == "lower" ) {
                            rebonMessage = "혈당 수치 낮음";
                        }
                        else if ( bloodSugarData.lastData.status == "warn" ) {
                            rebonMessage = "혈당 수치 주의";
                        }
                        else if ( bloodSugarData.lastData.status == "high" ) {
                            rebonMessage = "혈당 수치 높음";
                        }

                        if ( rebonMessage != "" ) {
                            rebonNotice.push({
                                message: rebonMessage,
                                link: "dashboard.blood.sugar.html"
                            });
                        }
                    }
                }

                var dashboardGoalWeight = goalWeight === 0 ? 0 : (goalDiffWeight == 0 ? goalWeight : goalDiffWeight);
                var dashboardGoalWeightType = goalWeight === 0 ? "목표체중 미설정" : (goalDiffWeight == 0 ? "목표 달성" : (goalDiffWeight > 0 ? "증량 목표" : "감량 목표"));
                var rebonFirstLink = "";
                var rebonSecondLink = "";

                var readyGoalInfo = SampleDashboardDAO.isLoaded() === false ? "ready" : "";
                var today = DataHelper.dateFormat("YYYY-MM-DD", "TODAY")
                
                var readySleepInfo = "";
                debug.log('self.userInfo().userDateCreated()', self.userInfo().userDateCreated());
                debug.log('TODAY', today);
                if(self.userInfo().userDateCreated() === today){  //회원가입일이 오는일경우, 과거데이터없음으로 수면데이터없음. 
                	readySleepInfo = "none";
                	//회원가입일이 당일이 아닌경우
                	// 1. 오래전에 가입했으나, 새로운밴드. :계산중-> '수면데이터없음'
                	// 2. 오래전에 가입했고, 기존밴드.  : 계산중 -> /status/hour/minute
                }else if(self.userInfo().userDateCreated() != today){ 
                		var _syncedQueue = [];
                    	
                		_syncedQueue= FitInfo.sharedInfo().getDeviceHistoryKey();
                		
                		//아직 밴드에서 히스토리키 테이블 로딩 전: 계산중
                		if(_syncedQueue === undefined ||  _syncedQueue === null){
                			readySleepInfo = sleepDashboardData.sleepCount === 0 ? "ready" : "";
                		// 밴드에서 히스토리키 테이블 로딩.
                		}else{
                        	var count=0;
                        	for ( var index in _syncedQueue ) {
                        	debug.log('1', _syncedQueue[index]);
                        	debug.log('2', this.sleepTargetDateKey());
        	                    var dateKey = _syncedQueue[index];
        	                    if ( dateKey === this.sleepTargetDateKey()) {
        	                    	count++;
        	                    }
                        	}
                        	debug.log('_syncedQueue count', count);
                        	//새로운밴드.
                        	if(count==0) {readySleepInfo = "none";}
                        	//기존 밴드.
                        	else{
                            	readySleepInfo = sleepDashboardData.sleepCount === 0 ? "ready" : "";
                            }
                		}
            	}
                debug.log('readySleepInfo', readySleepInfo);
            	var dashbordData = {
            		goal_weight: dashboardGoalWeight,
                    goal_weight_type: dashboardGoalWeightType,
                    goal_weight_noexist: goalWeight === 0 ? "dn" : "",
                    goal_step: self.numberFormat( goalStep ),
                    over_goal_step: self.numberFormat( overGoalStep ),
            		today_step: self.numberFormat( todayStep ),
            		today_distance: self.numberFormat( todayDistance ),
            		today_burn: self.numberFormat( todayCalorie ),

                    device_noexist: this.deviceType() === "B" ? "" : "dn",

                    sleep_result: sleepDashboardData.status.toUpperCase() + " SLEEP",
            		sleep_hour: sleepTimeData.hour,
            		sleep_minute: sleepTimeData.minute,
                    sleep_status: sleepStatus,

                    rebon_first_notice_noexist: ( rebonNotice.length >= 1 ) ? "" : "dn",
                    rebon_first_notice: ( rebonNotice.length >= 1 ) ? rebonNotice[0].message : "",
                    rebon_first_link: ( rebonNotice.length >= 1 ) ? rebonNotice[0].link : "",
                    rebon_first_autolink: ( rebonNotice.length >= 1 ) ? "auto-link" : "",
                    rebon_second_notice_noexist: ( rebonNotice.length == 2 ) ? "" : "dn",
                    rebon_second_notice: ( rebonNotice.length == 2 ) ? rebonNotice[1].message : "",
                    rebon_second_link: ( rebonNotice.length == 2 ) ? rebonNotice[1].link : "",
                    rebon_second_autolink: ( rebonNotice.length == 2 ) ? "auto-link" : "",

                    "ready_goal_info": readyGoalInfo,
                    "ready_sleep_info": readySleepInfo
            	};

                return dashbordData;
            },

            bloodPressureData: function() {
                var lastKey = "", lastData = {}, lastItem = null, recordKeys = [], recordData = {}, itemKeys = {};
                var statusInfo = function( data ) {
                    var status = "normal";
                    var comment = "";

                    if ( data.systolic == null || data.systolic == 0 ) {
                        status = "unknown";
                        comment = "";
                    }
                    else if ( data.systolic < 90 ) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "혈압 낮음";
                        }
                        else {
                            status = "lower";
                            comment = "수축기혈압 낮음";
                        }
                    }
                    else if (data.systolic>=90 && data.systolic<120) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "이완기혈압 낮음";
                        }
                        else if (data.diastolic>=60 && data.diastolic<80) {
                            status = "normal";
                            comment = "혈압 정상";
                        }
                        else if (data.diastolic>=80 && data.diastolic<90) {
                            status = "warn";
                            comment = "이완기혈압 조금 높음";
                        }
                        else if(data.diastolic>=90 && data.diastolic<100){
                            status = "hign";
                            comment = "이완기혈압 높음";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if (data.systolic>=120 && data.systolic<140) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 조금 높고, 이완기 혈압 낮음";
                        }
                        else if (data.diastolic>=60 && data.diastolic<80) {
                            status = "warn";
                            comment = "수축기혈압 조금 높음";
                        }
                        else if (data.diastolic>=80 && data.diastolic<90) {
                            status = "warn";
                            comment = "혈압 조금 높음";
                        }
                        else if (data.diastolic>=90 && data.diastolic<100){
                            status = "high";
                            comment = "이완기혈압 높음";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if (data.systolic>=140 && data.systolic<160) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 높고, 이완기혈압 낮음. <br />의료진 상담 필요";
                        }
                        else if(data.diastolic>=60 && data.diastolic<100){
                            status = "high";
                            comment = "혈압 높음. <br />의료진 상담 필요";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if ( data.systolic>=160 ) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 매우 높고, 이완기혈압 낮음. <br />의료진 상담 필요";
                        }
                        else if (data.diastolic>=60 && data.diastolic<100) {
                            status = "danger";
                            comment = "혈압 매우 높음. <br />의료진 상담 필요";
                        }
                        else {
                            status = "danger";
                            comment = "혈압 매우 높음. <br />즉시안정 및 의료진 상담 필요";
                        }
                    }

                    data.status = status;
                    data.comment = comment;

                    return data;
                };

                MeasureDAO.list( function( idx, item ) {
                    if ( item.type() == "BP" ) {
                        var recordKey = item.datetime();
                        var itemData = recordData[recordKey] ? recordData[recordKey] : { "systolic": 0, "diastolic": 0, "pulse": 0 };

                        if ( item.measure() == "systolic" ) {
                            itemData["systolic"] = item.value();
                        }
                        else if ( item.measure() == "diastolic" ) {
                            itemData["diastolic"] = item.value();
                        }
                        else if ( item.measure() == "pulse" ) {
                            itemData["pulse"] = item.value();
                            return;
                        }

                        if ( ! UI.Helper.Array.inArray( recordKeys, recordKey ) ) {
                            recordKeys.push(recordKey);
                        }

                        recordData[recordKey] = itemData;
                        itemKeys[recordKey] = item;
                    }
                });

                recordKeys = recordKeys.sort();

                if ( recordKeys.length > 7 ) {
                    recordKeys = recordKeys.slice( recordKeys.length-7, recordKeys.length);
                }

                lastKey = recordKeys.length > 0 ? recordKeys[recordKeys.length-1] : "";

                if ( lastKey != "" ) {
                    lastItem = itemKeys[lastKey];
                    lastData = recordData[lastKey];

                    lastData.date = lastItem.dateKey();
                    lastData["systolic"] = recordData[lastKey]["systolic"];
                    lastData["diastolic"] = recordData[lastKey]["diastolic"];
                    lastData["pulse"] = recordData[lastKey]["pulse"];
                }
                else {
                    lastData.date = null;
                    lastData["systolic"] = null;
                    lastData["diastolic"] = null;
                    lastData["pulse"] = null;
                }

                return {
                    lastData: statusInfo(lastData),
                    dateKeys: recordKeys,
                    data: recordData
                };
            },

            bloodSugarData: function( ) {
                var statusInfo = function( data ) {
                    var 
                    commentLower = "오렌지주스 반컵이나 사탕 3개 섭취",
                    commentHigher = "생활습관 관리 필요",
                    status = "normal", 
                    statusText = "", 
                    comment = "";

                    if (data.measure == "before") {
                        if ( data.value < 60 ) {
                            status = "lower";
                            statusText = "저혈당";
                            comment = commentLower;
                        }
                        else if ( data.value >= 60 && data.value < 100 ) {
                            status = "normal";
                            statusText = "정상";
                            comment = "";
                        }
                        else if ( data.value >=100 && data.value < 126 ) {
                            status = "warn";
                            statusText = "주의";
                            comment = commentHigher;
                        }
                        else {
                            status = "high";
                            statusText = "높음";
                            comment = commentHigher;
                        }
                    }
                    else if (data.measure == "after" || data.measure == "after2") { 
                        if ( data.value < 60 ) {
                            status = "lower";
                            statusText = "저혈당";
                            comment = commentLower;
                        }
                        else if ( data.value >= 60 && data.value < 140 ) {
                            status = "normal";
                            statusText = "정상";
                            comment = "";
                        }
                        else if(data.value>=140 && data.value < 200) {
                            status = "warn";
                            statusText = "주의";
                            comment = commentHigher;
                        }
                        else {
                            status = "high";
                            statusText = "높음";
                            comment = commentHigher;
                        }
                    }

                    data.status = status;
                    data.statusText = statusText;
                    data.comment = comment;
                    
                    return data;
                };

                var lastData = {};

                var beforeData = (function() {
                    var lastKey = "", lastData = {}, lastItem = null, recordKeys = [], recordData = {}, itemKeys = {};

                    MeasureDAO.list( function( idx, item ) {
                        if ( item.type() == "BS" ) {
                            var recordKey = item.datetime();
                            var itemData = recordData[recordKey] || { "value": null, "measure": null };

                            if ( item.measure() == "before" ) {
                                itemData["measure"] = "before";
                                itemData["value"] = item.value();
                            }
                            else {
                                return;
                            }

                            if ( ! UI.Helper.Array.inArray( recordKeys, recordKey ) ) {
                                recordKeys.push(recordKey);
                            }

                            itemData = statusInfo(itemData);

                            recordData[recordKey] = itemData;
                            itemKeys[recordKey] = item;
                        }
                    });

                    recordKeys = recordKeys.sort();

                    if ( recordKeys.length > 7 ) {
                        recordKeys = recordKeys.slice( recordKeys.length-7, recordKeys.length);
                    }

                    lastKey = recordKeys.length > 0 ? recordKeys[recordKeys.length-1] : "";

                    if ( lastKey != "" ) {
                        lastItem = itemKeys[lastKey];
                        lastData = recordData[lastKey];

                        lastData.date = lastItem.dateKey();
                        lastData.measure = lastItem.measure() == "after2" ? "after" : lastItem.measure();
                        lastData.value = lastItem.value();
                    }
                    else {

                        lastData.date = "0000-00-00";
                        lastData.measure = null;
                        lastData.value = null;
                    }

                    return {
                        lastData: lastData,
                        dateKeys: recordKeys,
                        data: recordData
                    };
                })();

                var afterData = (function() {
                    var lastKey = "", lastData = {}, lastItem = null, recordKeys = [], recordData = {}, itemKeys = {};

                    MeasureDAO.list( function( idx, item ) {
                        if ( item.type() == "BS" ) {
                            var recordKey = item.datetime();
                            var itemData = recordData[recordKey] || { "value": null, "measure": null };

                            if ( item.measure() == "after" || item.measure() == "after2" ) {
                                itemData["measure"] = "after";
                                itemData["value"] = item.value();
                            }
                            else {
                                return;
                            }

                            if ( ! UI.Helper.Array.inArray( recordKeys, recordKey ) ) {
                                recordKeys.push(recordKey);
                            }

                            itemData = statusInfo(itemData);

                            recordData[recordKey] = itemData;
                            itemKeys[recordKey] = item;
                        }
                    });

                    recordKeys = recordKeys.sort();

                    if ( recordKeys.length > 7 ) {
                        recordKeys = recordKeys.slice( recordKeys.length-7, recordKeys.length);
                    }

                    lastKey = recordKeys.length > 0 ? recordKeys[recordKeys.length-1] : "";

                    if ( lastKey != "" ) {
                        lastItem = itemKeys[lastKey];
                        lastData = recordData[lastKey];

                        lastData.date = lastItem.dateKey();
                        lastData.measure = lastItem.measure() == "after2" ? "after" : lastItem.measure();
                        lastData.value = lastItem.value();
                    }
                    else {

                        lastData.date = "0000-00-00";
                        lastData.measure = null;
                        lastData.value = null;
                    }

                    return {
                        lastData: lastData,
                        dateKeys: recordKeys,
                        data: recordData
                    };
                })();

                if ( beforeData.lastData.date <= afterData.lastData.date ) {
                    lastData = afterData.lastData;
                }
                else if ( beforeData.lastData.date > afterData.lastData.date ) {
                    lastData = beforeData.lastData;
                }

                return {
                    "lastData": lastData,
                    "before": beforeData,
                    "after": afterData
                };
            },

            bodyCompositionData: function() {
                var lastKey = "", lastData = {}, lastItem = null, recordKeys = [], recordData = {}, itemKeys = {};
                
                CompositDAO.list( function( idx, item ) {
                    var recordKey = item.code();
                    var itemData =  {
                        "date": item.datetime(),
                        "weight": item.weight(),
                        "fatRate": item.fatRate(),
                        "muscle": item.muscle()
                    };

                    if ( ! UI.Helper.Array.inArray( recordKeys, recordKey ) ) {
                        recordKeys.push(recordKey);
                    }

                    recordData[recordKey] = itemData;
                    itemKeys[recordKey] = item;
                });

                recordKeys = recordKeys.sort();

                if ( recordKeys.length > 7 ) {
                    recordKeys = recordKeys.slice( recordKeys.length-7, recordKeys.length);
                }

                lastKey = recordKeys.length > 0 ? recordKeys[recordKeys.length-1] : "";

                if ( lastKey != "" ) {
                    lastItem = itemKeys[lastKey];
                    lastData = recordData[lastKey];

                    lastData.weight = lastItem.weight();
                    lastData.fatRate = lastItem.fatRate();
                    lastData.muscle = lastItem.muscle();
                }
                else {
                    lastData.date = null;
                    lastData.weight = null;
                    lastData.fatRate = null;
                    lastData.muscle = null;
                }

                return {
                    lastData: lastData,
                    dateKeys: recordKeys,
                    data: recordData
                };
            },

            burnTodayData: function() {
                var todayBurn = self.currentCalorie();

                return {
                    value: todayBurn
                };
            },

            burnCumulativelyData: function() {
                var totalStep = self.stepCumulativelyData().value;
                var totalCalories = self.caloriesBySteps( totalStep );

                return {
                    value: totalCalories
                };
            },

            burnWeeklyData: function() {
                var goalData = self.caloriesByGoalStep();
                var currentCalorie = self.currentCalorie();
                var dateKeys = self.thisWeeklyKeys();
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EWS");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var todayWeekKey = "";
                var recordData = {};
                var recordKeys = [];
                var totalData = 0;
                var averageData = 0;
                var userData = {};

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var weekKey = weekKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "weekKey": weekKey,
                        "goal": 0,
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[weekKey] =  recordData[dateKey] = itemData;

                    userData[weekKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }

                    if ( todayDateKey == dateKey ) {
                        var goalStep = self.info().goalStep();
                        var step = self.currentStep();

                        todayWeekKey = weekKey;
                        itemData.goal = goalData;
                        itemData.value = currentCalorie;
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        userData[todayWeekKey] = itemData.value;
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var calories = self.caloriesBySteps( step );
                        var itemData = recordData[dateKey];
                        
                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.goal = self.caloriesBySteps( goalStep );
                        itemData.value = Math.max( itemData.value, calories );
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        
                        recordData[dateKey] = itemData;
                        userData[itemData.weekKey] = itemData.value; 
                    }
                });

                for ( var dateKey in userData ) {
                    var itemData = recordData[dateKey];
                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                return {
                    goalData: goalData,
                    today: todayWeekKey,
                    target: targetWeekKey,
                    userData: userData,

                    totalData: totalData,
                    averageData: averageData,
                    dateKeys: dateKeys,
                    weekKeys: weekKeys,
                    targetWeekKey: targetWeekKey,
                    targetDateKey: targetDateKey,
                    todayDateKey: todayDateKey,
                    todayWeekKey: todayWeekKey,
                    data: recordData
                };
            },

            burnMonthlyData: function() {
                var goalData = self.caloriesByGoalStep();
                var dateKeys = self.thisMonthlyKeys();
                var currentCalorie = self.currentCalorie();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var recordData = {};
                var userData = {};
                var totalData = 0;
                var averageData = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "value": 0,
                        "goal": 0,
                        "status": "nodata"
                    };

                    recordData[dateKey] = itemData;
                    userData[dateKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        var goalStep = self.info().goalStep();
                        var step = self.currentStep();
                        
                        itemData.goal = goalData;
                        itemData.value = currentCalorie;
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        userData[todayDateKey] = itemData.value;
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var calories = self.caloriesBySteps( step );
                        var itemData = recordData[dateKey];
                        
                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.goal = self.caloriesBySteps( goalStep );
                        itemData.value = Math.max( itemData.value, calories );
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        
                        recordData[dateKey] = itemData;
                        userData[dateKey] = itemData.value; 
                    }
                });

                for ( var dateKey in recordData ) {
                    var itemData = recordData[dateKey];
                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                return {
                    goalData: goalData,
                    today: todayDateKey,
                    target: targetDateKey,
                    userData: userData,
                    totalData: totalData,
                    averageData: averageData,
                    dateKeys: dateKeys,
                    targetDateKey: targetDateKey,
                    todayDateKey: todayDateKey,
                    data: recordData
                };
            },

            distanceCumulativelyData: function() {
                var totalStep = self.stepCumulativelyData().value;
                debug.log('distanceCumulativelyData totalStep', totalStep);
                var totalDistance = self.distancesBySteps( totalStep );
                debug.log('distanceCumulativelyData totalDistance', totalDistance);
                return {
                    value: totalDistance
                };
            },

            distanceWeeklyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = self.distancesByGoalStep();
                var currentDistance = self.currentDistance();
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EWS");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var todayWeekKey = "";
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var recordData = {};
                var userData = {};
                var totalData = 0;
                var averageData = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var weekKey = weekKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "weekKey": weekKey,
                        "goal": 0,
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[weekKey] = recordData[dateKey] = itemData;

                    userData[weekKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        var goalStep = self.info().goalStep();
                        var step = self.currentStep();

                        todayWeekKey = weekKey;
                        itemData.goal = goalData;
                        itemData.value = currentDistance;
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        userData[todayWeekKey] = itemData.value;
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var distance = self.distancesBySteps( step );
                        var itemData = recordData[dateKey];
                        
                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.goal = self.distancesBySteps( goalStep );
                        itemData.value = Math.max( itemData.value, distance );
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        
                        recordData[dateKey] = itemData;
                        userData[itemData.weekKey] = itemData.value; 
                    }
                });

                for ( var dateKey in recordData ) {
                    var itemData = recordData[dateKey];
                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                return {
                    goalData: goalData,
                    today: todayWeekKey,
                    target: targetWeekKey,
                    userData: userData,
                    totalData: totalData,
                    averageData: averageData,
                    dateKeys: dateKeys,
                    weekKeys: weekKeys,
                    targetDateKey: targetDateKey,
                    targetWeekKey: targetWeekKey,
                    todayDateKey: todayDateKey,
                    todayWeekKey: todayWeekKey,
                    data: recordData
                };
            },

            distanceMonthlyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = self.distancesByGoalStep();
                var currentDistance = self.currentDistance();
                debug.log('currentDistance', currentDistance);
                var dateKeys = self.thisMonthlyGroupKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var dateGroupKeys = [];
                var recordData = {};
                var recordGroupData = {};
                var userData = {};
                var totalData = 0;
                var averageData = 0;
                var cumulativelyData = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "average": 0,
                        "goal": 0,
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[dateKey] = itemData;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        var goalStep = self.info().goalStep();
                        var step = self.currentStep();
                        
                        itemData.average = 0;
                        itemData.goal = goalData;
                        itemData.value = currentDistance;
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        userData[todayDateKey] = itemData;
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var distance = self.distancesBySteps( step );
                        var itemData = recordData[dateKey];
                        
                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.average = Math.max( itemData.average, item.average() );
                        itemData.goal = self.distancesBySteps( goalStep );
                        itemData.value = Math.max( itemData.value, distance );
                        debug.log('itemData.value', itemData.value);
                        debug.log('distance', distance);
                        itemData.status = step > 0 && step >= goalStep ? "ok" : "failure";
                        
                        recordData[dateKey] = itemData;
                        userData[dateKey] = itemData.value; 
                    }
                });

                var groupData = [];
                var groupItems = [];

                for ( var g=0; g<dateKeys.length; g++ ) {
                    var dateKey = dateKeys[g];
                    var itemData = recordData[dateKey];
                    groupItems.push( itemData );

                    if ( g == (dateKeys.length-1) ) {
                        groupData.push( groupItems );
                        groupItems = null;
                    }
                    else if ( groupItems.length == 7 ) {
                        groupData.push( groupItems );
                        groupItems = [];
                    }
                }

                for ( var groupIndex=0; groupIndex<groupData.length; groupIndex++ ) {
                    var groupItems = groupData[groupIndex];
                    var dateGroupKey = (groupIndex + 1) + "W";
                    var sumValue = 0;
                    	
                    for ( var j=0; j<groupItems.length; j++ ) {
                        var itemData = groupItems[j];
                        if ( !(itemData.value == null || itemData.value == 0 || isNaN(itemData.value)) ) {
                            sumValue += itemData.value;
                        	debug.log('itemData', itemData.value);
                            debug.log('sumValue', sumValue);
                        }
                    }

                    dateGroupKeys.push( dateGroupKey );

                    recordGroupData[dateGroupKey] = {
                        "dateGroupKey": dateGroupKey,
                        "value": sumValue
                    };

                    userData[dateGroupKey] = sumValue;
                }

                for ( var dateKey in recordData ) {
                    var itemData = recordData[dateKey];
                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                dateKeys = self.sortKeys( dateGroupKeys, function( d1, d2 ) {
                    if ( d1 > d2 ) { 
                        return 1;
                    }
                    else if ( d1 < d2 ) { 
                        return -1;
                    }
                    return 0;
                }, -1);

                return {
                    goalData: goalData,
                    today: todayDateKey,
                    target: targetDateKey,
                    userData: userData,

                    cumulativelyData: totalData,
                    totalData: totalData,
                    averageData: averageData,
                    dateGroupKeys: dateGroupKeys,
                    targetDateKey: targetDateKey,
                    todayDateKey: todayDateKey,
                    data: recordGroupData
                };
            },

            stepCumulativelyData: function() {
                var totalStep = self.info().totalStep();
                var weeklyData = self.stepWeeklyData().totalData;
                var monthlyData = self.stepMonthlyData().totalData;
                var currentStep = self.currentStep();
                var cumulativeData = Math.max(totalStep, weeklyData, monthlyData);
                
                return {
                    value: isNaN(cumulativeData) || 0 ? currentStep : cumulativeData
                };
            },

            stepWeeklyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = goalStep;
                var currentStep = self.currentStep();
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EWS");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var todayWeekKey = "";
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var recordData = {};
                var userData = {};
                var totalData = 0;
                var averageData = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var weekKey = weekKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "weekKey": weekKey,
                        "average": 0,
                        "goal": 0,
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[weekKey] = recordData[dateKey] = itemData;

                    userData[weekKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        todayWeekKey = weekKey;
                        itemData.goal = goalData;
                        itemData.value = currentStep;
                        itemData.status = currentStep > 0 && currentStep >= goalData ? "ok" : "failure";
                        userData[todayWeekKey] = itemData.value; 
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.average = Math.max( itemData.average, item.average() );
                        itemData.goal = goalStep;
                        itemData.value = Math.max( itemData.value, step );
                        itemData.status = itemData.value > 0 && itemData.value>= goalStep ? "ok" : "failure";

                        recordData[dateKey] = itemData;
                        userData[itemData.weekKey] = itemData.value;
                    }
                });

                for ( var weekKey in userData ) {
                    var itemData = recordData[weekKey];

                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                return {
                    goalData: goalData,
                    today: todayWeekKey,
                    target: targetWeekKey,
                    userData: userData,

                    totalData: totalData,
                    averageData: averageData,
                    dateKeys: dateKeys,
                    weekKeys: weekKeys,
                    todayDateKey: todayDateKey,
                    todayWeekKey: todayWeekKey,
                    targetDateKey: targetDateKey,
                    targetWeekKey: targetWeekKey,
                    data: recordData
                };
            },

            stepMonthlyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = goalStep;
                var currentStep = self.currentStep();
                var dateKeys = self.thisMonthlyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var recordData = {};
                var userData = {};
                var totalData = 0;
                var averageData = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "average": 0,
                        "goal": 0,
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[dateKey] = itemData;

                    userData[dateKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        itemData.goal = goalData;
                        itemData.value = currentStep;
                        itemData.status = currentStep > 0 && goalData > 0 && currentStep >= goalData ? "ok" : "failure";
                        userData[todayDateKey] = itemData.value; 
                        break;
                    }
                }

                SampleDashboardDAO.list( "STEP", function( idx, item ) {
                    
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var goalStep = item.goalStep();
                        var step = item.step();
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( todayDateKey == dateKey ) {
                            return;
                        }

                        itemData.average = Math.max( itemData.average, item.average() );
                        itemData.goal = goalStep;
                        itemData.value = Math.max( itemData.value, step );
                        itemData.status = itemData.value > 0 && itemData.value >= goalStep ? "ok" : "failure";

                        recordData[dateKey] = itemData;
                        userData[dateKey] = itemData.value;
                    }
                });

                for ( var dateKey in recordData ) {
                    var itemData = recordData[dateKey];
                    if ( ! (itemData.value == null || itemData.value < 0 || isNaN(itemData.value)) ) {
                        totalData += itemData.value;
                    }
                }

                averageData = ( totalData <= 0 ) ? 0 : Math.round( totalData / dateKeys.length );

                return {
                    goalData: goalData,
                    today: todayDateKey,
                    target: targetDateKey,
                    userData: userData,

                    totalData: totalData,
                    averageData: averageData,
                    dateKeys: dateKeys,
                    todayDateKey: todayDateKey,
                    targetDateKey: targetDateKey,
                    data: recordData
                };
            },

            sleepTargetDateKey: function() {
                var now = new Date();
                var wakeTime = DataHelper.convertDate( DataHelper.dateFormat("YYYY-MM-DD", "TODAY") + "T" + DeviceInfo.sharedInfo().sleepEnd() );

                if ( now.getTime() < wakeTime.getTime() ) {
                    return DataHelper.dateFormat("YYYY-MM-DD", "-1D");
                }

                return DataHelper.dateFormat("YYYY-MM-DD", "-0D");
            },

            sleepDashboardData: function() {
                return self.sleepYesterdayData();
            },

            sleepYesterdayData: function() {
                   
                // 인터페이스 함수 추가
                //
                   
                var targetDateKey = this.sleepTargetDateKey();
                debug.log('sleepYesterdayData :targetDateKey', targetDateKey);
                var userData = [];
                var badKeys = [];
                var sosoKeys = [];
                
                var sleepStatus = "unknown";
                var sleepItem = SampleGroupDAO.item( targetDateKey );
                
                var userData = [];

                if ( ! sleepItem || sleepItem.sleepCount() === 0 ) {
                    return {
                        status: sleepStatus,
                        sosoValue: FitConfig.sleepSosoValue(),
                        badValue: FitConfig.sleepBadValue(),
                        badKeys: [],
                        sosoKeys: [],
                        sleepCount: 0,
                        sleepValue: 0,
                        time: {
                            bad: 0,
                            soso: 0,
                            good: 0,
                            sleep: 0,
                            total: 0
                        },
                        timeData: {
                            goodCount: 0,
                            badCount: 0,
                            sosoCount: 0,
                            total: self.timeDataByMinute( 0 ),
                            sleep: self.timeDataByMinute( 0 ),
                            good: self.timeDataByMinute( 0 ),
                            soso: self.timeDataByMinute( 0 ),
                            bad: self.timeDataByMinute( 0 )
                        },
                        deviceInfo: {
                            sleepStart: DeviceInfo.sharedInfo().sleepStart(),
                            sleepEnd: DeviceInfo.sharedInfo().sleepEnd()
                        },
                        userData: userData
                    };
                }

                var sleepData = sleepItem.sleepData();
                //debug.log('sleepYesterdayData', sleepData);
                   
                // 세부 데이타 추출
                var items = sleepItem.sleepSamples( function( idx, item ) {
                                                   
                                                   
                                                   
                	 // debug.log('sleepYesterdayData items', items);
                    var timeKey = item.timeKey( sleepData.startDate.getTime() );
                                                   
                                                   

                    if ( item.value() >= FitConfig.sleepBadValue() ) {
                        badKeys.push( item );
                    }
                    else if ( item.value() >= FitConfig.sleepSosoValue() ) {
                        sosoKeys.push( item );
                    }
                    userData[timeKey*0.5] = item.value() > 0 ? item.value() : 0;
                });
                   

                var goodCount = sleepItem.goodCount();
                var sosoCount = sleepItem.sosoCount();
                var badCount = sleepItem.badCount();
                var sleepCount = sleepItem.sleepCount();
                var sleepValue = sleepItem.sleepValue();

                var goodTime =  goodCount * 2;
                var sosoTime = sosoCount * 2;
                var badTime = badCount * 2;

                var sleepTime = goodTime + sosoTime;
                var totalTime = sleepData.total * 2;

                sleepStatus = sleepItem.sleepStatus();

                return {
                    status: sleepStatus,
                    sosoValue: FitConfig.sleepSosoValue(),
                    badValue: FitConfig.sleepBadValue(),
                    badKeys: badKeys,
                    sosoKeys: sosoKeys,
                    sleepValue: sleepValue,
                    sleepCount: sleepCount,
                    totalCount: sleepData.total,
                    time: {
                        bad: badTime,
                        soso: sosoTime,
                        good: goodTime,
                        sleep: sleepTime,
                        total: totalTime
                    },
                    timeData: {
                        goodCount: goodCount,
                        badCount: badCount,
                        sosoCount: sosoCount,
                        total: self.timeDataByMinute( totalTime ),
                        sleep: self.timeDataByMinute( sleepTime ),
                        good: self.timeDataByMinute( goodTime ),
                        soso: self.timeDataByMinute( sosoTime ),
                        bad: self.timeDataByMinute( badTime )
                    },
                    deviceInfo: {
                        sleepStart: sleepData.sleepStart,
                        sleepEnd: sleepData.sleepEnd
                    },
                    userData: userData
                };
            },
            
            synchManually : function( callback ){
            	
            	  M.execute("wnManualSynch",{
	                	manualSynchCallback: M.response.on( function( result ) {
       					  debug.log("hyjeon","스크립트 까지 싱크 완료 listener 왔습니다. ");
       					  /*callback();*/
       					  
						}).toString()}
                  );
            	
            	
            },
            
            
            sleepYesterdayDataByHTTP: function( callback ){
            	
            	 var targetDateKey = this.sleepTargetDateKey();
                 var userData = new Array();
                 var samplebadKeys = [];
                 var samplesosoKeys = [];
                 var sleepStatus = "unknown";
                 var sleepItem;
                 debug.log('hyjeon','어제 (혹은 가장 최근) 의 수면 정보 :' + targetDateKey);
                 var popupController = PopupController.sharedInstance();
                _controller.execute("fit.sleep.yesterday", {}, {
                     showIndicator:false,
                     callback: function( event ) { 
                         if ( event.error ) {
                             debug.warn( "SynchronizeManager error loading summary from server - ", event.error );
                             popupController.toast( event.error );
                             popupController.confirm(
                                 "데이타를 가져올 수 없습니다.\n다시 시도하시겠습니까", 
                                 ["취소", "다시 시도"],
                                 function( buttonIndex ) {
                                     if ( buttonIndex === 1 ) {
                                         _controller.retry( event );
                                     }
                                     else {
                                         self.cancelUpdate();
                                     }
                                 }
                             );
                             return;
                         }
                         
                         	
                     	debug.log("******************************************");
						debug.log("status:        							  " + event.result.status);
						debug.log("sosoValue:       					" + event.result.sosoValue);
						debug.log("badValue:       						 " + event.result.badValue);
						debug.log("badKeys:      						  " + event.result.badKeys);
						debug.log("디바이스인포의 sleepEnd :       " + event.result.deviceInfo.sleepEnd);
						debug.log("디바이스 인포의 sleepStart :     " + event.result.deviceInfo.sleepStart);
						debug.log("sleepCount:     					   " + event.result.sleepCount);
						debug.log("sleepValue:      					   " + event.result.sleepValue);
						debug.log("sosoKeys:        							 " + event.result.sosoKeys);
						debug.log("sosoValue:      							 " + event.result.sosoValue);
						debug.log("time_bad:             					  " + event.result.time.bad);
						debug.log("time_good:           				      " + event.result.time.good);
						debug.log("time_sleep:              			     " + event.result.time.sleep);
						debug.log("time_soso:               				  " + event.result.time.soso);
						debug.log("time_total:             				     " + event.result.time.total);
						debug.log("타임데이타의 bad  시간:     			  " + event.result.timeData.bad.hour);
						debug.log("타임데이타의 bad   분:   				 " + event.result.timeData.bad.minute);
						debug.log("타임데이타의 bad   '타임':			  " + event.result.timeData.bad.time);
						debug.log("타임데이타의 badCount    			   " + event.result.timeData.badCount);
						debug.log("타임데이타의 good 시간:      		  " + event.result.timeData.good.hour);
						debug.log("타임데이타의 good  분:      			  " + event.result.timeData.good.minute);
						debug.log("타임데이타의 good  '타임':      		  " + event.result.timeData.good.time);
						debug.log("타임데이타의 goodCount:   			" + event.result.timeData.goodCount);
						debug.log("타임데이타의 sleep:      				   " + event.result.timeData.sleep.hour);
						debug.log("타임데이타의 sleep:      				   " + event.result.timeData.sleep.minute);
						debug.log("타임데이타의 sleep:      				   " + event.result.timeData.sleep.time);
						debug.log("타임데이타의 soso:       				   " + event.result.timeData.soso.hour);
						debug.log("타임데이타의 soso:       				   " + event.result.timeData.soso.minute);
						debug.log("타임데이타의 soso:       				   " + event.result.timeData.soso.time);
						debug.log("타임데이타의 soso 카운트:      				 " + event.result.timeData.sosoCount);
						debug.log("타임데이타의 total:       				   " + event.result.timeData.total.hour);
						debug.log("타임데이타의 total:      				   " + event.result.timeData.total.minute);
						debug.log("타임데이타의 total:       				   " + event.result.timeData.total.time);
						debug.log("userData는 Array[0]입니다.:         " + event.result.userData);
						debug.log("********************************************");

						var items = event.result;
                         
                         var itemData;
                         debug.warn( "Sync Load Summary - items ", items );
                         
                         if(M.navigator.os("android")) {
                        	 
                        	 M.execute("wnGetSleepSamples",{
          	                	paramData:"",          	                	
          	                	databaseCallback: M.response.on(function( result ) {
      	        					if ( result.error ) {
      	        						return;
      	        					}
      	        					var list = result["sampleItems"];
      	        				
      	        					for ( var i=0; i< list.length; i++ ) {
      	        	             	   var itemData = list[i];
      	        	                   var value =   	itemData["SAMPLE_VALUE"];
      	        	                   var datetime = 	itemData["SAMPLE_DATETIME"];
       	   	                           if ( value >= FitConfig.sleepBadValue() ) {
       	   	                        	samplebadKeys.push( itemData );
       	   	                           }else if ( value >= FitConfig.sleepSosoValue() ) {
       	   	                        	samplesosoKeys.push( itemData );
       	   	                           }
       	   	                           userData.push( value );
      	        	                 }

          	                         var data =  {
          	                             status: event.result.status,
          	                             sosoValue: FitConfig.sleepSosoValue(),
          	                             badValue: FitConfig.sleepBadValue(),
          	                             badKeys: samplebadKeys,
          	                             sosoKeys: samplesosoKeys,
          	                             sleepValue: event.result.sleepValue,
          	                             sleepCount: event.result.sleepCount,
          	                             totalCount: event.result.sleepCount,
          	                             time: {
          	                                 bad: event.result.time.bad,
          	                                 soso: event.result.time.soso,
          	                                 good: event.result.time.good,
          	                                 sleep: event.result.time.sleep,
          	                                 total: event.result.time.total
          	                             },
          	                             timeData: {
          	                                 goodCount: event.result.timeData.goodCount,
          	                                 badCount: event.result.timeData.badCount,
          	                                 sosoCount: event.result.timeData.sosoCount,
          	                                 total: {
          	                                	 		hour:event.result.timeData.total.hour,
          	                                	 	    minute:event.result.timeData.total.minute,
          	                                	 	    time:event.result.timeData.total.time
          	                                 		},
          	                                 sleep: {
     		        	                                	hour:event.result.timeData.sleep.hour,
     	     	                                	 	    minute:event.result.timeData.sleep.minute,
     	     	                                	 	    time:event.result.timeData.sleep.time
          	                                 		},
          	                                 good: {
     		        	                                	hour:event.result.timeData.good.hour,
     	     	                                	 	    minute:event.result.timeData.good.minute,
     	     	                                	 	    time:event.result.timeData.good.time
          	                                 	   },
          	                                 soso: {
     		        	                                	hour:event.result.timeData.soso.hour,
     	     	                                	 	    minute:event.result.timeData.soso.minute,
     	     	                                	 	    time:event.result.timeData.soso.time
          	                                 	   },
          	                                 bad:  {
     		        	                                	hour:event.result.timeData.bad.hour,
     	     	                                	 	    minute:event.result.timeData.bad.minute,
     	     	                                	 	    time:event.result.timeData.bad.time
          	                                 	   }
          	                             },
          	                             deviceInfo: {
          	                                 sleepStart: DeviceInfo.sharedInfo().sleepStart(),
          	                                 sleepEnd: DeviceInfo.sharedInfo().sleepEnd()
          	                             },
          	                             userData: userData
          	                         };
          	                         
          	                         callback(data);
          	                         
        						}).toString()}
                             );                        	 
                         }
                         else {
                        	 
                        	 M.execute("wnGetSleepSamples",{
           	                	paramData:"",
           	                	sleepStartTime:DeviceInfo.sharedInfo().sleepStart(),
           	                	sleepEndTime:DeviceInfo.sharedInfo().sleepEnd(),
           	                	databaseCallback: M.response.on(function( result ) {
       	        					if ( result.error ) {
       	        						return;
       	        					}
       	        					var list = result["sampleItems"];
       	        				
       	        					for ( var i=0; i< list.length; i++ ) {
       	        	             	   var itemData = list[i];
       	        	                   var value =   	itemData["SAMPLE_VALUE"];
       	        	                   var datetime = 	itemData["SAMPLE_DATETIME"];
        	   	                           if ( value >= FitConfig.sleepBadValue() ) {
        	   	                        	samplebadKeys.push( itemData );
        	   	                           }else if ( value >= FitConfig.sleepSosoValue() ) {
        	   	                        	samplesosoKeys.push( itemData );
        	   	                           }
        	   	                           userData.push( value );
       	        	                 }

           	                         var data =  {
           	                             status: event.result.status,
           	                             sosoValue: FitConfig.sleepSosoValue(),
           	                             badValue: FitConfig.sleepBadValue(),
           	                             badKeys: samplebadKeys,
           	                             sosoKeys: samplesosoKeys,
           	                             sleepValue: event.result.sleepValue,
           	                             sleepCount: event.result.sleepCount,
           	                             totalCount: event.result.sleepCount,
           	                             time: {
           	                                 bad: event.result.time.bad,
           	                                 soso: event.result.time.soso,
           	                                 good: event.result.time.good,
           	                                 sleep: event.result.time.sleep,
           	                                 total: event.result.time.total
           	                             },
           	                             timeData: {
           	                                 goodCount: event.result.timeData.goodCount,
           	                                 badCount: event.result.timeData.badCount,
           	                                 sosoCount: event.result.timeData.sosoCount,
           	                                 total: {
           	                                	 		hour:event.result.timeData.total.hour,
           	                                	 	    minute:event.result.timeData.total.minute,
           	                                	 	    time:event.result.timeData.total.time
           	                                 		},
           	                                 sleep: {
      		        	                                	hour:event.result.timeData.sleep.hour,
      	     	                                	 	    minute:event.result.timeData.sleep.minute,
      	     	                                	 	    time:event.result.timeData.sleep.time
           	                                 		},
           	                                 good: {
      		        	                                	hour:event.result.timeData.good.hour,
      	     	                                	 	    minute:event.result.timeData.good.minute,
      	     	                                	 	    time:event.result.timeData.good.time
           	                                 	   },
           	                                 soso: {
      		        	                                	hour:event.result.timeData.soso.hour,
      	     	                                	 	    minute:event.result.timeData.soso.minute,
      	     	                                	 	    time:event.result.timeData.soso.time
           	                                 	   },
           	                                 bad:  {
      		        	                                	hour:event.result.timeData.bad.hour,
      	     	                                	 	    minute:event.result.timeData.bad.minute,
      	     	                                	 	    time:event.result.timeData.bad.time
           	                                 	   }
           	                             },
           	                             deviceInfo: {
           	                                 sleepStart: DeviceInfo.sharedInfo().sleepStart(),
           	                                 sleepEnd: DeviceInfo.sharedInfo().sleepEnd()
           	                             },
           	                             userData: userData
           	                         };
           	                         
           	                         callback(data);
           	                         
         						}).toString()}
                              );                          	 
                         }
                        
                     }
                 });
            },

            sleepWeeklyData: function() {
                
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = this.sleepTargetDateKey();
                var targetWeekKey = DataHelper.dateFormat("EWS", targetDateKey);
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var recordData = {};
                var userData = {};
                var totalTime = self.sleepTime();

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var weekKey = weekKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "weekKey": weekKey,
                        "count": 0,
                        "time": {
                            "total": 0,
                            "sleep": 0,
                            "good": 0,
                            "soso": 0,
                            "bad": 0
                        },
                        "status": "-"
                    };

                    userData[weekKey] = recordData[weekKey] = recordData[dateKey] = itemData;
                }

                SampleDashboardDAO.list( "SLEEP", function(  idx, item ) {
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( dateKey > targetDateKey ) {
                            debug.log( 'dateKey', dateKey, targetDateKey );
                            return;
                        }

                        itemData.count = item.badCount();
                        itemData.time.bad = item.badCount() * 2;
                        itemData.time.soso = item.sosoCount() * 2;
                        itemData.time.good = item.goodCount() * 2;
                        itemData.time.sleep = itemData.time.good + itemData.time.soso;
                        itemData.time.total = itemData.time.good + itemData.time.soso + itemData.time.bad;
                        itemData.status = item.sleepStatus();

                        //recordData[dateKey] = itemData;
                    }
                });

                return {
                    target: targetWeekKey,
                    userData: userData,
                    
                    dateKeys: dateKeys,
                    weekKeys: weekKeys,
                    targetDateKey: targetDateKey,
                    targetWeekKey: targetWeekKey,
                    data: recordData
                };
            },

            sleepMonthlyData: function() {
                var dateKeys = self.thisMonthlyKeys();
                var targetDateKey = this.sleepTargetDateKey();
                var recordData = {};
                var userData = {};
                var totalCount = dateKeys.length - 1;
                var goodCount = dateKeys.length - 1; // 오늘 날짜 뺌
                var badCount = 0;
                var sosoCount = 0;
                var totalTime = self.sleepTime();

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "count": 0,
                        "time": {
                            "total": 0,
                            "sleep": 0,
                            "good": 0,
                            "soso": 0,
                            "bad": 0
                        },
                        "status": "-"
                    };

                    recordData[dateKey] = itemData;

                    userData[dateKey] = "-";
                }

                SampleDashboardDAO.list( "SLEEP", function( idx, item ) {
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        if ( dateKey > targetDateKey ) {
                            debug.log( 'dateKey', dateKey, targetDateKey );
                            return;
                        }

                        itemData.count = item.badCount();
                        itemData.time.bad = item.badCount() * 2;
                        itemData.time.soso = item.sosoCount() * 2;
                        itemData.time.good = item.goodCount() * 2;
                        itemData.time.sleep = itemData.time.good + itemData.time.soso;
                        itemData.time.total = itemData.time.good + itemData.time.soso + itemData.time.bad;
                        itemData.status = item.sleepStatus();

                        //recordData[dateKey] = itemData;
                    }
                });

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = recordData[dateKey];

                    if ( dateKey > targetDateKey ) {
                        continue;
                    }

                    if ( itemData.status == "bad" ) {
                        badCount ++;
                        goodCount --;
                    }
                    else if ( itemData.status == "soso" ) {
                        sosoCount ++;
                        goodCount --;
                    }
                   
                    userData[dateKey] = itemData.status;
                }

                return {
                    bad: badCount,
                    soso: sosoCount,
                    good: goodCount,
                    target: targetDateKey,
                    userData: userData,
                    dateKeys: dateKeys,
                    targetDateKey: targetDateKey,
                    data: recordData
                };
            },

            bloodPressureDataWithHealingPlatform: function() {
                var lastKey = "", lastData = {}, lastItem = null, recordKeys = [], recordData = {}, itemKeys = {};
                var statusInfo = function( data ) {
                    var status = "normal";
                    var comment = "";

                    if ( data.systolic == null || data.systolic == 0 ) {
                        status = "unknown";
                        comment = "";
                    }
                    else if ( data.systolic < 90 ) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "혈압 낮음";
                        }
                        else {
                            status = "lower";
                            comment = "수축기혈압 낮음";
                        }
                    }
                    else if (data.systolic>=90 && data.systolic<120) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "이완기혈압 낮음";
                        }
                        else if (data.diastolic>=60 && data.diastolic<80) {
                            status = "normal";
                            comment = "혈압 정상";
                        }
                        else if (data.diastolic>=80 && data.diastolic<90) {
                            status = "warn";
                            comment = "이완기혈압 조금 높음";
                        }
                        else if(data.diastolic>=90 && data.diastolic<100){
                            status = "hign";
                            comment = "이완기혈압 높음";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if (data.systolic>=120 && data.systolic<140) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 조금 높고, 이완기 혈압 낮음";
                        }
                        else if (data.diastolic>=60 && data.diastolic<80) {
                            status = "warn";
                            comment = "수축기혈압 조금 높음";
                        }
                        else if (data.diastolic>=80 && data.diastolic<90) {
                            status = "warn";
                            comment = "혈압 조금 높음";
                        }
                        else if (data.diastolic>=90 && data.diastolic<100){
                            status = "high";
                            comment = "이완기혈압 높음";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if (data.systolic>=140 && data.systolic<160) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 높고, 이완기혈압 낮음. <br />의료진 상담 필요";
                        }
                        else if(data.diastolic>=60 && data.diastolic<100){
                            status = "high";
                            comment = "혈압 높음. <br />의료진 상담 필요";
                        }
                        else{
                            status = "danger";
                            comment = "이완기혈압 매우 높음. <br />의료진 상담 필요";
                        }
                    }
                    else if ( data.systolic>=160 ) {
                        if (data.diastolic<60) {
                            status = "lower";
                            comment = "수축기혈압 매우 높고, 이완기혈압 낮음. <br />의료진 상담 필요";
                        }
                        else if (data.diastolic>=60 && data.diastolic<100) {
                            status = "danger";
                            comment = "혈압 매우 높음. <br />의료진 상담 필요";
                        }
                        else {
                            status = "danger";
                            comment = "혈압 매우 높음. <br />즉시안정 및 의료진 상담 필요";
                        }
                    }

                    data.status = status;
                    data.comment = comment;

                    return data;
                };

                MeasureDAO.list( function( idx, item ) {
                    if ( item.type() == "BP" ) {
                        var recordKey = item.datetime();
                        var itemData = recordData[recordKey] ? recordData[recordKey] : { "systolic": 0, "diastolic": 0, "pulse": 0 };

                        if ( item.measure() == "systolic" ) {
                            itemData["systolic"] = item.value();
                        }
                        else if ( item.measure() == "diastolic" ) {
                            itemData["diastolic"] = item.value();
                        }
                        else if ( item.measure() == "pulse" ) {
                            itemData["pulse"] = item.value();
                            return;
                        }

                        if ( ! UI.Helper.Array.inArray( recordKeys, recordKey ) ) {
                            recordKeys.push(recordKey);
                        }

                        recordData[recordKey] = itemData;
                        itemKeys[recordKey] = item;
                    }
                });

                recordKeys = recordKeys.sort();

                if ( recordKeys.length > 7 ) {
                    recordKeys = recordKeys.slice( recordKeys.length-7, recordKeys.length);
                }

                lastKey = recordKeys.length > 0 ? recordKeys[recordKeys.length-1] : "";

                if ( lastKey != "" ) {
                    lastItem = itemKeys[lastKey];
                    lastData = recordData[lastKey];

                    lastData.date = lastItem.dateKey();
                    lastData["systolic"] = recordData[lastKey]["systolic"];
                    lastData["diastolic"] = recordData[lastKey]["diastolic"];
                    lastData["pulse"] = recordData[lastKey]["pulse"];
                }
                else {
                    lastData.date = null;
                    lastData["systolic"] = null;
                    lastData["diastolic"] = null;
                    lastData["pulse"] = null;
                }

                return {
                    lastData: statusInfo(lastData),
                    dateKeys: recordKeys,
                    data: recordData
                };
            },

            bloodGlucoseDataWithHealingPlatform: function() {

            },

            bodyCompositionDataWithHealingPlatform: function() {

            },

            reset: function() {
                this.clear();

                SampleDashboardDAO.truncate();

                _synchronizeManager.reset();
            },

            clear: function() {
                FitInfo.sharedInfo().truncate();

                MeasureDAO.truncate();
                CompositDAO.truncate();
            }
    	};
    },
    staticConstructor: function() {
        var _instance;

        return {
            defaultManager: function() {
                if ( _instance === undefined ) {
                    _instance = new FitManager();
                }
                return _instance;
            }
        }
    }
});

window.FitManager = FitManager;
	
})(window);