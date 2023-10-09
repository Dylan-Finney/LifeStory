#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
@interface RCT_EXTERN_MODULE(Journal, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(isOn , BOOL)
RCT_EXPORT_VIEW_PROPERTY(initalTxtString , NSString)
RCT_EXPORT_VIEW_PROPERTY(onTxtChange , RCTDirectEventBlock)
//RCT_EXPORT_VIEW_PROPERTY(onFocus , RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onEventMenu , RCTDirectEventBlock)
@end
