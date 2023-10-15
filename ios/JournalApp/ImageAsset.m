#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
@interface RCT_EXTERN_MODULE(ImageAsset, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(localIdentifier , NSString)
RCT_EXPORT_VIEW_PROPERTY(setHeight , NSInteger)
RCT_EXPORT_VIEW_PROPERTY(setWidth , NSInteger)
@end
