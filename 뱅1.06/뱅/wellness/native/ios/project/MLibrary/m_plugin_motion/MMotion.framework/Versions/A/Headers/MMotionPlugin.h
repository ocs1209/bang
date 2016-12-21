//
//  MMotionPlugin.h
//

#import <Foundation/Foundation.h>

@interface MMotionPlugin : MPlugin

+ (MMotionPlugin *)getInstance;

@end

#define PLUGIN_CLASS    MMotionPlugin
#define PLUGIN_BUNDLE   @"MMotion.bundle"

#define PGResource(res) [PLUGIN_BUNDLE appendPath:res]
#define PGLocalizedString(key, comment) [PLUGIN_CLASS localizedStringForKey:(key)]
