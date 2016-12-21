//
//  MMediaPickerController.h
//  MDebug
//
//  Created by ProgDesigner on 2015. 5. 19..
//
//

#import <Foundation/Foundation.h>

typedef void (^MMediaPickerControllerDidFinishSelectBlock) (NSArray *list, NSError *error, BOOL cancelled);
typedef void (^MMediaPickerControllerDidFinishLoadBlock) (NSArray *list, NSError *error);

typedef enum {
    MMediaSelectModeUnset = 0,
    MMediaSingleSelectMode = 1,
    MMediaMultiSelectMode = 2
} MMediaSelectMode;

typedef enum {
    MMediaSourceTypeUnset = 0,
    MMediaSourceTypeAssets = 1,
    MMediaSourceTypeResources = 2
} MMediaSourceType;

extern NSString *const MMediaTypePhoto;
extern NSString *const MMediaTypeVideo;
extern NSString *const MMediaTypeAudio;
extern NSString *const MMediaTypeAll;

@interface MMediaPickerController : NSObject

@property (strong, nonatomic) NSString *path;
@property (strong, nonatomic) NSString *mediaType;
@property (nonatomic, readwrite) NSInteger numberOfColumns;
@property (nonatomic, readwrite) BOOL useDetail;
@property (nonatomic, readwrite) BOOL useZoom;
@property (nonatomic, readwrite) MMediaSelectMode selectMode;
@property (nonatomic, readwrite) MMediaSourceType sourceType;

@property (nonatomic, copy) MMediaPickerControllerDidFinishSelectBlock selectBlock;
@property (nonatomic, copy) MMediaPickerControllerDidFinishLoadBlock loadBlock;

- (void)loadItems;
- (void)presentPickerInViewController:(UIViewController *)viewController;

@end
