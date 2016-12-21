//
//  AppDelegate+Facebook.m
//  MDebug
//
//  Created by ProgDesigner on 2015. 7. 20..
//
//

#import "AppDelegate+Facebook.h"
#import <FacebookSDK/FacebookSDK.h>

@implementation AppDelegate(Facebook)

- (void)applicationDidBecomeActive:(UIApplication *)application {
    [FBAppEvents activateApp];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    

    return [FBAppCall handleOpenURL:url sourceApplication:sourceApplication];
}

@end
