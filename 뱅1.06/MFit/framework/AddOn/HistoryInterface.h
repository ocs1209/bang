//
//  HistoryInterface.h
//  MFit
//
//  Created by OGGU on 2016. 6. 9..
//  Copyright © 2016년 UracleLab. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol FitHistoryDelegate;

@interface HistoryInterface : NSObject

@property (strong, nonatomic) NSString *resultString;

@property (strong, nonatomic) NSString *userKey;

@property (strong, nonatomic) NSString *authKey;

@property (strong, nonatomic) NSString *sleepStartTime;

@property (strong, nonatomic) NSString *sleepEndTime;

- (void) AddOnFitHistory:(NSArray *) dateArray;
- (void) readHistoryTable:(NSString*) sdate;
- (void) AddOnFitAbleHistory;

@property(strong, nonatomic) id<FitHistoryDelegate> delegate;

@end

@protocol FitHistoryDelegate <NSObject>

@required

- (void) historyData : (NSString *) jsonString arrayListDate : (NSArray *) arrayListDate userKey : (NSString *) userKey authKey : (NSString *) authKey sleepStartTime : (NSString *) sleepStartTime sleepEndTime : (NSString *) sleepEndTime;

@end