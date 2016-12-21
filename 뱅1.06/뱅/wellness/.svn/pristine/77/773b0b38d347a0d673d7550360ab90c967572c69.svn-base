
// Fit Manager 

(function(window, undefined) {

'use strict';

//var debug = window.debug;

var 
Class = UI.Class,
UserInfo = Class.UserInfo,
DeviceInfo = Class.DeviceInfo,
ProfileInfo = Class.ProfileInfo,
DatabaseConfig = Class.DatabaseConfig,
SampleDAO = Class.SampleDAO,
SampleDashboardDAO = Class.SampleDashboardDAO,
SampleGroupDAO = Class.SampleGroupDAO,
CompositDAO = Class.CompositDAO,
MeasureDAO = Class.MeasureDAO,
CompositInfo = Class.CompositInfo,
MeasureInfo = Class.MeasureInfo,
FitInfo = Class.FitInfo,
FitConfig = Class.FitConfig,

SyncCell = function( item ) {
    var 
    self,
    _finishHandler,
    _controller = MainController.sharedInstance(),
    _item = item,
    _cancelled = false,
    _timeKeys = [],
    _deviceSyncData = null,
    _updatingHistory = false,
    _syncing = false,
    _macro = new Macro(),
    _itemMap = {},
    _sendQueue = [],
    _sending = false,
    _sendToServer = true,
    _timoutException = null;

    var _constructor = {

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
                    console.log( "SyncCell." + self.dateKey(), "callback - restoreData", dateKey, commnandObject );

                    commnandObject.complete();
                });
            });

            _macro.register( "load.server.data", function() {

                var commnandObject = this;

                self.loadFromServer( function() {
                    console.log( "SyncCell." + self.dateKey(), "callback - loadFromServer", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "load.device.data", function() {

                var commnandObject = this;

                self.loadFromDevice( function() {
                    console.log( "SyncCell." + self.dateKey(), "callback - loadFromDevice", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "update.device.data", function() {

                var commnandObject = this;

                if ( _deviceSyncData == null ) {
                    console.log( "SyncCell." + self.dateKey(), "device sync data is null - ", dateKey, _deviceSyncData, commnandObject.command() );

                    commnandObject.complete();
                    return;
                }

                self.updateFromDevice( _deviceSyncData, function() {
                    console.log( "SyncCell." + self.dateKey(), "callback - updateFromDevice", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "arrange.sync.data", function() {

                var commnandObject = this;

                self.arrangeWithSyncData( function() {
                    console.log( "SyncCell." + self.dateKey(), "callback - arrangeWithSyncData", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "send.server.data", function() {

                var commnandObject = this;

                self.sendToServer( function() {
                    console.log( "SyncCell." + self.dateKey(), "callback - sendToServer", dateKey, commnandObject.command() );

                    commnandObject.complete();
                });
            });

            _macro.register( "dashboard.reload", function() {

                var commnandObject = this;

                _controller.macro().execute("fit.show.dashboard", dateKey, commnandObject.command());

                commnandObject.complete();
            });
        },

        dateKey: function() {
            return _item == null ? "" : _item.dateKey();
        },

        isSleepTime: function( time ) {
            var fitManager = _controller.fitManager();
            var date = DataHelper.convertDate( this.dateKey() );
            var sleepData = fitManager.deviceInfo().sleepData( date );
            var sleepStart = fitManager.deviceInfo().sleepStart();
            var sleepEnd = fitManager.deviceInfo().sleepEnd();

            var startDate = DataHelper.convertDate( this.dateKey() + " " + sleepStart );
            var endDate = DataHelper.convertDate( this.dateKey() + " " + sleepEnd );

            if ( sleepData.offset == -1 ) {

                // 수면시간
                if ( time >= startDate.getTime() || time <= endDate.getTime() ) { 
                    return true;
                }

            }
            else if ( sleepData.offset == 0 ) {

                // 수면시간
                if ( time >= startDate.getTime() && time <= endDate.getTime() ) { 
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

            //console.log( "SyncCell." + self.dateKey(), "lastWakeTime", lastWakeTime, date, lastWakeTime.getTime(), (date.getTime()+offset) );

            if ( (date.getTime()+offset) > lastWakeTime.getTime() ) {
                return true;
            }

            return false;
        },

        cancel: function() {
            //console.trace();
            console.log( "SyncCell." + self.dateKey(), "cancel" );

            _cancelled = true;
            _syncing = false;
            _macro.cancel();
        },

        cancelSynchronizeManager: function() {
            self.startExceptionTimeout();

            _controller.fitManager().synchronizeManager().cancel();
        },

        synchronize: function( callback ) {
            self.startExceptionTimeout();

            if ( _syncing == true ) {
                console.log( "SyncCell." + self.dateKey(), "it's already synchronizing..." );
                return;
            }

            console.log( "SyncCell." + self.dateKey(), "synchronize" );

            _syncing = true;
            _timeKeys = [];
            _itemMap = {};
            _macro.clear();

            if ( _item.isSynced() === false ) {
                if ( _item.isToday() === true ) {
                    self.restoreData( function() {

                    });

                    if ( _timeKeys.length > 0 ) {
                        var lastTimeKey = _timeKeys[_timeKeys.length-1];
                        var lastItem = _itemMap[lastTimeKey];
                        var date = DataHelper.convertDate( lastTimeKey );

                        if ( lastItem.isSynced() == false ) {
                            _macro.add("load.server.data");    
                        }
                        
                        if ( ! this.isWakeTime(date) ) {
                            console.log( "SyncCell." + self.dateKey(), "this is not wake time", date );

                            _macro.add("load.device.data");
                            _macro.add("update.device.data");    
                        }
                    }
                    else {
                        _macro.add("load.server.data");
                        _macro.add("load.device.data");
                        _macro.add("update.device.data");    
                    }
                }
                else {
                    _macro.add("restore.data");
                    _macro.add("load.server.data");
                    _macro.add("load.device.data");
                    _macro.add("update.device.data");
                }
            }

            _macro.add("arrange.sync.data");
            _macro.add("send.server.data");

            if ( _item.isToday() ) {
                _macro.add("dashboard.reload");
            }
            
            _macro.finishHandler( function( finished ) {
                self.stopExceptionTimeout();
                _syncing = false;

                console.log( "SyncCell." + self.dateKey(), "sync cell is finished! ", finished );

                callback( finished );
            });

            _macro.start();
        },

        stopExceptionTimeout: function() {
            if ( _timoutException != null ) {
                clearTimeout( _timoutException );
                _timoutException = null;
            }

            $(".btn_setting").removeClass("on");
        },

        startExceptionTimeout: function() {
            this.stopExceptionTimeout();

            _timoutException = setTimeout( function() {
                $(".btn_setting").addClass("on");
                M.pop.instance("동기화 중 오류가 발생되었습니다.\n기기 상태를 확인해주세요.");
            }, 30000);
        },

        restoreData: function( callback ) {
            this.startExceptionTimeout();

            if ( _item.isSynced() === true ) {
                callback();
                return;
            }

            console.log( "SyncCell." + self.dateKey(), "restoring data..." );

            SampleDAO.list( this.dateKey(), function( idx, item ) { 
                var timeKey = item.datetime();

                if ( UI.Helper.Array.inArray( _timeKeys, timeKey ) ) {
                    return;
                }

                _timeKeys.push( timeKey );
                _itemMap[timeKey] = item;
            });

            _timeKeys = _timeKeys.sort();

            console.log( "SyncCell." + self.dateKey(), "Loaded Local Backup Data - ", _timeKeys.length );

            if ( _timeKeys.length >= 30*24 ) {
                _item.data({
                    "synced": true
                });

                console.log( "SyncCell." + self.dateKey(), "it is synchronized." );
            }

            callback();
        },

        loadFromServer: function ( callback ) {
            this.startExceptionTimeout();

            console.log( "SyncCell." + self.dateKey(), "load from server " );

            if ( _item.isSynced() === true ) {
                callback();
                return;
            }

            _controller.execute("fit.sync.samples.load", { "date": this.dateKey() }, {
                showIndicator:false,
                callback: function( event ) { 

                    if ( event.error ) {
                        console.error( "SyncCell." + self.dateKey(), "error loading from server - ", event.error );
                        
                        self.cancelSynchronizeManager();

                        M.pop.instance( "동기화를 할 수 없습니다.\n재시도 해주시기 바랍니다." );

                        return;
                    }

                    var samples = event.result.samples;

                    console.log( "Server Samples - ", samples.length );

                    var updateCount = 0;

                    for ( var i=0; i<samples.length; i++ ) {
                        var itemData = samples[i];
                        var timeKey = itemData.datetime;

                        if ( UI.Helper.Array.inArray( _timeKeys, timeKey ) ) {

                            var item = _itemMap[timeKey];
                            var isSynced = item.isSynced();

                            item.data({
                                "synced": true,
                                "type": itemData.type,
                                "datetime": itemData.datetime,
                                "active": itemData.active,
                                "value": itemData.value
                            });

                            if ( isSynced == false ) {
                                SampleDAO.updateItem( item, true );
                                updateCount ++;
                            }

                            continue;
                        }

                        var item = SampleDAO.insert({
                            "synced": true,
                            "type": itemData.type,
                            "datetime": itemData.datetime,
                            "active": itemData.active,
                            "value": itemData.value
                        }, true);

                        SampleDAO.updateItem( item, true );
                        updateCount ++;

                        _timeKeys.push( timeKey );
                        _itemMap[timeKey] = item;
                    }

                    _timeKeys = _timeKeys.sort();

                    console.log( "SyncCell." + self.dateKey(), "Updated Data From Server - ", updateCount );

                    if ( _timeKeys.length >= 30*24 ) {
                        _item.data({
                            "synced": true
                        });

                        console.log( "SyncCell." + self.dateKey(), "it is synchronized." );
                    }

                    callback();
                }
            });
        },

        loadFromDevice: function( callback ) {
            this.startExceptionTimeout();

            var dateKey = this.dateKey();

            console.log( "SyncCell." + self.dateKey(), "load from history" );

            if ( _item.isToday() === true && _timeKeys.length > 0 ) {
                var lastTimeKey = _timeKeys[_timeKeys.length-1];
                var date = DataHelper.convertDate( lastTimeKey );
                
                if ( this.isWakeTime(date) ) {
                    console.log( "SyncCell." + self.dateKey(), "it is skipped action, that is wake time", date );

                    callback();
                    return;
                }
            }

            if ( _item.isSynced() === true ) {
                console.log( "SyncCell." + self.dateKey(), "sync data is synced");
                callback();
                return;
            }

            if ( _updatingHistory == true ) {
                console.log( "SyncCell." + self.dateKey(), "already updating device - " );
                callback();
                return;
            }

            if ( _deviceSyncData != null ) {
                console.log( "SyncCell." + self.dateKey(), "it has synced data", _deviceSyncData );
                callback();
                return;
            }

            _updatingHistory = true;

            console.log( "SyncCell." + self.dateKey(), "pairing..." );

            _controller.fitManager().pair( function( result ) {
                if ( result.error ) {
                    _updatingHistory = false;
                    self.cancelSynchronizeManager();

                    M.pop.instance( "동기화를 할 수 없습니다.\n재시도 해주시기 바랍니다." );
                    return;
                }

                console.log( "SyncCell." + self.dateKey(), "load history - " );

                M.fit.history({
                    date:[dateKey],
                    callback: function( result ) {

                        console.log( "SyncCell." + self.dateKey(), "result", result );

                        if ( result.error ) {
                            _updatingHistory = false;
                            self.cancelSynchronizeManager();

                            M.pop.instance( "동기화를 할 수 없습니다.\n재시도 해주시기 바랍니다." );
                            return;
                        }

                        _updatingHistory = false;
                        _deviceSyncData = [];
                        var items = result.list;
                        for ( var i=0;i<items.length; i++ ) {
                            var item = items[i];
                            _deviceSyncData.push( item );
                        }

                        _deviceSyncData = result.list;

                        console.log( "SyncCell." + self.dateKey(), "Loaded History Data", _deviceSyncData );

                        callback();
                    }
                });
            });
        },

        updateFromDevice: function( data, callback ) {
            this.startExceptionTimeout();

            console.log( "SyncCell." + self.dateKey(), "update from device - ", data );

            if ( _item.isToday() === true && _timeKeys.length > 0 ) {
                var lastTimeKey = _timeKeys[_timeKeys.length-1];
                var date = DataHelper.convertDate( lastTimeKey );
                
                if ( this.isWakeTime(date) ) {
                    console.warn( date, "it is skipped action, that is wake time" );

                    callback();
                    return;
                }
            }

            if ( _item.isSynced() === true ) {
                callback();
                return;
            }

            if ( data == null || ! UI.Helper.Array.isArray( data ) ) {
                callback();
                return;
            }

            var loadCount = 0;

            for ( var i=0; i<data.length; i++ ) {
                var itemData = data[i];
                var timeKey = itemData["date"] + " " + itemData["time"];
                var date = DataHelper.convertDate( timeKey );

                if ( self.isFuture(date) ) {
                    console.log( "SyncCell." + self.dateKey(), "datetime is future. - ", date );
                    continue;
                }

                if ( _item.isToday() === true && self.isWakeTime(date, 60*-3) ) {
                    console.log( "SyncCell." + self.dateKey(), "datetime is wake time. - ", date );
                    continue;
                }

                if ( UI.Helper.Array.inArray( _timeKeys, timeKey ) ) {
                    var item = _itemMap[timeKey];

                    //console.log( "item can't update data", item.data(), itemData );
                }
                else {

                    var item = SampleDAO.insert({
                        "synced": false,
                        "type": self.isSleepTime( date.getTime() ) ? "SLEEP": "STEP",
                        "datetime": itemData.date + " " + itemData.time,
                        "active": itemData.active,
                        "value": itemData.value
                    }, true);

                    loadCount ++;

                    _timeKeys.push( timeKey );
                    _itemMap[timeKey] = item;
                }
            }

            _timeKeys = _timeKeys.sort();

            console.log( "SyncCell." + self.dateKey(), "New Updated History Data - ", loadCount );

            if ( _item.isToday() == false && _deviceSyncData != null ) {

                if ( _timeKeys.length == _deviceSyncData.length ) {
                    _item.data({
                        "synced": true
                    });

                    console.log( "SyncCell." + self.dateKey(), "it is synchronized." );
                }
            }
            else if ( _timeKeys.length >= 30*24 ) {
                _item.data({
                    "synced": true
                });

                console.log( "SyncCell." + self.dateKey(), "it is synchronized." );
            }

            callback();
        },

        arrangeWithSyncData: function( callback ) {
            this.startExceptionTimeout();

            console.log( "SyncCell." + self.dateKey(), "arrange with sync data " );

            var steps = 0;
            var am_soso_count = 0;
            var am_soso_sleeps = 0;
            var am_bad_count = 0;
            var am_bad_sleeps = 0;
            var pm_soso_count = 0;
            var pm_soso_sleeps = 0;
            var pm_bad_count = 0;
            var pm_bad_sleeps = 0;
            var queue = [];

            var syncedItems = [];
            var sendCount = 0;

            for ( var i=0; i<_timeKeys.length; i++ ) {
                var timeKey = _timeKeys[i];
                var item = _itemMap[timeKey];
                var itemData = item.data();

                if (  item.isSynced() == false ) {
                    queue.push( item );
                    sendCount ++;
                }
                else {
                    syncedItems.push( item );
                }

                if ( item.type() === "SLEEP" ) {

                    if ( item.sleepStatus() === "bad" ) {
                        if ( item.isAM() ) {
                            am_bad_count ++;
                            am_bad_sleeps += item.value();
                        }
                        else {
                            pm_bad_count ++;
                            pm_bad_sleeps += item.value();
                        }
                    } 
                    else if ( item.sleepStatus() === "soso" ) {
                        if ( item.isAM() ) {
                            am_soso_count ++;
                            am_soso_sleeps += item.value();
                        }
                        else {
                            pm_soso_count ++;
                            pm_soso_sleeps += item.value();   
                        }
                    }

                }
                else {
                    steps += item.value();    
                }

                if ( queue.length > 30 * 6 ) {
                    self.addQueue( queue ); 
                    queue = [];
                }
            }

            if ( queue.length > 0 ) {
                self.addQueue( queue ); 
                queue = [];
            }

            console.log( "SyncCell." + self.dateKey(), "Send History Data - ", sendCount );

            if ( _item.isToday() == false && _deviceSyncData != null ) {

                if ( _timeKeys.length == _deviceSyncData.length ) {
                    _item.data({
                        "synced": true
                    });

                    console.log( "SyncCell." + self.dateKey(), "it is synchronized." );
                }
            }
            else if ( _timeKeys.length >= 30*24 ) {
                _item.data({
                    "synced": true
                });
            }

            _item.data({
                "steps": steps,
                "am_soso_count": am_soso_count,
                "am_soso_sleeps": am_soso_sleeps,
                "am_bad_count": am_bad_count,
                "am_bad_sleeps": am_bad_sleeps,
                "pm_soso_count": pm_soso_count,
                "pm_soso_sleeps": pm_soso_sleeps,
                "pm_bad_count": pm_bad_count,
                "pm_bad_sleeps": pm_bad_sleeps
            });

            SampleDashboardDAO.updateItem( _item );

            callback();
        },

        addQueue: function( items ) {
            var samples = [];

            for ( var i=0; i<items.length; i++ ) {
                var item = items[i];
                item.data({
                    "synced": true
                });

                samples.push( item.data() );
            }

            _sendQueue.push({
                samples: samples,
                items: items
            });
        },

        sendToServer: function( callback ) {

            if ( _sendToServer == false ) {
                console.log( "SyncCell." + self.dateKey(), "sync to server is disabled" );
                callback();
                return;
            }

            this.startQueue( callback );
        },

        startQueue: function( callback ) {
            if ( _sending == true ) {
                return;
            }

            this.nextQueue( callback );
        },

        nextQueue: function( callback ) {

            if ( _sending === true ) {
                return;
            }

            if ( _sendQueue.length === 0 ) {
                callback();
                return;
            }

            var sendData = _sendQueue.shift();
            var samples = sendData.samples;
            var items = sendData.items;

            _sending = true;
            _controller.execute("fit.sync.samples.send", { "samples": samples }, {
                showIndicator:false,
                callback: function( event ) {
                    console.log( "SyncCell." + self.dateKey(), "send - result", event );

                    _sending = false;

                    if ( event.error ) {
                        self.cancelSynchronizeManager();
                        return;
                    }

                    var result = event.result;

                    if ( result.count == 0 ) {

                    }
                    else {
                        for ( var i=0; i<items.length; i++ ) {
                            var item = items[i];
                            item.data({
                                "synced": true
                            });

                            SampleDAO.updateItem( item, true );
                        }
                    }

                    setTimeout( function() {
                        self.nextQueue( callback );
                    }, 0);
                }
            });
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
        _progresshandler,
        _finishHandler,
        _enabled = false,
        _cancelled = false,
        _firstExecute = true,
        _syncing = false,
        _syncedKey = "",
        _updating = false,
        _currentDateKey = "",
        _dateKeys = [],
        _tables = [],
        _historyCount = 1,
        _itemMap = {};
 
        return {

            isSynced: function() {
                var syncedKey = _controller.fitManager().targetDateFormat("YYYYMMDDhh");
                return M.data.global("SyncedKey") == (_controller.userInfo().userKey() + "." + syncedKey);
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

            _progress: function() {
                if ( self.isSynced() === true ) {
                    return;
                }

                var index = _historyCount - _dateKeys.length;
                var ratio = (index == 0 || _historyCount == 0) ? 0 : (index / _historyCount);

                console.log( "SynchronizeManager progress - ", ratio, index, _historyCount );

                if ( ratio < 0 ) {
                    ratio = 0;
                }

                if ( ratio > 1 ) {
                    ratio = 1;
                }

                if ( typeof _progresshandler === "function" ) {
                    _progresshandler( ratio );
                }
            },

            _finish: function() {

                console.log( "SynchronizeManager finish - ", _cancelled );

                if ( typeof _finishHandler === "function" ) {
                    setTimeout( function() {
                        _finishHandler( _cancelled );
                    }, 0);
                }
            },

            init: function() {
                self = this;

                _enabled = true;
                _tables = [];
                _controller = MainController.sharedInstance();
     
                return self;
            },
     
            initialize: function() {
                SampleDashboardDAO.create();
                SampleDAO.create();
            },

            retry: function() {
                console.log( "SynchronizeManager retry", _cancelled );

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

                console.log( "SynchronizeManager cancel" );

                console.trace();

                _cancelled = true;
                _syncing = false;

                for ( var i=0; i<_dateKeys.length; i++ ) {
                    var dateKey = _dateKeys[i];
                    var syncCell = _itemMap[dateKey];

                    if ( syncCell ) {
                        syncCell.cancel();
                    }
                }

                self._finish();
            },

            reset: function() {
                M.data.removeGlobal("SyncedKey");
            },

            synchronize: function() {
                console.log( "SynchronizeManager synchronize" );

                _firstExecute = false;

                if ( _enabled == false ) {
                    _syncing = false;

                    this._finish();
                    return;   
                }

                if ( this.isSynced() ) {
                    _cancelled = false;
                    self._finish();
                    console.log( "SynchronizeManager sync-data is synchronized." );
                    return;
                }

                if ( _syncing == true && _dateKeys.length > 0 ) {
                    _cancelled = false;
                    this.executeUpdate();
                    return;
                }

                _syncing = true;
                _cancelled = false;
                _dateKeys = [];
                _currentDateKey = "";
                _syncedKey = _controller.fitManager().targetDateFormat("YYYYMMDDhh");

                SampleDashboardDAO.list( function( idx, item ) {
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( _dateKeys, dateKey ) ) {
                        return;
                    }

                    var cell = new SyncCell( item );

                    _dateKeys.push( dateKey );
                    _itemMap[dateKey] = cell;
                });

                _dateKeys = _dateKeys.sort();
                _historyCount = _dateKeys.length;

                this._progress();

                if ( _dateKeys.length > 0 ) {
                    var lastDateKey = _dateKeys[_dateKeys.length-1];
                    var todayDateKey = _controller.fitManager().targetDateFormat("YYYY-MM-DD");

                    if ( lastDateKey == todayDateKey ) {
                        self.startUpdate();
                        
                        return;
                    }
                }

                console.log( "SynchronizeManager pairing..." );

                _controller.fitManager().pair( function(result) {
                    if ( result.error ) {
                        M.pop.instance( "Pairing is fail." );

                        return;
                    }

                    console.log( "SynchronizeManager load history table..." );

                    M.fit.historyTable( function( result ) {

                        if ( result.status === "FAIL" ) {
                            console.log( "SynchronizeManager fail history table..." );

                            self.cancelUpdate();
                            return;
                        }

                        var historyKeys = result.list;
                        historyKeys = historyKeys.sort();

                        for ( var i=(historyKeys.length-1); i>=0; i-- ) {
                            var dateKey = historyKeys[i];

                            //console.log( "dateKey", _controller.userInfo().userDateCreated(), dateKey );

                            if ( dateKey < _controller.userInfo().userDateCreated() ) {
                                continue;
                            }
                            
                            if ( UI.Helper.Array.inArray( _dateKeys, dateKey ) ) {
                                continue;
                            }

                            var item = SampleDashboardDAO.insert({
                                "date": dateKey,
                                "synced": false,
                                "am_soso_count": 0,
                                "am_soso_sleeps": 0,
                                "am_bad_count": 0,
                                "am_bad_sleeps": 0,
                                "pm_soso_count": 0,
                                "pm_soso_sleeps": 0,
                                "pm_bad_count": 0,
                                "pm_bad_sleeps": 0,
                                "steps": 0
                            });

                            var cell = new SyncCell( item );

                            _dateKeys.push( dateKey );
                            _itemMap[dateKey] = cell;
                        }

                        _dateKeys = _dateKeys.sort();
                        _historyCount = _dateKeys.length;

                        self.startUpdate();
                    });
                });
            },

            startUpdate: function() {
                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                console.log( "SynchronizeManager startUpdate" );

                this._progress();

                this.nextUpdate();
            },

            nextUpdate: function() {
                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                if ( _dateKeys.length == 0 ) {
                    this.finishUpdate();
                    return;
                }

                _currentDateKey = _dateKeys.pop();

                var syncCell = _itemMap[_currentDateKey];

                console.log( "SynchronizeManager nextUpdate", _currentDateKey, syncCell );

                this._progress();

                if ( ! syncCell ) {
                    console.log( "SyncCell." + self.dateKey(), "is Undefined" );
                    self.cancelUpdate();
                    return;
                }

                this._progress();

                this.executeUpdate();
            },

            executeUpdate: function() {
                if ( _cancelled == true ) {
                    this.cancelUpdate();
                    return;
                }

                var syncCell = _itemMap[_currentDateKey];

                console.log( "SynchronizeManager executeUpdate", _currentDateKey );

                if ( ! syncCell ) {
                    console.log( "SynchronizeManager SyncCell is Undefined" );
                    return;
                }

                syncCell.synchronize( function( finished ) {
                    if ( finished === false ) {
                        self.cancelUpdate();
                        return;
                    }

                    setTimeout( function() {
                        self.nextUpdate();
                    }, 0);
                });
            },

            finishUpdate: function() {
                console.log( "SynchronizeManager finishUpdate" );

                _syncing = false;

                M.data.global("SyncedKey", _controller.userInfo().userKey() + "." + _syncedKey );

                this._progress();
                this._finish();
            },

            cancelUpdate: function() {
                console.trace();
                console.log( "SynchronizeManager cancelUpdate" );

                if ( _cancelled === true ) {
                    console.log( "it is already cancelled." );
                    return;
                }

                _syncing = false;
                _cancelled = true;

                this._progress();
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
                this.deviceInfo().restoreData(true);

                return this.deviceInfo().hasPairedBand() ? true : false;
            },

    		init: function() {
                self = this;

                return self;
    		},

            initialize: function() {
                M.db.create( DatabaseConfig.databaseName() );
                M.db.open( DatabaseConfig.databaseName() );

                CompositDAO.create();
                MeasureDAO.create();
                SampleDAO.create();
                SampleGroupDAO.create();
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

            caloriesBySteps: function( step ) {
                var bodyWeight = self.profileInfo().bodyWeight("KG");

                // 2Mph
                //var calories = step <= 0 ? 0 : (bodyWeight * 2.20462 * 0.57 / 2200 * step);

                // 3.5Mph
                var calories = step <= 0 ? 0 : (bodyWeight * 2.20462 * 0.5 / 1400 * step);

                return isNaN(Math.round( calories ) ) ? 0 : Math.round( calories ) ;
            },

            distancesBySteps: function( step ) {
                var bodyHeight = self.profileInfo().bodyHeight("CM");
                var distances = step <= 0 ? 0 : ((bodyHeight * 0.414 * step ) / 100);

                return isNaN(Math.round( distances ) ) ? 0 : Math.round( distances ) ;
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
                    console.warn( "target date is invalid." );
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
                var startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);

                for ( var p=0; p<startDate.getDay(); p++ ) {
                    var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()-(startDate.getDay()===0 ? 7 : startDate.getDay())+1 +p);
                    var year = date.getFullYear() + '';
                    var month = date.getMonth() + 1 + '';
                    var day = date.getDate() + '';
                    var dateKey = [year, DataHelper.str2num(month), DataHelper.str2num(day)].join("-");
                
                    monthlyGroupKeys.push( dateKey );
                }

                var endDate = new Date(startDate.getFullYear(),startDate.getMonth()+1,"");
                var days = endDate.getDate();
                

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

            connect: function( callback ) {
                /*
                if ( M.fit.bluetooth.enabled() && M.fit.bluetooth.isConnected() ) {
                    callback({
                        status: "SUCCESS"
                    });
                    return;
                }
                */

                self.pair( callback );
            },

            pair: function( callback ) {

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

                                    self.pair( callback );
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

                                                self.pair( callback );
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
                                
                                callback( result );
                                return;
                            }
                            
                            self.deviceInfo().restoreData();
                            self.deviceInfo().set("paired_band_uuid", result.uuid);
                            self.deviceInfo().saveData();

                            callback( result );
                        }
                    });
                }
            },

            unpair: function( callback ) {
                M.fit.bluetooth.unpair({
                    ondisconnect: function( result ) {

                        if ( result.error ) {
                            M.pop.instance( "Unpairing is fail." );
                            callback( result );
                            return;
                        }
                        
                        self.deviceInfo().restoreData();
                        self.deviceInfo().set("paired_band_uuid", null);
                        self.deviceInfo().saveData();

                        callback( result );
                    }
                });
            },

            updateProfile: function( result, callback ) {

                self.connect(function( result ) {
                    if ( result.error ) {
                        M.pop.instance( "Pairing is fail." );
                        callback();
                        return;
                    }

                    var age = self.profileInfo().age();
                    var bodyHeight = self.profileInfo().bodyHeight("CM");
                    var bodyWeight = self.profileInfo().bodyWeight("KG");
                    var gender = self.profileInfo().gender() == "M" ? "MALE" : "FEMALE";

                    M.fit.profile.set({
                        age: age,
                        height: bodyHeight,
                        weight: bodyWeight,
                        gender: gender,
                        callback: function( result ) {

                            callback();
                        }
                    }); 
                });
            },

            updateGoal: function( result, callback ) {

                self.connect(function( result ) {
                    if ( result.error ) {
                        M.pop.instance( "Pairing is fail." );
                        
                        callback();
                        return;
                    }

                    var goalStep = self.info().goalStep();

                    M.fit.dailyStep.set({
                        step: goalStep,
                        callback: function( result ) {
                            callback();
                        }
                    }); 
                });
            },

            updateHistory: function( result, callback ) {

                callback( result );
            },

            updateDashboardWithSampleData: function( result ) {
                console.log( "FitManager - updateDashboardWithSampleData", result );

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

                SampleGroupDAO.drop();
                SampleGroupDAO.create();
                SampleGroupDAO.loadData( result.samples );
            },

            updateDashboardWithRebonData: function( result ) {
                console.log( "FitManager - updateDashboardWithRebonData", result );
                
                CompositDAO.drop();
                CompositDAO.create();
                CompositDAO.loadData( result.composit );

                MeasureDAO.drop();
                MeasureDAO.create();
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
                var goalStep = self.info().goalStep();
                var todayStep = self.currentStep();

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
                var sleepTodayData = self.sleepTodayData();
                var sleepTimeData = sleepTodayData.timeData.good;

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

            	var dashbordData = {
            		goal_weight: dashboardGoalWeight,
                    goal_weight_type: dashboardGoalWeightType,
                    goal_weight_noexist: goalWeight === 0 ? "dn" : "",
                    goal_step: self.numberFormat( goalStep ),
                    over_goal_step: self.numberFormat( overGoalStep ),
            		today_step: self.numberFormat( todayStep ),
            		today_distance: self.numberFormat( todayDistance ),
            		today_burn: self.numberFormat( todayCalorie ),

                    sleep_result: sleepTodayData.status.toUpperCase() + " SLEEP",
            		sleep_hour: sleepTimeData.hour,
            		sleep_minute: sleepTimeData.minute,

                    rebon_first_notice_noexist: ( rebonNotice.length >= 1 ) ? "" : "dn",
                    rebon_first_notice: ( rebonNotice.length >= 1 ) ? rebonNotice[0].message : "",
                    rebon_first_link: ( rebonNotice.length >= 1 ) ? rebonNotice[0].link : "",
                    rebon_first_autolink: ( rebonNotice.length >= 1 ) ? "auto-link" : "",
                    rebon_second_notice_noexist: ( rebonNotice.length == 2 ) ? "" : "dn",
                    rebon_second_notice: ( rebonNotice.length == 2 ) ? rebonNotice[1].message : "",
                    rebon_second_link: ( rebonNotice.length == 2 ) ? rebonNotice[1].link : "",
                    rebon_second_autolink: ( rebonNotice.length == 2 ) ? "auto-link" : ""
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
                var totalStep = self.info().totalStep();
                var totalBurn = self.caloriesBySteps( totalStep );
                var currentCalorie = self.currentCalorie();
                var weeklyData = self.burnWeeklyData().totalData;
                var todaySleepValue = self.caloriesBySteps( self.sleepTodayData().sleepValue );
                var cumulativeData = Math.max( totalBurn + currentCalorie - todaySleepValue, weeklyData );

                return {
                    value: isNaN(cumulativeData) ? currentCalorie : cumulativeData
                };
            },

            burnWeeklyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = self.caloriesBySteps( goalStep );
                var currentCalorie = self.currentCalorie();
                var dateKeys = self.thisWeeklyKeys();
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EM");
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
                        "value": 0
                    };

                    recordData[weekKey] =  recordData[dateKey] = itemData;

                    userData[weekKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }

                    if ( todayDateKey == dateKey ) {
                        todayWeekKey = weekKey;
                        itemData.value = currentCalorie;
                        userData[todayWeekKey] = itemData.value;
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];
                            
                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                            itemData.value = self.caloriesBySteps( step );
                            //itemData.status = itemData.value >= goalData ? "ok" : "failure";
                            
                            recordData[dateKey] = itemData;
                            userData[itemData.weekKey] = itemData.value; 
                        }
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
                    targetWeekKey: targetWeekKey,
                    targetDateKey: targetDateKey,
                    todayDateKey: todayDateKey,
                    todayWeekKey: todayWeekKey,
                    data: recordData
                };
            },

            burnMonthlyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = self.caloriesBySteps( goalStep );
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
                        "value": 0
                    };

                    recordData[dateKey] = itemData;
                    userData[dateKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        itemData.value = currentCalorie;
                        userData[todayDateKey] = itemData.value;
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                            itemData.value = self.caloriesBySteps( step );

                            recordData[dateKey] = itemData;
                            userData[dateKey] = itemData.value;
                        }
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
                var totalStep = self.info().totalStep();
                var totalDistance = self.distancesBySteps( totalStep );
                var currentDistance = self.currentDistance();
                var weeklyData = self.distanceWeeklyData().totalData;
                var todaySleepValue = self.distancesBySteps( self.sleepTodayData().sleepValue );
                var cumulativeData = Math.max( totalDistance + currentDistance - todaySleepValue, weeklyData );
                
                return {
                    value: isNaN(cumulativeData) ? currentDistance : cumulativeData
                };
            },

            distanceWeeklyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = self.distancesBySteps( goalStep );
                var currentDistance = self.currentDistance();
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EM");
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
                        itemData.value = currentDistance;
                        itemData.status = itemData.value >= goalData ? "ok" : "failure";
                        userData[todayWeekKey] = itemData.value;
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];
                            
                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                            itemData.value = self.distancesBySteps( step );
                            itemData.status = itemData.value >= goalData ? "ok" : "failure";

                            recordData[dateKey] = itemData;
                            userData[itemData.weekKey] = itemData.value; 
                        }
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
                var goalData = self.distancesBySteps( goalStep );
                var currentDistance = self.currentDistance();
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
                        "value": 0,
                        "status": "nodata"
                    };

                    recordData[dateKey] = itemData;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        itemData.average = 0;
                        itemData.value = currentDistance;
                        itemData.status = itemData.value >= goalData ? "ok" : "failure";
                        userData[todayDateKey] = itemData;
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                itemData.average = item.average();
                                return;
                            }

                            itemData.average = item.average();
                            itemData.value = self.distancesBySteps( step );
                            itemData.status = itemData.value >= goalData ? "ok" : "failure";

                            recordData[dateKey] = itemData;
                        }
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

            sleepTodayData: function() {
                var targetDate = this.targetDate();
                var sleepData = this.sleepData( targetDate );
                var totalTime = self.sleepTime();
                var goodTime = totalTime;
                var sosoTime = 0;
                var badTime = 0;
                var sleepStatus = "good";
                var sleepStart = self.deviceInfo().sleepStart("AM/PM");
                var sleepEnd = self.deviceInfo().sleepEnd("AM/PM");
                var sampleData = {};

                var checkCount = 0;
                var badCount = 0;
                var sosoCount = 0;
                var sumValue = 0;
                var userData = [];

                var badKeys = [];
                var sosoKeys = [];

                SampleDAO.seek( sleepData.start, sleepData.end, function( idx, item ) {
                    if ( item.type() === "SLEEP" ) {
                        if ( item.sleepStatus() === "bad" ) {
                            badCount ++;
                            badTime += 2;
                            goodTime -= 2;
                        }
                        else if ( item.sleepStatus() === "soso" ) {
                            sosoCount ++;
                            sosoTime += 2;
                            goodTime -= 2;
                        }

                        sumValue += item.value();

                        var timeKey = item.timeKey( sleepData.startDate.getTime() );

                        if ( item.value() >= FitConfig.sleepBadValue() ) {
                            checkCount += 2;
                            badKeys.push( item );
                        }
                        else if ( item.value() >= FitConfig.sleepSosoValue() ) {
                            checkCount ++;
                            sosoKeys.push( item );
                        }
                        
                        sampleData[ timeKey ] = item;
                    }
                });

                for ( var t=0; t<=totalTime; t+=2 ) {

                    if ( sampleData[t] ) {
                        var item = sampleData[t];
                        userData.push( item.value() );
                    }
                    else {
                        userData.push( 0 );    
                    }
                }

                if ( checkCount >= FitConfig.sleepBadCount() ) {
                    sleepStatus = "bad";
                }
                else if ( checkCount >= FitConfig.sleepSosoCount() ) {
                    sleepStatus = "soso";
                }

                return {
                    status: sleepStatus,
                    sosoValue: FitConfig.sleepSosoValue(),
                    badValue: FitConfig.sleepBadValue(),
                    badKeys: badKeys,
                    sosoKeys: sosoKeys,
                    sleepValue: sumValue,
                    timeData: {
                        checkCount: checkCount,
                        badCount: badCount,
                        sosoCount: sosoCount,
                        total: self.timeDataByMinute( totalTime ),
                        good: self.timeDataByMinute( goodTime ),
                        soso: self.timeDataByMinute( sosoTime )
                    },
                    deviceInfo: {
                        sleepStart: sleepStart,
                        sleepEnd: sleepEnd
                    },
                    userData: userData
                };
            },

            sleepWeeklyData: function() {
                
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EM");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var todayWeekKey = "";
                var weekKeys = ["mon","tue","wed","thu","fri","sat","sun"];
                var recordData = {};
                var userData = {};
                var totalTime = self.sleepTime();
                // @TODO: weekly change

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var weekKey = weekKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "weekKey": weekKey,
                        "count": 0,
                        "time": {
                            "total": totalTime,
                            "good": totalTime,
                            "soso": 0,
                            "bad": 0
                        },
                        "status": "good"
                    };

                    userData[weekKey] = recordData[weekKey] = recordData[dateKey] = itemData;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        todayWeekKey = weekKey;
                        itemData.status = "good";
                        userData[todayWeekKey] = itemData; 
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "SLEEP" ) {
                        var dateKey = item.dateKey();
                        var nextDateKey = item.nextDateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, nextDateKey ) ) {
                            var itemData = recordData[nextDateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            itemData.count += (item.pmSosoCount() + (item.pmBadCount()*2));
                            itemData.time.soso += item.pmSosoCount() * 2;
                            itemData.time.bad += item.pmBadCount() * 2;
                            itemData.time.good -= (item.pmSosoCount() + item.pmBadCount()) * 2;

                            if ( itemData.count >= FitConfig.sleepBadCount() ) {
                                itemData.status = "bad";
                            }
                            else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                                itemData.status = "soso";
                            }

                            //recordData[nextDateKey] = itemData;
                        }

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            itemData.count += (item.amSosoCount() + (item.amBadCount()*2));
                            itemData.time.soso += item.amSosoCount() * 2;
                            itemData.time.bad += item.amBadCount() * 2;
                            itemData.time.good -= (item.amSosoCount() + item.amBadCount()) * 2;

                            if ( itemData.count >= FitConfig.sleepBadCount() ) {
                                itemData.status = "bad";
                            }
                            else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                                itemData.status = "soso";
                            }

                            //recordData[dateKey] = itemData;
                        }
                    }
                });

                /*
                SampleDashboardDAO.list( function( idx, item ) {
                    var dateKey = item.dateKey();
                    var nextDateKey = item.nextDateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, nextDateKey ) ) {
                        var itemData = recordData[nextDateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        itemData.count += item.pmSosoCount() + (item.pmBadCount()*2);
                        itemData.time.soso += item.pmSosoCount() * 2;
                        itemData.time.bad += item.pmBadCount() * 2;
                        itemData.time.good -= (item.pmSosoCount() + item.pmBadCount()) * 2;

                        if ( itemData.count >= FitConfig.sleepBadCount() ) {
                            itemData.status = "bad";
                        }
                        else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                            itemData.status = "soso";
                        }

                        //recordData[nextDateKey] = itemData;
                    }

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        itemData.count += item.amSosoCount() + (item.amBadCount()*2);
                        itemData.time.soso += item.amSosoCount() * 2;
                        itemData.time.bad += item.amBadCount() * 2;
                        itemData.time.good -= (item.amSosoCount() + item.amBadCount()) * 2;

                        if ( itemData.count >= FitConfig.sleepBadCount() ) {
                            itemData.status = "bad";
                        }
                        else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                            itemData.status = "soso";
                        }

                        //recordData[dateKey] = itemData;
                    }
                });
                */

                return {
                    today: todayWeekKey,
                    target: targetWeekKey,
                    userData: userData,
                    
                    dateKeys: dateKeys,
                    weekKeys: weekKeys,
                    targetDateKey: targetDateKey,
                    targetWeekKey: targetWeekKey,
                    todayDateKey: todayDateKey,
                    todayWeekKey: todayWeekKey,
                    data: recordData
                };
            },

            sleepMonthlyData: function() {
                var dateKeys = self.thisMonthlyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var todayDateKey = self.todayFormat("YYYY-MM-DD");
                var recordData = {};
                var userData = {};
                var totalCount = dateKeys.length;
                var goodCount = dateKeys.length;
                var badCount = 0;
                var sosoCount = 0;

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = {
                        "dateKey": dateKey,
                        "count": 0,
                        "status": "good"
                    };

                    recordData[dateKey] = itemData;

                    userData[dateKey] = "good";

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        itemData.status = "good";
                        userData[todayDateKey] = itemData.status; 
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "SLEEP" ) {
                        var dateKey = item.dateKey();
                        var nextDateKey = item.nextDateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, nextDateKey ) ) {
                            var itemData = recordData[nextDateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            itemData.count += (item.pmSosoCount() + (item.pmBadCount()*2));

                            if ( itemData.count >= FitConfig.sleepBadCount() ) {
                                itemData.status = "bad";
                            }
                            else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                                itemData.status = "soso";
                            }

                            //recordData[nextDateKey] = itemData;
                            userData[nextDateKey] = itemData.status;
                        }

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            itemData.count += (item.amSosoCount() + (item.amBadCount()*2));

                            if ( itemData.count >= FitConfig.sleepBadCount() ) {
                                itemData.status = "bad";
                            }
                            else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                                itemData.status = "soso";
                            }

                            //recordData[dateKey] = itemData;
                            userData[dateKey] = itemData.status;
                        }
                    }
                });
                
                /*
                SampleDashboardDAO.list( function( idx, item ) {
                    var dateKey = item.dateKey();
                    var nextDateKey = item.nextDateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, nextDateKey ) ) {
                        var itemData = recordData[nextDateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        itemData.count = item.pmSosoCount() + (item.pmBadCount()*2);

                        if ( itemData.count >= FitConfig.sleepBadCount() ) {
                            itemData.status = "bad";
                        }
                        else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                            itemData.status = "soso";
                        }

                        recordData[nextDateKey] = itemData;
                    }

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                        itemData.count += item.amSosoCount() + (item.amBadCount()*2);

                        if ( itemData.count >= FitConfig.sleepBadCount() ) {
                            itemData.status = "bad";
                        }
                        else if ( itemData.count >= FitConfig.sleepSosoCount() ) {
                            itemData.status = "soso";
                        }

                        recordData[dateKey] = itemData;
                        userData[dateKey] = itemData.status;
                    }
                });
                */

                for ( var k=0; k<dateKeys.length; k++ ) {
                    var dateKey = dateKeys[k];
                    var itemData = recordData[dateKey];

                    if ( itemData.status == "bad" ) {
                        badCount ++;
                        goodCount --;
                    }
                    else if ( itemData.status == "soso" ) {
                        sosoCount ++;
                        goodCount --;
                    }
                }

                return {
                    bad: badCount,
                    soso: sosoCount,
                    good: goodCount,
                    today: todayDateKey,
                    target: targetDateKey,
                    userData: userData,
                    dateKeys: dateKeys,
                    todayDateKey: todayDateKey,
                    targetDateKey: targetDateKey,
                    data: recordData
                };
            },

            stepCumulativelyData: function() {
                var totalStep = self.info().totalStep();
                var currentStep = self.currentStep();
                var weeklyData = self.stepWeeklyData().totalData;
                var todaySleepValue = self.sleepTodayData().sleepValue;
                var cumulativeData = Math.max(totalStep + currentStep - todaySleepValue, weeklyData);
                
                return {
                    value: isNaN(cumulativeData) ? currentStep : cumulativeData
                };
            },

            stepWeeklyData: function() {
                var goalStep = self.info().goalStep();
                var goalData = goalStep;
                var currentStep = self.currentStep();
                var dateKeys = self.thisWeeklyKeys();
                var targetDateKey = self.targetDateFormat("YYYY-MM-DD");
                var targetWeekKey = self.targetDateFormat("EM");
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
                        "value": 0
                    };

                    recordData[weekKey] = recordData[dateKey] = itemData;

                    userData[weekKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                        targetWeekKey = weekKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        todayWeekKey = weekKey;
                        itemData.value = currentStep;
                        userData[todayWeekKey] = itemData.value; 
                        break;
                    }
                }

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                            itemData.average = item.average();
                            itemData.value = step;

                            recordData[dateKey] = itemData;
                            userData[itemData.weekKey] = itemData.value;
                        }
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
                        "value": 0
                    };

                    recordData[dateKey] = itemData;

                    userData[dateKey] = 0;

                    if ( targetDateKey == dateKey ) {
                        targetDateKey = dateKey;
                    }
                    
                    if ( todayDateKey == dateKey ) {
                        itemData.value = currentStep;
                        userData[todayDateKey] = itemData.value; 
                        break;
                    }
                }

                SampleDashboardDAO.list( function(idx, item) {
                    var dateKey = item.dateKey();

                    if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {

                        var step = item.value();
                        var itemData = recordData[dateKey];

                        if ( itemData == undefined ) {
                            return;
                        }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                        //itemData.average = item.average();
                        itemData.value = step;

                        recordData[dateKey] = itemData;
                        userData[dateKey] = itemData.value;
                    }
                });

                SampleGroupDAO.list( function( idx, item ) {
                    if ( item.type() == "STEP" ) {
                        var dateKey = item.dateKey();

                        if ( UI.Helper.Array.inArray( dateKeys, dateKey ) ) {
                            var step = item.value();
                            var itemData = recordData[dateKey];

                            if ( itemData == undefined ) {
                                return;
                            }

                            if ( todayDateKey == dateKey ) {
                                return;
                            }

                            itemData.average = item.average();
                            itemData.value = step;

                            recordData[dateKey] = itemData;
                            userData[dateKey] = itemData.value;
                        }
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

            reset: function() {
                SampleDashboardDAO.drop();
                SampleDAO.drop();

                M.data.removeGlobal("SyncedKey");
            },

            clear: function() {
                M.db.close( DatabaseConfig.databaseName() );

                self.info().clear();
                MeasureInfo.clear();
                CompositInfo.clear();
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