//
//  ExtendWNInterface.h
//

#import <Foundation/Foundation.h>
#import <MFit/HistoryInterface.h>
#import "AppDelegate.h"

@interface ExtendWNInterface : NSObject<WNInterface, FitHistoryDelegate, AppSearchBandDelegate>

@property (nonatomic, readonly) PPWebViewController *viewController;

@end