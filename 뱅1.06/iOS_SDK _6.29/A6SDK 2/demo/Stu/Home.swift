//
//  Home.swift
//  Stu
//
//  Created by vidonn on 16/4/13.
//  Copyright © 2016年 stu. All rights reserved.
//

import UIKit
import XXF
class Home: UIViewController ,UITableViewDataSource,UITableViewDelegate,xDelegate{

    @IBOutlet weak var tab: UITableView!
    var xxArray:Array = ["Steps", "heart", "read the current step number", "read current heart rate", "read historical data", "read the current power", "read bracelet parameters", "writer loop parameters", " firmware upgrade "]
    var setp:String?
    var ra:String?
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        self.navigationItem.setHidesBackButton(true, animated: false)
        self.navigationItem.title = MyInstance.getDataCenter().name
        SXInterface.getDataCenter().setxDelegate(self)
    }
    @IBAction func exitt(sender: UIButton) {
        exit(0)
    }
    func didHeartrate(v: Int) {
        print(v)
        ra = String(v)
        tab.reloadData()
    }
    func didsetp(v: Int) {
        print(v)
        setp = String(v)
        tab.reloadData()
    }
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return  xxArray.count
    }
    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 60
    }
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let initIdentifier = "Cell"
        let cell = UITableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: initIdentifier)
        cell.textLabel?.text = xxArray[indexPath.row]
        if indexPath.row == 0{
            cell.detailTextLabel?.text = setp
        }
        else if indexPath.row == 1{
            cell.detailTextLabel?.text = ra
        }
        return cell
    }
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        switch indexPath.row {
        case 0:
            break
        case 2:
            SXInterface.getDataCenter().ReadWriteData(nil, type: HandlerType.READDQ, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 3:
            SXInterface.getDataCenter().ReadWriteData(nil, type: HandlerType.READRA, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 4:
            let alertView = UIAlertController(title:"", message:"Console to view historical data, please wait ...",preferredStyle:.Alert)
            SXInterface.getDataCenter().ReadWriteData(nil, type: HandlerType.READLS, blockfunc: { (output, type) in
                print(output)
               alertView.dismissViewControllerAnimated(true, completion: {
                
               })
            })
           self.presentViewController(alertView, animated: true, completion: nil)
            break
        case 5:
            SXInterface.getDataCenter().ReadWriteData(nil, type: HandlerType.READDL, blockfunc: { (output, type) in
                print(output)
            })
            break
        case 6:
            if (MyInstance.getDataCenter().name.rangeOfString("A6-") != nil){
                self.performSegueWithIdentifier("h2r", sender: self)
            }else{
                self.performSegueWithIdentifier("h2rx", sender: self)
            }
            
            break
        case 7:
            if (MyInstance.getDataCenter().name.rangeOfString("A6-") != nil){
                self.performSegueWithIdentifier("h2w", sender: self)
            }else{
                self.performSegueWithIdentifier("h2wx", sender: self)
            }
            break
        case 8:
            self.performSegueWithIdentifier("h2g", sender: self)
            break
        default:
            break
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
