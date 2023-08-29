import Foundation
@objc(ImageAsset) class ImageAsset: RCTViewManager {
  override func view() -> UIView! {
    return ImageAssetView()
    
  }
  override static func requiresMainQueueSetup() -> Bool {
    return true
    
  }
  
}
