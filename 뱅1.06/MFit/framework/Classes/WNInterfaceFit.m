//
//  WNInterfaceFit.m
//
//  Created by uracle.lab on 2015. 09. 09..
//

#import "WNInterfaceFit.h"
#import "MFitPlugin.h"
#import "MFitManager.h"
#import "GlobalData.h"


@interface WNInterfaceFit ()

@property (nonatomic, assign) PPWebViewController *viewctrl;

@end

@implementation WNInterfaceFit

+ (Class)initalizeClass {
    return [MFitPlugin class];
}

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

- (id)init {
    self = [super init];
    if (self) {
        
    }
    return self;
}

- (void)dealloc {
    [super dealloc];
}

- (BOOL)isAlive {
    if (![[PPNavigationController ppNavigationController] existViewController:_viewController]) {
        PPDebug(@"Already released view controller!!");
        return NO;
    }
    
    return YES;
}

#pragma mark - Interface 2.2

#pragma mark - for Current

- (NSString *)wn2PluginFitCurrent:(NSString *)jsonString {
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
    //__block NSMutableArray *dateQueue = [[NSMutableArray alloc] init];
    
    MFitManager *fitManager = [MFitManager defaultManager];
        
    [fitManager service:FitGetCurrentQuantities data:nil success:^(FitService service, NSDictionary *data) {
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
        
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            
            @"calorie": @([[appendedData objectForKey:@"calorie"] integerValue]),
            @"distance": @([[appendedData objectForKey:@"distance"] integerValue]),
            @"step": @([[appendedData objectForKey:@"setp"] integerValue]),
            @"data": appendedData
        };
            
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
            
    } error:^(NSError *error) {
            
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for History

- (NSString *)wn2PluginFitHistoryTable:(NSString *)jsonString {
    
    
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

    BOOL hasCachedData = NO;
//    NSError *error = nil;
    NSMutableArray *syncedDateKeys = [NSMutableArray array];

    MFitManager *fitManager = [MFitManager defaultManager];
//    MFitSynchronizeManager *syncManager = [MFitSynchronizeManager defaultManager];
//    MDatabaseManager *databaseManager = [MDatabaseManager defaultManagerWithPath:[syncManager databasePath]];

//    if ( [databaseManager isCreated]) {
//        if ( ! [databaseManager isOpened] ) {
//            [databaseManager openDatabase];
//        }
//
//        if ( [databaseManager isOpened] ) {
//            MRecordSet *rs = [databaseManager executeQuery:@"SELECT * FROM fit_sync_table WHERE 1 ORDER BY date ASC" error:&error];
//
//            if ( ! error ) {
//                if ( [rs isFetchable] ) {
//                    while ([rs moveNext]) {
//                        NSDictionary *itemData = rs.data;
//                        NSString *dateKey = [itemData objectForKey:@"date"];
//                        [syncedDateKeys addObject:dateKey];
//                    }
//                }
//            }
//        }
//    }
//
    if ( hasCachedData == YES && syncedDateKeys.count > 0 ) {
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"list": [NSArray arrayWithArray:syncedDateKeys],
            @"data": @{}
        };
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.15f * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
        });
    }
    else {
        [fitManager service:FitGetHistoryTable data:nil success:^(FitService service, NSDictionary *data) {
            NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
            
            NSMutableArray* list = [NSMutableArray array];
            
            for ( NSString *indexKey in data ) {
                NSString *dateString = [data objectForKey:indexKey];
                [list addObject:dateString];
            }
            
            NSArray *sortedList = [list sortedArrayUsingComparator:^NSComparisonResult(NSString *date1, NSString *date2) {
                return [date1 compare:date2];
            }];
                
            NSDictionary *resultInfo = @{
                @"status": @"SUCCESS",
                @"list": [NSArray arrayWithArray:sortedList],
                @"data": appendedData
            };
            
            [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
            NSLog(@"데이터 콜백 : %@", resultInfo);
        }
        error:^(NSError *error) {
            [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
        }];
    }

    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitHistory:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"date": [NSArray class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSArray *dateList = [options objectForKey:@"date"];
    
    NSString *callback = [options objectForKey:@"callback"];
    __block NSMutableArray *dateQueue = [[NSMutableArray alloc] init];
    
    for ( NSString *dateKey in dateList ) {
        if ( [[dateKey uppercaseString] isEqualToString:@"TODAY"] ) {
            NSDate *date = [NSDate dateWithTimeIntervalSinceNow:0];
            NSDateComponents *dateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay fromDate:date];
            [dateQueue addObject:[NSString stringWithFormat:@"%02d-%02d-%02d", (int)dateComponents.year, (int)dateComponents.month, (int)dateComponents.day]];
        }
        else {
            [dateQueue addObject:dateKey];
        }
    }
    
    if ( dateQueue.count < 1 ) {
        return [@{@"status":@"FAIL", @"error":@"date is invalid"} jsonString];
    }

    MFitManager *fitManager = [MFitManager defaultManager];

    [fitManager service:FitGetHistoryTable data:nil success:^(FitService service, NSDictionary *data) {
    
        NSMutableArray* value = [NSMutableArray array];
        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
        
        if ( dateQueue.count == 0 ) {
            for ( NSString *indexKey in data ) {
                NSString *date = [data objectForKey:indexKey];
                
                for(int hour = 0 ; hour < 24 ; hour++) {
                    if ( [date isEqualToString:[NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day]] ) {
                        if ( hour > todayComponents.hour ) {
                            break;
                        }
                    }
                    
                    [value addObject:[NSString stringWithFormat:@"%@ %d", date, hour]];
                }
            }
        }
        else {
            for ( NSString *date in dateQueue ) {
                for(int hour = 0 ; hour < 24 ; hour++) {
                    if ( [date isEqualToString:[NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day]] ) {
                        if ( hour > todayComponents.hour - 1 ) {
                            break;
                        }
                    }
                    
                    [value addObject:[NSString stringWithFormat:@"%@ %d", date, hour]];
                }
            }
        }
        
        NSLog(@"지정된 시간111 : %@", value);

        [fitManager service:FitGetHistoryAppointValue data:value success:^(FitService service, NSDictionary *data) {
            
            NSLog(@"아웃풋결과111 : %@", data);
            
            NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
            
            
            
            NSArray *itemList = [NSArray arrayWithArray:[appendedData objectForKey:@"setp"]];
            __block NSMutableArray *list = [NSMutableArray array];
            
            for ( int i=0; i<itemList.count; i++ ) {
                NSString *record = [itemList objectAtIndex:i];
                
                NSArray *recordComponents = [record componentsSeparatedByString:@","];
                NSArray *timeComponents = [[recordComponents objectAtIndex:0] componentsSeparatedByString:@" "];
                NSString *date = [timeComponents objectAtIndex:0];
                NSInteger hour = [[timeComponents objectAtIndex:1] integerValue];
                NSInteger minute = [[recordComponents objectAtIndex:1] integerValue];
                NSInteger value = [[recordComponents objectAtIndex:3] integerValue];
                NSString *active = (value == 0 && [[recordComponents objectAtIndex:2] isEqualToString:@"F"]) ? @"F" :  @"A";
                
                [list addObject:@{
                    @"date": [date copy],
                    @"time": [NSString stringWithFormat:@"%02d:%02d", (int)hour, (int)minute],
                    @"active": active,
                    @"value": @(value)
                }];
            }
            
            NSDictionary *resultInfo = @{
                @"status": @"SUCCESS",
                @"list": [NSArray arrayWithArray:list],
                @"data": appendedData
            };
            
            NSLog(@"데이터 리스트들 : %@", resultInfo);
            
            [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
            
            NSLog(@"데이터 리스트들 콜백 함수 %@", callback);
            
        } error:^(NSError *error) {
            
            [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
        }];
        
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];

    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Profile

- (NSString *)wn2PluginFitProfileGet:(NSString *)jsonString {
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetUserProfile data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"height": @([[appendedData objectForKey:@"sg"] integerValue]),
            @"weight": @([[appendedData objectForKey:@"tz"] integerValue]),
            @"age": @([[appendedData objectForKey:@"nl"] integerValue]),
            @"gender": ([[appendedData objectForKey:@"xb"] isEqualToString:@"1"] ? @"male" : @"female"),
            
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitProfileSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"age": [NSNumber class],
        @"height": [NSNumber class],
        @"weight": [NSNumber class],
        @"gender": [NSString class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSInteger age = [[options objectForKey:@"age"] integerValue];
    NSInteger height = [[options objectForKey:@"height"] integerValue];
    NSInteger weight = [[options objectForKey:@"weight"] integerValue];
    NSString *gender = [options objectForKey:@"gender"];
    NSString *callback = [options objectForKey:@"callback"];
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetUserProfile data:@[
            [NSString stringWithFormat:@"%@", @(height)],
            [NSString stringWithFormat:@"%@", @(weight)],
            [NSString stringWithFormat:@"%@", ( [gender isEqualToString:@"FEMALE"] ? @(0) : @(1) )],
            [NSString stringWithFormat:@"%@", @(age)]
        ] success:^(FitService service, NSDictionary *data) {
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Daily Step

- (NSString *)wn2PluginFitDailyStepGet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    NSLog(@"데일리스텝 가져오기");
    
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    NSLog(@"밴드는 연결되어있는가? : %d", fitManager.isConnected);
    
    NSLog(@"밴드는 연결되어있는가? : %@", [self wn2PluginFitBluetoothIsConnected]);
    
    NSLog(@"서비스 유유아이디 %@", fitManager.serviceUUID);
    
    [fitManager service:FitGetDailyStep data:nil success:^(FitService service, NSDictionary *data) {
        
        NSLog(@"데일리스텝 가져오기 성공");
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
        
        
        
        
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"step": @([[appendedData objectForKey:@"mb"] integerValue]),
            
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        NSLog(@"데일리스텝 가져오기 에러");
        NSLog(@"%@", error);
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitDailyStepSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"step": [NSNumber class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSInteger step = [[options objectForKey:@"step"] integerValue];
    NSString *callback = [options objectForKey:@"callback"];
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetDailyStep data:@[
            [NSString stringWithFormat:@"%@", @(step)]
        ] success:^(FitService service, NSDictionary *data) {
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Alarm

- (NSString *)wn2PluginFitAlarmGet:(NSString *)jsonString {
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetAlarm data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
        
        if ( ! [[appendedData objectForKey:@"clock"] isKindOfClass:[NSArray class]] || [[appendedData objectForKey:@"clock"] count] < 8 ) {
            NSError *error = [NSError errorWithDomain:@"FitError" code:-1 userInfo:@{NSLocalizedDescriptionKey:@"alarm data is invalid"}];
            [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
            return;
        }
        
        NSMutableArray *receivedClockData = [NSMutableArray arrayWithArray:[appendedData objectForKey:@"clock"]];
        NSMutableDictionary *alarmListData = [NSMutableDictionary dictionary];
        NSMutableArray *alarmList = [NSMutableArray arrayWithCapacity:8];
        
        for ( int i=0; i<receivedClockData.count; i++ ) {
            NSString *clockItemString = [receivedClockData objectAtIndex:i];
            NSArray *clockItemComponents = [clockItemString componentsSeparatedByString:@"+"];
            NSString *indexKey = [clockItemComponents firstObject];
            
            if ( ! [alarmListData objectForKey:indexKey] ) {
                NSArray *weekComponents = [NSArray arrayWithArray:[[clockItemComponents objectAtIndex:3] componentsSeparatedByString:@","]];
                NSArray *orderWeekKeys = @[@"SAT",@"SUN",@"MON",@"TUE",@"WED",@"THU",@"FRI"];
                NSMutableDictionary *weeks = [NSMutableDictionary dictionary];
                
                for ( int w=0; w<orderWeekKeys.count; w++ ) {
                    NSString *weekKey = [orderWeekKeys objectAtIndex:w];
                    NSString *weekValue = [NSString stringWithFormat:@"%@", [weekComponents objectAtIndex:w]];
                    
                    [weeks setObject:@([weekValue isEqualToString:@"1"] ? YES : NO) forKey:weekKey];
                }
            
                [alarmListData setObject:@{
                    @"index": @([indexKey integerValue]),
                    @"type": [[clockItemComponents objectAtIndex:1] isEqualToString:@"2"] ? @"MEDICATION" : @"NORMAL",
                    @"enabled": @([[clockItemComponents objectAtIndex:2] boolValue]),
                    @"weeks": weeks,
                    @"time": [clockItemComponents objectAtIndex:4],
                } forKey:indexKey];
            }
        }
        
        for ( int i=0; i<8; i++ ) {
            NSString *indexKey = [NSString stringWithFormat:@"%@", @(i)];
            NSDictionary *alarmInfo = [alarmListData objectForKey:indexKey];
            
            [alarmList addObject:alarmInfo];
        }
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"list": alarmList,
            
            @"data": appendedData
        };
        
        
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitAlarmSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"index": [NSNumber class],
        @"time": [NSString class],
        @"type": [NSString class],
        @"enabled": [NSString class],
        @"weeks": [NSDictionary class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSInteger index = [[options objectForKey:@"index"] integerValue];
    NSString *time = [options objectForKey:@"time"];
    NSString *type = [[options objectForKey:@"type"] isEqualToString:@"MEDICATION"] ? @"2" : @"1";
    NSString *enabled = [[options objectForKey:@"enabled"] boolValue] == YES ? @"1" : @"0";
    NSMutableArray *weeksComponents = [NSMutableArray array];
    NSDictionary *weeks = [options objectForKey:@"weeks"];
    
    //NSCalendar *calendar = [NSCalendar currentCalendar];
    //NSDateComponents *components = [calendar components:( NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitWeekday ) fromDate:[NSDate date]];
    //NSLog( @"%@ %@", @(components.day), @(components.weekday) );
    
    NSMutableArray *orderWeekKeys = [NSMutableArray arrayWithArray:@[@"MON",@"TUE",@"WED",@"THU",@"FRI",@"SAT",@"SUN"]];
    
    for ( NSString *key in orderWeekKeys ) {
        [weeksComponents addObject:( [[weeks objectForKey:key] boolValue] == YES ? @"1" : @"0" )];
    }
    
    NSString *callback = [options objectForKey:@"callback"];
    
    if ( [time rangeOfString:@":"].location == NSNotFound ) {
        return [@{@"status":@"FAIL", @"error":@"invalid time"} jsonString];
    }
    
    NSInteger hour = [[[time componentsSeparatedByString:@":"] objectAtIndex:0] integerValue];
    NSInteger minute = [[[time componentsSeparatedByString:@":"] objectAtIndex:1] integerValue];
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetAlarm data:@[
            [NSString stringWithFormat:@"%@", @(index)],
            [NSString stringWithFormat:@"%@", type],
            [NSString stringWithFormat:@"%@", enabled],
            [weeksComponents componentsJoinedByString:@","],
            [NSString stringWithFormat:@"%@", @(hour)],
            [NSString stringWithFormat:@"%@", @(minute)]
        ] success:^(FitService service, NSDictionary *data) {
            
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Clock

- (NSString *)wn2PluginFitClockGet:(NSString *)jsonString {
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetClock data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
        NSString *datetime = [NSString stringWithFormat:@"%02d-%02d-%02d %02d:%02d:%02d",
            [[appendedData objectForKey:@"yyyy"] intValue],
            [[appendedData objectForKey:@"MM"] intValue],
            [[appendedData objectForKey:@"dd"] intValue],
            [[appendedData objectForKey:@"HH"] intValue],
            [[appendedData objectForKey:@"mm"] intValue],
            [[appendedData objectForKey:@"ss"] intValue]];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"datetime": datetime,
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitClockSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"datetime": [NSString class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *datetime = [options objectForKey:@"datetime"];
    NSString *callback = [options objectForKey:@"callback"];
    
    NSDate *date = nil;
    
    if ( [datetime isEqualToString:@"NOW"] ) {
        date = [NSDate dateWithTimeIntervalSinceNow:0];
    }
    else {
        NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
        [dateFormat setDateFormat:@"yyyy-MM-dd hh:mm:ss"];
        [dateFormat setTimeZone:[NSTimeZone systemTimeZone]];
        
        date = [dateFormat dateFromString:datetime];
        
        [dateFormat release];
    }
    
    if ( date == nil ) {
        return [@{@"status":@"FAIL", @"error":@"invalid datetime"} jsonString];
    }
    
    NSDateComponents *dateComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond | kCFCalendarUnitWeekday fromDate:date];
    
    NSString *year = [NSString stringWithFormat:@"%ld", (long)dateComponents.year];
    NSString *month = [NSString stringWithFormat:@"%ld", (long)dateComponents.month];
    NSString *day = [NSString stringWithFormat:@"%ld", (long)dateComponents.day];
    NSString *hour = [NSString stringWithFormat:@"%ld", (long)dateComponents.hour];
    NSString *minute = [NSString stringWithFormat:@"%ld", (long)dateComponents.minute];
    NSString *second = [NSString stringWithFormat:@"%ld", (long)dateComponents.second];
    NSString *week = [NSString stringWithFormat:@"%ld", (long)([dateComponents weekday] - 1)];
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetClock data:@[year,month,day,hour,minute,second,week] success:^(FitService service, NSDictionary *data) {
        
        NSLog(@"알람설정 성공");
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        NSLog(@"알람설정 실패");
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for SleepTime

- (NSString *)wn2PluginFitSleepTimeGet:(NSString *)jsonString {
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    NSLog(@"(수면)밴드는 연결되어있는가? : %d", fitManager.isConnected);
    
    NSLog(@"(수면)밴드는 연결되어있는가? : %@", [self wn2PluginFitBluetoothIsConnected]);
    
    [fitManager service:FitGetSleepTime data:nil success:^(FitService service, NSDictionary *data) {
        
        NSLog(@"수면 성공");
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        
        
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            
            @"start": [NSString stringWithFormat:@"%02d:%02d", [[appendedData objectForKey:@"sH"] intValue], [[appendedData objectForKey:@"sM"] intValue]],
            @"end": [NSString stringWithFormat:@"%02d:%02d", [[appendedData objectForKey:@"eH"] intValue], [[appendedData objectForKey:@"eM"] intValue]],
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        
        NSLog(@"수면 에러");
        
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitSleepTimeSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"start": [NSString class],
        @"end": [NSString class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *start = [options objectForKey:@"start"];
    NSString *end = [options objectForKey:@"end"];
    NSString *callback = [options objectForKey:@"callback"];
    
    if ( [start rangeOfString:@":"].location == NSNotFound ) {
        return [@{@"status":@"FAIL", @"error":@"invalid start date #1"} jsonString];
    }
    
    NSArray *startComponents = [start componentsSeparatedByString:@":"];
    if ( startComponents.count < 2 ) {
        return [@{@"status":@"FAIL", @"error":@"invalid start date #2"} jsonString];
    }
    
    NSInteger startHours = [[startComponents objectAtIndex:0] integerValue];
    NSInteger startMinutes = [[startComponents objectAtIndex:1] integerValue];
    
    if ( startHours < 0 || startHours > 23 || startMinutes < 0 || startMinutes > 59 ) {
        return [@{@"status":@"FAIL", @"error":@"invalid start date #3"} jsonString];
    }
    
    if ( [end rangeOfString:@":"].location == NSNotFound ) {
        return [@{@"status":@"FAIL", @"error":@"invalid end date #4"} jsonString];
    }
    
    NSArray *endComponents = [end componentsSeparatedByString:@":"];
    if ( endComponents.count < 2 ) {
        return [@{@"status":@"FAIL", @"error":@"invalid end date #5"} jsonString];
    }
    
    NSInteger endHours = [[endComponents objectAtIndex:0] integerValue];
    NSInteger endMinutes = [[endComponents objectAtIndex:1] integerValue];
    
    if ( endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59 ) {
        return [@{@"status":@"FAIL", @"error":@"invalid end date #6"} jsonString];
    }
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetSleepTime data:@[
            [NSString stringWithFormat:@"%@", @(startHours)],
            [NSString stringWithFormat:@"%@", @(startMinutes)],
            [NSString stringWithFormat:@"%@", @(endHours)],
            [NSString stringWithFormat:@"%@", @(endMinutes)]
        ] success:^(FitService service, NSDictionary *data) {
        
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for System

- (NSString *)wn2PluginFitSystemBattery:(NSString *)jsonString {
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetBatteryStatus data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitSystemVersion:(NSString *)jsonString {
   
    // 버전 정보를 호출하면 response 가 오지 않음...
    return [@{@"status":@"FAIL", @"error":@"NOT SUPPORTED"} jsonString];

    /*
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetSystemVersion data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
    */
}

- (NSString *)wn2PluginFitSystemReset:(NSString *)jsonString {

    // 버전 정보를 호출하면 response 가 오지 않음...
    return [@{@"status":@"FAIL", @"error":@"NOT SUPPORTED"} jsonString];

    /*
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSystemReset data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
    
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
    */
}

// 폰트 설정 추가 - 2016.06.22
- (NSString *) exWN2PluginFitDisplayTypeSet : (NSString *) jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{@"uiType" : [NSNumber class]};
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSInteger uiType = [[options objectForKey:@"uiType"] integerValue];
    NSString *callback = [options objectForKey:@"callback"];
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitSetClockPart data:@[
            [NSString stringWithFormat:@"%@", @(0)],
            [NSString stringWithFormat:@"%@", @(0)],
            [NSString stringWithFormat:@"%@", @(2)],
            [NSString stringWithFormat:@"%@", @(uiType)]
            ] success:^(FitService service, NSDictionary *data) {
                NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
                
                NSDictionary *resultInfo = @{
                                             @"status": @"SUCCESS",
                                             @"data": appendedData
                                             };
                [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
            }
    error:^(NSError *error) {
        NSLog(@" 디스플레이뷰 에러 걸림 : %@", jsonString);
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    
    NSLog(@" 디스플레이뷰 들어온 값 : %@", jsonString);
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Locale
- (NSString *)wn2PluginFitLocaleGet:(NSString *)jsonString {
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

    MFitManager *fitManager = [MFitManager defaultManager];

    [fitManager service:FitGetLocale data:nil success:^(FitService service, NSDictionary *data) {
        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];

        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",

            @"data": appendedData
        };

        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];

    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitLocaleSet:(NSString *)jsonString {
    NSDictionary *options = [jsonString objectFromJsonString];

    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"locale": [NSString class],
        @"callback": [NSString class]
    };

    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }

    NSInteger locale = [[options objectForKey:@"locale"] integerValue];
    NSString *callback = [options objectForKey:@"callback"];

    MFitManager *fitManager = [MFitManager defaultManager];
    
    // locale 0 ZH?
    // locale 1 KR?

    [fitManager service:FitSetLocale data:@[@(locale)] success:^(FitService service, NSDictionary *data) {

        NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];

        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"data": appendedData
        };

        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];

    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma mark - for Bluetooth

- (NSString *)wn2PluginFitBluetoothIsConnected {
    return [[MFitManager defaultManager] isConnected] ? @"Y" : @"N";
}

- (NSString *)wn2PluginFitBluetoothCancel:(NSString *)jsonString {
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

    MFitManager *fitManager = [MFitManager defaultManager];
    [fitManager cancelServices];
    
    NSLog(@"블루투스 올 켄슬");

    return [@{ @"status": @"SUCCESS" } jsonString];
}

- (NSString *)wn2PluginFitBluetoothPair:(NSString *)jsonString {
    
    NSLog(@"블루투스 페어 성공");
    
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }

    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
        @"timeout": [NSNumber class],
        @"callback": [NSString class]
    };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSString *callback = [options objectForKey:@"callback"];
    NSInteger timeout = [[options objectForKey:@"timeout"] integerValue];
    
    if ( timeout < 500 ) {
        return [@{@"status":@"FAIL", @"error":@"timeout is too low"} jsonString];
    }
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager pair:^(NSString *uuid) {
        NSString *state = fitManager.state == CBCentralManagerStatePoweredOn ? @"ENABLED" : @"DISABLED";
        
        NSLog(@"블루투스 페어 성공 두번째 접속시");
        NSLog(@"밴드는 연결되어있는가? 두번째 접속시 : %d", fitManager.isConnected);
        NSLog(@"밴드는 연결되어있는가? : %@", [self wn2PluginFitBluetoothIsConnected]);
        NSLog(@"상태 : %@", state);
        NSLog(@"밴드 uuid : %@", uuid);
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"state": state,
            @"uuid": [NSString stringWithString:uuid]
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        NSString *state = fitManager.state == CBCentralManagerStatePoweredOn ? @"ENABLED" : @"DISABLED";
    
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"state": state, @"error":[error localizedDescription]}, nil];
    } timeout:((float)timeout/1000)];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

#pragma 밴드선택하여 페어링
- (NSString *)wn2PluginFitSelectBluetoothPair:(NSString *)jsonString {
    
    NSLog(@"%@", jsonString);
    
    NSLog(@"블루투스 페어 성공11");
    
    NSDictionary *options = [jsonString objectFromJsonString];
    
    if (!options) {
        return [@{@"status":@"FAIL", @"error":@"invalid params"} jsonString];
    }
    
    NSLog(@"블루투스 페어 유효성 검사 실패");
    
    NSString *invalidMessage = nil;
    NSDictionary *validClasses = @{
                                   @"timeout": [NSNumber class],
                                   @"uuid" : [NSString class]
                                   };
    
    if ( ! [self checkValidParameters:options fromValidClasses:validClasses errorMessage:&invalidMessage] ) {
        return [@{@"status":@"FAIL", @"error":invalidMessage} jsonString];
    }
    
    NSLog(@"블루투스 페어 필수 파라미터 실패");
    
    NSString *callback = [options objectForKey:@"callback"];
    NSInteger timeout = [[options objectForKey:@"timeout"] integerValue];
    NSString *selectedUUID = [options objectForKey:@"uuid"];
    NSString *devicename = [options objectForKey:@"devicename"];
    
    if ( timeout < 500 ) {
        return [@{@"status":@"FAIL", @"error":@"timeout is too low"} jsonString];
    }
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager pair:^(NSString *uuid) {
        
        // 페어결과 받기
        
        NSLog(@"블루투스 페어 성공111");
        NSString *state = fitManager.state == CBCentralManagerStatePoweredOn ? @"ENABLED" : @"DISABLED";
        
        //[GlobalData sharedGlobalData].peripheral = peripheral;
        [GlobalData sharedGlobalData].bandUUid = uuid;
        
        NSLog(@"블루투스 페어 성공 후 글로벌 데이터 유유아이디 초기화");
        
        NSLog(@"블루투스 페어 후 페어링 체크 : %d", fitManager.isConnected);
        NSDictionary *resultInfo = @{
                                     @"status": @"SUCCESS",
                                     @"state": state,
                                     @"devicename" : devicename,
                                     @"uuid": [NSString stringWithString:uuid]
                                     };
        
        
        [self.viewController callCbfunction:@"iosPairedResult" withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        NSLog(@"블루투스 페어 실패111");
        NSLog(@"%@", error);
        NSString *state = fitManager.state == CBCentralManagerStatePoweredOn ? @"ENABLED" : @"DISABLED";
        
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"state": state, @"error":[error localizedDescription]}, nil];
    } timeout:((float)timeout/1000) uuid:selectedUUID];
    
    
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitBluetoothUnpair:(NSString *)jsonString {
    
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    NSLog(@"블루투스 언페어");
    
    [fitManager unpair:^(NSString *uuid) {
        NSDictionary *resultInfo = @{
            @"status": @"SUCCESS",
            @"uuid": [NSString stringWithString:uuid]
        };
        
        [self.viewController callCbfunction:callback withObjects:resultInfo, nil];
    } error:^(NSError *error) {
        [self.viewController callCbfunction:callback withObjects:@{@"status":@"ERROR", @"error":[error localizedDescription]}, nil];
    }];
    
    return [@{ @"status": @"PROCESSING" } jsonString];
}

- (NSString *)wn2PluginFitBluetoothEnabled:(NSString *)jsonString {
    NSString *status = @"NS";
    NSString *message = PGLocalizedString(@"mp_beacon_bluetooth_no_supported_settings", @"not supported");
    
    @try {
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"prefs:root=General&path=Bluetooth"]];
    }
    @catch ( NSException *e ) {
        status = @"FAIL";
        message = [e reason];
    }
    
    return [@{@"status":status, @"message":message} jsonString];
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

- (PPWebViewController *)viewController {
    if ( self.isAlive == NO ) {
        return nil;
    }

    return _viewController;
}

@dynamic viewController;
@synthesize viewctrl = _viewController;

@end
