//
//  MMotionManager.h
//  MDebug
//
//  Created by ProgDesigner on 2015. 11. 19..
//
//

#import <Foundation/Foundation.h>


typedef enum {
    MotionServiceUnknown = 0,
    MotionGetCurrentQuantities = 1010,     // 현재 실시간 움직임 읽기
    MotionGetHistoryTable = 1011,          // 데이타가 저장된 날짜 리스트 가져오기
    MotionGetHistoryAppointValue = 1012,   // 지정된 날짜의 데이타 가져오기
    MotionGetSleepTime = 1041,             // 수면시간 설정 가져오기
    MotionSetSleepTime = 1042,             // 수면시간 설정하기
    MotionGetDailyStep = 1046,             // 하루 목표 걸음수 가져오기
    MotionSetDailyStep = 1047,             // 하루 목표 걸음수 설정하기
    // MotionSystemReset = 1049,              // 저장데이타 리셋
} MotionService;

typedef void (^MotionServiceManagerDataSuccessBlock) ( MotionService service, NSDictionary *response );
typedef void (^MotionServiceManagerDataErrorBlock) ( NSError *error );


@interface MMotionServiceManager : NSObject

- (void)service:(MotionService)service request:(NSDictionary *)request success:(MotionServiceManagerDataSuccessBlock)successBlock error:(MotionServiceManagerDataErrorBlock)errorBlock;

+ (MMotionServiceManager *)defaultManager;

@end

@interface MMotionManager : NSObject

- (void)initialize;

+ (MMotionManager *)defaultManager;

@end
