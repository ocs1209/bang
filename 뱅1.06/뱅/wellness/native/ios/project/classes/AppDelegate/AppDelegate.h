//
//  AppDelegate.h
//

#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>
#import "BraceletListViewController.h"
#import "IndicatorViewController.h"
#import "Wellness-Swift.h"

@interface NSArray (OverArray)

@end

@protocol AppSearchBandDelegate;

@interface AppDelegate : UIResponder <UIApplicationDelegate, SearchBandDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;

@property (strong, nonatomic) BraceletListViewController *braceletListViewController;

@property (strong, nonatomic) SearchBand *searchBandList;

@property (strong, nonatomic) id<AppSearchBandDelegate> delegate;

// 인디케이터 관련
@property (strong, nonatomic) IndicatorViewController *indicatorView;
- (void) indicatorViewIn;
- (void) indicatorViewOut;

- (void)saveContext;
- (NSURL *)applicationDocumentsDirectory;
- (void) bluetoothBandList;
- (void) bluetoothBandListClose;
@end

@protocol AppSearchBandDelegate <NSObject>

- (void) BandUUID : (NSString *) uuid deviceName : (NSString *) deviceName;

@end