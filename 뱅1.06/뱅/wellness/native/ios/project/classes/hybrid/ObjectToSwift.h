//
//  ObjectToSwift.h
//  Wellness
//
//  Created by OGGU on 2016. 6. 30..
//
//

#import <Foundation/Foundation.h>
#import <MFit/GlobalData.h>

@interface ObjectToSwift : NSObject

- (CBPeripheral *) getConnectedPeripheral;

- (NSString *) getBandUUid;

- (void) indicatorViewIn;

- (void) indicatorViewOut;

@end
