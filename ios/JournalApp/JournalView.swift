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
      textInput.text = initalTxtString as String
    }
  }
  override init(frame: CGRect) {
    super.init(frame: frame)
//    self.addSubview(button)
    self.addSubview(textInput)
    textInput.delegate = self

    
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
  
  
  
}


