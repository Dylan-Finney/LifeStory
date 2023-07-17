import Foundation
@objc(Journal) class Journal: RCTViewManager {
  override func view() -> UIView! {
    return JournalView()
    
  }
  override static func requiresMainQueueSetup() -> Bool {
    return true
    
  }
  
}
