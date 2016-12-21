//
//  UP.swift
//  Stu
//
//  Created by vidonn on 16/4/21.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import CoreBluetooth
import XXF
class UP: UIViewController {

    @IBOutlet weak var pro: UILabel!
    @IBOutlet weak var btn: UIButton!
    @IBOutlet weak var cbtn: UIButton!
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
    @IBAction func act(sender: UIButton) {
        sender.enabled = false
        self.cbtn.enabled = false
        startup()
    }
    @IBAction func closeAct(sender: UIButton) {
        self.navigationController?.popViewControllerAnimated(true)
    }
    func startup(){
        let fname:String = MyInstance.getDataCenter().name.componentsSeparatedByString("-")[0]
        let path:String = NSBundle.mainBundle().pathForResource(fname, ofType: "bin")!
        let fdata:NSData = NSData(contentsOfFile: path)!
        fdatalen = fdata.length
        SXInterface.getDataCenter().ReadWriteData(fdata, type: HandlerType.WEADUP) { (output, type) in
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
                    self.cbtn.enabled = true
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
