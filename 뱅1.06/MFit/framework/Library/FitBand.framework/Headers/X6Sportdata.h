//
//  Movementdata.h
//  vidonn_bt_dll
//
//  Created by 曾 言伟 on 13-12-26.
//  Copyright (c) 2013年 vidonn. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface X6Sportdata : NSObject
{
    NSString* setp;
    NSString* setpls;
    NSString* distance;
    NSString* calorie;
    NSString* time;
    NSString* index;
    NSString* packagetype;
    NSString* dayindex;
    NSString* hourindex;
    NSString* sporttype;
    NSString* slptype;
    NSString* minute;
    NSString* error;
    NSMutableDictionary* index2data;
    NSMutableDictionary* data2index;
}

@property (strong,nonatomic) NSString*  setp;
@property (strong,nonatomic) NSString*  slptype;
@property (strong,nonatomic) NSString*  setpls;
@property (strong,nonatomic) NSString*  distance;
@property (strong,nonatomic) NSString*  calorie;
@property (strong,nonatomic) NSString*  time;
@property (strong,nonatomic) NSString*  index;
@property (strong,nonatomic) NSString*  packagetype;
@property (strong,nonatomic) NSString*  dayindex;
@property (strong,nonatomic) NSString*  hourindex;
@property (strong,nonatomic) NSString*  sporttype;
@property (strong,nonatomic) NSString*  minute;
@property (strong,nonatomic) NSString*  error;
@property (strong,nonatomic) NSMutableDictionary*  index2data;
@property (strong,nonatomic) NSMutableDictionary*  data2index;

@end
