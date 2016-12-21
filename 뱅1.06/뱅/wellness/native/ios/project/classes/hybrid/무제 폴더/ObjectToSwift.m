//
//  ObjectToSwift.m
//  Wellness
//
//  Created by OGGU on 2016. 6. 30..
//
//


#import "ObjectToSwift.h"

@implementation ObjectToSwift

- (CBPeripheral *) getConnectedPeripheral {
    
//    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
    if ([GlobalData sharedGlobalData].peripheral) {
        
//        [userDefaults setObject:[GlobalData sharedGlobalData].peripheral forKey:@"peripheral"];
    }
    
    NSLog(@"%@", [GlobalData sharedGlobalData].peripheral);
    return [GlobalData sharedGlobalData].peripheral;
}

- (NSString *) getBandUUid {
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
    if ([GlobalData sharedGlobalData].bandUUid) {
        
        [userDefaults setObject:[GlobalData sharedGlobalData].bandUUid forKey:@"banduuid"];
    }
    
    return [userDefaults objectForKey:@"banduuid"];
}

@end