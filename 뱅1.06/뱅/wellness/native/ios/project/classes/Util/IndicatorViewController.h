//
//  IndicatorViewController.h
//  kdstudent
//
//  Created by OGGU on 2016. 1. 6..
//  Copyright © 2016년 OGGU. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface IndicatorViewController : UIViewController

@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *indicator;

- (void)startIndicator;

- (void) stopIndicator;

@end
