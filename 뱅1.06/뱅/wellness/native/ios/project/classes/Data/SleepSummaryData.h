//
//  SleepSummaryData.h
//  Wellness
//
//  Created by OGGU on 2016. 6. 16..
//
//

#import <CoreData/CoreData.h>

@interface SleepSummaryData : NSManagedObject

@property (strong, nonatomic) NSNumber *idx;

@property (strong, nonatomic) NSNumber *sync_cnt;

@property (strong, nonatomic) NSNumber *sync_val;

@property (strong, nonatomic) NSNumber *sync_avg;

@property (strong, nonatomic) NSNumber *soso_cnt;

@property (strong, nonatomic) NSNumber *soso_val;

@property (strong, nonatomic) NSNumber *bad_cnt;

@property (strong, nonatomic) NSNumber *bad_val;

@property (strong, nonatomic) NSNumber *good_cnt;

@property (strong, nonatomic) NSNumber *good_val;

@end
