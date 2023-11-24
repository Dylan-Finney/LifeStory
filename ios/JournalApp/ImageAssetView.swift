import UIKit
import Foundation
import Photos
class ImageAssetView: UIView {
  
  //localIdentifier of the Asset to display in the component
  @objc var localIdentifier: NSString = "" {
    didSet {
      displayAssetInImageView(localIdentifier: localIdentifier as String)
    }
  }
  

  //Dynamic Height for the Component
  @objc var setHeight: NSInteger = 100 {
    didSet {
      var newFrame = imageView.frame
      let integerValue: Int = Int(setHeight)
      let newHeight: CGFloat = CGFloat(Float(integerValue))
      newFrame.size.height = newHeight
      imageView.frame.size.height = newFrame.size.height
      displayAssetInImageView(localIdentifier: localIdentifier as String)
      
    }
  }
  
  //Dynamic Width for the Component
  @objc var setWidth: NSInteger = 100 {
    didSet {
      var newFrame = imageView.frame
      let integerValue: Int = Int(setWidth)
      let newWidth: CGFloat = CGFloat(Float(integerValue))
      newFrame.size.width = newWidth
      imageView.frame.size.width = newFrame.size.width
      displayAssetInImageView(localIdentifier: localIdentifier as String)
      
    }
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.addSubview(imageView)

    
  }
  required init?(coder aDecoder: NSCoder) {
    fatalError("init has not been implemented")
    
  }

  lazy var imageView: UIImageView = {
    let imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: 500, height: 500))
    imageView.contentMode = .scaleAspectFill;
        return imageView
    
  }()
  

  //Get the asset with the given localIdentifier
  func fetchAsset(withLocalIdentifier localIdentifier: String) -> PHAsset? {
    let fetchOptions = PHFetchOptions()
    fetchOptions.predicate = NSPredicate(format: "localIdentifier = %@", localIdentifier)
    let result = PHAsset.fetchAssets(with: fetchOptions)
    return result.firstObject
}

  //Display the asset in the ImageView
  func displayAssetInImageView(localIdentifier: String) {
      if let asset = fetchAsset(withLocalIdentifier: localIdentifier) {
         let requestOptions = PHImageRequestOptions()
         requestOptions.isSynchronous = true // You might want to change this for asynchronous loading

         PHImageManager.default().requestImage(for: asset, targetSize: imageView.frame.size, contentMode: .aspectFill, options: requestOptions) { image, _ in
           self.imageView.image = image


          print("hello")
         }

      }
  }

  

  
}

