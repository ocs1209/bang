//
//  AppDelegate.m
//

#import "AppDelegate.h"
#import "FitManager.h"


@implementation NSArray (OverArray)

- (void)removeAllObjects {
    if ( [self isKindOfClass:[NSMutableArray class]] ) {
        [(NSMutableArray *)self removeAllObjects];
    }
}

@end

@interface AppDelegate ()

@property (strong, nonatomic) PPNavigationController *navigationController;

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
    
    WriteBand *band = [[WriteBand alloc] init];
    [band sxInterfaceInit];
    
    window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    navigationController = [MAppDelegate initialViewControllerWithLaunchOptions:launchOptions];// history:YES];
    
    [window setBackgroundColor:[UIColor whiteColor]];
    [window setRootViewController:navigationController];
    [window makeKeyAndVisible];
    
    return YES;
}

//- (void)applicationDidEnterBackground:(UIApplication *)application {
//
//    [[FitManager defaultManager] startUpdating];
//}

@synthesize window, navigationController;

#pragma mark - Core Data stack

@synthesize managedObjectContext = _managedObjectContext;
@synthesize managedObjectModel = _managedObjectModel;
@synthesize persistentStoreCoordinator = _persistentStoreCoordinator;

- (NSURL *)applicationDocumentsDirectory {
    // The directory the application uses to store the Core Data store file. This code uses a directory named "citistone.kdstudent" in the application's documents directory.
    return [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
}

- (NSManagedObjectModel *)managedObjectModel {
    // The managed object model for the application. It is a fatal error for the application not to be able to find and load its model.
    if (_managedObjectModel != nil) {
        return _managedObjectModel;
    }
    NSURL *modelURL = [[NSBundle mainBundle] URLForResource:@"BangCodeData" withExtension:@"momd"];
    _managedObjectModel = [[NSManagedObjectModel alloc] initWithContentsOfURL:modelURL];
    return _managedObjectModel;
}

- (NSPersistentStoreCoordinator *)persistentStoreCoordinator {
    // The persistent store coordinator for the application. This implementation creates and returns a coordinator, having added the store for the application to it.
    if (_persistentStoreCoordinator != nil) {
        return _persistentStoreCoordinator;
    }
    
    // Create the coordinator and store
    
    _persistentStoreCoordinator = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel:[self managedObjectModel]];
    NSURL *storeURL = [[self applicationDocumentsDirectory] URLByAppendingPathComponent:@"BangCodeData.sqlite"];
    NSError *error = nil;
    NSString *failureReason = @"There was an error creating or loading the application's saved data.";
    if (![_persistentStoreCoordinator addPersistentStoreWithType:NSSQLiteStoreType configuration:nil URL:storeURL options:nil error:&error]) {
        // Report any error we got.
        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        dict[NSLocalizedDescriptionKey] = @"Failed to initialize the application's saved data";
        dict[NSLocalizedFailureReasonErrorKey] = failureReason;
        dict[NSUnderlyingErrorKey] = error;
        error = [NSError errorWithDomain:@"YOUR_ERROR_DOMAIN" code:9999 userInfo:dict];
        // Replace this with code to handle the error appropriately.
        // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
        NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
        abort();
    }
    
    return _persistentStoreCoordinator;
}


- (NSManagedObjectContext *)managedObjectContext {
    // Returns the managed object context for the application (which is already bound to the persistent store coordinator for the application.)
    if (_managedObjectContext != nil) {
        return _managedObjectContext;
    }
    
    NSPersistentStoreCoordinator *coordinator = [self persistentStoreCoordinator];
    if (!coordinator) {
        return nil;
    }
    
    _managedObjectContext = [[NSManagedObjectContext alloc] initWithConcurrencyType:NSMainQueueConcurrencyType];
    [_managedObjectContext setPersistentStoreCoordinator:coordinator];
    return _managedObjectContext;
}

#pragma mark - Core Data Saving support

- (void)saveContext {
    
    NSManagedObjectContext *managedObjectContext = self.managedObjectContext;
    
    if (managedObjectContext != nil) {
        
        NSError *error = nil;
        
        if ([managedObjectContext hasChanges] && ![managedObjectContext save:&error]) {
            // Replace this implementation with code to handle the error appropriately.
            // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
            NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
            abort();
        }
    }
}

#pragma 밴드리스트 뷰 추가
- (void) bluetoothBandList {
    
    CGRect screenRect = [[UIScreen mainScreen] bounds];
    _searchBandList = [[SearchBand alloc] initWithNibName:@"SearchBand" bundle:nil];
    [_searchBandList.view setFrame:screenRect];
    _searchBandList.delegate = self;
    [self.window addSubview:_searchBandList.view];  
    
}

- (void) bluetoothBandListClose {
    
    [_searchBandList.view removeFromSuperview];
}

- (void) SelectedBandUUID:(NSString *)uuid deviceName:(NSString * _Nonnull)deviceName {
    
    [self.delegate BandUUID:uuid deviceName:deviceName];
}

#pragma 인디케이터 제어

- (void) indicatorViewIn {
    
    if (!_indicatorView) {
        _indicatorView = [[IndicatorViewController alloc] initWithNibName:@"IndicatorViewController" bundle:nil];
        _indicatorView.view.frame = CGRectMake(0, 0, [[UIScreen mainScreen] applicationFrame].size.width, [[UIScreen mainScreen] applicationFrame].size.height+20);
    }
    
    [self.window addSubview:_indicatorView.view];
    [_indicatorView startIndicator];
}

- (void) indicatorViewOut {
    [_indicatorView stopIndicator];
    [_indicatorView.view removeFromSuperview];
}

@end
