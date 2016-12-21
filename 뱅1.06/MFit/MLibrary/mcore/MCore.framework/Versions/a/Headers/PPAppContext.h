//
//  PPAppContext.h
//  Library
//
//  Created by Uracle Lab on 12. 5. 21..
//  Copyright (c) 2012년 lab@uracle.co.kr. All rights reserved.
//

#import <Foundation/Foundation.h>

#define _setGlovalValue(_key, _value)  [[PPAppContext getInstance] setGlobalObject:_value key:_key]
#define _getGlovalValue(_key)          [[PPAppContext getInstance] globalObjectForKey:_key]

#define _setGlobalValue(_key, _value)  [[PPAppContext getInstance] setGlobalObject:_value key:_key]
#define _getGlobalValue(_key)          [[PPAppContext getInstance] globalObjectForKey:_key]
#define _setStorageValue(_key, _value) [[PPAppContext getInstance] setStorageObject:_value key:_key]
#define _getStorageValue(_key)         [[PPAppContext getInstance] storageStringForKey:_key]

@interface PPAppContext : NSObject {
@private
	NSMutableDictionary *_sharedVariable;
    NSDictionary* appStartOption;
}

@property (nonatomic, readonly) NSMutableDictionary *sharedVariable;
@property (nonatomic, retain)   NSDictionary        *appStartOption;

+ (PPAppContext *) getInstance;

#pragma -
#pragma application valiable setter getter methods

- (void) setStorageObject: (NSString *) object key: (NSString *) key;

- (NSString *) storageObjectForKey: (NSString *) key;

- (NSString *) storageObjectForKeyAndRemove: (NSString *) key;

- (NSString *) storageStringForKey: (NSString *) key;

- (NSArray *) listAllStorageKeys;

- (NSDictionary *) listAllStorageValues;

- (void) removeStorageObject:(NSString *)key;

- (void) resetAllStorageKeys;

#pragma -
#pragma global valiable setter getter methods

- (void) setGlobalObject: (NSString *) object key: (NSString *) key;

- (NSString *) globalObjectForKey: (NSString *) key;

- (NSString *) globalObjectForKeyAndRemove: (NSString *) key;

- (NSArray *) listAllGlobalKeys;

- (void) removeGlobalObject:(NSString *)key;

- (void) resetAllGlobalKeys;

@end
