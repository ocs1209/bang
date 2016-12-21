//
//  IndicatorViewController.m
//  kdstudent
//
//  Created by OGGU on 2016. 1. 6..
//  Copyright © 2016년 OGGU. All rights reserved.
//

#import "IndicatorViewController.h"

@interface IndicatorViewController ()

@end

@implementation IndicatorViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

#pragma 인디게이터 시작
- (void) startIndicator {
    [_indicator startAnimating];
}

#pragma 인디게이터 정지
- (void) stopIndicator {
    [_indicator stopAnimating];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
