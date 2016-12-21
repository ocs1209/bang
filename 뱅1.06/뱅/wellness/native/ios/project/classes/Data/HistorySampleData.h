//
//  HisotorySampleData.h
//  Wellness
//
//  Created by OGGU on 2016. 6. 10..
//
//

#import <CoreData/CoreData.h>

@interface HisotorySampleData : NSManagedObject

@property (strong, nonatomic) NSNumber *idx;

@property (strong, nonatomic) NSDate *step_datetime;

@property (strong, nonatomic) NSString *step_date;

@property (strong, nonatomic) NSString *time;

@property (strong, nonatomic) NSString *type;

@property (strong, nonatomic) NSNumber *value;

@property (strong, nonatomic) NSString *etc1;

@property (strong, nonatomic) NSString *etc2;

@property (strong, nonatomic) NSString *etc3;

@end