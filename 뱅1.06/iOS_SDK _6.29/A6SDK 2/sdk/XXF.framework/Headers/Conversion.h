//
//  Conversion.h
//  Stu
//
//  Created by vidonn on 16/4/14.
//  Copyright © 2016年 stu. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Conversion : NSObject
//+(Conversion *) getInstance;
+(int) HXtoInt:(NSData *) byte;
+(NSMutableDictionary*) parsinga503:(NSData *) data;
+(NSMutableDictionary*) parsinga503X:(NSData *) data;
+(NSMutableArray*) parsinga507:(NSMutableArray *) data;
+ (int) parsing2A37:(NSData*) data;
+ (int) parsingFFE9:(NSData*) data;
+ (NSString*) parsing2A19:(NSData*) data;
+(NSMutableDictionary*) parsing2001:(NSData *) data;
+(NSMutableDictionary*) parsing2002:(NSData *) data;
+(NSMutableDictionary*) parsing2002j:(NSData *) data;
+(NSMutableDictionary*) parsing2003:(NSData *) data;
+(NSMutableDictionary*) parsing2004:(NSData *) data;
+(NSMutableDictionary*) parsing2005:(NSData *) data;
+(NSMutableDictionary*) parsing2005x:(NSData *) data;
+(NSMutableDictionary*) parsing2006:(NSData *) data;
+(NSMutableDictionary*) parsing2007:(NSData *) data;
+(NSMutableDictionary*) parsing2007y:(NSData *) data;
+(NSMutableDictionary*) parsing2008:(NSData *) data;
+(NSMutableDictionary*) parsing2009:(NSData *) data;
+(NSMutableDictionary*) parsing2010:(NSData *) data;
+(NSMutableDictionary*) parsinga521:(NSData *) data;
+(NSMutableDictionary*) parsinga521x:(NSData *) data;
+(NSMutableDictionary*) parsinga522:(NSData *) data;
+ (NSString*) parsing2A28:(NSData*) data;
+ (NSString*) parsing2A27:(NSData*) data;
+(NSMutableDictionary*) parsinga502:(NSData *) data;
+(NSMutableDictionary*) parsinga502x:(NSData *) data;
+(NSString*) parsing25:(NSData *) data;
+(NSMutableDictionary*) parsinga504:(NSData *) data;
+(NSMutableArray*) parsinga505:(NSMutableArray *) data dic:(NSMutableDictionary*) dic;
+(NSMutableDictionary*) parsing200A:(NSData *) data;
+(NSMutableDictionary*) parsing200B:(NSData *) data;
@end
