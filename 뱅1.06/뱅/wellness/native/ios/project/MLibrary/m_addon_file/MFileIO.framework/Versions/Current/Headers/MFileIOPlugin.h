//
//  MFileIOPlugin.h
//  Framework
//
//  Created by Uracle Lab on 13. 9. 6..
//
//

#import <Foundation/Foundation.h>

@interface MFileIOPlugin : NSObject
{
    NSBundle* _bundle;
    NSBundle* _strBundle;
}

@property (nonatomic, retain) NSBundle* bundle;
@property (nonatomic, retain) NSBundle* strBundle;

+ (MFileIOPlugin *) getInstance;
+ (NSString *) localizedStringForKey:(NSString *)key withComment:(NSString *)comment;

@end

#define PLUGIN_CLASS    MFileIOPlugin
#define PLUGIN_BUNDLE   @"MFileIO.bundle"

#define PGResource(res) [PLUGIN_BUNDLE appendPath:res]
#define PGLocalizedString(key, comment) [PLUGIN_CLASS localizedStringForKey:(key) withComment:(comment)]
