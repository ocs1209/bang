//
//  DFU.swift
//  Stu
//
//  Created by vidonn on 16/4/22.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import CoreBluetooth
import XXF
class DFU: UIViewController {

    @IBOutlet weak var x6c: UIButton!
    @IBOutlet weak var x6s: UIButton!
    @IBOutlet weak var a6: UIButton!
    @IBOutlet weak var pro: UILabel!
    var fdatalen:Int!
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationItem.hidesBackButton = true
        NSNotificationCenter.defaultCenter().addObserver(self, selector: #selector(UP.didDpuprogress(_:)), name: "Dpuprogress", object: nil)
    }
    override func viewWillDisappear(animated: Bool) {
        super.viewWillDisappear(animated)
        NSNotificationCenter.defaultCenter().removeObserver(self, name: "Dpuprogress", object: nil)
    }
    @IBAction func closeAct(sender: UIButton) {
        self.navigationController?.popViewControllerAnimated(true)
    }
    @IBAction func act(sender: UIButton) {
        var fdata:NSData!;
        switch sender.tag {
        case 20:
            fdata = NSData(contentsOfFile: NSBundle.mainBundle().pathForResource("X6C", ofType: "bin")!)!
            break
        case 21:
            fdata = NSData(contentsOfFile: NSBundle.mainBundle().pathForResource("X6S", ofType: "bin")!)!
            break
        case 22:
            fdata = NSData(contentsOfFile: NSBundle.mainBundle().pathForResource("A6", ofType: "bin")!)!
            break
        default:
            break
        }
        fdatalen = fdata.length
        SXInterface.getDataCenter().ReadWriteData(fdata, type: HandlerType.WEADDFU) { (output, type) in
            print(output)
            self.reCont()
        }
    }
    func reCont(){
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            let per:CBPeripheral = output as! CBPeripheral
            if(per.identifier.UUIDString == MyInstance.getDataCenter().uuid){
                SXInterface.getDataCenter().ConnectBracelet(per, blockfunc: { (output) in
                    print(output)
                    self.pro.text = "100%"
                })
            }
        }
    }
    func didDpuprogress(notification:NSNotification){
        let len:Int = fdatalen/20
        let vt:Int = (notification.object as! Int)*100/len
        
        self.performSelectorOnMainThread(#selector(UP.sss(_:)), withObject: String(vt), waitUntilDone: true)
    }
    
    func sss(p:String){
        self.pro.text = p + "%"
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
