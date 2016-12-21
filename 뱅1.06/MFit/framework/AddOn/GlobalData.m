//
//  GlobalData.m
//  MFit
//
//  Created by OGGU on 2016. 6. 30..
//  Copyright © 2016년 UracleLab. All rights reserved.
//

#import "GlobalData.h"


@implementation GlobalData

static GlobalData *sharedGlobalData = nil;

+(GlobalData *) sharedGlobalData {
    
    if (sharedGlobalData == nil) {
        
        sharedGlobalData = [[super allocWithZone:nil] init];
    }
    
    return sharedGlobalData;
}

- (id) init{
    
    if (self = [super init]) {
        // 초기화 작업
    }
    
    return self;
}

@end
