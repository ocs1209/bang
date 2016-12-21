//
//  MyInstance.swift
//  Wellness
//
//  Created by OGGU on 2016. 7. 1..
//
//

import UIKit

class MyInstance: NSObject {
    
    var name:String = ""
    var uuid:String = ""
    class func getDataCenter() ->MyInstance! {
        
        struct Once {
            static var token:dispatch_once_t = 0
            static var dataCenterObj:MyInstance! = nil
        }
        dispatch_once(&Once.token, {
            Once.dataCenterObj = MyInstance()
        })
        return Once.dataCenterObj
    }
}