import UIKit
class JournalView: UIView, UITextViewDelegate {
  
  @objc var onTxtChange: RCTDirectEventBlock?
  @objc var onEventMenu: RCTDirectEventBlock?
  
  
  
  @objc var isOn: Bool = false {
    didSet {
      button.backgroundColor = isOn ? .yellow : .black
      button.setTitle(String(describing: isOn ? "I am ON" : "I am OFF"), for: .normal)
      
    }
    
  }
  
  @objc var initalTxtString: NSString = "" {
    didSet {
      let initalTxtStringConverted = initalTxtString as String
      let attributedString = NSMutableAttributedString(string: initalTxtStringConverted)
      let fullRange = NSRange(location: 0, length: initalTxtStringConverted.count)

      attributedString.addAttribute(.font, value: UIFont(name: "Inter-Regular", size: 18.0)!, range: fullRange)
      attributedString.addAttribute(.foregroundColor, value: UIColor(red: 0.28, green: 0.33, blue: 0.40, alpha: 1.00), range: fullRange)

      if #available(iOS 16.0, *) {
        do {
          let selectedRange = textInput.selectedRange
          let pattern = #"\[\[\d+\]\]"#
          let eventRegex = try NSRegularExpression(pattern: pattern, options: .caseInsensitive)
          let searchRange = NSRange(location: 0, length: initalTxtStringConverted.count)
          let matches = eventRegex.matches(in: initalTxtStringConverted, range: searchRange)
          for match in matches {
            attributedString.addAttribute(.foregroundColor, value: UIColor.red, range: match.range)
          }
//          attributedString.addAttribute(.foregroundColor, value: UIColor.red, range: NSRange(location: 0, length: 5))
//          attributedString.addAttribute(.foregroundColor, value: UIColor.red, range: NSRange(location: 0, length: 5))
          textInput.attributedText = attributedString
          textInput.selectedRange = selectedRange
        } catch let error {
          print(error.localizedDescription)
          textInput.attributedText = attributedString

        }
                
      } else {
        // Fallback on earlier versions
        textInput.attributedText = attributedString
      }

    }
  }
  override init(frame: CGRect) {
    super.init(frame: frame)
//    self.addSubview(button)
    self.addSubview(textInput)
    textInput.delegate = self
    textInput.allowsEditingTextAttributes = true
//    textInput.textColor = .red
    
    let query = "@"

            if let str = textInput.text {
                let text = NSMutableAttributedString(string: str)
                var searchRange = str.startIndex..<str.endIndex
                while let range = str.range(of: query, options: NSString.CompareOptions.caseInsensitive, range: searchRange) {
                  text.addAttribute(NSAttributedString.Key.foregroundColor, value: UIColor.red, range: NSRange(range, in: str))
                    searchRange = range.upperBound..<searchRange.upperBound
                }
              textInput.attributedText = text
            }

    
  }
  required init?(coder aDecoder: NSCoder) {
    fatalError("init has not been implemented")
    
  }
  lazy var button: UIButton = {
    let button = UIButton.init(type: UIButton.ButtonType.system)
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    button.titleLabel?.font = UIFont.systemFont(ofSize: 20)
    button.addTarget(
      self,
      action: #selector(toggleSwitchStatus),
      for: .touchUpInside
    )
    return button
    
  }()
  lazy var textInput: UITextView = {
    let textInput = UITextView.init()
    textInput.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    textInput.text = String("Text")
    textInput.font = UIFont(name: "Callout", size: 30)
    textInput.textColor =   UIColor(red: 0.28, green: 0.33, blue: 0.40, alpha: 1.00) // #475467
    return textInput
    
  }()
  

  @objc func toggleSwitchStatus() {
    isOn = !isOn as Bool
    
  }
   
  func textViewDidChange(_ textView: UITextView) {
    print(textView.text!)
    onTxtChange!(["nativeStr": textView.text!])

  }

  @available(iOS 13.0, *)
  func textView(
        _ textView: UITextView,
        editMenuForTextIn range: NSRange,
        suggestedActions: [UIMenuElement]
    ) -> UIMenu? {
        var additionalActions: [UIMenuElement] = []
        if range.length > 0 {
            let upvoteAction = UIAction(title: "Upvote") {(action) in
              self.onEventMenu!(["nativeEventMenu": ["action": 1.1, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
            }
            let downvoteAction = UIAction(title: "Downvote") {(action) in
              self.onEventMenu!(["nativeEventMenu": ["action": 1.2, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
            }
            let voteMoreAction = UIAction(title: "More") {(action) in
              self.onEventMenu!(["nativeEventMenu": ["action": 1.3, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
            }

            let voteMenu = UIMenu(title: "Vote", image: nil, identifier: nil, options: [], children: [upvoteAction, downvoteAction, voteMoreAction])
            additionalActions.append(voteMenu)
        }
        
        let aiRewriteAction = UIAction(title: "AI rewrite") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 2, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }
        additionalActions.append(aiRewriteAction)
        let fiveEmotionAction = UIAction(title: "😁") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.1, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }
        let fourEmotionAction = UIAction(title: "🙂") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.2, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }
        let threeEmotionAction = UIAction(title: "😐") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.3, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }

        let twoEmotionAction = UIAction(title: "🙁") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.4, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }

        let oneEmotionAction = UIAction(title: "😞") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.5, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }
        
        let emotionMoreAction = UIAction(title: "More") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 3.6, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }


        let assignEmotionMenu = UIMenu(title: "Assign emotion", image: nil, identifier: nil, options: [], children: [fiveEmotionAction, fourEmotionAction, threeEmotionAction, twoEmotionAction,oneEmotionAction,  emotionMoreAction])
        additionalActions.append(assignEmotionMenu)


        let tagAction = UIAction(title: "Tag") {(action) in
          self.onEventMenu!(["nativeEventMenu": ["action": 4, "range": NSStringFromRange(range), "str": textView.text[Range(range, in: textView.text)!]] as [String : Any]])
        }

        additionalActions.append(tagAction)
        return UIMenu(children: additionalActions)
    }
  
  func UIColorFromRGB(_ rgbValue: Int) -> UIColor! {
    return UIColor(red: CGFloat((Float((rgbValue & 0xff0000)>>16))/255.0),
                   green: CGFloat((Float((rgbValue & 0xff0000)>>8))/255.0),
                   blue: CGFloat((Float((rgbValue & 0xff0000)>>0))/255.0),
                   alpha: 1.0)
  }
  
  
  
}


