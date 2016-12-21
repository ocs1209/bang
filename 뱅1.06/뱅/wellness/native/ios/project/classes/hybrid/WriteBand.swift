//
//  WriteBand.swift
//  Wellness
//
//  Created by OGGU on 2016. 6. 29..
//
//

import UIKit
import CoreBluetooth
import XXF


class WriteBand: NSObject {
    
    var cbPeripheral : CBPeripheral!
    var getDeviceInfo : ObjectToSwift!
    typealias CompletionHandler = (success:String) -> Void
    typealias CompletionTimeZoneHandler = (success:String) -> Void
    

    
    override init() {
        super.init()
    }
    
    
    func sxInterfaceInit() {
        
        SXInterface.getDataCenter().bleinit()
        self.getDeviceInfo = ObjectToSwift()
        
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            
            print("밴드종류 : " + (output as! CBPeripheral).identifier.UUIDString)
            //05C5EDC2-4953-940A-5F16-D95338BECF0A
            //                if (output as! CBPeripheral).identifier.UUIDString == self.getDeviceInfo.getBandUUid()
            //                print("밴드 uuid : " + (output as! CBPeripheral).identifier.UUIDString)
            
            
            print("스위프트 밴드 유유아이디 : " + self.getDeviceInfo.getBandUUid())
            if (output as! CBPeripheral).identifier.UUIDString == self.getDeviceInfo.getBandUUid()
                //if (output as! CBPeripheral).identifier.UUIDString == "05C5EDC2-4953-940A-5F16-D95338BECF0A"
            {
                
                print("붙었음")
                
                self.cbPeripheral = output as! CBPeripheral
                
                SXInterface.getDataCenter().ConnectBracelet(self.cbPeripheral) { (output) in
                    
                    print(output)
                    print("붙었은거 확인")
                    
                    MyInstance.getDataCenter().name = (output as! String).componentsSeparatedByString("+")[0]
                    MyInstance.getDataCenter().uuid = (output as! String).componentsSeparatedByString("+")[1]
                    
                    self.systemLanguage({(success) -> Void in
                        print(success)
                    })
                }
            }
        }
    }
    
    func sxConnect(completionHandler: CompletionHandler) {
        
        self.getDeviceInfo = ObjectToSwift()
        
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            
            print("밴드종류 : " + (output as! CBPeripheral).identifier.UUIDString)
            print("스위프트 밴드 유유아이디 : " + self.getDeviceInfo.getBandUUid())
            
            if (output as! CBPeripheral).identifier.UUIDString == self.getDeviceInfo.getBandUUid()
            {
                print("붙었음")
                
                self.cbPeripheral = output as! CBPeripheral
                
                SXInterface.getDataCenter().ConnectBracelet(self.cbPeripheral) { (output) in
                    print(output)
                    
                    print("붙었은거 확인")
                    
                    MyInstance.getDataCenter().name = (output as! String).componentsSeparatedByString("+")[0]
                    MyInstance.getDataCenter().uuid = (output as! String).componentsSeparatedByString("+")[1]
                    
                    
                    completionHandler(success:"success")
                    //completionHandler(success:"success")
//                    self.timeZone({(success) -> Void in
//                        print(success)
//                        completionHandler(success:"success")
//                    })
                    
                }
            }
        }
    }
    
    
    func sxInterfaceInit(completionHandler: CompletionHandler) {
        
        self.getDeviceInfo = ObjectToSwift()
        
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            
            print("밴드종류 : " + (output as! CBPeripheral).identifier.UUIDString)
            
            print("스위프트 밴드 유유아이디 : " + self.getDeviceInfo.getBandUUid())
            if (output as! CBPeripheral).identifier.UUIDString == self.getDeviceInfo.getBandUUid()
            {
                
                print("붙었음")
                
                self.cbPeripheral = output as! CBPeripheral
                
                SXInterface.getDataCenter().ConnectBracelet(self.cbPeripheral) { (output) in
                    print(output)
                    
                    print("붙었은거 확인")
                    
                    MyInstance.getDataCenter().name = (output as! String).componentsSeparatedByString("+")[0]
                    MyInstance.getDataCenter().uuid = (output as! String).componentsSeparatedByString("+")[1]
                    
                    self.systemLanguage({(success) -> Void in
                        print(success)
                        completionHandler(success:"success")
                    })
                }
            }
        }
    }
    
    // 방해금지설정
    func preventPush(onoff:String, beginHH: String, beginMM: String, endHH: String, endMM: String) {
        
        var dic = [String:String]()
//        dic["onoff"] = "1"
//        dic["beginH"] = "14"
//        dic["beginM"] = "10"
//        dic["endH"] = "08"
//        dic["endM"] = "25"
        dic["onoff"] = onoff
        dic["beginH"] = beginHH
        dic["beginM"] = beginMM
        dic["endH"] = endHH
        dic["endM"] = endMM
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADWR, blockfunc: { (output, type) in print(output)})
    }
    
    // 알람설정
    func alramSetup(number: String,  type: String, once: String, onoff: String, sunday: String, saturday: String, friday: String, thursday: String, wednesday: String, tuesday: String, monday: String, hourHH: String, minuteMM: String) {
        
        var dic = [String:String]()
        dic["number"] = number
        dic["type"] = type
        dic["once"] = once
        dic["onoff"] = onoff
        dic["sunday"] = sunday
        dic["saturday"] = saturday
        dic["friday"] = friday
        dic["thursday"] = thursday
        dic["wednesday"] = wednesday
        dic["tuesday"] = tuesday
        dic["monday"] = monday
        dic["hour"] = hourHH
        dic["minute"] = minuteMM
        
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADNZ, blockfunc: { (output, type) in
            print(output)
        })
    }
    
    // 화면회전
    func rotationFlip(rotationType: String!) {
        
        var dic = [String:String]()
        dic["rightleft"] = rotationType
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADFZ, blockfunc: { (output, type) in
            print(output)
        })
    }
    
    // 무반응 설정
    func sedentaryTimeSetup(sedentaryTime: String) {
        var dic = [String:String]()
        dic["sedentary"] = sedentaryTime
        // dic["qq"] = "1"
        //dic["wechat"] = "1"
        // dic["skype"] = "1"
        // dic["news"] = "1"
        // dic["email"] = "1"
        // dic["others"] = "1"
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADJZ, blockfunc: { (output, type) in
            print(output)
        })                
    }
    
    // 타임존
    func timeZone(completionTimeZoneHandler: CompletionTimeZoneHandler) {
        
        var dic = [String:String]()
        dic["lost"] = "1"
        dic["apm"] = "1"
        dic["ui"] = "64"
        
        var timezone_bug_count : Int
        timezone_bug_count = 0;
        
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADLE, blockfunc: { (output, type) in
            if(timezone_bug_count == 0) {
                
                print(output)
                completionTimeZoneHandler(success:"success")
            }
            
            timezone_bug_count += 1
        })
    }
    
    
    // 언어설정
    func systemLanguage(completionHandler: CompletionHandler) {
        
        var dic = [String:String]()
        dic["language"] = "1"
        // dic["qq"] = "1"
        //dic["wechat"] = "1"
        // dic["skype"] = "1"
        // dic["news"] = "1"
        // dic["email"] = "1"
        // dic["others"] = "1"
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADYY, blockfunc: { (output, type) in
            print(output)
            completionHandler(success:"success")
//            var dic = [String:String]()
//            dic["lost"] = "1"
//            dic["apm"] = "1"
//            dic["ui"] = "64"
//            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADLE, blockfunc: { (output, type) in
//                print(output)
//                completionHandler(success:"success")
//            })
        })
    }
    
    // 세로로 시계보기
    func verticalDisplaySet(handraise: String, horizontal: String) {
        
        var dic = [String:String]()
        dic["handraise"] = handraise
        dic["horizontal"] = horizontal
        SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADTS, blockfunc: { (output, type) in
            print(output)
        })
    }
}