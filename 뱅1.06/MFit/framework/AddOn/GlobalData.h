//
//  GlobalData.h
//  MFit
//
//  Created by OGGU on 2016. 6. 30..
//  Copyright © 2016년 UracleLab. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

@interface GlobalData : NSObject

+ (GlobalData *) sharedGlobalData;

@property (retain, nonatomic) CBPeripheral *peripheral;

@property (retain, nonatomic) NSString *bandUUid;

@end
