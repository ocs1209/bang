//
//  AppDelegate+MPush.m
//  MDebug
//
//  Created by ProgDesigner on 2015. 7. 20..
//
//

#import "AppDelegate+MPush.h"

#import "PushReceiver.h"
#import "PushManager.h"
#import "AppDelegate+PushManager.h"

@implementation AppDelegate(MPush)

- (void)application:(UIApplication *)application didFinishLaunchingWithOptionsForPushService:(NSDictionary *)launchOptions {
    [[PushManager defaultManager] application:application didFinishLaunchingWithOptions:launchOptions];
    [[PushManager defaultManager] initilaizeWithDelegate:[[[PushReceiver alloc] init] autorelease]];
}


@end
