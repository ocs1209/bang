//
//  BraceletListViewController.h
//  Wellness
//
//  Created by OGGU on 2016. 6. 29..
//
//

#import <UIKit/UIKit.h>

@interface BraceletListViewController : UIViewController<UITableViewDelegate, UITableViewDataSource>

@property (weak, nonatomic) IBOutlet UITableView *tableView;

@end