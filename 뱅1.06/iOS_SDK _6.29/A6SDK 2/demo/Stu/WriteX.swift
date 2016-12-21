//
//  WriteX.swift
//  Stu
//
//  Created by vidonn on 16/4/21.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import XXF
class WriteX: UIViewController ,UIScrollViewDelegate{
@IBOutlet weak var scro: UIScrollView!
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        self.scro.delegate = self
        self.scro.contentSize = CGSize(width: 320,height: 1024) //self.scro.bounds.size
        self.scro.autoresizingMask = UIViewAutoresizing.FlexibleHeight
    }
    @IBAction func Act(sender: UIButton) {
        switch sender.tag {
        case 10:
            var dic = [String:String]()
            dic["height"] = "170"
            dic["weight"] = "60"
            dic["sex"] = "1"
            dic["age"] = "25"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADGR, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 11:
            var dic = [String:String]()
            dic["goal"] = "10023"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADMB, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 12:
            var dic = [String:String]()
            dic["beginH"] = "23"
            dic["beginM"] = "30"
            dic["endH"] = "08"
            dic["endM"] = "25"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADSM, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 13:
            var dic = [String:String]()
            dic["onoff"] = "1"
            dic["beginH"] = "23"
            dic["beginM"] = "30"
            dic["endH"] = "08"
            dic["endM"] = "25"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADWR, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 14:
            var dic = [String:String]()
            dic["sedentary"] = "800"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADJZ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 15:
            var dic = [String:String]()
            dic["lost"] = "1"
            dic["apm"] = "1"
            dic["ui"] = "64"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADLE, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 16:
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
            })
            break
        case 17:
            var dic = [String:String]()
            dic["rightleft"] = "1"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADFZ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 18:
            var dic = [String:String]()
            dic["yyyy"] = "2016"
            dic["MM"] = "04"
            dic["dd"] = "20"
            dic["HH"] = "11"
            dic["mm"] = "50"
            dic["ss"] = "0"
            dic["ww"] = "3"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADSJ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 19:
            var dic = [String:String]()
            dic["number"] = "0"
            dic["type"] = "2"
            dic["once"] = "0"
            dic["onoff"] = "1"
            dic["sunday"] = "1"
            dic["saturday"] = "1"
            dic["friday"] = "1"
            dic["thursday"] = "1"
            dic["wednesday"] = "1"
            dic["tuesday"] = "1"
            dic["monday"] = "1"
            dic["hour"] = "18"
            dic["minute"] = "56"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADNZ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 20:
            var dic = [String:String]()
            dic["retype"] = "1"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADCQ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 21:
            var dic = [String:String]()
            dic["retype"] = "2"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADCQ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 22:
            var dic = [String:String]()
            dic["retype"] = "3"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADCQ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 23:
            var dic = [String:String]()
            dic["handraise"] = "1"
            dic["horizontal"] = "1"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADTS, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 24:
            var dic = [String:String]()
             dic["qq"] = "1"
             dic["wechat"] = "1"
             dic["skype"] = "1"
             dic["news"] = "1"
             dic["email"] = "1"
             dic["others"] = "1"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADXX, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 25:
            var dic = [String:String]()
            dic["temp"] = "1"
            SXInterface.getDataCenter().ReadWriteData(dic, type: HandlerType.WEADLT, blockfunc: { (output, type) in
                print(output)
            })
            break
        default:
            break
        }
    }
    func scrollViewDidScroll(scrollView: UIScrollView) {
        
    }
    
    func scrollViewDidEndDragging(scrollView: UIScrollView, willDecelerate decelerate: Bool) {
        
    }
    
    func scrollViewDidEndDecelerating(scrollView: UIScrollView) {
        
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
