//
//  PPHttpBaseProvider.h
//  Library
//
//  Created by  on 11. 11. 22..
//  Copyright (c) 2011 . All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PPHttpProviderDelegate.h"

typedef enum {
	PPHttpBasePostProvide, // Default
	PPHttpBaseFormDataProvide,
    PPHttpBaseGetProvide,
    PPHttpBasePutProvide,
    PPHttpBaseDeleteProvide,
} PPHttpBaseProvideType;

//@protocol PPHttpBaseProviderDelegate;

@interface PPHttpBaseProvider : NSObject<NSURLConnectionDelegate> 
{
    id<PPHttpProviderDelegate> _delegate;
    NSString*             _url;
    PPHttpBaseProvideType _type;
    NSArray*              _userData;
    NSTimeInterval        _timeout;
    
    // inner valiable
    NSURLConnection*      _connection;
    NSMutableURLRequest*  _request;
    NSHTTPURLResponse*    _response;
    NSMutableData*        _receivedData;
    // timer
    NSTimer*              _timer;
    NSTimeInterval        _connectionCount;
    Class                _exNetworkIndicatorClass;
}

@property (nonatomic, retain) id<PPHttpProviderDelegate> delegate;
@property (nonatomic, copy)   NSString*             url;
@property (nonatomic, assign) PPHttpBaseProvideType type;
@property (nonatomic, retain) NSArray*              userData;
@property (nonatomic, assign) NSTimeInterval        timeout;
@property (nonatomic, retain) Class                exNetworkIndicatorClass;
@property (nonatomic) BOOL useUntrustedCert;

#pragma mark -
#pragma mark init method

- (id)initWithUrl:(NSString*)url type:(PPHttpBaseProvideType)type;
- (id)initWithUrl:(NSString*)url methodTypeString:(NSString *)typeString;

#pragma mark -
#pragma mark common data setter method

- (void) setRequestHeaders:(NSDictionary*)headers;
- (void) addRequestHeader:(NSString*)header value:(NSString*)value;

#pragma mark -
#pragma mark post data setter method

- (void) appendPostData:(NSData*)data;

#pragma mark -
#pragma mark process method

- (void) startAsynchronous;
- (void) cancel;

#pragma mark -
#pragma mark indicator setup method

- (void) setIndicatorWithViewCtrl:(UIViewController *)ctrl msg:(NSString *)message cancelButton:(BOOL)buttonYN;
@end

