//
//  btdelegate.h
//  vidonn_bt_dll
//
//  Created by 曾 言伟 on 13-12-24.
//  Copyright (c) 2013年 vidonn. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreBluetooth/CBService.h>

@protocol X6btdelegate <NSObject>

- (void) didConnectPeripheral:(CBPeripheral*) p;
- (void) didConnectPeripheralDpu:(CBPeripheral*) p;
- (void) didDisConnectBracelet;
- (void) didFailToConnectPeripheral;
- (void) didConnectError;
- (void) didUpdateValueForCharacteristic:(NSData*) data type:(UInt16) type;
- (void) didUpdateRTStepValueForCharacteristic:(NSData*) data type:(UInt16) type;
- (void) didPairBracelet:(CBPeripheral*) per;
- (void) didsss:(NSArray*) Peripherals;

@end
