//
//  SearchBand.swift
//  Wellness
//
//  Created by OGGU on 2016. 7. 11..
//
//

import UIKit
import XXF
import CoreBluetooth


@objc protocol SearchBandDelegate {
    
    func SelectedBandUUID (uuid:String, deviceName:String) -> Void
}

class SearchBand: UIViewController, UITableViewDataSource, UITableViewDelegate, CBCentralManagerDelegate, CBPeripheralDelegate {
    
    var getDeviceInfo : ObjectToSwift!
    var timer = NSTimer()
    var second : NSInteger!
    
    //Swift <2.2 selector syntax
//    var timer = NSTimer.scheduledTimerWithTimeInterval(0.4, target: self, selector: "update", userInfo: nil, repeats: true)

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var containerView: UIView!
    
    // 창닫기
    @IBAction func closeView(sender: AnyObject) {
        
        self.cbManager.stopScan()
        view.removeFromSuperview()
    }
    
    // 밴드검색
    @IBAction func searchBandList(sender: AnyObject) {
        
        self.cbManager.stopScan()
        perArray.removeAll()
        self.cbManager.scanForPeripheralsWithServices(nil, options: nil)
    }
    
    //var perArray = [CBPeripheral]()
    //var perArray =  [CBPeripheral]()
    var perArray = [Dictionary<String, AnyObject>]()
    var delegate : SearchBandDelegate?
    var cbManager : CBCentralManager!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        
        // 메인뷰 백그라운드 알파 투명도 처리
        view.backgroundColor = UIColor.blackColor().colorWithAlphaComponent(0.5)
        containerView.layer.cornerRadius = 5.0
        self.cbManager = CBCentralManager(delegate: self, queue: nil)
        
        self.getDeviceInfo = ObjectToSwift()
        SXInterface.getDataCenter().bleinit()
        self.searchBandList()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
        
    }
    
    func searchBandList() {
        
//        self.cbManager.stopScan()
//        perArray.removeAll()
//        self.cbManager.scanForPeripheralsWithServices(nil, options: nil)
        
        
        //self.cbManager.scanForPeripheralsWithServices(nil, options: nil)
        
//        perArray.removeAll()
//        SXInterface.getDataCenter().SearchBracelet { (output) in
//            print(output)
//            print(output as! CBPeripheral)
//            
//            var temp_peripheral : CBPeripheral!
//            temp_peripheral = (output as! CBPeripheral)
//            //print(temp_peripheral.name)
//            
//            
//            
//            if temp_peripheral.name != nil && (temp_peripheral.name?.hasPrefix("X6S"))! {
//                
//                self.perArray.append(output as! CBPeripheral)
//                self.tableView.reloadData()
//            }
//        }
        
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return  self.perArray.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        
        let initIdentifier = "Cell"
        
        let cell = UITableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: initIdentifier)
        let tper:CBPeripheral = perArray[indexPath.row]["1"] as! CBPeripheral
        cell.textLabel?.text = tper.name
        cell.detailTextLabel?.text = tper.identifier.UUIDString
        return cell
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        
        let tper:CBPeripheral = perArray[indexPath.row]["1"] as! CBPeripheral
        delegate?.SelectedBandUUID(tper.identifier.UUIDString, deviceName: tper.name!)
        
        self.cbManager.stopScan()
        self.getDeviceInfo.indicatorViewIn()
        
        // 타임아웃 체크(10초)
        
        self.second = 0;
        timer.invalidate() // just in case this button is tapped multiple times
        
        // start the timer
        timer = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: #selector(timerAction), userInfo: nil, repeats: true)
        
    }
    
    func timerAction() {
        
        self.second = self.second + 1;
        
        if self.second > 10 {
            
            timer.invalidate()
            self.getDeviceInfo.indicatorViewOut()
        }
        
        print(self.second);
        // Something cool
    }
    
    func centralManager(central: CBCentralManager, didDiscoverPeripheral peripheral: CBPeripheral, advertisementData: [String : AnyObject], RSSI: NSNumber) {
        
        if(peripheral.name != nil && peripheral.name!.hasPrefix("X6S")) {
            print(peripheral)
            print(RSSI)
            
            let dic = ["1" : peripheral, "2" : RSSI]
            
            self.perArray.append(dic)
            self.perArray.sortInPlace{ (dic1, dic2) -> Bool in
                return dic1["2"]?.integerValue > dic2["2"]?.integerValue
            }
//            self.perArray.sortInPlace { (CBPeripheral1, CBPeripheral2) -> Bool in
//                return CBPeripheral1.RSSI?.integerValue < CBPeripheral2.RSSI?.integerValue
//            }
            
            
            self.tableView.reloadData()
        }
    }
    
    func centralManager(central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: NSError?) {
        
    }
    
    func centralManager(central: CBCentralManager, didFailToConnectPeripheral peripheral: CBPeripheral, error: NSError?) {
        
    }
    
    func centralManagerDidUpdateState(central: CBCentralManager) {
        
    }
}