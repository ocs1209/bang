//
//  MFitManager.h
//  MDebug
//
//  Created by ProgDesigner on 2015. 9. 9..
//
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreBluetooth/CBService.h>

typedef enum {
    FitGetCurrentQuantities = 0,    // READDQ: 현재 실시간 움직임 읽기
    FitGetHistoryTable = 1,         // READLSB
    FitGetHistoryAppointValue = 2,  // READLS: 지정된 시간에 히스토리 가져오기
    FitGetUserProfile = 3,          // READGR: 사용자 프로필(나이, 키, 몸무게, 성별) 정보 가져오기
    FitSetUserProfile = 4,          // WRITEGR: 사용자 프로필 정보 설정하기
    FitGetClock = 5,                // READSJ: 시간 설정 가져오기
    FitSetClock = 6,                // WRITESJ: 시간 설정하기
    FitSetAlarm = 7,                // WRITENZ: 알람 시간 설정하기
    FitGetAlarm = 8,                // READNZ: 알람 설정 가져오기
    FitGetMoveLessTime = 9,         // READJZ  비활동 시간 설정 가져오기
    FitSetMoveLessTime = 10,        // WRITEJZ 비활동 시간 설정하기
    FitGetSleepTime = 11,           // READSM: 수면시간 설정 가져오기
    FitSetSleepTime = 12,           // WRITESM: 수면시간 설정하기
    FitGetDoNotDisturbTime = 13,    // READWR 방해금지 모드 시간 설정 가져오기
    FitSetDoNotDisturbTime = 14,    // WRITEWR 방해금지 모드 시간 설정
    FitGetBatteryStatus = 15,       // READDL  배터리 상태
    FitSystemReset = 16,            // WRITECZ  시스템 설정 리셋
    FitSystemFirmwareVersion = 17,  // READBB  밴드 펌웨어 버전
    FitSystemHardwareVersion = 18,  // READYB  밴드 하드웨어 버전
    FitSystemManufacturer = 19,     // READCB  밴드 제조업체 정보
    FitGetDailyStep = 20,           // READMB: 하루 목표 걸음수 가져오기
    FitSetDailyStep = 21,           // WRITEMB: 하루 목표 걸음수 설정하기
    FitGetSystemMacAddress = 22,    // READXLH: MacAddress 가져오기
    FitSystemUpgrade = 23,          // DEVUP 펌웨어 업그레이드
    FitSystemDFUMOD = 24,           // DFUMOD
    FitSystemDFUX = 25,             // DFUX
    FitSystemDSUDP = 26,            // SUDP
    FitGetClockPart = 27,           // RAPM 오전/오후 가져오기
    FitSetClockPart = 28,           // WAPM 오전/오후 설정하기
    FitSetNotificationType = 29,    // WNOTE 메세지 타입 설정하기
    FitGetNotificationType = 30,    // RNOTE 메세지 타입 가져오기
    FitSetDisplayReverse = 31,      // WLEFT 왼손/오른손 설정하기
    FitGetDisplayReverse = 32,      // RLEFT 왼손/오른손 설정 가져오기
    FitSetDisplayOrientation = 33,  // WHORVER 수평/수정 설정하기
    FitSystemSUDPX = 34,            // SUDPX
    FitGetTemporaryMode = 35,       // RLS 임시모드 설정 가져오기
    FitSetTemporaryMode = 36,       // WLS 임시모드 설정하기
    FitGetHandGesture = 37,         // RTS 손 올리기 인식 설정 가져오기
    FitSetHandGesture = 38,         // WTS 손 올리기 인식 설정하기
    FitSetLocale = 39,              // WYY 언어 설정 가져오기
    FitGetLocale = 40,              // RYY 언어 설정하기
    
    FitServiceCustom = 1000,        // 직접 단말기를 컨트롤함
    FitGetDisplayRotation = 1801,   // 디스플레이 가로/세로 방향 가져오기
    FitSetDisplayRotation = 1802,   // 디스플레이 가로/세로 방향 설정하기
    FitGetDisplayShowDate = 1803,   // 디스플레이가 세로방향일때 디스플레이 날짜 표시여부 가져오기
    FitSetDisplayShowDate = 1804,   // 디스플레이가 세로방향일때 디스플레이 날짜 표시여부 설정하기
    FitGetDisplaySwitchHand = 1805, // 디스플레이가 세로방향일때 디스플레이 왼손/오른손 방향 가져오기
    FitSetDisplaySwitchHand = 1806, // 디스플레이가 세로방향일때 디스플레이 왼손/오른손 방향 설정하기
} FitService;

typedef void (^FitManagerPairingFinishBlock) ( NSString *uuid );
typedef void (^FitManagerPairingErrorBlock) ( NSError *error );
typedef void (^FitManagerDataSuccessBlock) ( FitService service, NSDictionary *data );
typedef void (^FitManagerDataErrorBlock) ( NSError *error );
typedef void (^FitManagerBluetoothStateBlock) ( CBCentralManagerState state );
typedef void (^BandListBlock) (NSArray *bandListArray);




@interface MFitManager : NSObject

@property (nonatomic, readonly) CBCentralManagerState state;
@property (nonatomic, readonly) NSString *serviceUUID; // Service 되고 있는 Band 의 UUID

- (BOOL)isConnected;
- (void)initialize;
- (void)connect:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout;

- (void)pair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout;

- (void)unpair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock;

- (void)service:(FitService)service data:(NSArray *)data success:(FitManagerDataSuccessBlock)successBlock error:(FitManagerDataErrorBlock)errorBlock;

- (void)pair:(FitManagerPairingFinishBlock)finishBlock error:(FitManagerPairingErrorBlock)errorBlock timeout:(NSTimeInterval)timeout uuid:(NSString *) uuid;

- (void)cancelServices;

- (void) searchBand : (BandListBlock) dataArray;

+ (MFitManager *)defaultManager;

@end
