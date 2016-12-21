//
//  SearchBand.swift
//  Wellness
//
//  Created by OGGU on 2016. 7. 11..
//
//

import UIKit
import XXF

@objc protocol SearchBandDelegate {
    
    func SelectedBandUUID (uuid:String, deviceName:String) -> Void
}

class SearchBand: UIViewController, UITableViewDataSource, UITableViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var containerView: UIView!
    
    // 창닫기
    @IBAction func closeView(sender: AnyObject) {
        
        view.removeFromSuperview()
        
    }
    
    // 밴드검색
    @IBAction func searchBandList(sender: AnyObject) {
        
    }
    
    var perArray = [CBPeripheral]()
    var delegate : SearchBandDelegate?
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        
        // 메인뷰 백그라운드 알파 투명도 처리
        view.backgroundColor = UIColor.blackColor().colorWithAlphaComponent(0.5)
        
        containerView.layer.cornerRadius = 5.0
        
        
        SXInterface.getDataCenter().bleinit()
        self.searchBandList()        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
        
        
    }
    
    func searchBandList() {
        
        perArray.removeAll()
        //  self.manager.scanForPeripheralsWithServices(nil, options: nil)
        SXInterface.getDataCenter().SearchBracelet { (output) in
            print(output)
            print(output as! CBPeripheral)
            
            if(((output as! CBPeripheral).name?.containsString("X6S-B869")) != nil) {
                self.perArray.append(output as! CBPeripheral)
                self.tableView.reloadData()
            }
        }
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
        let tper:CBPeripheral = perArray[indexPath.row]
        cell.textLabel?.text = tper.name
        cell.detailTextLabel?.text = tper.identifier.UUIDString
        return cell
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        
        let tper:CBPeripheral = perArray[indexPath.row]
        delegate?.SelectedBandUUID(tper.identifier.UUIDString, deviceName: tper.name!)
        
    }
}