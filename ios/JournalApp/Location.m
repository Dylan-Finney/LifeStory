#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@interface RCT_EXTERN_MODULE(Location, RCTEventEmitter)
RCT_EXTERN_METHOD(increment)
RCT_EXTERN_METHOD(
  enablePermissions: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)
RCT_EXTERN_METHOD(
                  sendDataToNative:(NSInteger)data
                  data2:(NSInteger)data2
                  withResolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
RCT_EXTERN_METHOD(
                  getPhotosFromNative:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )
@end
