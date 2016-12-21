//
//  ExtendWNInterface.m
//


#import "Wellness-Swift.h"
#import "ExtendWNInterface.h"
#import "PPHybridViewController.h"
#import <MFit/MFitManager.h>
#import <MFit/GlobalData.h>
#import "AppDelegate.h"
#import "HistorySampleData.h"
#import "SleepSummaryData.h"
//#define GATEWAY @"http://211.241.199.180:9090/gw/api"
#define GATEWAY @"http://gateway.rebon.co.kr/api"
#define SUMMARY_SEND [GATEWAY stringByAppendingString:@"/fit/sync/summary/send"]
#define LAST_SEND [GATEWAY stringByAppendingString:@"/fit/step/last"]
#define MEMBERSHIP_START_DATE [GATEWAY stringByAppendingString:@"/user/createDate"]
//@class WriteBand;

@interface ExtendWNInterface ()

@property (nonatomic, assign) PPWebViewController *viewctrl;

@property (strong, nonatomic) NSString *goalVal;

@end

@implementation ExtendWNInterface

- (BOOL)checkValidParameters:(NSDictionary *)parameters fromValidClasses:(NSDictionary *)validClasses errorMessage:(NSString **)errorMessage {
    
    for ( NSString *key in validClasses ) {
        Class validClass = [validClasses objectForKey:key];
        id parameter = [parameters objectForKey:key];
        
        if ( parameter == nil ) {
            *errorMessage = [NSString stringWithFormat:@"key(%@) is null", key];
            return NO;
        }
        
        if ( ![parameter isKindOfClass:validClass] ) {
            *errorMessage = [NSString stringWithFormat:@"key(%@) is invalid type", key];
            return NO;
        }
        
        if ( [validClass isKindOfClass:[NSString class]] && [[parameter stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] isEqualToString:@""]) {
            *errorMessage = [NSString stringWithFormat:@"key(%@) is invalid string", key];
            return NO;
        }
        else if ( [validClass isKindOfClass:[NSDictionary class]] ) {
            *errorMessage = [NSString stringWithFormat:@"key(%@) is invalid dictionary", key];
            return NO;
        }
        else if ( [validClass isKindOfClass:[NSArray class]] ) {
            *errorMessage = [NSString stringWithFormat:@"key(%@) is invalid array", key];
            return NO;
        }
    }
    
    return YES;
}

- (BOOL)isAlive {
    if (![[PPNavigationController ppNavigationController] existViewController:_viewController]) {
        PPDebug(@"Already released view controller!!");
        return NO;
    }
    
    return YES;
}

- (NSString *)exWN2PluginFitSettingValueGet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   @"callback": [NSString class]
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *callback = [options objectForKey:@"callback"];
    
    /*
     FitSystem1 = 21,                // RAPM ??  // AM CHANGE
     FitSystem2 = 22,                // WAPM ??  // AM CHANGE
     FitSystem3 = 23,                // WNOTE ?? // Notification QQ, wechat, Skype, News, E-mail, Other
     FitSystem4 = 24,                // RNOTE ?? // Notification
     FitSystem5 = 25,                // WLEFT ??
     FitSystem6 = 26                 // WHORVER ??
     */
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self.viewController callCbfunction:callback withObjects:@{@"date":@(0), @"uiTypue": @(0), @"status": @"SUCCESS"}, nil];
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

- (NSString *)exWN2PluginFitSettingValueSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    // BOOL isOn = [[options objectForKey:@"isOn"] boolValue];
    // NSString *callback = [options objectForKey:@"callback"];
    
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

- (NSString *)exWN2PluginFitScreenChangeGet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   @"callback": [NSString class]
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *callback = [options objectForKey:@"callback"];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self.viewController callCbfunction:callback withObjects:@{@"flip":@(0), @"status": @"SUCCESS"}, nil];
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

- (NSString *)exWN2PluginFitVerticalClockGet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   @"callback": [NSString class]
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *callback = [options objectForKey:@"callback"];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self.viewController callCbfunction:callback withObjects:@{@"direction":@(0), @"status": @"SUCCESS"}, nil];
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

// 2016.06월 부터 추가

- (NSString *) exWN2PluginFitBandHistoryyy {
    
    return @"aaa";
}

//- (NSString *) exWN2PluginFitBandHistory : (NSString *) userKey : (NSString *) licenseKey : (NSString *) sleepStartTime : (NSString *) sleepEndTime {
- (NSString *) exWN2PluginFitBandHistory : (NSString *) userKey : (NSString *) licenseKey : (NSString *) sleepStartTime : (NSString *) sleepEndTime :(NSString *) goalVal {
    
    // 골값 초기화
    _goalVal = goalVal;
    
    // isLogin == true : 자동로그인
    
    // 블루투스 통신 시작 알림
    _setGlovalValue(@"BLE_LOCK", @"LOCK");
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSString *isFirst = [userDefaults objectForKey:@"isFirst"]; // 처음 설치 여부 판단
    
    // 처음설치 아닐때
    if ([isFirst isEqualToString:@"YES"]) {
        
        NSLog(@"%@", _getGlovalValue(@"AUTO_LOGIN"));
        
        // 자동 로그인
        if([_getGlovalValue(@"AUTO_LOGIN") isEqualToString:@"AUTO"]) {
            
            [self lastUploadDateSync:userKey :licenseKey :sleepStartTime :sleepEndTime];
        }
        // 수동 로그인
        else {
            
            [self lastUploadDateSync:userKey :licenseKey :sleepStartTime :sleepEndTime];
        }
    }
    //  처음 설치 일때
    else {
        // 라스트 데이터 가져오기
        [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
    }
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

- (void) lastUploadDateSync : (NSString *) userKey : (NSString *) licenseKey : (NSString *) sleepStartTime : (NSString *) sleepEndTime {
    
    
    // 최근 업로드 날짜 가져오기
    NSString *request_url = LAST_SEND;
    NSURL *url = [NSURL URLWithString:request_url];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    
    NSString *postString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"user_key\" : \"%@\"}}", userKey];
    NSData *postData = [postString dataUsingEncoding:NSUTF8StringEncoding];
    
    request.HTTPMethod = @"POST";
    [request setHTTPBody:postData];
    
    NSURLSession *session = [NSURLSession sharedSession];
    
    [[session dataTaskWithRequest:request completionHandler:^(NSData *data,
                                                            NSURLResponse *response,
                                                              NSError *error) {
        
        NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&error];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            if (jsonDic != nil) {
                
                // 성공
                if ([jsonDic[@"head"][@"result_code"] isEqualToString:@"200"]) {
                    
                    // 마지막 업로드 일자 가져오기
                    
                    NSArray *resultArray = jsonDic[@"body"][@"list"];
                    
                    if (resultArray.count > 0) {
                        
                        NSDictionary *lastUploadDate = resultArray[0];
                        
                        // 720개의 스텝데이터가 쌓인 마지막 날짜를 가져옴
                        // 플러스 하루하기
                        NSDateFormatter *lastUploadDateFormatter = [[NSDateFormatter alloc] init];
                        [lastUploadDateFormatter setDateFormat:@"yyyy-MM-dd"];
                        [lastUploadDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
                        NSDate *serverLastUploadDate = [lastUploadDateFormatter dateFromString:lastUploadDate[@"sync_ymdt"]];
                        serverLastUploadDate = [serverLastUploadDate dateByAddingTimeInterval:60*60*24];
                        
                        NSDateComponents *serverLastUploadDateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:serverLastUploadDate];
                        
                        NSString *serverUploadDate = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)serverLastUploadDateComponents.year, (int)serverLastUploadDateComponents.month, (int)serverLastUploadDateComponents.day];
                        
                        [self PluginFitBandHistory :serverUploadDate :userKey :licenseKey :sleepStartTime :sleepEndTime];
                        //                        [self PluginFitBandHistory :@"2016-06-18" :userKey :licenseKey :sleepStartTime :sleepEndTime];
                    }
                    else {
                        
                        // 라스트 업로드 없는 것으로 처리
                        [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
                    }
                }
                // 실패
                else {
                    
                    // 라스트 업로드 없는 것으로 처리
                    [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
                }
            }
            
            // nil 처리
            else {
                
                // 라스트 업로드 없는 것으로 처리
                [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
            }
        });
        
        
    }] resume];
    
    
    
    
    
    
    
    
    
    
//    // 최근업로드 날짜 가져오기
//    dispatch_async(dispatch_get_global_queue(0, 0), ^{
//        
//        NSString *request_url = LAST_SEND;
//        NSURL *url = [NSURL URLWithString:request_url];
//        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
//        
//        NSString *postString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"user_key\" : \"%@\"}}", userKey];
//        NSData *postData = [postString dataUsingEncoding:NSUTF8StringEncoding];
//        
//        request.HTTPMethod = @"POST";
//        //        NSMutableData *body = [NSMutableData data];
//        
//        NSError *error;
//        
//        [request setHTTPBody:postData];
//        
//        NSData *respondData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:&error];
//        NSString *result_string = [[NSString alloc] initWithData:respondData encoding:NSUTF8StringEncoding];
//        NSLog(@"결과 : %@", result_string);
//        NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:respondData options:NSJSONReadingMutableContainers error:&error];
//        
//        
//        dispatch_async(dispatch_get_main_queue(), ^{
//            
//            if (jsonDic != nil) {
//                
//                // 성공
//                if ([jsonDic[@"head"][@"result_code"] isEqualToString:@"200"]) {
//                    
//                    // 마지막 업로드 일자 가져오기
//                    
//                    NSArray *resultArray = jsonDic[@"body"][@"list"];
//                    
//                    if (resultArray.count > 0) {
//                        
//                        NSDictionary *lastUploadDate = resultArray[0];
//                        
//                        // 720개의 스텝데이터가 쌓인 마지막 날짜를 가져옴
//                        // 플러스 하루하기
//                        NSDateFormatter *lastUploadDateFormatter = [[NSDateFormatter alloc] init];
//                        [lastUploadDateFormatter setDateFormat:@"yyyy-MM-dd"];
//                        [lastUploadDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
//                        NSDate *serverLastUploadDate = [lastUploadDateFormatter dateFromString:lastUploadDate[@"sync_ymdt"]];
//                        serverLastUploadDate = [serverLastUploadDate dateByAddingTimeInterval:60*60*24];
//                        
//                        NSDateComponents *serverLastUploadDateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:serverLastUploadDate];
//                        
//                        NSString *serverUploadDate = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)serverLastUploadDateComponents.year, (int)serverLastUploadDateComponents.month, (int)serverLastUploadDateComponents.day];
//                        
//                        [self PluginFitBandHistory :serverUploadDate :userKey :licenseKey :sleepStartTime :sleepEndTime];
//                        //                        [self PluginFitBandHistory :@"2016-06-18" :userKey :licenseKey :sleepStartTime :sleepEndTime];
//                    }
//                    else {
//                        
//                        // 라스트 업로드 없는 것으로 처리
//                        [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
//                    }
//                }
//                // 실패
//                else {
//                    
//                    // 라스트 업로드 없는 것으로 처리
//                    [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
//                }
//            }
//            
//            // nil 처리
//            else {
//                
//                // 라스트 업로드 없는 것으로 처리
//                [self PluginFitBandHistory :nil :userKey :licenseKey :sleepStartTime :sleepEndTime];
//            }
//        });
//    });
}

// 밴드 데이터 가져와서 로컬 DB에 넣기
- (NSString *) PluginFitBandHistory : (NSString *) lastUploadDate : (NSString *) userKey : (NSString *) licenseKey : (NSString *) sleepStartTime : (NSString *) sleepEndTime {
    
    //[self delete_history_core_data];
    
    // 맥스값 가져오기
    NSString *maxDate = lastUploadDate;
    
    NSMutableArray *arrayList = [[NSMutableArray alloc] init];
    
    // 오늘꺼 넣기(이건 작동)
    if (maxDate == nil) {
        
        // 최초가입일자 이후만 보내도록 해야함
        // 최근업로드 날짜 가져오기
        NSString *request_url = MEMBERSHIP_START_DATE;
        NSURL *url = [NSURL URLWithString:request_url];
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
        
        NSString *postString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"user_key\" : \"%@\"}}", userKey];
        NSData *postData = [postString dataUsingEncoding:NSUTF8StringEncoding];
        
        request.HTTPMethod = @"POST";
        //        NSMutableData *body = [NSMutableData data];
        
        [request setHTTPBody:postData];
        
        
        NSURLSession *session = [NSURLSession sharedSession];
        
        [[session dataTaskWithRequest:request completionHandler:^(NSData *data,
                                                                NSURLResponse *response,
                                                                 NSError *error) {
            
            NSString *result_string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            NSLog(@"결과 : %@", result_string);
            NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&error];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                if (jsonDic != nil) {
                    
                    if ([jsonDic[@"head"][@"result_code"] isEqualToString:@"200"]) {
                        
                        // 오늘일자만 가져오기
                        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
                        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
                        NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day];
                        
                        //NSString *user_created_date = jsonDic[@"body"][@"date"];
                        [arrayList addObject:todayDateString];
                        HistoryInterface *historyInterface = [[HistoryInterface alloc] init];
                        historyInterface.userKey = userKey;
                        historyInterface.authKey = licenseKey;
                        historyInterface.sleepStartTime = sleepStartTime;
                        historyInterface.sleepEndTime = sleepEndTime;
                        historyInterface.delegate = self;
                        [historyInterface AddOnFitHistory:arrayList];
                    }
                }
                
                // nil 처리
                else {
                    
                }
            });
            
        }] resume];
        
        
//        // 최초가입일자 이후만 보내도록 해야함
//        // 최근업로드 날짜 가져오기
//        dispatch_async(dispatch_get_global_queue(0, 0), ^{
//            
//            NSString *request_url = MEMBERSHIP_START_DATE;
//            NSURL *url = [NSURL URLWithString:request_url];
//            NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
//            
//            NSString *postString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"user_key\" : \"%@\"}}", userKey];
//            NSData *postData = [postString dataUsingEncoding:NSUTF8StringEncoding];
//            
//            request.HTTPMethod = @"POST";
//            //        NSMutableData *body = [NSMutableData data];
//            
//            NSError *error;
//            
//            [request setHTTPBody:postData];
//            
//            NSData *respondData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:&error];
//            NSString *result_string = [[NSString alloc] initWithData:respondData encoding:NSUTF8StringEncoding];
//            NSLog(@"결과 : %@", result_string);
//            NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:respondData options:NSJSONReadingMutableContainers error:&error];
//            
//            dispatch_async(dispatch_get_main_queue(), ^{
//                
//                if (jsonDic != nil) {
//                    
//                    if ([jsonDic[@"head"][@"result_code"] isEqualToString:@"200"]) {
//                        
//                        // 오늘일자만 가져오기
//                        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
//                        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
//                        NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day];
//                        
//                        //NSString *user_created_date = jsonDic[@"body"][@"date"];
//                        [arrayList addObject:todayDateString];
//                        HistoryInterface *historyInterface = [[HistoryInterface alloc] init];
//                        historyInterface.userKey = userKey;
//                        historyInterface.authKey = licenseKey;
//                        historyInterface.sleepStartTime = sleepStartTime;
//                        historyInterface.sleepEndTime = sleepEndTime;
//                        historyInterface.delegate = self;
//                        [historyInterface AddOnFitHistory:arrayList];
//                    }
//                }
//                
//                // nil 처리
//                else {
//                    
//                }
//            });
//        });
        
        return [@{@"status":@"PROCESSING"} jsonString];
    }
    
    // 코어데이터 맥스 일자 NSDate 로 변환
    NSDateFormatter *coreDataMaxDateFormatter = [[NSDateFormatter alloc] init];
    [coreDataMaxDateFormatter setDateFormat:@"yyyy-MM-dd"];
    [coreDataMaxDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
    NSDate *coreDateMaxDate = [coreDataMaxDateFormatter dateFromString:maxDate];
    
    NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
    NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
    NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day];
    NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
    [basicDateFormatter setDateFormat:@"yyyy-MM-dd"];
    [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
    NSDate *basicDate = [basicDateFormatter dateFromString:todayDateString]; // 오늘일자

    // 오늘 일자와 코어데이터 맥스 일자 비교
    // -1 2016-06-13(맥스값)
    NSInteger result = [self compareFromDateToDate:coreDateMaxDate :basicDate];
    
    // 코어데이터 맥스 일자가 현재 일자보다 과거일때
    // 중단일자 시간부터 현재까지 데이터 넣어주기
    if (result >= 0) {
        
        // 일주일 이내일때
        // 중단 지점부터 코어데이터 넣기(일단위)
        if (result < 7 && result >= 0) {
            
            // 코어데이터 맥스일자 다 삭제
            
            AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
            NSManagedObjectContext *stepSummaryDataContext = [appDelegate managedObjectContext];
            NSFetchRequest *request = [NSFetchRequest fetchRequestWithEntityName:@"History_Sample"];
            NSPredicate *predicate = [NSPredicate predicateWithFormat:@"step_date => %@", maxDate];
            [request setPredicate:predicate];
            NSError *error = nil;
            NSArray *results = [stepSummaryDataContext executeFetchRequest:request error:&error];
            
            for (HisotorySampleData *sampleData in results) {
                NSLog(@"코어데이터 삭제 : %@", sampleData.step_date);
                [stepSummaryDataContext deleteObject:sampleData];
                [stepSummaryDataContext save:nil];
            }
            
            // 루프돌면서 데이터 넣기
            while ([self compareFromDateToDate:coreDateMaxDate:basicDate] >= 0 && [self compareFromDateToDate:coreDateMaxDate:basicDate] < 7) {
                
                NSLog(@"%ld", [self compareFromDateToDate:coreDateMaxDate:basicDate]);
                
                NSDateComponents *coreDateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:coreDateMaxDate];
                NSString *coreDate = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)coreDateComponents.year, (int)coreDateComponents.month, (int)coreDateComponents.day];
                
                [arrayList addObject:coreDate];
                
                coreDateMaxDate = [coreDateMaxDate dateByAddingTimeInterval:60*60*24];
                
                NSLog(@"%ld", (long)[self formattedDateCompareToNow:coreDateMaxDate]);
            }
        }
        // 일주일보다 기간이 클때 일주일치 밴드 데이터 다 넣어주기
        else {
            
            NSDate *loopDate = [basicDate dateByAddingTimeInterval:60*60*24*-6];
            
            while ([self compareFromDateToDate:loopDate:basicDate] > -1) {
                
                NSDateComponents *coreDateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:loopDate];
                NSString *coreDate = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)coreDateComponents.year, (int)coreDateComponents.month, (int)coreDateComponents.day];
                
                [arrayList addObject:coreDate];
                
                loopDate = [today dateByAddingTimeInterval:60*60*24];
            }
        }
    }
    
    // 코어데이터에 밴드 데이터 쓰기
    // 밴드안에 저장된 날짜 레인지 코어데이터 마지막 날짜 비교후 코어데이터 쌓기
    
    HistoryInterface *historyInterface = [[HistoryInterface alloc] init];
    historyInterface.userKey = userKey;
    historyInterface.authKey = licenseKey;
    historyInterface.sleepStartTime = sleepStartTime;
    historyInterface.sleepEndTime = sleepEndTime;
    historyInterface.delegate = self;
    [historyInterface AddOnFitHistory:arrayList];
//    [historyInterface AddOnFitHistory:@[@"2015-10-14", @"2015-10-15", @"2016-10-12", @"2016-10-13", @"2016-10-14"]];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

// 코어데이터 맥스 날짜 가져오기 &&  맥스시간 가져오기
- (HisotorySampleData *) getMaxDate {
    
    NSError *error = nil;
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *historyDataContext = [appDelegate managedObjectContext];
    
    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] initWithEntityName:@"History_Sample"];
    fetchRequest.fetchLimit = 1;
    fetchRequest.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"idx" ascending:NO]];
    NSArray *results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    HisotorySampleData *hisotorySampleData;
    
    if (results.count > 0) {
        hisotorySampleData = (HisotorySampleData*)results[0];
        NSLog(@"%@", hisotorySampleData.step_date);
        NSLog(@"%@", hisotorySampleData.time);
    }
    
    return hisotorySampleData;
}

// 코어데이터 넣은 후 서버 업로드
- (void) historyData:(NSString *)jsonString arrayListDate:(NSArray *)arrayListDate userKey:(NSString *)userKey authKey:(NSString *)authKey sleepStartTime:(NSString *)sleepStartTime sleepEndTime:(NSString *)sleepEndTime {
    
    // 테스트 코드
//        [self delete_history_core_data];
    
    NSLog(@"%@", jsonString);
    
    NSArray *result_json = [jsonString objectFromJsonString];
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *historyDataContext = [appDelegate managedObjectContext];
    NSError *error = nil;
    
    // 유저디폴트에서 현재 IDX값 가져옴
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSInteger max_idx = [[userDefaults objectForKey:@"idx"] integerValue];    
    
    NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
    [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
    
    for (NSDictionary *dic in result_json) {
        
        NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%@ %@:00", dic[@"date"], dic[@"time"]]];
        HisotorySampleData *hisotorySampleData = [NSEntityDescription insertNewObjectForEntityForName:@"History_Sample" inManagedObjectContext:historyDataContext];
        
        
        [hisotorySampleData setIdx:[NSNumber numberWithInteger:max_idx]];
        [hisotorySampleData setStep_date:dic[@"date"]];
        [hisotorySampleData setTime:dic[@"time"]];
        [hisotorySampleData setType:dic[@"active"]];
        [hisotorySampleData setValue:[NSNumber numberWithInteger:[dic[@"value"] integerValue]]];
        [hisotorySampleData setStep_datetime:basicDate];
        
        
        if (![historyDataContext save:&error]) {
            NSLog(@"Save did not complete successfully. Error: %@",
                  [error localizedDescription]);
        }
        
        max_idx++;
    }
    
    [userDefaults setObject:[NSNumber numberWithInteger:max_idx - 1] forKey:@"idx"];
    
    NSString *stepJsonResult = [self stepJsonBuild:jsonString arrayListDate:arrayListDate userKey:userKey authKey:authKey sleepStartTime:sleepStartTime sleepEndTime:sleepEndTime];
    NSString *sleepJsonResult = [self sleepJsonBuild:jsonString arrayListDate:arrayListDate userKey:userKey authKey:authKey sleepStartTime:sleepStartTime sleepEndTime:sleepEndTime];
    
    NSString *postDataString = @"";
    
    if ([sleepJsonResult isEqualToString:@""]) {
        
        postDataString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"auth_token\" : \"%@\", \"user_key\" : \"%@\", \"device\" : \"B\", \"items\" : [%@]}}", authKey, userKey, stepJsonResult];
    }
    else {
        
        postDataString = [NSString stringWithFormat:@"{\"head\" : {}, \"body\" : {\"auth_token\" : \"%@\", \"user_key\" : \"%@\", \"device\" : \"B\", \"items\" : [%@,%@]}}", authKey, userKey, stepJsonResult, sleepJsonResult];
    }
    

    NSLog(@"%@", postDataString);
    
    NSData *postData = [postDataString dataUsingEncoding:NSUTF8StringEncoding];
    
    NSString *request_url = SUMMARY_SEND;
    NSURL *url = [NSURL URLWithString:request_url];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    request.HTTPMethod = @"POST";
    [request setHTTPBody:postData];
    
    NSURLSession *session = [NSURLSession sharedSession];
    
    [[session dataTaskWithRequest:request completionHandler:^(NSData *data,
                                                            NSURLResponse *response,
                                                              NSError *error){
        
        NSString *result_string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        NSLog(@"결과 : %@", result_string);
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            //            [bandInit sxInterfaceInit];
            _setGlovalValue(@"BLE_LOCK", @"UNLOCK");
            NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
            [userDefaults setObject:@"YES" forKey:@"isFirst"];
            
            [_viewController callCbfunction:@"refreshBySynchResult" withObjects: nil];
            //            [_viewController callCbfunction:@"TimeZoneSet" withObjects:nil];
            
            WriteBand *band = [[WriteBand alloc] init];
            [band sxInterfaceInit:^(NSString *success) {
                
                [self ex2PluginTimeZone];
            }];
        });
        
    }] resume];
    
    
//    dispatch_async(dispatch_get_global_queue(0, 0), ^{
//        
//        NSString *request_url = SUMMARY_SEND;
//        NSURL *url = [NSURL URLWithString:request_url];
//        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
//        
//        request.HTTPMethod = @"POST";
//        
//        NSError *error;
//        
//        [request setHTTPBody:postData];
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        NSData *respondData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:&error];
//        NSString *result_string = [[NSString alloc] initWithData:respondData encoding:NSUTF8StringEncoding];
//        NSLog(@"결과 : %@", result_string);
//        
//        dispatch_async(dispatch_get_main_queue(), ^{
//            
////            [bandInit sxInterfaceInit];
//            _setGlovalValue(@"BLE_LOCK", @"UNLOCK");
//            NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
//            [userDefaults setObject:@"YES" forKey:@"isFirst"];
//            
//            [_viewController callCbfunction:@"refreshBySynchResult" withObjects: nil];
////            [_viewController callCbfunction:@"TimeZoneSet" withObjects:nil];
//            
//            WriteBand *band = [[WriteBand alloc] init];
//            [band sxInterfaceInit:^(NSString *success) {
//                
//                [self ex2PluginTimeZone];
//            }];
//        });
//    });
}

#pragma 스텝 서머리 데이터 JSON BUILD
- (NSString *) stepJsonBuild : (NSString *) jsonString arrayListDate:(NSArray *)arrayListDate userKey:(NSString *)userKey authKey:(NSString *)authKey sleepStartTime:(NSString *)sleepStartTime sleepEndTime:(NSString *)sleepEndTime {
    
    // 일자별 스텝 계산
    // 코어 데이터 쿼리
    
    NSMutableArray *mutableJsonDateArray = [[NSMutableArray alloc] init];
    
    
    for (NSString *queryDate in arrayListDate) {
        
        // 해당일자 루프 돌면서 스텝데이터 합 산출
        
        AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        
        NSManagedObjectContext *stepSummaryDataContext = [appDelegate managedObjectContext];
        NSFetchRequest *request = [NSFetchRequest fetchRequestWithEntityName:@"History_Sample"];
        NSPredicate *predicate = [NSPredicate predicateWithFormat:@"step_date = %@", queryDate];
        [request setPredicate:predicate];
        NSError *error = nil;
        NSArray *results = [stepSummaryDataContext executeFetchRequest:request error:&error];
        
        
        // 결과가 있을때 합산데이터 만들어줌
        
        NSInteger stepCount = 0;
        NSInteger totalStepValue = 0;
        
        if (results.count > 0) {
            
            stepCount = results.count;
            
            for (HisotorySampleData *sampleData in results) {
                
                totalStepValue += [sampleData.value integerValue];
            }
        }
        
        // SUMMARY 데이터 json형식 만든다
        NSString *jsonResult = [NSString stringWithFormat:@"{\"sync_date\" : \"%@\", \"datetime\" : \"%@\", \"type\" : \"STEP\", \"count\" : %ld, \"value\" : %ld, \"average\" : 0, \"device\" : \"B\", \"soso_count\" : 0, \"bad_count\" : 0, \"good_count\" : 0, \"soso_value\" : 0, \"bad_value\" : 0, \"good_value\" : 0, \"sleep_start\" : \"%@\", \"sleep_end\" : \"%@\", \"goal_val\" : \"%@\"}", queryDate, queryDate, (long)stepCount, (long)totalStepValue, sleepStartTime, sleepEndTime, _goalVal];
        
        [mutableJsonDateArray addObject:jsonResult];
    }
    
    NSString *resultJson = @"";
    
    int jasonDataCount = (int)mutableJsonDateArray.count;
    int jasonCount = 0;
    
    for (NSString *dateJson in mutableJsonDateArray) {
        
        jasonCount++;
        
        if (jasonCount == jasonDataCount) {
            resultJson = [NSString stringWithFormat:@"%@%@", resultJson, dateJson];
        }
        else {
            resultJson = [NSString stringWithFormat:@"%@%@,", resultJson, dateJson];
        }
    }

    return resultJson;
}

#pragma 수면 서머리 데이터 JSON BUILD
- (NSString *) sleepJsonBuild : (NSString *) jsonString arrayListDate:(NSArray *)arrayListDate userKey:(NSString *)userKey authKey:(NSString *)authKey sleepStartTime:(NSString *)sleepStartTime sleepEndTime:(NSString *)sleepEndTime {
    
    // 수면 데이터 넣는다.
    // 오늘 일자기준으로 수면 종료시간이 지나지 않았으면 데이터를 넣어주지 않는다.(서버쪽은 기본값 넣어준다.)
    //
    
    NSMutableArray *mutableJsonDateArray = [[NSMutableArray alloc] init];
    
    for (NSString *queryDate in arrayListDate) {
        
        NSString *join_string = _getStorageValue(@"USER_CREATED_DATE");
        if ([join_string isEqualToString:queryDate]) {
            continue;
        }
        
        // 해당일자 루프 돌면서 스텝 데이터 산출
        
        AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        
        NSManagedObjectContext *stepSummaryDataContext = [appDelegate managedObjectContext];
        NSFetchRequest *request = [NSFetchRequest fetchRequestWithEntityName:@"History_Sample"];
        NSPredicate *predicate = [NSPredicate predicateWithFormat:@"step_date = %@", queryDate];
        [request setPredicate:predicate];
        NSError *error = nil;
        NSArray *results = [stepSummaryDataContext executeFetchRequest:request error:&error];
        
        // 수면 서머리 만들기
        // queryDate가 오늘일자일때 수면종료시간 가져와서 지나지 않았으면 기본데이터 넣어주고 아니면 계산해서넣어줌
        
        // 오늘 일자 가져오기
        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute fromDate:today];
        NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day];
        //NSString *todayTimeString = [NSString stringWithFormat:@"%02d:%02d", (int)todayComponents.hour, (int)todayComponents.minute];
        
        int todayHour = (int)todayComponents.hour;
        int todayMinute = (int)todayComponents.minute;
        
        NSArray *startSpliteTime = [sleepStartTime componentsSeparatedByString:@":"];
        NSArray *endSpliteTime = [sleepEndTime componentsSeparatedByString:@":"];
        
        int sleepStartHour = [startSpliteTime[0] intValue];
        int sleepStartMinute = [startSpliteTime[1] intValue];
        int sleepEndHour = [endSpliteTime[0] intValue];
        int sleepEndMinute = [endSpliteTime[1] intValue];
        
        // 같을때
        if ([queryDate isEqualToString:todayDateString]) {
            
            // 데이터 합산
            if (results.count > 0) {
                
                // 시간 분 둘다 크거나 같을 때만 업데이트 실행
                if (todayHour >= sleepEndHour)  {
                    
                    // 현재 시간이 같고 현재 분이 종료시간보다 적을때 기본데이터 만듬
                    if (todayHour == sleepEndHour && todayMinute <= sleepEndMinute) {
                        
                        // 기본데이터 만들기
                        [self sleepBasicJsonBuild:queryDate sleepStartTime:sleepStartTime sleepEndTime:sleepEndTime];
                    }
                    // 원래 로직대로 진행
                    else {
                        
                        NSString *resultJson = [self sleepSumJsonBuild:queryDate sleepStartHour:sleepStartHour sleepEndHour:sleepEndHour sleepStartMinute:sleepStartMinute sleepEndMinute:sleepEndMinute];
                        
                        [mutableJsonDateArray addObject:resultJson];
                    }
                }
                else {
                    
                    // 기본데이터 만들기
                    NSString *resultJson = [self sleepBasicJsonBuild:queryDate sleepStartTime:sleepStartTime sleepEndTime:sleepEndTime];
                    [mutableJsonDateArray addObject:resultJson];
                }
            }
            // 기본 데이터 만들어줌
            else {
                
                NSString *resultJson = [self sleepBasicJsonBuild:queryDate sleepStartTime:sleepStartTime sleepEndTime:sleepEndTime] ;
                [mutableJsonDateArray addObject:resultJson];
            }
        }
        // 오늘일자와 같지 않을 때(합산식 들어감)
        else {
            NSString *resultJson = [self sleepSumJsonBuild:queryDate sleepStartHour:sleepStartHour sleepEndHour:sleepEndHour sleepStartMinute:sleepStartMinute sleepEndMinute:sleepEndMinute];
            
            [mutableJsonDateArray addObject:resultJson];
        }
    }
    
    NSString *resultJson = @"";
    
    int jasonDataCount = (int)mutableJsonDateArray.count;
    int jasonCount = 0;
    
    for (NSString *dateJson in mutableJsonDateArray) {
        
        jasonCount++;
        
        if (jasonCount == jasonDataCount) {
            resultJson = [NSString stringWithFormat:@"%@%@", resultJson, dateJson];
        }
        else {
            resultJson = [NSString stringWithFormat:@"%@%@,", resultJson, dateJson];
        }
    }
    
    return resultJson;
}

#pragma 수면 데이터 합산 JSON BUILD
- (NSString *) sleepSumJsonBuild : (NSString *) queryDate sleepStartHour : (int) sleepStartHour sleepEndHour : (int) sleepEndHour sleepStartMinute : (int) sleepStartMinute sleepEndMinute : (int) sleepEndMinute {
    
    NSDate *sleepStartDate;
    NSDate *sleepEndDate;
    
    // 해당 루프의 슬립시작시간 일시 슬립종료시간 일시 구하기
    // 슬립시작일시(전날) 슬립종료일시(전날+1)
    if (sleepStartHour > sleepEndHour || (sleepStartHour == sleepEndHour && sleepStartMinute >= sleepEndMinute)) {
        
        // queryDate - 하루
        NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
        [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
        [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
        
        NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%@ %02d:%02d:00", queryDate, sleepStartHour, sleepStartMinute]]; // 오늘일자
        
        sleepStartDate = [basicDate dateByAddingTimeInterval:60*60*24*-1];
        sleepEndDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%@ %02d:%02d:00", queryDate, sleepEndHour, sleepEndMinute]];
    }
    
    // 같은 날짜에 수면시작시간 수면종료시간이 존재할때 (로직은 if문 로직과 비슷하지만 날짜 하루빼주는것만 틀림)
    else {
        // queryDate - 하루
        NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
        [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
        [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
        
        NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%@ %02d:%02d:00", queryDate, sleepStartHour, sleepStartMinute]]; // 오늘일자
        
        sleepStartDate = basicDate;
        sleepEndDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%@ %02d:%02d:00", queryDate, sleepEndHour, sleepEndMinute]];
    }
    
    // 수면 시간 뽑기
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *historyDataContext = [appDelegate managedObjectContext];
    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] initWithEntityName:@"History_Sample"];
    fetchRequest.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"idx" ascending:NO]];
    
    // SOSO 카운트 뽑기
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"step_datetime >= %@ AND step_datetime < %@ AND value >= 2 AND value =< 11", sleepStartDate, sleepEndDate];
    [fetchRequest setPredicate:predicate];
    
    NSError *error = nil;
    NSArray *results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    int sosoCount = (int)results.count; // 쏘쏘카운트
    int sosoValue = 0; // 쏘쏘활동값
    for (HisotorySampleData *historySampleData in results) {
        
        sosoValue += [historySampleData.value integerValue];
    }
    
    // BAD 카운트 뽑기
    predicate = [NSPredicate predicateWithFormat:@"step_datetime >= %@ AND step_datetime < %@ AND value > 11", sleepStartDate, sleepEndDate];
    [fetchRequest setPredicate:nil];
    [fetchRequest setPredicate:predicate];
    
    error = nil;
    results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    int badCount = (int)results.count; // 배드카운트
    int badValue = 0; //배드활동값
    for (HisotorySampleData *historySampleData in results) {
        badValue += [historySampleData.value integerValue];
    }
    
    // GOOD 카운트 뽑기
    predicate = [NSPredicate predicateWithFormat:@"step_datetime >= %@ AND step_datetime < %@ AND value < 2", sleepStartDate, sleepEndDate];
    [fetchRequest setPredicate:nil];
    [fetchRequest setPredicate:predicate];
    
    error = nil;
    results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    int goodCount = (int)results.count; // 굿카운트
    int goodValue = 0; // 굿 활동값
    for (HisotorySampleData *historySampleData in results) {
        goodValue += [historySampleData.value integerValue];
    }
    
    // 총 수면 카운트 뽑기
    predicate = [NSPredicate predicateWithFormat:@"step_datetime >= %@ AND step_datetime < %@", sleepStartDate, sleepEndDate];
    [fetchRequest setPredicate:nil];
    [fetchRequest setPredicate:predicate];
    
    error = nil;
    results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    int totalCount = (int)results.count; // 총 수면 카운트
    int totalValue = 0; // 토탈 수면 활동값
    for (HisotorySampleData *historySampleData in results) {
        totalValue += [historySampleData.value integerValue];
    }
    
    // JSON String 만들기
    NSString *jsonResult = [NSString stringWithFormat:@"{\"sync_date\" : \"%@\", \"datetime\" : \"%@\", \"type\" : \"SLEEP\", \"count\" : %d, \"value\" : %d, \"average\" : 0, \"device\" : \"B\", \"soso_count\" : %d, \"bad_count\" : %d, \"good_count\" : %d, \"soso_value\" : %d, \"bad_value\" : %d, \"good_value\" : %d, \"sleep_start\" : \"%02d:%02d\", \"sleep_end\" : \"%02d:%02d\", \"goal_val\" : \"%@\"}", queryDate, queryDate, totalCount, totalValue, sosoCount, badCount, goodCount, sosoValue, badValue, goodValue, sleepStartHour, sleepStartMinute, sleepEndHour, sleepEndMinute, _goalVal];
    
    return jsonResult;
}

#pragma 수면 데이터 기본 JSON BUILD
- (NSString *) sleepBasicJsonBuild : (NSString *) queryDate sleepStartTime : (NSString *) sleepStartTime sleepEndTime : (NSString *) sleepEndTime {
    
    NSString *jsonResult = [NSString stringWithFormat:@"{\"sync_date\" : \"%@\", \"datetime\" : \"%@\", \"type\" : \"SLEEP\", \"count\" : 0, \"value\" : 0, \"average\" : 0, \"device\" : \"B\", \"soso_count\" : 0, \"bad_count\" : 0, \"good_count\" : 0, \"soso_value\" : 0, \"bad_value\" : 0, \"good_value\" : 0, \"sleep_start\" : \"%@\", \"sleep_end\" : \"%@\", \"goal_val\" : \"%@\"}", queryDate, queryDate, sleepStartTime, sleepEndTime, _goalVal];
    
    return jsonResult;
}

#pragma 임시 테스트 코드 - 코어 데이터 삭제 -
- (void) delete_history_core_data {
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *historyDataContext = [appDelegate managedObjectContext];
    NSFetchRequest *request = [[NSFetchRequest alloc] initWithEntityName:@"History_Sample"];
    NSBatchDeleteRequest *delete_request = [[NSBatchDeleteRequest alloc] initWithFetchRequest:request];
    NSError *error = nil;
    [historyDataContext executeRequest:delete_request error:&error];
}

- (PPWebViewController *)viewController {
    return _viewController;
}

#pragma 날짜비교
- (NSInteger) compareFromDateToDate : (NSDate *) fromDate : (NSDate *) toDate {
    
    NSDateComponents *dateComp = [[NSCalendar currentCalendar] components:NSDayCalendarUnit fromDate:fromDate toDate:toDate options:0];
    return (long)[dateComp day];
}

#pragma 날짜비교
- (NSInteger)formattedDateCompareToNow:(NSDate *)date
{
    NSDateFormatter *mdf = [[NSDateFormatter alloc] init];
    [mdf setDateFormat:@"yyyy-MM-dd"];
    NSDate *midnight = [mdf dateFromString:[mdf stringFromDate:date]];
    
    NSInteger dayDiff = (int)[midnight timeIntervalSinceNow] / (60*60*24);
    return dayDiff;
}

#pragma 어제의 수면 데이터 들고오기
- (NSString *) wnGetSleepSamples : (NSString *) jsonString {
    
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   @"databaseCallback": [NSString class]
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *callback = [options objectForKey:@"databaseCallback"];
    NSString *sleepStartTime = [options objectForKey:@"sleepStartTime"];
    NSString *sleepEndTime = [options objectForKey:@"sleepEndTime"];
    
//    NSArray *sleepStartEndArray = [jsonString componentsSeparatedByString:@"||"];
//    
//    NSString *sleepStartTime = sleepStartEndArray[0];
//    NSString *sleepEndTime = sleepStartEndArray[1];
    
    // 코어데이터에서 어제수면시작시간 오늘 수면종료시간 쿼리를 뽑아온다
    // 수면 종료시간 체크하기(스크립트단에서 아니면 네이티브단에서?)
    
    NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
    NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute fromDate:today];
    NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d %d:%d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, (int)todayComponents.hour, (int)todayComponents.minute];
    NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
    [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
    NSDate *todayDate = [basicDateFormatter dateFromString:todayDateString]; // 오늘일자
    
    // 오늘 수면 종료 시간 nsdate로 변환
    NSArray *startSpliteTime = [sleepStartTime componentsSeparatedByString:@":"];
    int sleepStartHour = [startSpliteTime[0] intValue];
    int sleepStartMinute = [startSpliteTime[1] intValue];
    NSArray *endSpliteTime = [sleepEndTime componentsSeparatedByString:@":"];
    int sleepEndHour = [endSpliteTime[0] intValue];
    int sleepEndMinute = [endSpliteTime[1] intValue];
    
    NSDateComponents *sleepEndComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute fromDate:today];
    NSString *sleepEndDateString = [NSString stringWithFormat:@"%02d-%02d-%02d %d:%d:00", (int)sleepEndComponents.year, (int)sleepEndComponents.month, (int)sleepEndComponents.day, sleepEndHour, sleepEndMinute];
    NSDate *sleepEndDateTime = [basicDateFormatter dateFromString:sleepEndDateString];
    
    NSDate *sleepStartDate;
    NSDate *sleepEndDate;
    
    
    // 현재일시가 수면종료일시보다 클때
    if ([todayDate compare:sleepEndDateTime] == NSOrderedDescending || [todayDate compare:sleepEndDateTime] == NSOrderedSame) {
        
        // 데이터가 없을 수도 있기때문에 수면데이터 유효성 체크를 한다.
        // 또는 동기화를 한번 해주고 조회를 한다.(권장 하지 않음)
        
        // 슬립시작일시(전날) 슬립종료일시
        if (sleepStartHour > sleepEndHour || (sleepStartHour == sleepEndHour && sleepStartMinute >= sleepEndMinute)) {
            
            // queryDate - 하루
            NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
            [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
            [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
            
            NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepStartHour, sleepStartMinute]]; // 오늘일자
            sleepStartDate = [basicDate dateByAddingTimeInterval:60*60*24*-1];
            sleepEndDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepEndHour, sleepEndMinute]];
            
        }
        else {
            
            // queryDate - 하루
            NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
            [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
            [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
            
            NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepStartHour, sleepStartMinute]]; // 오늘일자
            sleepStartDate = basicDate;
            sleepEndDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepEndHour, sleepEndMinute]];
        }
        
    }
    // 오늘일시가 수면종료일시보다 적을때
    else {
        
        // 슬립시작일시(전날) 슬립종료일시
        if (sleepStartHour > sleepEndHour || (sleepStartHour == sleepEndHour && sleepStartMinute >= sleepEndMinute)) {
            
            // queryDate - 하루
            NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
            [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
            [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
            
            NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepStartHour, sleepStartMinute]]; // 오늘일자
            
            sleepStartDate = [basicDate dateByAddingTimeInterval:60*60*24*-2];
            sleepEndDate = [[basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepEndHour, sleepEndMinute]] dateByAddingTimeInterval:60*60*24*-1];
            
        }
        else {
            
            // queryDate - 하루
            NSDateFormatter *basicDateFormatter = [[NSDateFormatter alloc] init];
            [basicDateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
            [basicDateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"ko_KR"]];
            
            NSDate *basicDate = [basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepStartHour, sleepStartMinute]]; // 오늘일자
            sleepStartDate = [basicDate dateByAddingTimeInterval:60*60*24*-1];
            sleepEndDate = [[basicDateFormatter dateFromString:[NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:00", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day, sleepEndHour, sleepEndMinute]] dateByAddingTimeInterval:60*60*24*-1];
            
        }
    }
    
    // 수면 원시데이터 뽑기
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *historyDataContext = [appDelegate managedObjectContext];
    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] initWithEntityName:@"History_Sample"];
    fetchRequest.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"step_datetime" ascending:YES]];
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"step_datetime >= %@ AND step_datetime < %@", sleepStartDate, sleepEndDate];
    [fetchRequest setPredicate:predicate];
    NSError *error = nil;
    NSArray *results = [historyDataContext executeFetchRequest:fetchRequest error:&error];
    
    NSMutableArray *sampleDataArray = [[NSMutableArray alloc] init];
    
    for(HisotorySampleData *historyData in results) {
        
        NSString *sampleDate = historyData.step_date;
        NSString *sampleDateTime = [NSString stringWithFormat:@"%@ %@", historyData.step_date, historyData.time];
        NSArray *coreTimeArray = [historyData.time componentsSeparatedByString:@":"];
        int coreTimeHour = [coreTimeArray[0] intValue];
        int coreTimeMinute = [coreTimeArray[1] intValue];
        int stepValue = [historyData.value intValue];
        NSDictionary *dic = [[NSDictionary alloc] initWithObjectsAndKeys:sampleDate, @"SAMPLE_DATE", [NSNumber numberWithInt:coreTimeHour], @"SAMPLE_HOUR", [NSNumber numberWithInt:coreTimeMinute], @"SAMPLE_TIME", [NSNumber numberWithInt:stepValue], @"SAMPLE_VALUE",  sampleDateTime, @"SAMPLE_DATETIME", nil];
        [sampleDataArray addObject:dic];
    }
    
    NSDictionary *jsonDic = [[NSDictionary alloc] initWithObjectsAndKeys: sampleDataArray, @"sampleItems", nil];
    
    NSString *resultJsonString = [jsonDic jsonString];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        [self.viewController callCbfunction:callback withObjects:@{@"flip":@(0), @"status": @"SUCCESS"}, nil];
        [self.viewController callCbfunction:callback withObjects:resultJsonString, nil];
        
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 로그아웃시 / 기기연결 해제시 / 로컬데이터 지우기
- (NSString *) wnRemoveLocalData {
    
    [self delete_history_core_data];
    
//    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
//    [userDefaults setObject:@"NO" forKey:@""];
    
    // 재로그인 여부 디폴트 설정 체크
    
     
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 화면회전 현재값 가져오기
//- (NSString *) exWN2PluginFitScreenChangeGet : (NSString *) jsonString {
//    
//    return [@{@"status":@"PROCESSING"} jsonString];
//}

#pragma 화면회전 설정하기
- (NSString *) exWN2PluginFitScreenChangeSet : (NSString *)jsonString {
    
//    SXInterface *aaa = [[SXInterface alloc] init];
    
//    [[SXInterface getDataCenter] ConnectBracelet:nil blockfunc:nil];
    WriteBand *band = [[WriteBand alloc] init];
//    [band rotationSetup:@"1"];
    
    NSDictionary *options = [jsonString objectFromJsonString];
    NSString *result_string = [NSString stringWithFormat:@"%@", options[@"isOn"]];
        
    if ([result_string isEqualToString:@"0"]) {
        [band rotationFlip:@"1"];
    }
    else {
        [band rotationFlip:@"0"];
    }
    
//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        
//        // 화면회전 스위프트 프레임워크 실행
//    
//    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 방해금지시간
- (NSString *) exWN2PluginFitDisturbSet : (NSString *)jsonString {
    
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    
//    NSString *callback = [options objectForKey:@"callback"];
    
    NSString *enabled = [NSString stringWithFormat:@"%@", options[@"enabled"]];
    enabled = [enabled isEqualToString:@"Y"] ? @"1" : @"0";
    
    WriteBand *band = [[WriteBand alloc] init];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        
        NSArray *startTime = [options[@"stime"] componentsSeparatedByString:@":"];
        NSArray *endTime = [options[@"etime"] componentsSeparatedByString:@":"];
        [band preventPush:enabled beginHH:startTime[0] beginMM:startTime[1] endHH:endTime[0] endMM:endTime[1]];
        
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
    
}

#pragma 세로로 시계보기
- (NSString *) exWN2PluginFitVerticalDisplaySet : (NSString *) jsonString {
    
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    //NSLog(@"%@", options[@"isOn"]);
    
    // true : 가로(위로 길게) false : 세로(옆으로길게)
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *isOn = [NSString stringWithFormat:@"%@", options[@"isOn"]];
        WriteBand *band = [[WriteBand alloc] init];
        [band verticalDisplaySet:@"1" horizontal:[isOn isEqualToString:@"0"] ? @"1" : @"2"];
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 알람시간설정
- (NSString *) ex2PluginFitAlarmSet : (NSString *) jsonString {
    
    NSDictionary *options = [jsonString objectFromJsonString];
    NSString *callback = [options objectForKey:@"callback"];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        
//        
//        
//        NSString *index = [NSString stringWithFormat:@"%@", options[@"index"]];
//        NSString *type = [NSString stringWithFormat:@"%@", options[@"type"]];
//        type = [type isEqualToString:@"NORMAL"] ? @"1" : @"2";
//        NSString *enabled = [NSString stringWithFormat:@"%@", options[@"enabled"]];
//        enabled = ([enabled isEqualToString:@"1"] || [enabled isEqualToString:@"true"]) ? @"1" : @"0";
//        NSString *mon = [NSString stringWithFormat:@"%@", options[@"weeks"][@"MON"]];
//        NSString *tue = [NSString stringWithFormat:@"%@", options[@"weeks"][@"TUE"]];
//        NSString *wed = [NSString stringWithFormat:@"%@", options[@"weeks"][@"WED"]];
//        NSString *thu = [NSString stringWithFormat:@"%@", options[@"weeks"][@"THU"]];
//        NSString *fri = [NSString stringWithFormat:@"%@", options[@"weeks"][@"FRI"]];
//        NSString *sat = [NSString stringWithFormat:@"%@", options[@"weeks"][@"SAT"]];
//        NSString *sun = [NSString stringWithFormat:@"%@", options[@"weeks"][@"SUN"]];
//        NSString *hhmm = options[@"time"];
//        
//        NSArray *hhmmArray = [hhmm componentsSeparatedByString:@":"];
//        NSString *hh = [NSString stringWithFormat:@"%02d", [hhmmArray[0] intValue]];
//        NSString *mm = [NSString stringWithFormat:@"%02d", [hhmmArray[1] intValue]];
//        
//        WriteBand *band = [[WriteBand alloc] init];
//        [band alramSetup:index type:type once:@"0" onoff:enabled sunday:sun saturday:sat friday:fri thursday:thu wednesday:wed tuesday:tue monday:mon hourHH:hh minuteMM:mm];
//    });

    NSString *index = [NSString stringWithFormat:@"%@", options[@"index"]];
    NSString *type = [NSString stringWithFormat:@"%@", options[@"type"]];
    type = [type isEqualToString:@"NORMAL"] ? @"0" : @"1";
    NSString *enabled = [NSString stringWithFormat:@"%@", options[@"enabled"]];
    enabled = ([enabled isEqualToString:@"1"] || [enabled isEqualToString:@"true"]) ? @"1" : @"0";
    NSString *mon = [NSString stringWithFormat:@"%@", options[@"weeks"][@"MON"]];
    NSString *tue = [NSString stringWithFormat:@"%@", options[@"weeks"][@"TUE"]];
    NSString *wed = [NSString stringWithFormat:@"%@", options[@"weeks"][@"WED"]];
    NSString *thu = [NSString stringWithFormat:@"%@", options[@"weeks"][@"THU"]];
    NSString *fri = [NSString stringWithFormat:@"%@", options[@"weeks"][@"FRI"]];
    NSString *sat = [NSString stringWithFormat:@"%@", options[@"weeks"][@"SAT"]];
    NSString *sun = [NSString stringWithFormat:@"%@", options[@"weeks"][@"SUN"]];
    NSString *hhmm = options[@"time"];
    
    NSArray *hhmmArray = [hhmm componentsSeparatedByString:@":"];
    NSString *hh = [NSString stringWithFormat:@"%02d", [hhmmArray[0] intValue]];
    NSString *mm = [NSString stringWithFormat:@"%02d", [hhmmArray[1] intValue]];
    
    WriteBand *band = [[WriteBand alloc] init];
    [band alramSetup:index type:type once:@"0" onoff:enabled sunday:sun saturday:sat friday:fri thursday:thu wednesday:wed tuesday:tue monday:mon hourHH:hh minuteMM:mm];
    
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        //        [self.viewController callCbfunction:callback withObjects:@{@"flip":@(0), @"status": @"SUCCESS"}, nil];
        
        [self.viewController callCbfunction:callback withObjects:nil];
        
    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}


#pragma 블루투스 선택 페이지 띄우기
- (NSString *) ex2PluginShowBandList {
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.delegate = self;
    [appDelegate bluetoothBandList];
    
//    [aaa searchBand:^(NSArray *bandListArray) {
//        NSLog(@"밴드리스트 결과 : %@", bandListArray);
//    }];
//    
    
    //[_viewController callCbfunction:@"" withObjects:@"", nil];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 블루투스 선택 페이지 닫기
- (NSString *) ex2PluginShowBandListClose {
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.delegate = self;
    [appDelegate bluetoothBandListClose];
    [appDelegate indicatorViewOut];
    
    WriteBand *band = [[WriteBand alloc] init];
    
    [band sxConnect:^(NSString *success) {
        //[NSThread sleepForTimeInterval:1.];
        //[self.viewController callCbfunction:callback withObjects: nil];
        @try {
            [_viewController callCbfunction:@"iosBandInitResult" withObjects:nil];
        } @catch (NSException *exception) {
            
        } @finally {
            
        }
        
        
//        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//            
//            [_viewController callCbfunction:@"iosBandInitResult" withObjects:nil];
//        });
    }];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 타임존 설정
- (NSString *) ex2PluginTimeZone {
    
    WriteBand *band = [[WriteBand alloc] init];
    
    [band timeZone:^(NSString *success) {
        NSLog(@"success");
    }];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 인디케이터 닫기
- (NSString *) ex2PluginHideIndicator {
    
    NSLog(@"인디케이터 호출 댐");
    
    AppDelegate *appDelegate =  (AppDelegate *)[[UIApplication sharedApplication] delegate];
    [appDelegate indicatorViewOut];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 중국산 스위프트 초기화
- (NSString *) ex2PluginWriteBandInit:(NSString *) jsonString {
    
    NSDictionary *options = [jsonString objectFromJsonString];
    NSString *callback = [options objectForKey:@"callback"];
    
    WriteBand *band = [[WriteBand alloc] init];
    
    //[band sxConnect:<#^(NSString * _Nonnull success)completionHandler#>
    
    [band sxInterfaceInit:^(NSString *success) {
        
        [self.viewController callCbfunction:callback withObjects: nil];
        
    }];
    
//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        
//        
//    });
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 무반응 설정
- (NSString *) ex2PluginRemainder : (NSString *)jsonString {
    
    
    WriteBand *band = [[WriteBand alloc] init];
    [band sedentaryTimeSetup:jsonString];
    
    return [@{@"status":@"PROCESSING"} jsonString];
}

#pragma 시스템 언어 설정
//- (NSString *) ex2PluginSystemLanguage : (NSString *)jsonString {
//    
//    WriteBand *band = [[WriteBand alloc] init];
//    [band systemLanguage];
//    
//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        [self.viewController callCbfunction:@"" withObjects:nil];
//    });
//    
//    return [@{@"status":@"PROCESSING"} jsonString];
//}

- (void) BandUUID:(NSString *)uuid deviceName:(NSString *)deviceName {
    
    NSString *devicename = deviceName;
    
    [_viewController callCbfunction:@"iosPairingBand" withObjects:uuid, devicename, nil];
}

@dynamic viewController;
@synthesize viewctrl = _viewController;

@end