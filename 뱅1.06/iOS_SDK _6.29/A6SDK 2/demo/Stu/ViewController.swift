//
//  ViewController.swift
//  Stu
//
//  Created by vidonn on 16/4/11.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import CoreBluetooth
import XXF
class ViewController: UIViewController,UITableViewDataSource,UITableViewDelegate{

    @IBOutlet weak var ble: UITableView!
    
    var perArray = [CBPeripheral]()
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        //self.manager = CBCentralManager(delegate: self, queue: nil)
        SXInterface.getDataCenter().bleinit()
        
    }

    @IBAction func scanAct(sender: UIButton) {
        perArray.removeAll()
      //  self.manager.scanForPeripheralsWithServices(nil, options: nil)
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            self.perArray.append(output as! CBPeripheral)
            self.ble.reloadData()
        }
    }

    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
       return  perArray.count
    }
    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 60
    }
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let initIdentifier = "Cell"
        let cell = UITableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: initIdentifier)
        let tper:CBPeripheral = perArray[indexPath.row]
        cell.textLabel?.text = tper.name
        cell.detailTextLabel?.text = tper.identifier.UUIDString
        return cell
    }
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        SXInterface.getDataCenter().ConnectBracelet(perArray[indexPath.row]) { (output) in
           print(output)
            MyInstance.getDataCenter().name = (output as! String).componentsSeparatedByString("+")[0]
            MyInstance.getDataCenter().uuid = (output as! String).componentsSeparatedByString("+")[1]
           self.gotoIndex()
        }
    }
    func gotoIndex()
    {
        self.performSegueWithIdentifier("s2h", sender: self)
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func dfu(sender: UIButton) {
        self.performSegueWithIdentifier("h2u", sender: self)
    }
   
}

