//
//  SXInterface.swift
//  XXF
//
//  Created by vidonn on 16/4/18.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import CoreBluetooth
public protocol xDelegate {
    func didHeartrate(v:Int)
    func didsetp(v:Int)
}
public enum HandlerType: Int {
    case READDQ = 0//当前步数
    case READRA//心率
    case READLS//历史
    case READDL//电量
    case READGR//个人信息
    case READMB//目标
    case READGN//功能参数
    case READXS//显示参数
    case READTZ//通知
    case READXL//心率参数
    case READSJ//时间
    case READRJ//软件版本
    case READYJ//硬件版本
    case READMAC//mac地址
    case READSM//睡眠
    case READWR//勿扰
    case READNZ//闹钟
    case READTS//抬手亮屏
    case READJZ//久坐
    case READYY//语言
    case READFZ//屏幕水平翻转
    case READXX//信息
    case READLT//临时模式
    case READLE//AM
    
    case WEADGR
    case WEADMB
    case WEADGN
    case WEADXS
    case WEADSM
    case WEADWR
    case WEADNZ
    case WEADTZ
    case WEADXL
    case WEADSJ
    case WEADRA
    case WEADCQ
    case WEADCL
    case WEADDEF
    case WEADTS
    case WEADJZ
    case WEADYY
    case WEADFZ
    case WEADXX
    case WEADLT
    case WEADLE
    case WEADUP
    case WEADDFU
}

public typealias SearchBracelet_s = (output:AnyObject) -> Void
public typealias ConnectBracelet_s = (output:AnyObject) -> Void
public typealias PairBracelet_s = (output:AnyObject) -> Void
public typealias ReadWriteData_s = (output:AnyObject,type:HandlerType) -> Void

public class SXInterface: NSObject {

    public var searchFunc = SearchBracelet_s?()
    public var pairFunc = PairBracelet_s?()
    public var rwFunc = ReadWriteData_s?()
    public class func getDataCenter() ->SXInterface! {
        
        struct Once {
            static var token:dispatch_once_t = 0
            static var dataCenterObj:SXInterface! = nil
        }
        dispatch_once(&Once.token, {
            Once.dataCenterObj = SXInterface()
        })
        return Once.dataCenterObj
    }
    public func bleinit(){
        BleInterface.getDataCenter().bleinit()
    }
    public func setxDelegate(delegate:xDelegate){
         BleInterface.getDataCenter().delegate = delegate
    }
    public func SearchBracelet(blockfunc:SearchBracelet_s?){
        searchFunc = blockfunc
        BleInterface.getDataCenter().SearchBracelet { (output) in
           self.searchFunc!(output: output)
        }
    }
    public func ConnectBracelet(per: CBPeripheral,blockfunc:ConnectBracelet_s?){
        pairFunc = blockfunc
        BleInterface.getDataCenter().PairBracelet(per) { (output) in
            self.pairFunc!(output: output)
        }
    }
    public func ReadWriteData(input:AnyObject?,type:HandlerType,blockfunc:ReadWriteData_s?){
        rwFunc = blockfunc
        BleInterface.getDataCenter().ReadWriteData(input, type: type) { (output, type) in
            self.rwFunc!(output:output ,type:type)
        }
    }
}
