//
//  FitManager.m
//  MDebug
//
//  Created by ProgDesigner on 2015. 9. 30..
//
//

#import "FitManager.h"
//#import <MFit/MFitSynchronizeManager.h>
#import <MFit/MFitManager.h>

@interface FitManager () {
    NSTimer *_timer;
    UIBackgroundTaskIdentifier _backgroundTask;
}

@end

@implementation FitManager

- (id)init {
    self = [super init];
    if (self) {
        _backgroundTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
            [[UIApplication sharedApplication] endBackgroundTask:_backgroundTask];
            _backgroundTask = UIBackgroundTaskInvalid;
        }];
    }
    return self;
}

- (void)startUpdating {
    NSLog( @"startUpdating" );
    
//    if ( _timer != nil ) {
//        _timer = [NSTimer scheduledTimerWithTimeInterval:60*60 target:self selector:@selector(synchronize) userInfo:@{} repeats:YES];
//    }
//    
//    [self performSelector:@selector(synchronize) withObject:nil afterDelay:5.0f];
}

//- (void)synchronize {
//    if ( [UIApplication sharedApplication].applicationState == UIApplicationStateBackground ) {
//        if ( [MFitSynchronizeManager defaultManager].isSynchronizing == NO ) {
//            [[MFitSynchronizeManager defaultManager] synchronize];
//        }
//    }
//}

+ (FitManager *)defaultManager {
    static FitManager* instance;
    @synchronized(self) {
        if (!instance) {
            instance = [[FitManager alloc] init];
            return instance;
        }
    }
    return instance;
}

@end
