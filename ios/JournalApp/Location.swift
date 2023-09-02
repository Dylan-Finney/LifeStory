//
//  Location.swift
//  JournalApp
//
//  Created by Dylan Finney on 04/08/2023.
//

import Foundation
import CoreLocation
import EventKit
import Photos
import Dispatch
@objc(Location)
class Location: RCTEventEmitter, CLLocationManagerDelegate {
  var locationManager: CLLocationManager = CLLocationManager()
  let geoCoder = CLGeocoder()
  var fileManager: FileManager = FileManager.default
  let eventStore = EKEventStore()
  var titles: [String] = []
//  var testIdentifiers: [String] = []
  var testIdentifiers: [[String: String]] = []

  var dateEvents: [[String: String]] = []
  var startDate: Date!
  var endDate: Date!
  var allPhotos : PHFetchResult<PHAsset>? = nil
  let semaphore = DispatchSemaphore(value: 1)
  let photoThread = DispatchSemaphore(value: 1)
  var calendarDenied = false

  // var documentsURLHey: URL = nil
//  let documentsURL: URL = FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)

  private var count = 0
  struct BasicLocation: Codable {
    var latitude: Double
    var longitude: Double
    var date: Date
    var dateString: String
    var description: String
  }

  let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .medium
    return formatter
  }()
//  private(set) var locations: [BasicLocation]

  // var locationManager:CLLocationManager = CLLocationManager()

  @objc
  func increment() {
    var documentsURL = try! fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
    

    count += 1
    print("count is \(count)")
    debugPrint("count")
//    sendEvent(withName: "onIncrement", body: ["count": documentsURL])

    sendEvent(withName: "onIncrement", body: ["count": count])
  }
  
  @objc
  func fetchEventsFromCalendar() -> Void {
          let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
          switch status {
          case .notDetermined: semaphore.wait(); requestAccessToCalendar("Calendar")
          case .authorized: fetchEventsFromCalendar("Calendar")
          case .denied: calendarDenied = true
          default: break
          }
      semaphore.wait();
      }
  @objc
//  func requestAccessToCalendar(_ calendarTitle: String) {
//          eventStore.requestAccess(to: EKEntityType.event) { (_, _) in
//            self.fetchEventsFromCalendar()
//          }
//      }
  
  func requestAccessToCalendar(_ calendarTitle: String) {
    eventStore.requestAccess(to: EKEntityType.event) { (accessGranted, error) in
      //            self.getCalendarPermissions()
      if accessGranted == true {
        self.fetchEventsFromCalendar(calendarTitle)
      } else {
        self.calendarDenied = true

      }
      self.semaphore.signal()

    }
  }

  
  @objc
  func fetchEventsFromCalendar(_ calendarTitle: String) -> Void {
          titles = []
      dateEvents = []
          for calendar in eventStore.calendars(for: .event) {
              if calendar.title == calendarTitle {
//                  let oneMonthAgo = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
//                  let oneMonthAfter = Calendar.current.date(byAdding: .month, value: 1, to: Date()) ?? Date()
                  let predicate = eventStore.predicateForEvents(
                      withStart: startDate,
                      end: endDate,
                      calendars: [calendar]
                  )
                  let events = eventStore.events(matching: predicate)
                  for event in events {
                      var newEvent = [String: String]()
                    newEvent["title"] = event.title
                    newEvent["start"] = String(event.startDate.timeIntervalSince1970)
                    newEvent["end"] = String(event.endDate.timeIntervalSince1970)
                    newEvent["isAllDay"] = String(event.isAllDay)
                    newEvent["notes"] = event.notes
//                      titles.append(event.title)
//                    example2.append(newEvent)
                    dateEvents.append(newEvent)
                  }
              }
          }

          // Print the event titles so check if everything works correctly
          print(titles)
      }
  @objc func sendDataToNative(_ data: Int, data2: Int, withResolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    calendarDenied = false
    let date = NSDate(timeIntervalSince1970: TimeInterval(data))
    startDate = date as Date
    let date2 = NSDate(timeIntervalSince1970: TimeInterval(data2))
    endDate = date2 as Date
    
    let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
    switch status {
//    case .notDetermined: semaphore.wait(); requestAccessToCalendar("Calendar")
//    case .authorized: fetchEventsFromCalendar("Calendar")
//    case .denied: reject("E_COUNT2", "DENIED", NSError(domain:"", code:101, userInfo:nil))
    default: break
    }
    fetchEventsFromCalendar()
    if calendarDenied == true {
      reject("E_COUNT2", "DENIED", NSError(domain:"", code:101, userInfo:nil))

    } else {
      resolve(dateEvents)
    }
//    semaphore.wait();

      }

  @objc func enablePermissions(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) -> Void {
    locationManager.delegate = self
    locationManager.requestWhenInUseAuthorization()
    locationManager.requestAlwaysAuthorization()
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
    locationManager.distanceFilter = kCLDistanceFilterNone
    locationManager.allowsBackgroundLocationUpdates = true
     locationManager.startMonitoringVisits()
//    locationManager.startUpdatingLocation()
    resolve(true)

  }

  // init() {
  //   let fileManager = FileManager.default
  //   documentsURL = try! fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)    
  //   self.fileManager = fileManager
    
  //   let jsonDecoder = JSONDecoder()
    
  //   let locationFilesURLs = try! fileManager.contentsOfDirectory(at: documentsURL,
  //                                                                includingPropertiesForKeys: nil)
  //   locations = locationFilesURLs.compactMap { url -> Location? in
  //     guard !url.absoluteString.contains(".DS_Store") else {
  //       return nil
  //     }
  //     guard let data = try? Data(contentsOf: url) else {
  //       return nil
  //     }
  //     return try? jsonDecoder.decode(Location.self, from: data)
  //   }.sorted(by: { $0.date < $1.date })
  // }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    // backgroundlocations.append(contentsOf: locations)
    // logsArr.append("newElement: String")
    // guard let location = locations.last else { return }
    // // backgroundlocations.append(locations.last)
    // logsArr.append("newElement: String2")
    
    geoCoder.reverseGeocodeLocation(locations.last!) { placemarks, _ in
      if let place = placemarks?.first {
        let description = "\(place)"
        self.sendEvent(withName: "locationChange", body: ["lat": locations.last?.coordinate.latitude as Any, "lon": locations.last?.coordinate.longitude as Any, "description": description] as [String : Any])

      }
    }


  }
//   override init() {
//     super.init()
//     sendEvent(withName: "init", body: ["count": "change"])
//   }
// required init?(coder aDecoder: NSCoder) {
//     fatalError("init has not been implemented")
    
//   }
  
  
//    reject("E_COUNT2", "DENIED", NSError(domain:"", code:100, userInfo:nil))

    

//     let formatter2 = DateFormatter()
//    formatter2.dateFormat = "YY/MM/dd"
//    let finalStr = formatter2.string(from: date as Date)
//    let description = "\(finalStr)"
//    resolve(titles)
//      reject("THIS IS A REJECT TEST")
//    sendEvent(withName: "onCalendar", body: ["count": 1])

  
//  let semaphore = DispatchSemaphore(value: 1)

  func requestAccessToCalendar2(_ calendarTitle: String) {
    eventStore.requestAccess(to: EKEntityType.event) { (accessGranted, error) in
      //            self.getCalendarPermissions()
      if accessGranted == true {
        self.permissionCalendar = 4

      } else {
        self.permissionCalendar = 5

      }
      self.semaphore.signal()

    }
  }
  
  var permissionCalendar = 0
  @objc func enableCalendarPermissions( _ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    self.getCalendarPermissions()
      resolve(permissionCalendar)

  }
  
  func getCalendarPermissions() {
        let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
    switch status {
    case .notDetermined: semaphore.wait(); self.requestAccessToCalendar2("Calendar")
    case .authorized: permissionCalendar = 2
    case .denied: permissionCalendar = 3
    default: break    }
    semaphore.wait();

  }
  
  
  
  @objc func fetchPhotos() {
    testIdentifiers = []
    let fetchOptions = PHFetchOptions()
    let dateOne =  Calendar.current.startOfDay(for: Date())
    let dateTwo = Calendar.current.date(byAdding: .day, value: 1, to: dateOne)
    fetchOptions.predicate = NSPredicate(format: "mediaType = %d AND ( creationDate > %@ ) AND ( creationDate < %@ )", PHAssetMediaType.image.rawValue, dateOne as NSDate, dateTwo! as NSDate)
    PHAsset.fetchAssets(with: .image, options: fetchOptions).enumerateObjects({ (object, count, stop) in
      var newPhoto = [String: String]()
//      var requestOptions = PHImageRequestOptions()
//      requestOptions.isSynchronous = true
//      if #available(iOS 13, *) {
//        PHImageManager.default().requestImageDataAndOrientation(for: object, options: requestOptions, resultHandler: {
//          imageData, dataUTI, orientation, info in
//          newPhoto["test"] = info[]
//        })
//        newPhoto["test2"] = "test2"
//
//      } else {
//        // Fallback on earlier versions
//      }
//      newPhoto["desc"] = PHAssetResource.assetResources(for: object).description
      newPhoto["name"] = PHAssetResource.assetResources(for: object).first?.originalFilename
//      newPhoto["url2"] = PHAssetResource.assetResources(for: object).first?.assetLocalIdentifier
//      newPhoto["url2"] = PHAssetResource.assetResources(for: object).first?.
      newPhoto["localIdentifier"] = object.localIdentifier
      if let unwrappedDate = object.creationDate {
//        newPhoto["creation"] = self.dateFormatter.string(from: unwrappedDate)
        newPhoto["creation"] = String(unwrappedDate.timeIntervalSince1970)
      } else {
        newPhoto["creation"] = "null"
      }
      if let location = object.location {
        newPhoto["lat"] = String(location.coordinate.latitude)
        newPhoto["lon"] = String(location.coordinate.longitude)
        let clLocation = CLLocation(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
        self.geoCoder.reverseGeocodeLocation(clLocation) { placemarks, _ in
          if let place = placemarks?.first {
            let description = "\(place)"
            newPhoto["loc"] = description
          }
        }
      } else {
        newPhoto["lat"] = "null"
        newPhoto["lon"] = "null"
        newPhoto["loc"] = "null"

      }
//      newPhoto["creation"] = dateFormatter.string(from: object.creationDate)
//      newPhoto["lat"] = String(object.location?.coordinate.latitude) || ""
//      newPhoto["lon"] = String(object.location?.coordinate.longitude) || ""
      self.testIdentifiers.append(newPhoto)
      
    })

  }
  var response = ""

  var photoAccess = false

  @available(iOS 14, *)
  func test() -> Void {
     let status2 = PHPhotoLibrary.authorizationStatus(for: .readWrite)
     switch status2 {
        case .notDetermined: test2(); response = "nD"
            // The user hasn't determined this app's access.
        case .restricted: photoAccess = false
            // The system restricted this app's access.
        case .denied: photoAccess = false
            // The user explicitly denied this app's access.
        case .authorized: photoAccess = true
            // The user authorized this app to access Photos data.
        case .limited: photoAccess = true; test2();
            // The user authorized this app for limited Photos access.
        @unknown default: print("test")
        }
    photoThread.wait()
  }

  @available(iOS 14, *)
  func test2() {
    photoThread.wait()
    PHPhotoLibrary.requestAuthorization(for: .readWrite) { photoStatus in
        switch photoStatus {
        case .notDetermined: self.photoAccess = false
            // The user hasn't determined this app's access.
        case .restricted: self.photoAccess = false
            // The system restricted this app's access.
        case .denied: self.photoAccess = false
            // The user explicitly denied this app's access.
        case .authorized: self.photoAccess = true
            // The user authorized this app to access Photos data.
        case .limited: self.photoAccess = true
            // The user authorized this app for limited Photos access.
        @unknown default: print("test")
        }
      // photoThread.signal()
      self.photoThread.signal()
    }
  }
  
  @available(iOS 14, *)
  @objc func getPhotosFromNative(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
  

    // let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
    do {
      photoAccess = false
// photoThread.activate()
// photoThread.wait()
  test()
  if photoAccess == true {
    fetchPhotos()
    // resolve(testIdentifiers)
    resolve(testIdentifiers)

  } else {
    reject("E_COUNT2", "DENIED", NSError(domain:"", code:100, userInfo:nil))
  }

    } catch {
      reject("E_COUNT2", "DENIED", NSError(domain:"", code:105, userInfo:nil))
    }
    
  //   switch status {
  //   case .notDetermined: photoThread.wait(); PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
  //     switch status {
  //     case .restricted:
  //       print("test")
  //     case .denied:
  //       accessDenied = true;
  //     case .authorized:
  //       print("test")
  //     case .limited:
  //       print("test")
  //     default:
  //       print("test")
  //     }
  //     photoThread.signal()
  // }
  //   case .authorized: accessDenied = false
  //   case .denied: accessDenied = true
  //   default: break
  //   }
    // photoThread.wait();

//    PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
//        switch status {
//        case .notDetermined:
//          print("test")
//        case .restricted:
//          print("test")
//        case .denied:
//          print("test")
//        case .authorized:
//          print("test")
//        case .limited:
//          print("test")
//        @unknown default:
//          print("test")
//        }
//    }
//    if accessDenied == false {
      // allPhotos = nil
      // fetchPhotos()
      // resolve(testIdentifiers)
      // resolve(true)
//    } else {
//      // reject("E_COUNT2", "DENIED", NSError(domain:"", code:100, userInfo:nil))
//      resolve("HAHAHAHAHA")
//    }
    
    //    let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
//    switch status {
////    case .notDetermined: reject("E_COUNT", "notDetermined", NSError())
//    case .authorized: resolve(testIdentifiers)
//    case .denied: reject("E_COUNT2", "DENIED", NSError(domain:"", code:100, userInfo:nil)
//)
//    default: break
//    }
//    resolve(true)
//    let fetchOptions = PHFetchOptions()
//    let dateOne = NSDate()
//    let dateTwo = NSDate()
//    fetchOptions.predicate = NSPredicate(format: "mediaType = %d AND ( creationDate > %@ ) AND ( creationDate < %@ )", PHAssetMediaType.image.rawValue, startDate as NSDate, endDate as NSDate)
//    let photoArray  = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    
    
    
    

      }
  
  func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {
    // backgroundlocations.append(contentsOf: locations)
    // logsArr.append("newElement: String")
    // guard let location = locations.last else { return }
    // // backgroundlocations.append(locations.last)
    // logsArr.append("newElement: String2")
    let clLocation = CLLocation(latitude: visit.coordinate.latitude, longitude: visit.coordinate.longitude)
    geoCoder.reverseGeocodeLocation(clLocation) { placemarks, _ in
      if let place = placemarks?.first {
        let description = "\(place)"
        self.sendEvent(withName: "locationChange", body: ["lat": clLocation.coordinate.latitude as Any, "lon": clLocation.coordinate.longitude as Any, "description": description] as [String : Any])

      }
    }

//    let clLocation = CLLocation(latitude: visit.coordinate.latitude, longitude: visit.coordinate.longitude)
//    geoCoder.reverseGeocodeLocation(clLocation) { placemarks, _ in
//      if let place = placemarks?.first {
//        let description = "\(place)"
//        self.newVisitReceived(visit, description: description)
//      }
//    }
//
//    sendEvent(withName: "onIncrement", body: ["count": "visit"])

  }

  func saveLocationOnDisk(_ visit: CLVisit, description: String) {
  // 1
  let encoder: JSONEncoder = JSONEncoder()
  let newLocation = BasicLocation(latitude: visit.coordinate.latitude, longitude: visit.coordinate.longitude, date: visit.arrivalDate, dateString: dateFormatter.string(from: visit.arrivalDate), description: description)
  // let timestamp = visit.arrivalDate.timeIntervalSince1970

  // // 2
  // let fileURL = documentsURL.appendingPathComponent("\(timestamp)")

  // // 3
  // let data = try! encoder?.encode(location)

  // // 4
  // try! data.write(to: fileURL)

  // // 5
  // locations.append(location)
}


  func newVisitReceived(_ visit: CLVisit, description: String) {
    // let location = Location(visit: visit, descriptionString: description)
    sendEvent(withName: "onIncrement", body: ["count": description])
    saveLocationOnDisk(visit, description: description)
    // Save location to disk
  }

  

  // we need to override this method and
  // return an array of event names that we can listen to
  override func supportedEvents() -> [String]! {
    return ["onIncrement", "init", "locationChange", "onCalendar"]
  }
  // you also need to add the override attribute
  // on these methods
  override func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "number": 123.9,
      "string": "foo",
      "boolean": true,
      "array": [1, 22.2, "33"],
      "object": ["a": 1, "b": 2]
    ]
  }
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

// class BasicLocation: Codable {
//   static let dateFormatter: DateFormatter = {
//     let formatter = DateFormatter()
//     formatter.dateStyle = .medium
//     formatter.timeStyle = .medium
//     return formatter
//   }()
  
//   var coordinates: CLLocationCoordinate2D {
//     return CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
//   }
  
//   let latitude: Double
//   let longitude: Double
//   let date: Date
//   let dateString: String
//   let description: String
  
//   init(_ location: CLLocationCoordinate2D, date: Date, descriptionString: String) {
//     latitude =  location.latitude
//     longitude =  location.longitude
//     self.date = date
//     dateString = Location.dateFormatter.string(from: date)
//     description = descriptionString
//   }
  
//   convenience init(visit: CLVisit, descriptionString: String) {
//     self.init(visit.coordinate, date: visit.arrivalDate, descriptionString: descriptionString)
//   }
// }
