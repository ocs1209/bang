//
//  PPWebView.h
//  Library
//
//  Created by numan4r on 11. 2. 8..
//  Copyright 2011 . All rights reserved.
//

#import <UIKit/UIKit.h>

@interface PPWebView : UIWebView {
    double    _startDate;
    id        _scriptDebugDelegate;
}
@property (nonatomic, assign) double    startDate;
@property (nonatomic, retain) id        scriptDebugDelegate;

@end
