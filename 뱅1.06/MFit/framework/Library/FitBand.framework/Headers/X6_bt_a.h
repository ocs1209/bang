//
//  vidonn_bt_a.h
//  vidonn_bt_a
//
//  Created by 曾 言伟 on 14-1-3.
//  Copyright (c) 2014年 vidonn. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "X6btdelegate.h"

typedef enum {
    
    READDQ = 0, // 读取手环当前实时运动数据
    READLSB,    // 读取手环历史运动数据日期对照表
    READLS,   // 读取指定日期手环历史运动数据
    READGR,   // 读取个人信息，包括身高，体重，年龄，性别，运动目标
    WRITEGR,   // 写入个人信息
    READSJ,   // 读手环时间
    WRITESJ,   // 写手环时间
    WRITENZ,   // 写闹钟
    READNZ,   // 读闹钟
    READJZ,   // 读取久坐提醒时间
    WRITEJZ,   // 写久坐提醒时间
    READSM,   // 读取睡眠时间
    WRITESM,   // 写手环睡眠时间
    READWR,   // 读勿扰
    WRITEWR,   // 写勿扰
    READDL,   // 读电量
    WRITECZ,   // 系统重置
    READBB,   // 读手环软件版本
    READYB,    //硬件版本
    READCB,   //厂商
    READMB,   // 读运动目标
    WRITEMB,  // 写运动目标
    READXLH,  //读mac地址
    DEVUP,    //   固件升级
    DFUMOD,    //   固件升级
    DFUX,    //   固件升级
    SUDP,
    RAPM,  //   设置AM PM
    WAPM,
    WNOTE,    //设置消息类型
    RNOTE,
    WLEFT,     //左右手
    RLEFT,     //左右手
    WHORVER,   //横竖
    SUDPX,
    RLS,//读临时模式
    WLS,//写临时模式
    RTS,//读抬手+横竖
    WTS,//写抬手+横竖
    WYY,//写手环语言语言
    RYY//读手环语言
    
} HandlerType;


typedef void (^ConnectedBlock_t)(NSString* val);
typedef void (^SearchBlock_t)(NSMutableArray* val);
typedef void (^PairBlock_t)(NSString* val);
typedef void (^DisconnectedBlock_t)(BOOL val);
typedef void (^ReadWriteDataBlock_t)(NSMutableDictionary *array , HandlerType type);
typedef void (^VFBLEErrorBlock_t)(NSError* error);

@interface X6_bt_a : NSObject<X6btdelegate>
{
    ConnectedBlock_t ConnectedBlock;
    SearchBlock_t SearchBlock;
    PairBlock_t PairBlock;
    DisconnectedBlock_t DisconnectedBlock;
    ReadWriteDataBlock_t ReadWriteDataBlock;
    VFBLEErrorBlock_t VFBLEErrorBlock;
}

+(X6_bt_a *) getInstance;

/*!
 *  @method SearchBracelet
 *  @discussion 搜索手环
 *
 */
-(void) SearchBracelet:(SearchBlock_t) data err:(VFBLEErrorBlock_t)err;

/*!
 *  @method PairBracelet
 *  @param uuid 手环UUID
 *  @discussion 手环配对
 *
 */
-(void) PairBracelet:(NSString*)uuid blk:(PairBlock_t) data err:(VFBLEErrorBlock_t)err;

/*!
 *  @method ConnectBracelet
 *  @param uuid 手环UUID
 *  @discussion 连接手环
 *
 */
-(void) ConnectBracelet:(NSString*)uuid blk:(ConnectedBlock_t) data err:(VFBLEErrorBlock_t)err;




/*!
 *  @method isconnectPeripheral
 *  @discussion 判断手环是否连接
 *	@return	返回连接状态
 *
 */
-(CBPeripheralState) isconnectPeripheral;

/*!
 *  @method ReadWriteData
 *  @param type  读写操作类型
 *  @param input 写入手环数据
 *  @discussion  读写手环数据
 *
 */
-(void) ReadWriteData:(HandlerType) type input:(id) input blk:(ReadWriteDataBlock_t) data err:(VFBLEErrorBlock_t)err;

@end
