//
//  MFitManager.m
//  MDebug
//
//  Created by ProgDesigner on 2015. 9. 9..
//
//

#import "MFitManager.h"
#import <FitBand/FitBand.h>
#import <objc/runtime.h>
#import "GlobalData.h"

#define MFitVersion @"1.0.1"

#define MFitBandInfoKeyHistoryUUIDs   @"MFitBandInfoKeyHistoryUUIDs"
#define MFitManagerInfoKeyServiceUUID   @"MFitManagerInfoKeyServiceUUID"
static const void *MFitManagerInfoKeyServiceUUIDBlockKey = &MFitManagerInfoKeyServiceUUIDBlockKey;

@class FitBand, FitMessage;
@protocol FitBandDelegate <NSObject>

- (void)bandDidConnect:(FitBand *)band withUUID:(NSString *)uuid;
- (void)bandDidFailToConnect:(FitBand *)band withError:(NSError *)error;
//- (void)bandDidDisconnect:(FitBand *)band;
//- (void)bandDidFailToDisconnect:(FitBand *)band withError:(NSError *)error;
- (void)band:(FitBand *)band didSuccessService:(FitService)service withResponse:(NSMutableDictionary *)response;
- (void)band:(FitBand *)band didFailMessage:(FitMessage *)message withError:(NSError *)error;

// 2016.07.11 추가 밴드리스트 선택화면 델리게이트 함수 추가
- (void) showBandList;

@end

#pragma mark - [FitConnection]

@interface FitConnection : NSObject {
    NSTimeInterval _timeout;
    NSTimer *_timer;
    BOOL _expired;
    id _delegate;
}

@property (nonatomic, readwrite) BOOL isPairing;
@property (nonatomic, readwrite) NSTimeInterval timeout;
@property (nonatomic, assign) MFitManager *delegate;
@property (nonatomic, copy) FitManagerPairingFinishBlock successBlock;
@property (nonatomic, copy) FitManagerPairingErrorBlock errorBlock;

- (id)initWithDelegate:(MFitManager *)delegate timeout:(NSTimeInterval)timeout;
- (void)connect;
- (void)success:(NSString *)uuid;
- (void)fail:(NSError *)error;

@end

@implementation FitConnection

- (id)initWithDelegate:(MFitManager *)delegate timeout:(NSTimeInterval)timeout {
    self = [super init];
    if (self) {
        _delegate = delegate;
        _timeout = timeout;
        _timer = nil;
        _expired = NO;
    }
    return self;
}

- (void)connect {
    PPDebug( @"connect - timeout: %@", @(_timeout) );
    
    [self startTimer];
}

- (void)startTimer {
    
    if ( _timer != nil ) {
        [_timer invalidate];
        _timer = nil;
    }
    
    _timer = [[NSTimer scheduledTimerWithTimeInterval:_timeout target:self selector:@selector(timeoutSending:) userInfo:nil repeats:NO] retain];
}

- (void)stopTimer {
    
    if ( _timer != nil ) {
        [_timer invalidate];
        [_timer release];
        _timer = nil;
    }
}

- (void)timeoutSending:(NSTimer *)timer {
    PPDebug( @"connecting is timtout" );
    
    [self stopTimer];
    
    if ( _expired == NO ) {
        NSError *error = [NSError errorWithDomain:@"FitMessageError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"pairng is timeout"}];
        
        [self fail:error];
    }
}

- (void)success:(NSString *)uuid {
    [self stopTimer];

    if ( _expired == YES ) {
        //PPWarn( @"message is expired" );
        return;
    }
    
    _expired = YES;

    self.successBlock( uuid );
}

- (void)fail:(NSError *)err {
    [self stopTimer];
    
    if ( _expired == YES ) {
        //PPWarn( @"message is expired" );
        return;
    }
    
    _expired = YES;

    NSError *error = [NSError errorWithDomain:@"FitMessageError" code:-1 userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
    
    self.errorBlock( error );
}

@synthesize delegate = _delegate;
@synthesize timeout = _timeout;
@synthesize isPairing = _isPairing;

@end

#pragma mark - [FitMessage]

@interface FitMessage : NSObject {
    NSTimeInterval _timeout;
    NSTimer *_timer;
    BOOL _expired;
    id _delegate;
}

@property (nonatomic, readwrite) FitService service;
@property (nonatomic, readwrite) NSTimeInterval timeout;
@property (nonatomic, assign) MFitManager *delegate;
@property (nonatomic, copy) NSMutableArray *request;
@property (nonatomic, copy) FitManagerDataSuccessBlock successBlock;
@property (nonatomic, copy) FitManagerDataErrorBlock errorBlock;

@property (nonatomic, readonly) BOOL isMustCallback;

- (id)initWithDelegate:(MFitManager *)delegate;
- (void)send;
- (void)success:(NSDictionary *)data;
- (void)fail:(NSError *)error;

@end

@implementation FitMessage

- (id)initWithDelegate:(MFitManager *)delegate {
    self = [super init];
    if (self) {
        _delegate = delegate;
        _timeout = 5000;
        _timer = nil;
        _expired = NO;
    }
    return self;
}

- (void)send {
    PPDebug( @"send - service: %@, request : %@, timeout: %@", @(self.service), self.request, @(_timeout)  );
    
    [self startTimer];
}

- (void)startTimer {
    
    if ( _timer != nil ) {
        [_timer invalidate];
        _timer = nil;
    }
    
    _timer = [[NSTimer scheduledTimerWithTimeInterval:_timeout*0.001 target:self selector:@selector(timeoutSending:) userInfo:nil repeats:NO] retain];
}

- (void)stopTimer {
    
    if ( _timer != nil ) {
        [_timer invalidate];
        [_timer release];
        _timer = nil;
    }
}

- (void)timeoutSending:(NSTimer *)timer {
    PPDebug( @"band request timeout - service: %@, request : %@, timeout: %@", @(self.service), self.request, @(_timeout) );
    
    [self stopTimer];
    
    if ( _expired == YES ) {
        NSLog( @"band request is expired" );
        return;
    }

    NSError *error = [NSError errorWithDomain:@"FitMessageError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"pairing is timeout"}];
        
    [self fail:error];
}

- (void)success:(NSDictionary *)data {
    [self stopTimer];

    if ( _expired == YES ) {
        //PPWarn( @"message is expired" );
        return;
    }
    
    PPDebug( @"band response timeout - service: %@, response : %@", @(self.service), data, @(_timeout) );
    
    _expired = YES;

    self.successBlock( self.service, data );
}

- (void)fail:(NSError *)err {
    [self stopTimer];
    
    if ( _expired == YES ) {
        //PPWarn( @"message is expired" );
        return;
    }
    
    _expired = YES;

    NSError *error = [NSError errorWithDomain:@"FitMessageError" code:-1 userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
    
    self.errorBlock( error );
}

- (NSString *)description {
    return [NSString stringWithFormat:@"FitMessage : %@", @(self.service)];
}

- (BOOL)isMustCallback {
    if ( self.service == FitSetClock ) {
        return NO;
    }

    return YES;
}

@synthesize delegate = _delegate;
@synthesize timeout = _timeout;
@dynamic isMustCallback;

@end

#pragma mark - [FitBand]

@interface FitBand : X6_bt_a <CBCentralManagerDelegate, CBPeripheralManagerDelegate, CBPeripheralDelegate> {
    CBCentralManager *_centralManager;
    CBPeripheralManager *_peripheralManager;
    NSTimeInterval _timeout;
    NSTimer *_timer;
    NSString *_pairingUUID;
    BOOL _pairing;
    BOOL _scanning;
}

@property (nonatomic, readonly) BOOL pairing;
@property (nonatomic, readonly) NSMutableArray *uuids;
@property (nonatomic, readwrite) NSTimeInterval timeout;
@property (nonatomic, assign) id <FitBandDelegate> manager;
@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, strong) CBPeripheralManager *peripheralManager;

- (void)initialize;

+ (FitBand *)sharedInstance;

@end

@implementation FitBand

static FitBand* instance_;

+ (FitBand *)sharedInstance {
    @synchronized(self) {
        if (!instance_) {
            instance_ = [[FitBand alloc] init];
            return instance_;
        }
    }
    return instance_;
}

+ (FitBand *)destroyInstance {
    if ( instance_ ) {
        [instance_ release];
        instance_ = nil;
    }
    return instance_;
}

- (void)dealloc {

    [super dealloc];
}

- (BOOL)isConnected {
    return [self isconnectPeripheral];
}

- (CBCentralManager *)centralManager {
    return _centralManager;
}

- (void)initialize {
    id uuids = [[NSUserDefaults standardUserDefaults] arrayForKey:MFitBandInfoKeyHistoryUUIDs];
    
    _uuids = [[NSMutableArray alloc] init];
    if ( uuids != nil && [uuids isKindOfClass:[NSArray class]] ) {
        [_uuids addObjectsFromArray:uuids];
    }
    
    _pairingUUID = nil;
    _pairing = NO;
    _timeout = 5000;
    _centralManager = nil;
    _peripheralManager = nil;
    
}

- (void)addUUID:(NSString *)uuid {
    [_uuids addObject:uuid];
    
    [[NSUserDefaults standardUserDefaults] setObject:_uuids forKey:MFitBandInfoKeyHistoryUUIDs];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSArray *)identifiersForRetrieving {
    NSMutableArray *identifiers = [NSMutableArray array];
    
    PPDebug( @"_uuids: %@", _uuids );
    
    [_uuids enumerateObjectsUsingBlock:^(NSString *uuidString, NSUInteger idx, BOOL * _Nonnull stop) {
        if ( ! (uuidString == nil || [uuidString isEqualToString:@""]) ) {
            CBUUID *uuid = [CBUUID UUIDWithString:uuidString];
            [identifiers addObject:uuid];
        }
    }];
    
    return [NSArray arrayWithArray:identifiers];
}

- (void)cancel {
    if ( _pairing == YES ) {
        [self stopScan];
        [self stopTimer];
        
        _pairing = NO;
        
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"pairng is cancelled"}];
        [self didFailToConnect:error];
    }
}

- (BOOL)connect:(NSString *)uuid timeout:(NSTimeInterval)timeout {
    PPDebug( @"connect: %@ timeout: %@", uuid, @(timeout) );

    if ( _pairing == YES ) {
        PPDebug(@"already pairing...");
        return NO;
    }
    
    _pairing = YES;
    _timeout = timeout;
    
    if ( ! ( uuid == nil || [uuid isEqualToString:@""] ) ) {
        if ( _pairingUUID != nil ) {
            [_pairingUUID release];
            _pairingUUID = nil;
        }
    
        _pairingUUID = [[NSString alloc] initWithString:uuid];
    
        if ( [_uuids containsObject:uuid] ) {
            [_uuids removeObject:uuid];
        }
        
        [self addUUID:uuid];
        
        if ( self.isconnectPeripheral == YES ) {
            
            [self didConnectWithUUID:uuid];
        }
        
        // 새로운 연결
        // 이 부분에서 띄워줘야함
        else {
            
            NSLog(@"처음 연결");
            // 프로토콜 만들기
            
            //[self.manager showBandList];
            
            if ( _centralManager != nil ) {
                [_centralManager release];
                _centralManager = nil;
            }
            
            NSLog(@"처음 연결111");
            
            [self startTimerWithTimeout:_timeout];
            //NSLog(@"타임아웃 : %@",_timeout);
            
            NSLog(@"처음 연결222");
            
            [self connect:uuid success:^(NSString *uuidString) {
                NSLog(@"처음 연결333");
                PPDebug( @"uuidString: %@", uuidString );
                
                [self didConnectWithUUID:uuidString];
            } fail:^(NSError *err) {
                
                NSLog(@"처음 연결444");
                PPDebug( @"error_uuid: %@", err );
               
                NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
                [self didFailToConnect:error];
            }];
        }

        return YES;
    }
    
    if ( _centralManager != nil ) {
        [_centralManager release];
        _centralManager = nil;
    }

//    dispatch_queue_t centralQueue = dispatch_queue_create("com.uracle.push.test.queue", DISPATCH_QUEUE_SERIAL);

    _centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:@{CBCentralManagerOptionRestoreIdentifierKey:@"com.uracle.push.test"}];
    
    [self startTimerWithTimeout:_timeout];

    return YES;
}

- (BOOL)selectConnect:(NSString *)uuid timeout:(NSTimeInterval)timeout {
    PPDebug( @"connect: %@ timeout: %@", uuid, @(timeout) );
    
    if ( _pairing == YES ) {
        PPDebug(@"already pairing...");
        return NO;
    }
    
    _pairing = YES;
    _timeout = timeout;
    
    if ( ! ( uuid == nil || [uuid isEqualToString:@""] ) ) {
        if ( _pairingUUID != nil ) {
            [_pairingUUID release];
            _pairingUUID = nil;
        }
        
        _pairingUUID = [[NSString alloc] initWithString:uuid];
        
        if ( [_uuids containsObject:uuid] ) {
            [_uuids removeObject:uuid];
        }
        
        [self addUUID:uuid];
        
        if ( self.isconnectPeripheral == YES ) {
            
            [self didConnectWithUUID:uuid];
        }
        
        // 새로운 연결
        // 이 부분에서 띄워줘야함
        else {
            
            NSLog(@"처음 연결");
            // 프로토콜 만들기
            
            //[self.manager showBandList];
            
            if ( _centralManager != nil ) {
                [_centralManager release];
                _centralManager = nil;
            }
            
            NSLog(@"처음 연결111");
            
            [self startTimerWithTimeout:_timeout];
            //NSLog(@"타임아웃 : %@",_timeout);
            
            NSLog(@"처음 연결222");
            
            [self pair:uuid success:^(NSString *uuidString) {
                NSLog(@"처음 연결333");
                PPDebug( @"uuidString: %@", uuidString );
                
                [self didConnectWithUUID:uuidString];
            } fail:^(NSError *err) {
                
                NSLog(@"처음 연결444");
                PPDebug( @"error_uuid: %@", err );
                
                NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
                [self didFailToConnect:error];
            }];
        }
        
        return YES;
    }
    
    if ( _centralManager != nil ) {
        [_centralManager release];
        _centralManager = nil;
    }
    
    //    dispatch_queue_t centralQueue = dispatch_queue_create("com.uracle.push.test.queue", DISPATCH_QUEUE_SERIAL);
    
    _centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:@{CBCentralManagerOptionRestoreIdentifierKey:@"com.uracle.push.test"}];
    
    [self startTimerWithTimeout:_timeout];
    
    return YES;
}

- (void)centralManager:(CBCentralManager *)central willRestoreState:(NSDictionary<NSString *,id> *)dict {
    NSLog( @"willRestoreState %@", dict );
}

//- (void)scan {
//
//    [self SearchBracelet:^(NSMutableArray *val) {
//
//        NSLog( @"val : %@", val );
//
//    } err:^(NSError *error) {
//
//        NSLog( @"error: %@", error );
//
//    }];
//}

- (void)connect:(NSString *)uuid success:(ConnectedBlock_t)success fail:(VFBLEErrorBlock_t)fail {
    PPDebug( @"connect: %@ ", uuid );
    
    NSLog(@"비든 SDK 연결시도");
    NSLog(@"비든 밴드 uuid : %@", uuid);
    
    
    //self PairBracelet:uuid blk:<#^(NSString *val)data#> err:<#^(NSError *error)err#>
    
        
    
    [self ConnectBracelet:uuid blk:^(NSString *result) {
        
        NSLog(@"비든 결과 : %@", result);
        
        NSLog(@"비든 SDK 연결상태 : %d", [self isConnected]);
        
        NSLog(@"비든 SDK 연결성공");
        
        NSArray *resultComponents = [result componentsSeparatedByString:@"|"];
        NSString *bandName = [resultComponents objectAtIndex:0];
        NSString *uuid = [resultComponents objectAtIndex:1];
        
        PPDebug( @"bandName: %@", bandName );
        
        if ( ! (uuid == nil || [uuid isEqualToString:@""]) ) {
            NSLog(@"비든 SDK 연결성공11");
            success(uuid);
        }
        else {
            NSLog(@"비든 SDK 연결실패333");
            NSError *error = [NSError errorWithDomain:@"FitBandError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"uuid is not valid"}];
            fail(error);
        }
        
    } err:^(NSError *err) {
        NSLog(@"비든 SDK 에러333");
        PPDebug( @"error: %@", err );
        
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
        fail(error);
    }];
}



- (void)pair:(NSString *)uuid success:(ConnectedBlock_t)success fail:(VFBLEErrorBlock_t)fail {
    PPDebug( @"pair: %@ ", uuid );
    
    NSLog(@"수정후 최초 연결");

    [self PairBracelet:uuid blk:^(NSString *result) {

        NSArray *resultComponents = [result componentsSeparatedByString:@"|"];
        NSString *bandName = [resultComponents objectAtIndex:0];
        NSString *uuid = [resultComponents objectAtIndex:1];

        PPDebug( @"bandName: %@", bandName );
        
        if ( ! (uuid == nil || [uuid isEqualToString:@""]) ) {
            success(uuid);
        }
        else {
            NSError *error = [NSError errorWithDomain:@"FitBandError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"uuid is not valid"}];
            fail(error);
        }
        
    } err:^(NSError *err) {
        PPDebug( @"error: %@", err );
        
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
        fail(error);
    }];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    
    if ( central.state == CBCentralManagerStatePoweredOn ) {

//        NSArray *retrieveConnectedPeripherals = @[];
//        NSArray *r1 = [_centralManager retrieveConnectedPeripheralsWithServices:@[[CBUUID UUIDWithString:@"13"]]];
//        NSLog( @"%@", r1 );

        NSArray *retrieveConnectedPeripherals = [_centralManager retrievePeripheralsWithIdentifiers:[self identifiersForRetrieving]];

        NSLog( @"retrieveConnectedPeripherals: %@", retrieveConnectedPeripherals );

//        NSArray *connectedPeripherals = [_centralManager retrieveConnectedPeripheralsWithServices:@[[CBUUID UUIDWithString:@"FFE1"]]];
//
//        NSLog( @"connectedPeripherals: %@", connectedPeripherals );

        __block BOOL hasUUID = NO;
        
        if ( retrieveConnectedPeripherals.count > 0 ) {
        
            [retrieveConnectedPeripherals enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(CBPeripheral *peripheral, NSUInteger idx, BOOL * _Nonnull stop) {
                
                PPDebug( @"peripheral: %@ ", peripheral );

                if ( hasUUID == NO && _pairingUUID == nil ) {
                    hasUUID = YES;
                
                    [self pair:peripheral.identifier.UUIDString success:^(NSString *uuid) {

                        PPDebug( @"paired UUIDString - %@", uuid );
                        
                        [self centralManager:_centralManager didConnectPeripheral:peripheral];
                        
                    } fail:^(NSError *error) {
                        
                        PPError( @"error: %@", error );
                    }];
                }
                else if ( _pairingUUID != nil && [peripheral.identifier.UUIDString isEqualToString:_pairingUUID] ) {
                    hasUUID = YES;
                
                    [self pair:peripheral.identifier.UUIDString success:^(NSString *uuid) {
                    
                        PPDebug( @"paired UUIDString - %@", uuid );
                        
                        [self centralManager:_centralManager didConnectPeripheral:peripheral];
                        
                    } fail:^(NSError *error) {
                        
                        PPError( @"error: %@", error );
                    }];
                }
                
            }];
        
            if ( hasUUID == NO ) {
                _scanning = YES;

//                [retrieveConnectedPeripherals enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(CBPeripheral *peripheral, NSUInteger idx, BOOL * _Nonnull stop) {
//                    [_centralManager connectPeripheral:peripheral options:nil];
//                }];

                [_centralManager scanForPeripheralsWithServices:nil options:@{ CBCentralManagerScanOptionAllowDuplicatesKey:@YES }];
            }
        }
        else {

            [_centralManager scanForPeripheralsWithServices:nil options:@{ CBCentralManagerScanOptionAllowDuplicatesKey:@YES }];

        }
        
    }
    else {
        [_centralManager stopScan];
    }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSINumber {
    
    if ( [peripheral.name hasPrefix:@"X6"] ) {
        PPDebug( @"peripheral: %@, rssi : %@", peripheral, RSSINumber );
        
        if ( RSSINumber.integerValue < 0 && RSSINumber.integerValue > -50 ) {
        
            [_centralManager stopScan];


            [self pair:peripheral.identifier.UUIDString success:^(NSString *uuid) {
                
                PPDebug( @"paired UUIDString - %@", uuid );
                
                [self centralManager:_centralManager didConnectPeripheral:peripheral];                
                
            } fail:^(NSError *error) {
                
                PPError( @"error: %@", error );
            }];
        }
    }
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    
//    NSLog(@"블루투스 페어링 부분임 %@",  peripheral);
//    
    [GlobalData sharedGlobalData].peripheral = peripheral;
    [GlobalData sharedGlobalData].bandUUid = peripheral.identifier.UUIDString;
    
    NSLog(@"글로벌 데이터 uuid초기화");
    
    PPDebug( @"didConnectPeripheral: %@", peripheral );
    
    NSString *uuidString = [[NSString alloc] initWithString:peripheral.identifier.UUIDString];

    NSLog( @"services" );
    for (CBService *service in peripheral.services) {

        NSLog(@"service :%@", service);
        NSLog(@"service uuid %@", service.UUID);
    }

    if ( [_uuids containsObject:uuidString] ) {
        [_uuids removeObject:uuidString];
    }
                    
    [self addUUID:uuidString];
    
    [uuidString release];
    
    _pairing = NO;
            
    [self didConnectWithUUID:uuidString];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    
    PPError( @"didFailToConnectPeripheral: %@, error: %@", peripheral, error );
    
    _pairing = NO;
                        
    [self didFailToConnect:error];
}

- (void)stopScan {
    PPDebug( @"stopScan" );

    if ( _centralManager != nil ) {
        [_centralManager stopScan];
        [_centralManager release];
        _centralManager = nil;
    }
    
    _scanning = NO;
}

- (void)startTimerWithTimeout:(NSTimeInterval)timeout {
    PPDebug( @"startTimerWithTimeout" );

    if ( _timer != nil ) {
        [_timer invalidate];
        _timer = nil;
    }
    
    _timer = [[NSTimer scheduledTimerWithTimeInterval:timeout target:self selector:@selector(timeoutScanning:) userInfo:nil repeats:NO] retain];
}

- (void)stopTimer {
    PPDebug( @"stopTimer" );

    if ( _timer != nil ) {
        [_timer invalidate];
        [_timer release];
        _timer = nil;
    }
}

- (void)timeoutScanning:(NSTimer *)timer {
    PPDebug( @"scanning is timeout" );

    [self stopScan];
    [self stopTimer];
    
    if ( _pairing == YES ) {
        _pairing = NO;
    
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"pairng is timeout"}];
        
        [self didFailToConnect:error];
    }
}

- (void)didConnectWithUUID:(NSString *)uuid {
    PPDebug( @"didConnectWithUUID : %@", uuid );

    [self stopScan];
    [self stopTimer];
    
    if ( self.manager != nil ) {
        [self.manager bandDidConnect:self withUUID:uuid];
    }
    
    if ( _peripheralManager != nil ) {
        [_peripheralManager release];
        _peripheralManager = nil;
    }
    
    _peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil options:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:0] forKey:CBCentralManagerOptionShowPowerAlertKey]];
}

- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral {
    PPDebug( @"peripheralManagerDidUpdateState :%@, %@", peripheral, @(peripheral.state) );

    if (peripheral.state == CBPeripheralManagerStatePoweredOn) {
        [_peripheralManager startAdvertising:@{CBAdvertisementDataLocalNameKey: [[UIDevice currentDevice] name]}];
    } else {
        [_peripheralManager stopAdvertising];
    }
}

- (void)didFailToConnect:(NSError *)err {
    PPDebug( @"didFailToConnect : %@", err );

    [self stopScan];
    [self stopTimer];
    
    if ( self.manager != nil ) {
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
    
        [self.manager bandDidFailToConnect:self withError:error];
    }
}

- (void)disconnect:(DisconnectedBlock_t)successHandler error:(VFBLEErrorBlock_t) errorHandler {

    __block DisconnectedBlock_t successBlock = [successHandler copy];
    __block VFBLEErrorBlock_t errorBlock = [errorHandler copy];

    if ( _pairingUUID != nil ) {
        [_pairingUUID release];
        _pairingUUID = nil;

        successBlock(YES);
    }
    else {
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"No Exist Paired UUID"}];
        errorBlock(error);
    }
    
    /*
    NSArray *retrieveConnectedPeripherals = [_centralManager retrievePeripheralsWithIdentifiers:[self identifiersForRetrieving]];
    
    if ( retrieveConnectedPeripherals.count > 0 ) {
        
        [retrieveConnectedPeripherals enumerateObjectsUsingBlock:^(CBPeripheral *peripheral, NSUInteger idx, BOOL * _Nonnull stop) {
            [_centralManager cancelPeripheralConnection:peripheral];
        }];
    }
    */

//    __block DisconnectedBlock_t successBlock = [successHandler copy];
//    __block VFBLEErrorBlock_t errorBlock = [errorHandler copy];

//    [self DisconnectBracelet:^(BOOL val) {
//        //[self didDisconnect];
//        successBlock(val);
//        
//    } err:^(NSError *err) {
//        PPDebug( @"error: %@", err );
//        
//        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
//        errorBlock(error);
//    }];
}

/*
- (void)didDisconnect {
    [self stopTimer];
    
    if ( self.manager != nil ) {
        [self.manager bandDidDisconnect:self];
    }s
    
    self.serviceUUID = nil;
}

- (void)didFailToDisconnect:(NSError *)err {
    PPDebug( @"error: %@", err );
 
    [self stopTimer];
    
    if ( self.manager != nil ) {
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
    
        [self.manager bandDidFailToDisconnect:self withError:error];
    }
}
*/

- (void)send:(FitMessage *)fitMessage {
    
    PPDebug( @"fitband send request : %@, service: %@", fitMessage.request, @(fitMessage.service) );
    
    [fitMessage send];

    [self ReadWriteData:(HandlerType)fitMessage.service input:[fitMessage.request copy] blk:^(NSMutableDictionary *response, HandlerType type) {

        if ( fitMessage.isMustCallback == YES ) {
            NSMutableDictionary *copiedResponse = [[NSMutableDictionary alloc] initWithDictionary:response];
            
            PPDebug( @"fitband response : %@, service: %@", copiedResponse, @(fitMessage.service) );
            
            [self didSend:(FitService)type withResponse:copiedResponse];
            
            [copiedResponse release];
        }

    } err:^(NSError *err) {
        PPDebug( @"error: %@", err );
        NSLog(@"접속에러 %@", err);

        if ( fitMessage.isMustCallback == YES ) {
            NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
            
            [self didFailMessage:fitMessage withError:error];
        }
    }];

    if ( fitMessage.isMustCallback == NO ) {
        [self didSend:fitMessage.service withResponse:[NSMutableDictionary dictionaryWithDictionary:@{}]];
    }
}

- (void)didSend:(FitService)service withResponse:(NSMutableDictionary *)response {
    if ( self.manager != nil ) {
        [self.manager band:self didSuccessService:service withResponse:response];
    }
}

- (void)didFailMessage:(FitMessage *)fitMessage withError:(NSError *)err {
    PPDebug( @"didFailMessage: %@", err );
    
    if ( self.manager != nil ) {
        NSError *error = [NSError errorWithDomain:@"FitBandError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
    
        [self.manager band:self didFailMessage:fitMessage withError:error];
    }
}

@synthesize manager = _manager;
@synthesize pairing = _pairing;
@synthesize uuids = _uuids;
@dynamic centralManager;

@end

#pragma mark - [MFitManager]

@interface MFitManager () <FitBandDelegate, CBCentralManagerDelegate> {
    
    NSMutableArray *_queueMessage;
    NSMutableArray *_queueConnection;
    CBCentralManager *_centralManager;
    CBCentralManagerState _state;
    BOOL _processing;
}

@property (nonatomic, copy) NSString *serviceUUID;
@property (nonatomic, assign) CBCentralManagerState state;

@end

@implementation MFitManager

+ (MFitManager *)defaultManager {
    static MFitManager* instance;
    @synchronized(self) {
        if (!instance) {
            PPDebug( @"MFit Plugin Version - %@", MFitVersion );
            
            instance = [[MFitManager alloc] init];
            return instance;
        }
    }
    return instance;
}

- (BOOL)isConnected {
     NSString *serviceUUID = self.serviceUUID;
    
    if ( [[FitBand sharedInstance] isConnected] && ! (serviceUUID == nil || [serviceUUID isEqualToString:@""]) ) {
        return YES;
    }

    return NO;
}

- (void)bandDidConnect:(FitBand *)band withUUID:(NSString *)uuid {

    self.serviceUUID = uuid;

    if ( _queueConnection.count > 0 ) {
        [_queueConnection enumerateObjectsUsingBlock:^(FitConnection *connection, NSUInteger idx, BOOL * _Nonnull stop) {
            [connection success:[uuid copy]];
        }];

        [_queueConnection removeAllObjects];
    }
    
//    // Change Locale
    PPDebug(@"change locale to ko-kr");
    [self service:FitSetLocale data:@[@(1)] success:^(FitService service, NSDictionary *data) {

    } error:^(NSError *error) {
        PPDebug( @"error: %@", error );
    }];
}

- (void)bandDidFailToConnect:(FitBand *)band withError:(NSError *)error {

    if ( _queueConnection.count > 0 ) {
        FitConnection *fitConnection = [[_queueConnection firstObject] retain];
        
        if ( fitConnection != nil ) {
            [_queueConnection removeObject:fitConnection];
            [fitConnection fail:error];
        }
        else {
            PPWarn( @"connection is not registered" );
        }
        
        [fitConnection release];
    }
}

/*
- (void)bandDidDisconnect:(FitBand *)band {
    
}

- (void)bandDidFailToDisconnect:(FitBand *)band withError:(NSError *)error {
    
}
*/

- (void)band:(FitBand *)band didSuccessService:(FitService)service withResponse:(NSMutableDictionary *)response {
    NSLog( @"didSuccessService" );

    @synchronized(self) {
        if ( _queueMessage.count > 0 ) {
            NSMutableArray *removeMessages = [NSMutableArray array];

            [_queueMessage enumerateObjectsUsingBlock:^(FitMessage *message, NSUInteger idx, BOOL * _Nonnull stop) {
                if ( message.service == service ) {
                    [message success:[response copy]];
                    [removeMessages addObject:message];
                }
            }];

            [_queueMessage removeObjectsInArray:removeMessages];
        }

        [self performSelectorOnMainThread:@selector(executeQueue) withObject:nil waitUntilDone:NO];
    }
}

- (void)band:(FitBand *)band didFailMessage:(FitMessage *)message withError:(NSError *)error {
    NSLog( @"didFailMessage" );

    @synchronized(self) {
        if ( _queueMessage.count > 0 ) {
            NSMutableArray *removeMessages = [NSMutableArray array];

            [_queueMessage enumerateObjectsUsingBlock:^(FitMessage *item, NSUInteger idx, BOOL * _Nonnull stop) {
                if ( [item isEqual:message] ) {
                    [message fail:[error copy]];
                    [removeMessages addObject:message];
                }
            }];

            [_queueMessage removeObjectsInArray:removeMessages];
        }

        [self performSelectorOnMainThread:@selector(executeQueue) withObject:nil waitUntilDone:NO];
    }
}

- (void)dealloc {
    
    
    [super dealloc];
}

- (id)init {
    self = [super init];
    if (self) {
        
        _queueConnection = [[NSMutableArray alloc] init];
        _queueMessage = [[NSMutableArray alloc] init];
        _centralManager = nil;

        [[FitBand sharedInstance] setManager:self];
    }
    return self;
}

- (void)initialize {

    if ( _centralManager == nil ) {
        _state = CBCentralManagerStateUnknown;

        if ( self.isOverIOS7 ) {
            _centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:0] forKey:CBCentralManagerOptionShowPowerAlertKey]];
        }

        [[FitBand sharedInstance] initialize];
    }
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    _state = central.state;
}

- (void)connect:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout {
    
    
    NSLog(@"최초 블루투스 접속");
    [GlobalData sharedGlobalData].bandUUid = self.serviceUUID;
    NSLog(@"글로벌 데이터 uuid초기화");
    
    if ( _state != CBCentralManagerStatePoweredOn ) {
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:400 userInfo:@{NSLocalizedDescriptionKey:@"Bluetooth is disabled"}];
        errorBlock( error );
        return;
    }

    if ( self.serviceUUID == nil ) {
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:400 userInfo:@{NSLocalizedDescriptionKey:@"Band isn't paired"}];
        errorBlock( error );
        return;
    }
    
    NSString *serviceUUID = self.serviceUUID;

    FitConnection *connection = [[FitConnection alloc] initWithDelegate:self timeout:timeout];
    connection.successBlock = finishBlock;
    connection.errorBlock = errorBlock;
    
    [_queueConnection addObject:connection];
    
    [[FitBand sharedInstance] connect:serviceUUID timeout:timeout];
}

- (void)pair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout {
    
    NSLog(@"두번째 블루투스 접속1");
    NSLog(@"두번째 블루투스 접속 %@", self.serviceUUID);
    
    
    [GlobalData sharedGlobalData].bandUUid = self.serviceUUID;
    NSLog(@"글로벌 데이터 uuid초기화");
    
    if ( _state != CBCentralManagerStatePoweredOn ) {
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:400 userInfo:@{NSLocalizedDescriptionKey:@"Bluetooth is disabled"}];
        errorBlock( error );
        return;
    }
    
    NSString *serviceUUID = self.serviceUUID;
    
    if ( [FitBand sharedInstance].pairing == YES ) {
        [[FitBand sharedInstance] cancel];
    }

    [_queueMessage removeAllObjects];
    _processing = NO;
    
    FitConnection *connection = [[FitConnection alloc] initWithDelegate:self timeout:timeout];
    connection.successBlock = finishBlock;
    connection.errorBlock = errorBlock;
    
    [_queueConnection addObject:connection];
    
    [[FitBand sharedInstance] connect:serviceUUID timeout:timeout];
    
}

#pragma 선택된 uuid 페어링
- (void)pair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout uuid:(NSString *) uuid {
    
    NSLog(@"최초 블루투스 접속2");
    
    if ( _state != CBCentralManagerStatePoweredOn ) {
        NSError *error = [NSError errorWithDomain:@"FitManagerError" code:400 userInfo:@{NSLocalizedDescriptionKey:@"Bluetooth is disabled"}];
        errorBlock( error );
        return;
    }
    
    NSLog(@"최초 블루투스 접속3");
    
    NSString *serviceUUID = uuid;
    
    if ( [FitBand sharedInstance].pairing == YES ) {
        [[FitBand sharedInstance] cancel];
    }
    
    [_queueMessage removeAllObjects];
    _processing = NO;
    
    FitConnection *connection = [[FitConnection alloc] initWithDelegate:self timeout:timeout];
    connection.successBlock = finishBlock;
    connection.errorBlock = errorBlock;
    
    [_queueConnection addObject:connection];
    
    [[FitBand sharedInstance] selectConnect:serviceUUID timeout:timeout];
}

- (void)reinitialize {
    [FitBand destroyInstance];

    [[FitBand sharedInstance] setManager:self];
    [[FitBand sharedInstance] initialize];
}

- (void)unpair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock {
    //NSString *serviceUUID = serviceUUID;

    [_queueMessage removeAllObjects];
    _processing = NO;

    if ( [FitBand sharedInstance].pairing == YES ) {
        [[FitBand sharedInstance] cancel];
    }

    //[self reinitialize];

    if ( self.serviceUUID == nil ) {
        finishBlock( @"" );
        return;
    }

    __block FitManagerPairingFinishBlock successBlock = [finishBlock copy];
    __block FitManagerPairingErrorBlock failBlock = [errorBlock copy];

//    [[FitBand sharedInstance] disconnect:^(BOOL val) {
//
//        NSString *serviceUUID = self.serviceUUID;
//        self.serviceUUID = nil;
//
//        if ( successBlock ) {
//            successBlock( serviceUUID ? serviceUUID : @"" );
//            successBlock = nil;
//            failBlock = nil;
//        }
//        
//    } error:^(NSError *err) {
//        PPDebug( @"error: %@", err );
//        
//        NSError *error = [NSError errorWithDomain:@"MFitManagerError" code:err.code userInfo:@{NSLocalizedDescriptionKey:err.localizedDescription}];
//
//        if ( failBlock ) {
//            failBlock( error );
//            successBlock = nil;
//            failBlock = nil;
//        }
//    }];

    // 임시 처리
    self.serviceUUID = nil;
    successBlock( @"" );
    successBlock = nil;
    failBlock = nil;
}

// 밴드리스트 찾기
//- (void) searchBand:(BandListBlock)dataArray {
//    
//    [[X6_bt_a getInstance] SearchBracelet:^(NSMutableArray *val){
//        
//        NSLog(@"밴드 찾음");
//        dataArray(val);
//        
//    } err:^(NSError *error){
//        
//    }];
//}

- (void)startQueue {
    if ( _processing == YES ) {
        PPDebug( @"processing... : %@", _queueMessage );
        return;
    }

    _processing = YES;
    
    [self performSelectorOnMainThread:@selector(executeQueue) withObject:nil waitUntilDone:NO];
}

- (void)executeQueue {
    
    PPDebug(@"executeQueue :%@", @(_queueMessage.count) );
    
    if ( _queueMessage.count == 0 ) {
        _processing = NO;
        return;
    }
    
    FitMessage *fitMessage = [_queueMessage firstObject];
    
    [[FitBand sharedInstance] send:fitMessage];
}

- (void)cancelQueue {
    
    PPDebug(@"cancelQueue :%@", @(_queueMessage.count) );

    [_queueMessage removeAllObjects];
    _processing = NO;
}

- (void)service:(FitService)service data:(NSArray *)data success:(FitManagerDataSuccessBlock)success error:(FitManagerDataErrorBlock)error {

    PPDebug( @"service: %@", @(service), data );

    FitMessage *fitMessage = [[FitMessage alloc] initWithDelegate:self];
    fitMessage.service = service;
    fitMessage.request = data == nil ? nil : [NSMutableArray arrayWithArray:[data copy]];
    fitMessage.successBlock = [success copy];
    fitMessage.errorBlock = [error copy];
    fitMessage.timeout = ( service == FitGetHistoryAppointValue ) ? 120000 : 5000;
    
    [_queueMessage addObject:fitMessage];
    
    [self startQueue];
}

- (void)removeConnectionQueue:(FitConnection *)fitConnection {
    PPDebug( @"removeConnectionQueue : %@", fitConnection );

    @synchronized(self) {
        if ( [_queueConnection containsObject:fitConnection] ) {
            [_queueConnection removeObject:fitConnection];
        }
    }
}

- (void)removeMessageQueue:(FitMessage *)fitMessage {
    PPDebug( @"removeMessageQueue : %@", @(fitMessage.service) );

    @synchronized(self) {
        if ( [_queueMessage containsObject:fitMessage] ) {
            [_queueMessage removeObject:fitMessage];
        }
    }
}

- (NSString *)serviceUUID {
    NSString *value = objc_getAssociatedObject(self, &MFitManagerInfoKeyServiceUUIDBlockKey);
    
    if ( value == nil ) {
        id storageValue = [[NSUserDefaults standardUserDefaults] objectForKey:MFitManagerInfoKeyServiceUUID];
        
        if ( storageValue != nil ) {
            objc_setAssociatedObject(self, &MFitManagerInfoKeyServiceUUIDBlockKey, storageValue, OBJC_ASSOCIATION_COPY);
            value = storageValue;
        }
    }
    
    return ( value == nil ) ? @"" : value;
}

- (void)setServiceUUID:(NSString *)value {

    if ( value == nil ) {
        objc_setAssociatedObject(self, &MFitManagerInfoKeyServiceUUIDBlockKey, NULL, OBJC_ASSOCIATION_COPY);
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:MFitManagerInfoKeyServiceUUID];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return;
    }

    if ( ! [self.serviceUUID isEqualToString:value] ) {
        [_queueMessage removeAllObjects];
    }

    objc_setAssociatedObject(self, &MFitManagerInfoKeyServiceUUIDBlockKey, ( value == nil ) ? NULL : value, OBJC_ASSOCIATION_COPY);
    [[NSUserDefaults standardUserDefaults] setObject:value forKey:MFitManagerInfoKeyServiceUUID];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)cancelServices {

    [_queueMessage removeAllObjects];

}

@synthesize state = _state;
@dynamic serviceUUID;

@end
