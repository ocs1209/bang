//
//  PPHybridViewController.m
//

#import "PPHybridViewController.h"

@interface PPHybridViewController(/* Private */) <UIGestureRecognizerDelegate> {
    UISwipeGestureRecognizer *_swipeGestureRecognizer;
    NSURL *_requestURL;
}

@property (nonatomic, strong) UISwipeGestureRecognizer *swipeGestureRecognizer;
@property (nonatomic, strong) NSURL *requestURL;

@end

@implementation PPHybridViewController

/* 
 * @brief Back Interaction 구현을 위해 Swipe Gesture 적용
 */
- (void)useBackInteraction {
    _swipeGestureRecognizer = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(onBack:)];
    _swipeGestureRecognizer.delegate = self;
    _swipeGestureRecognizer.direction = UISwipeGestureRecognizerDirectionRight;
    [self.view addGestureRecognizer:_swipeGestureRecognizer];
    _swipeGestureRecognizer.enabled = NO;
    
#if ! __has_feature(objc_arc)
    [_swipeGestureRecognizer release];
#endif
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer {
    CGPoint location = [gestureRecognizer locationInView:self.view];
    if ( location.x < 10 ) {
        return YES;
    }
    return NO;
}

- (void)onBack:(UIPanGestureRecognizer *)gestureRecognizer {
    BOOL hasInterface = [[self.poperaWebview stringByEvaluatingJavaScriptFromString:@"(typeof window['onInitPage'] == 'function') ? 'YES' : 'NO'"] boolValue];

    if ( ! hasInterface ) {
        [self historyBack:@""];
    }
    else {
        [self callCbfunction:@"onKey" withObjects:[@{@"key":@"back", @"event":@"keyup"} jsonString], nil];
    }
}

- (void)viewWillAppear:(BOOL)animated {
	[super viewWillAppear:animated];
    
    _swipeGestureRecognizer.enabled = YES;
    
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    _swipeGestureRecognizer.enabled = NO;
    
//    if ( self.presentedViewController != nil ) {
//        [self.presentedViewController dismissViewControllerAnimated:animated completion:^{
//            
//        }];
//    }
    
//    UIViewController *viewController = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
//    if ( self.view.window.rootViewController.presentedViewController != nil ) {
//        [self.view.window.rootViewController.presentedViewController dismissViewControllerAnimated:animated completion:^{
//            
//        }];
//    }
}

#if ! __has_feature(objc_arc)
- (void)dealloc {
    
    [super dealloc];
}
#endif

- (void) loadView {
	[super loadView];
    
    _requestURL = [NSURL URLWithString:[self.openInitUrl copy]];
    
    // NavigationBar 는 사용하지 않으므로 Hidden
    self.navigationController.navigationBarHidden = YES;

    // Back Interaction 을 사용할 경우 주석 해제
    [self useBackInteraction];
}

/*
 * @brief StatusBar Style 변경
 */
- (UIStatusBarStyle)preferredStatusBarStyle {
    
    if ( [_requestURL.path rangeOfString:@"index.html"].location != NSNotFound ||
         [_requestURL.path rangeOfString:@"intro.html"].location != NSNotFound ) {
        
        self.backgroundView.backgroundColor = [UIColor clearColor];
        return UIStatusBarStyleLightContent;
    }

    if ( [_requestURL.path rangeOfString:@"intro.pairing.html"].location != NSNotFound ||
         [_requestURL.path rangeOfString:@"user.profile.html"].location != NSNotFound ) {
        
        self.backgroundView.backgroundColor = [UIColor whiteColor];
        return UIStatusBarStyleDefault;
    }
    
    self.backgroundView.backgroundColor = [UIColor colorWithRed:0.188 green:0.455 blue:0.753 alpha:1];
    return UIStatusBarStyleLightContent;
}

- (BOOL)useStatusBarView {
    if ( [_requestURL.path rangeOfString:@"index.html"].location != NSNotFound ||
         [_requestURL.path rangeOfString:@"intro.html"].location != NSNotFound ||
         [_requestURL.path rangeOfString:@"intro.pairing.html"].location != NSNotFound ) {
        
//        NSLog( @"useStatusBarView : NO" );
        return NO;
    }
    
//    NSLog( @"useStatusBarView : YES" );
    return YES;
}

/*
 * @brief StatusBar 표시 여부
 */
//- (BOOL)prefersStatusBarHidden {
//    return [super prefersStatusBarHidden];
//}

- (BOOL)prefersStatusBarHidden {
//    NSLog( @"_requestURL.path: %@", _requestURL.path );

    if ( [_requestURL.path rangeOfString:@"index.html"].location != NSNotFound ||
         [_requestURL.path rangeOfString:@"intro.html"].location != NSNotFound ) {
         
//        NSLog( @"prefersStatusBarHidden : YES" );
        return YES;
    }
    
//    NSLog( @"prefersStatusBarHidden : NO" );
    return NO;
}

/*
 * @brief 이동될 페이지경로 저장
 */
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    _requestURL = request.URL;
    
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

/*
 * @brief 외부 페이지가 열린 상태에서 로딩 오류가 발생했을 경우에 대한 처리.
 */
- (void)webView:(PPWebView *)webView didFailLoadWithError:(NSError *)error {
    if ( error ) {
        NSLog( @"error : %@", error );
    }
//    [super webView:webView didFailLoadWithError:error];
    
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    [super webViewDidFinishLoad:webView];
    
}

/*
 * @brief 부모 클래스에서 처리되지 않은 기능을 확장영역에서 처리할 수 있도록 추가함.
 */
- (BOOL)exWebView:(PPWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
   
    if (![_requestURL.scheme hasPrefix:@"http"] && [[UIApplication sharedApplication] canOpenURL:_requestURL]) {
        //  HTTP가 아닌 일반 사용자 정의 scheme의 경우 해당 Skip 처리하도록 추가함.
        
        [[UIApplication sharedApplication] openURL:_requestURL];
        return NO; // 내부적으로 처리함.
    }
    else {
        // AppFree 사이트의 경우 http://itunes.apple.com 를 open시도 후 바로 itms-services:// 스키마를 날리고 있음.
        // 예제(http://itunes.apple.com/us/app/aebpeuli-touchen-appfree/id506292960?mt=8)처럼 명시적으로 appStore로 이동하려는 경우
        
        if ([_requestURL.absoluteString hasPrefix:@"http://itunes.apple.com/"]) {
            [[UIApplication sharedApplication] openURL:_requestURL];
            return NO; // 내부적으로 처리함.
        }
    }
    
    return YES; // 부모에서 처리하도록 함.
}

@synthesize swipeGestureRecognizer = _swipeGestureRecognizer;
@synthesize requestURL = _requestURL;

@end
