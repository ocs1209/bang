//
//  PPIndicatorUtil.m
//

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#import "PPIndicatorUtil.h"

@implementation PPIndicatorUtil

+ (void) simpleActivityIndicatorStart:(UIView*)aView message:(NSString*)aMessage {

    if ([aView viewWithTag:INDICATOR_TAG]) {
        [self simpleActivityIndicatorStop:aView];
    }
    
    if ( !(!aMessage || [aMessage isEqualToString:@""]) ) {
        // Background View
        UIView* bgView = [[UIView alloc] initWithFrame:[aView bounds]];
        [bgView setAutoresizingMask:(UIViewAutoresizingFlexibleWidth |
                                     UIViewAutoresizingFlexibleHeight)];
        // [bgView setBackgroundColor:[UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.4]];
        [bgView setTag:INDICATOR_TAG];
        
        UIView* view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 270, 80)];
        
        CGPoint center = aView.center;
        center.x -= aView.frame.origin.x;
        center.y -= aView.frame.origin.y;
        
        [view setCenter:center];
        [view setAutoresizingMask:(UIViewAutoresizingFlexibleLeftMargin |
                                   UIViewAutoresizingFlexibleRightMargin |
                                   UIViewAutoresizingFlexibleTopMargin |
                                   UIViewAutoresizingFlexibleBottomMargin)];
        
        CAGradientLayer *gradient = [CAGradientLayer layer];
        gradient.frame = view.bounds;
        gradient.cornerRadius = 8.0f;
        gradient.colors = [NSArray arrayWithObjects:
                           (id)[[UIColor colorWithRed:34/255.0 green:72/255.0 blue:109/255.0 alpha:1.0] CGColor],
                           (id)[[UIColor colorWithRed:30/255.0 green:55/255.0 blue:79/255.0 alpha:1.0] CGColor],
                           (id)[[UIColor colorWithRed:21/255.0 green:40/255.0 blue:57/255.0 alpha:1.0] CGColor],
                           nil];
        [view.layer insertSublayer:gradient atIndex:0];
        [[view layer] setCornerRadius:8.0f];
        [[view layer] setBorderWidth:2.0];
        [[view layer] setBorderColor:[[UIColor colorWithRed:177/255.0 green:188/255.0 blue:190/255.0 alpha:1.0] CGColor]];
        
        view.layer.shadowOffset = CGSizeMake(0, 3);
        view.layer.shadowRadius = 5.0f;
        view.layer.shadowOpacity = 0.5f;
        
        [bgView addSubview:view];
        
        [aView addSubview:bgView];
        
        // ActivityIndicator
        UIActivityIndicatorView *activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
        
        [activityIndicator setFrame:CGRectMake(15,
                                               (view.frame.size.height - (activityIndicator.frame.size.width * 1.3)) / 2.0 + 2,
                                               activityIndicator.frame.size.width * 1.3,
                                               activityIndicator.frame.size.height * 1.3)];
        
        [activityIndicator startAnimating];
        [view addSubview:activityIndicator];
        
        // Text Label
        UILabel* label = [[UILabel alloc] initWithFrame:CGRectMake(activityIndicator.frame.origin.x + activityIndicator.frame.size.width + 15,
                                                                   activityIndicator.frame.origin.y - 5,
                                                                   view.frame.size.width - (activityIndicator.frame.origin.x + activityIndicator.frame.size.width + 20),
                                                                   activityIndicator.frame.size.height + 10)];
        
        [label setAdjustsFontSizeToFitWidth:NO];
        [label setBaselineAdjustment:UIBaselineAdjustmentAlignBaselines];
        [label setLineBreakMode:NSLineBreakByTruncatingTail];
        [label setNumberOfLines:3];
        [label setTextAlignment:NSTextAlignmentLeft];
        [label setFont:[UIFont systemFontOfSize:14]];
        [label setTextColor:[UIColor colorWithRed:186/255.0 green:186/255.0 blue:186/255.0 alpha:1.0f]];
        [label setText:aMessage];
        [label setBackgroundColor:[UIColor clearColor]];
        [view addSubview:label];
    }
    else {
        // 안드로이드와 동일하게 표현하도록 추가한 부분.
        UIView* bgView = [[UIView alloc] initWithFrame:[aView bounds]];
        [bgView setAutoresizingMask:(UIViewAutoresizingFlexibleWidth |
                                     UIViewAutoresizingFlexibleHeight)];
        // [bgView setBackgroundColor:[UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.4]];
        [bgView setTag:INDICATOR_TAG];
        
        [aView addSubview:bgView];
        
        UIActivityIndicatorView *activityIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
        // activityIndicator.tag = INDICATOR_TAG;
        // activityIndicator.frame = CGRectMake(0, 0, 80, 80);
        [activityIndicator setCenter:aView.center];
        [bgView/*aView*/ addSubview:activityIndicator];
        [activityIndicator startAnimating];
    }
}

+ (void) simpleActivityIndicatorStart:(UIView*)aView {
//    [self simpleActivityIndicatorStart:aView message:@"잠시만 기다려 주세요."];
    [self simpleActivityIndicatorStart:aView message:nil];
}

+ (void) simpleActivityIndicatorStop:(UIView*)aView {
    BOOL main = [NSThread isMainThread];
    
    if (!main) {
        dispatch_async(dispatch_get_main_queue(), ^{
            UIView* view = [aView viewWithTag:INDICATOR_TAG];
            if(view) [view removeFromSuperview];
        });
    }
    else {
        UIView* view = [aView viewWithTag:INDICATOR_TAG];
        if(view) [view removeFromSuperview];
    }
}

@end
