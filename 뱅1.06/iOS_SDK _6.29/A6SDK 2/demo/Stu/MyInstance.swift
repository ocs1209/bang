//
//  MyInstance.swift
//  Stu
//
//  Created by vidonn on 16/4/11.
//  Copyright © 2016年 stu. All rights reserved.
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
