import UIKit
import Foundation
import Photos
class ImageAssetView: UIView {
  
  
  @objc var localIdentifier: NSString = "" {
    didSet {
      // let x = String("0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001")
      displayAssetInImageView(localIdentifier: localIdentifier as String)
    }
  }
  var number = 100
  
  @objc var setHeight: NSInteger = 100 {
    didSet {
      // let x = String("0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001")
//      displayAssetInImageView(localIdentifier: "0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001")
      var newFrame = imageView.frame
//      newFrame.size.height = (int)(height)
      let integerValue: Int = Int(setHeight)
      let newHeight: CGFloat = CGFloat(Float(integerValue))
      newFrame.size.height = newHeight
      imageView.frame = newFrame
      
    }
  }
  
  @objc var setWidth: NSInteger = 100 {
    didSet {
      var newFrame = imageView.frame
      let integerValue: Int = Int(setWidth)
      let newWidth: CGFloat = CGFloat(Float(integerValue))
      newFrame.size.width = newWidth
      imageView.frame = newFrame
      
    }
  }
  
  var stringText = ""
  override init(frame: CGRect) {
    super.init(frame: frame)
//    self.addSubview(button)
    self.addSubview(imageView)

    
  }
  required init?(coder aDecoder: NSCoder) {
    fatalError("init has not been implemented")
    
  }

  lazy var imageView: UIImageView = {
    let imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
//    imageView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
//    imageView.boun
//    let manager = PHImageManager.default()
//    let option = PHImageRequestOptions()
//    var thumbnail = UIImage()
//    option.isSynchronous = true
//    let fetchOptions = PHFetchOptions()
        // let asset = PHAsset.fetchAssets(withLocalIdentifiers: ["0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001"], options: nil).enumerateObjects({ (object, count, stop) in
    //   stringText = type(of: object)
    // })
    // if let asset = asset {
        // Request the image for the asset
//         manager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFit, options: option) { (result, _) in
//             if let imageResult = result {
//                 // Update the UI on the main thread
// //                DispatchQueue.main.async {
//                     image.image = imageResult
// //                }
//             }
//         }
  // print(asset.localIdentifier)
  //     }
      //    let imageManager = PHCachingImageManager()
    // manager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: option) { (result: UIImage!, info) in
    //   // image.image = result
    //   print("hey)")
    // }
//    manager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFit, options: option)
//    manager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFit, options: option) { result, s in
//      thumbnail = result
//    }
//    image.image = thumbnail

    return imageView
    
  }()
  


  func fetchAsset(withLocalIdentifier localIdentifier: String) -> PHAsset? {
    let fetchOptions = PHFetchOptions()
    fetchOptions.predicate = NSPredicate(format: "localIdentifier = %@", localIdentifier)
    let result = PHAsset.fetchAssets(with: fetchOptions)
    return result.firstObject
}

  func displayAssetInImageView(localIdentifier: String) {
      if let asset = fetchAsset(withLocalIdentifier: localIdentifier) {
         let requestOptions = PHImageRequestOptions()
         requestOptions.isSynchronous = true // You might want to change this for asynchronous loading

         PHImageManager.default().requestImage(for: asset, targetSize: imageView.bounds.size, contentMode: .aspectFit, options: requestOptions) { image, _ in
           self.imageView.image = image
          print("hello")
         }
      }
  }

  

  
}

