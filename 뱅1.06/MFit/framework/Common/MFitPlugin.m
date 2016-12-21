//
//  MFitPlugin.m
//
//  Created by uracle.lab on 2015. 09. 09..
//

#import "MFitPlugin.h"
#import "MFitManager.h"

@interface MFitPlugin () {
//    UIBackgroundTaskIdentifier _backgroundTask;
}

@end

@implementation MFitPlugin

- (void)initialize {
    [[MFitManager defaultManager] initialize];
    NSLog(@"엠핏 매니저 인잇");
//   [[MFitSynchronizeManager defaultManager] initialize];
    
//    _backgroundTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
//        [[UIApplication sharedApplication] endBackgroundTask:_backgroundTask];
//        _backgroundTask = UIBackgroundTaskInvalid;
//    }];
}

- (NSString *)bundleFileName {
    return PLUGIN_BUNDLE;
}

+ (PLUGIN_CLASS *)getInstance {
    static id sharedInstance;
	@synchronized(self) {
		if(!sharedInstance) {
			sharedInstance = [[PLUGIN_CLASS alloc] init];
            DDebug(@"Loaded Plugin : %@", NSStringFromClass([PLUGIN_CLASS class]) );
			return sharedInstance;
		}
	}
	return sharedInstance;
}

@end
