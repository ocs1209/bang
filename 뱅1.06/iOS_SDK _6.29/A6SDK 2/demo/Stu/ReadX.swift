//
//  ReadX.swift
//  Stu
//
//  Created by vidonn on 16/4/21.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import XXF
class ReadX: UIViewController {
    @IBOutlet weak var par: UITextView!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        SXInterface.getDataCenter().ReadWriteData(nil, type: HandlerType.READGR, blockfunc: { (output, type) in
            print(output)
            self.par.text = self.getShowName(type, va: output as! NSMutableDictionary)
            self.readAll(HandlerType.READMB)
        })
    }
    func readAll(tp:HandlerType){
        switch tp {
        case HandlerType.READGR:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.readAll(HandlerType.READMB)
            })
            break
        case HandlerType.READMB:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READSM)
            })
            break
        case HandlerType.READSM:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READWR)
            })
            break
        case HandlerType.READWR:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READTS)
            })
            break
        case HandlerType.READTS:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READJZ)
            })
            break
        case HandlerType.READJZ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READYY)
            })
            break
        case HandlerType.READYY:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READFZ)
            })
            break
        case HandlerType.READFZ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READXX)
            })
            break
        case HandlerType.READXX:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READLT)
            })
            break
        case HandlerType.READLT:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READLE)
            })
            break
        case HandlerType.READLE:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READSJ)
            })
            break
        case HandlerType.READSJ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                self.readAll(HandlerType.READNZ)
            })
            break
        case HandlerType.READNZ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
                if((output as! NSMutableDictionary).valueForKey("number") as! String == "7"){
                    self.readAll(HandlerType.READRJ)
                }
            })
            break
        case HandlerType.READRJ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + "软件版本:\n"+(output as! String)+"\n"
                self.readAll(HandlerType.READYJ)
            })
            break
        case HandlerType.READYJ:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + "硬件版本:\n"+(output as! String)+"\n"
                self.readAll(HandlerType.READMAC)
            })
            break
        case HandlerType.READMAC:
            SXInterface.getDataCenter().ReadWriteData(nil, type: tp, blockfunc: { (output, type) in
                print(output)
                self.par.text = self.par.text + self.getShowName(type, va: output as! NSMutableDictionary)
            })
            break
        default:
            break
        }
        
    }
    func getShowName(tp:HandlerType, va:NSMutableDictionary) ->String{
        switch tp {
        case HandlerType.READGR:
            return "个人信息:\n"+/*(va.objectForKey("height") as! String)+(va.objectForKey("weight") as! String)+(va.objectForKey("sex") as! String)+(va.objectForKey("age") as! String)*/String(va)+"\n"
        case HandlerType.READMB:
            return "运动目标:\n"+String(va)+"\n"
        case HandlerType.READSM:
            return "睡眠时间:\n"+String(va)+"\n"
        case HandlerType.READWR:
            return "勿扰时间:\n"+String(va)+"\n"
        case HandlerType.READTS:
            return "抬手亮屏:\n"+String(va)+"\n"
        case HandlerType.READYY:
            return "语言:\n"+String(va)+"\n"
        case HandlerType.READFZ:
            return "屏幕水平翻转:\n"+String(va)+"\n"
        case HandlerType.READXX:
            return "信息打开:\n"+String(va)+"\n"
        case HandlerType.READLT:
            return "临时模式:\n"+String(va)+"\n"
        case HandlerType.READJZ:
            return "久坐提醒:\n"+String(va)+"\n"
        case HandlerType.READSJ:
            return "手环时间:\n"+String(va)+"\n"
        case HandlerType.READLE:
            return "时间格式:\n"+String(va)+"\n"
        case HandlerType.READNZ:
            return "手环闹钟"+(va.valueForKey("number") as! String)+":\n"+String(va)+"\n"
        case HandlerType.READMAC:
            return "MAC地址:\n"+String(va)+"\n"
        default:
            return ""
        }
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
