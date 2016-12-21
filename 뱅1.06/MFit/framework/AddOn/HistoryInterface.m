//
//  HistoryInterface.m
//  MFit
//
//  Created by OGGU on 2016. 6. 9..
//  Copyright © 2016년 UracleLab. All rights reserved.
//

#import "HistoryInterface.h"
#import "MFitPlugin.h"
#import "MFitManager.h"
#import <FitBand/FitBand.h>

@class FitBand;
@implementation HistoryInterface

#pragma 밴드에서 데이터 가져오기

- (void) AddOnFitHistory:(NSArray *) dateArray {
    
    NSArray *dateList = dateArray;
    
    NSLog(@" 데이터 리스트 로그 : %@", dateList);
    
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
    
    MFitManager *fitManager = [MFitManager defaultManager];
    
    [fitManager service:FitGetHistoryTable data:nil success:^(FitService service, NSDictionary *data) {
        
        NSLog(@" 사용 가능한 데이트 리스트 %@", data);
        
        
        // 1. 추출 가능한 데이터 리스트를 먼저 추출한다 (data)
        // 2. 추출할 데이터와 사용 가능한 데이터를 비교해서(dateQueue)
        // 3. 최종 날짜 리스트를 만든다.(dateQueue)
        
        NSMutableArray *ableArray = [[NSMutableArray alloc] init];
        
        // 추출가능한 날짜 리스트
        for (NSString *requestDate in dateQueue) {
            
            // 요청한 날짜 리스트
            
            int count = 0;
            
            for (NSString *dicKey in data) {
                
                NSString *ableDate = [data objectForKey:dicKey];
                
                NSLog(@"가능한날짜 : %@ 리퀘스트 날짜 : %@ 발견된 카운트 %d", ableDate, requestDate, count);
                
                if ([ableDate isEqualToString:requestDate]) {
                    
                    count++;
                }
            }
            
            NSLog(@"발견된 카운트 %d", count);
            
            if (count > 0) {
                
                // 사용가능한 날짜 어레이에 넣기
                [ableArray addObject:requestDate];
            }
        }
        
        // 삭제된후 어레이 리스트
        NSLog(@"정제된 사용가능한 날짜 리스트 %@", ableArray);
        
        NSMutableArray* value = [NSMutableArray array];
        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
        
        if ( ableArray.count == 0 ) {
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
            for ( NSString *date in ableArray ) {
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
        
        NSLog(@"시간대별 호출1 : %@", value);
        
        [fitManager service:FitGetHistoryAppointValue data:value success:^(FitService service, NSDictionary *data) {
            
            NSLog(@"SDK 에서 받아오는값 %@", data);
            
            NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
            
            NSArray *itemList = [NSArray arrayWithArray:[appendedData objectForKey:@"setp"]];
            
            //NSLog(@"아이템 리스트 갯수 %ld", itemList.count);
            
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
            
            NSLog(@" 스텝 리스트 로그 : %@", list);
            
            // 코어 데이터에 쌓기
            
            _resultString = [[list jsonString] copy];
            
            if ([self.delegate respondsToSelector:@selector(historyData:arrayListDate:userKey:authKey:sleepStartTime:sleepEndTime:)]) {
                
                [self.delegate historyData:_resultString arrayListDate:dateArray userKey:_userKey authKey:_authKey sleepStartTime:_sleepStartTime sleepEndTime:_sleepEndTime];
            }
            
            NSLog(@"리턴될 값 : %@", _resultString);
            
            
        } error:^(NSError *error) {
            
            
        }];
        
    } error:^(NSError *error) {
        
    }];
}


- (void) AddOnFitAbleHistory {
    
    [[FitBand sharedInstance] ReadWriteData:READLSB input:nil blk:^(NSMutableDictionary *array, HandlerType type) {
        NSLog(@"kkr : history1 호출됨");
        if(type == READLSB)
        {
            NSLog(@"kkr : history2 호출됨");
            [self ReadHistoryFromArray:[self createArray:array] dateArray:array];
        }
        
    } err:^(NSError *error) {
        NSLog(@"kkr : history1 에러 호출됨");
    }];
    
//    NSLog(@"kkr : history1 호출됨");
//    MFitManager *fitManager = [MFitManager defaultManager];
//    
//    [fitManager service:FitGetHistoryTable data:nil success:^(FitService service, NSDictionary *data) {
//        
//        NSDictionary *array_date_data = data;
//        
//        [fitManager service:FitGetHistoryAppointValue data:[self createArray:array_date_data] success:^(FitService service, NSDictionary *data) {
//            
//            NSLog(@"kkr : history2 호출됨");
//            
//            NSLog(@"SDK 에서 받아오는값 %@", data);
//            
//            NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:data];
//            
//            NSArray *itemList = [NSArray arrayWithArray:[appendedData objectForKey:@"setp"]];
//            
//            //NSLog(@"아이템 리스트 갯수 %ld", itemList.count);
//            
//            __block NSMutableArray *list = [NSMutableArray array];
//            
//            for ( int i=0; i<itemList.count; i++ ) {
//                NSString *record = [itemList objectAtIndex:i];
//                
//                NSArray *recordComponents = [record componentsSeparatedByString:@","];
//                NSArray *timeComponents = [[recordComponents objectAtIndex:0] componentsSeparatedByString:@" "];
//                NSString *date = [timeComponents objectAtIndex:0];
//                NSInteger hour = [[timeComponents objectAtIndex:1] integerValue];
//                NSInteger minute = [[recordComponents objectAtIndex:1] integerValue];
//                NSInteger value = [[recordComponents objectAtIndex:3] integerValue];
//                NSString *active = (value == 0 && [[recordComponents objectAtIndex:2] isEqualToString:@"F"]) ? @"F" :  @"A";
//                
//                [list addObject:@{
//                                  @"date": [date copy],
//                                  @"time": [NSString stringWithFormat:@"%02d:%02d", (int)hour, (int)minute],
//                                  @"active": active,
//                                  @"value": @(value)
//                                  }];
//            }
//            
//            NSLog(@" 스텝 리스트 로그 : %@", list);
//            
//            // 코어 데이터에 쌓기
//            
//            _resultString = [[list jsonString] copy];
//            
//            if ([self.delegate respondsToSelector:@selector(historyData:arrayListDate:userKey:authKey:sleepStartTime:sleepEndTime:)]) {
//                
//                NSMutableArray *array_date = [[NSMutableArray alloc] init];
//                
//                [array_date_data enumerateKeysAndObjectsWithOptions:NSEnumerationConcurrent
//                                                   usingBlock:^(id key, id object, BOOL *stop) {
//                                                       
//                                                       [array_date addObject:object];
//                                                       
//                                                       [self.delegate historyData:_resultString arrayListDate:array_date userKey:_userKey authKey:_authKey sleepStartTime:_sleepStartTime sleepEndTime:_sleepEndTime];
//                                                       
//                                                   }];
//                
//                
//            }
//            
//            NSLog(@"리턴될 값 : %@", _resultString);
//            
//            
//        } error:^(NSError *error) {
//            
//            NSLog(@"kkr : history1 에러 호출됨");
//        }];
//        
//    } error:^(NSError *error) {
//        
//    }];
}




-(void) ReadHistoryFromArray:(NSArray*) value dateArray : (NSMutableDictionary *) dateArray
{
    NSLog(@"kkr : history4 호출됨");
    [[FitBand sharedInstance] ReadWriteData:READLS input:value blk:^(NSMutableDictionary *array, HandlerType type) {
        if(type == READLS)
        {
            NSLog(@"kkr : history3 호출됨");
            
            NSLog(@"SDK 에서 받아오는값 %@", array);
            
            NSMutableDictionary *appendedData = [NSMutableDictionary dictionaryWithDictionary:array];
            
            NSArray *itemList = [NSArray arrayWithArray:[appendedData objectForKey:@"setp"]];
            
            //NSLog(@"아이템 리스트 갯수 %ld", itemList.count);
            
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
            
            NSLog(@" 스텝 리스트 로그 : %@", list);
            
            // 코어 데이터에 쌓기
            
            _resultString = [[list jsonString] copy];
            
            if ([self.delegate respondsToSelector:@selector(historyData:arrayListDate:userKey:authKey:sleepStartTime:sleepEndTime:)]) {
                
                NSMutableArray *array_date = [[NSMutableArray alloc] init];
                
                for ( NSString *key in [dateArray allKeys]) {
                    
                    [array_date addObject:[dateArray objectForKey:key]];
                    
                }
                
                [self.delegate historyData:_resultString arrayListDate:array_date userKey:_userKey authKey:_authKey sleepStartTime:_sleepStartTime sleepEndTime:_sleepEndTime];
                
//                [dateArray enumerateKeysAndObjectsWithOptions:NSEnumerationConcurrent
//                                              usingBlock:^(id key, id object, BOOL *stop) {
//                                                  
//                                                  [array_date addObject:object];
//                                                  
//                                                  [self.delegate historyData:_resultString arrayListDate:array_date userKey:_userKey authKey:_authKey sleepStartTime:_sleepStartTime sleepEndTime:_sleepEndTime];
//                                                  
//                                              }];
                
            }
            
            NSLog(@"리턴될 값 : %@", _resultString);
        }
        
    } err:^(NSError *error) {
        
    }];
}

- (void) readHistoryTable:(NSString*) sdate
{
    [[X6_bt_a getInstance] ReadWriteData:READLSB input:nil blk:^(NSMutableDictionary *array, HandlerType type) {
        if(type == READLSB)
        {
            if(sdate == nil)
            {
                NSLog(@"kkr : history1 호출됨");
                [self ReadHistoryFromArray:[self createArray:array] dateArray:array];
            }
            else
            {
                [self ReadHistoryFromArray:[self createArrayst:sdate]dateArray:array];
            }
            
        }
        
    } err:^(NSError *error) {
        NSLog(@"kkr : history1 에러 호출됨");
    }];
}

-(NSMutableArray*) createArray:(NSMutableDictionary*)historyTable
{
    NSMutableArray* value = [NSMutableArray array];
    for(int i = 1 ; i < 8 ; i++)
    {
        NSString* da2in = [historyTable objectForKey:[NSString stringWithFormat:@"%d",i]];
        
        if(da2in == nil)
            continue;
        
        
        // 1. 오늘날짜인지 비교하기
        NSDate *today = [NSDate dateWithTimeIntervalSinceNow:0];
        NSDateComponents *todayComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour fromDate:today];
        NSString *todayDateString = [NSString stringWithFormat:@"%02d-%02d-%02d", (int)todayComponents.year, (int)todayComponents.month, (int)todayComponents.day];
        int current_hour = todayComponents.hour;
        
        
        for(int j = 0 ; j < 24 ; j++)
        {
            // 오늘일자 현재 시간 보다 높으면 계속 컨티뉴 되도록 로직 변경
            
            
            if ([todayDateString isEqualToString:da2in]) {
                
                if (j > current_hour) {
                    continue;
                }
            }
            
            [value addObject:[NSString stringWithFormat:@"%@ %02d",da2in,j]];
        }
    }
    
    return [self sortData:value];
}

-(NSMutableArray*) createArrayst:(NSString*)sdate
{
    NSMutableArray* value = [NSMutableArray array];
    NSString *nyr = [[sdate componentsSeparatedByString:@" "] objectAtIndex:0];
    NSString *h = [[sdate componentsSeparatedByString:@" "] objectAtIndex:1];
    
    if([nyr isEqualToString:[self getCurTime]])
    {
        for(int i = [h intValue] ; i <= [[self getCurTimeH] intValue] ; i ++)
        {
            [value addObject:[NSString stringWithFormat:@"%@ %02d", nyr, i]];
        }
        return [self sortData:value];
    }
    else
    {
        for (int i = 0; i < 7; i++)
        {
            NSString *curnext = [self getCurNext:i];
            for(int i = 0 ; i < 24 ; i ++)
            {
                [value addObject:[NSString stringWithFormat:@"%@ %02d", curnext, i]];
            }
            if ([curnext isEqualToString:nyr])
            {
                return [self sortData:value];
            }
        }
        return [self sortData:value];
    }
    return nil;
}

- (NSString *)getCurNext:(int)idx {
    NSDate *date = [[NSDate alloc] init];
    date = [date dateByAddingTimeInterval:-(idx)*3600 * 24];
    NSDateFormatter *dateformatter = [[NSDateFormatter alloc] init];
    [dateformatter setDateFormat:@"yyyy-MM-dd"];
    NSString *locationString = [dateformatter stringFromDate:date];
    return locationString;
}

-(NSString*) getCurTimeH
{
    NSDate *  senddate=[NSDate date];
    NSDateFormatter  *dateformatter=[[NSDateFormatter alloc] init];
    [dateformatter setDateFormat:@"HH"];
    NSString *  locationString=[dateformatter stringFromDate:senddate];
    return locationString;
}

-(NSString*) getCurTime
{
    NSDate *  senddate=[NSDate date];
    NSDateFormatter  *dateformatter=[[NSDateFormatter alloc] init];
    [dateformatter setDateFormat:@"yyyy-MM-dd"];
    NSString *  locationString=[dateformatter stringFromDate:senddate];
    return locationString;
}

- (NSMutableArray *)sortData:(NSMutableArray *)data {
    NSStringCompareOptions comparisonOptions =
    NSCaseInsensitiveSearch | NSNumericSearch | NSWidthInsensitiveSearch |
    NSForcedOrderingSearch;
    NSComparator sort = ^(NSString *obj1, NSString *obj2) {
        NSRange range = NSMakeRange(0, obj1.length);
        return [obj1 compare:obj2 options:comparisonOptions range:range];
    };
    NSArray *resultArray2 = [data sortedArrayUsingComparator:sort];
    return [resultArray2 mutableCopy];
}

@end
