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
import EventKitUI
@objc(Location)
class Location: RCTEventEmitter, CLLocationManagerDelegate, EKCalendarChooserDelegate {
  var locationManager: CLLocationManager = CLLocationManager()
  let geoCoder = CLGeocoder()
  let eventStore = EKEventStore()
  var testIdentifiers: [[String: String]] = []
var presentingVC = RCTPresentedViewController()
  var dateEvents: [[String: String]] = []
  var endDate: Date! = Date()
  var startDate: Date! = Calendar.current.date(byAdding: .day, value: -1, to: Date())
  let semaphore = DispatchSemaphore(value: 0)
  let photoThread = DispatchSemaphore(value: 1)
  var reverseGeoCodePhoto = DispatchSemaphore(value: 0)

  var calendarDenied = false
  var photoAccess = false
  var calendarIdentifiers: [String] = []
    var calendarInital = false







/*

  Calendar Events Functions
    - Gets Permissions for Calendar Events
    - Requests Permissions for Calendar Events, wait for response
    - Gets all Calendar Events (we have access to) in the user's local gallery from over a specified period (usually week)
    - Returns 
      - title: Event Title
      - start: Unix Timestamp of the starting time
      - end: Unix Timestamp of the ending time
      - isAllDay: If the event is scheduled for the whole day
      - notes: Additional Notes about the events that may provide context
*/
  
  @objc
  func fetchEventsFromCalendar() -> Void {
          let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
          switch status {
          case .notDetermined: calendarInital = true; requestAccessToCalendar("Calendar"); semaphore.wait(); calendarInital = false;
          case .authorized: fetchEventsFromCalendar("Calendar")
          case .fullAccess: fetchEventsFromCalendar("Calendar")
          case .restricted: fetchEventsFromCalendar("Calendar")
          case .writeOnly: calendarDenied = true
          case .denied: calendarDenied = true
          default: break
          }
      }
  
  // @objc func getCalendarPermissions() -> Void {

  // }
  
  @objc
  func enableCalendarPermissions(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
          let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
          switch status {
          case .notDetermined: calendarInital = true; requestAccessToCalendar("Calendar"); semaphore.wait(); resolve(true);
          default: resolve(false)
          }
      }

  
  func requestAccessToCalendar(_ calendarTitle: String) {
    if #available(iOS 17, *) {
      eventStore.requestFullAccessToEvents { (accessGranted, error) in
        if accessGranted == true {
          // self.fetchEventsFromCalendar(calendarTitle)
          self.chooserOpen()

        } else {
          self.calendarDenied = true
        self.semaphore.signal()

        }
      }
    } else if #available(iOS 6, *) {
      eventStore.requestAccess(to: EKEntityType.event) { (accessGranted, error) in
        if accessGranted == true {
          // self.fetchEventsFromCalendar(calendarTitle)
          self.chooserOpen()

        } else {
          self.calendarDenied = true
        self.semaphore.signal()

        }
      }

    }
    
  }

  
  @objc
  func fetchEventsFromCalendar(_ calendarTitle: String) -> Void {
      dateEvents = []
      var calendars : [EKCalendar] = []
          
          for localIdentifier in calendarIdentifiers {
            if let calendar = eventStore.calendar(withIdentifier: localIdentifier){
              calendars.append(calendar)
            }
          }
          
          if calendars.count > 0 {
            let predicate = eventStore.predicateForEvents(
                withStart: startDate,
                end: endDate,
                calendars: calendars
            )
            let events = eventStore.events(matching: predicate)
            for event in events {
                var newEvent = [String: String]()
              newEvent["title"] = event.title
              newEvent["start"] = String(event.startDate.timeIntervalSince1970)
              newEvent["end"] = String(event.endDate.timeIntervalSince1970)
              newEvent["isAllDay"] = String(event.isAllDay)
              newEvent["notes"] = event.notes
              newEvent["calendar"] = event.calendar.title
              if let colorComponents = event.calendar.cgColor.components, event.calendar.cgColor.numberOfComponents == 4 {
                let red = Int(colorComponents[0] * 255)
                let green = Int(colorComponents[1] * 255)
                let blue = Int(colorComponents[2] * 255)
                
                let hexRed = String(format: "%02X", red)
                let hexGreen = String(format: "%02X", green)
                let hexBlue = String(format: "%02X", blue)
                
                let hexColor = "#\(hexRed)\(hexGreen)\(hexBlue)"
                newEvent["calendarColor"] = hexColor
              }
              dateEvents.append(newEvent)
            }

          }
          print(dateEvents)

      }
  @objc func getCalendarEvents(_ data: Int, data2: Int, withResolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    calendarDenied = false
//    let date = NSDate(timeIntervalSince1970: TimeInterval(data))
//    startDate = date as Date
//    let date2 = NSDate(timeIntervalSince1970: TimeInterval(data2))
//    endDate = date2 as Date

    fetchEventsFromCalendar()
    if calendarDenied == true {
      reject("E_COUNT2", "DENIED", NSError(domain:"", code:101, userInfo:nil))

    } else {
      resolve(dateEvents)
    }

      }

  @objc func getCalendarIdentifiers(_ callback: RCTResponseSenderBlock) {
      callback([calendarIdentifiers])
    }

    @objc func setCalendarIdentifiers(_ calendarIdentifiers: [String]) -> Void {
      self.calendarIdentifiers = calendarIdentifiers
    }


    @objc func chooserOpen() -> Void{
      DispatchQueue.main.async {
      self._chooserOpen()
    }

    }
     @objc func _chooserOpen() -> Void {
//    let controller = RCTPresentedViewController();
var selectedCalendars = Set<EKCalendar>()

for localIdentifier in calendarIdentifiers {
          if let calendar = eventStore.calendar(withIdentifier: localIdentifier){
            selectedCalendars.insert(calendar)
          }
        }

    presentingVC = RCTPresentedViewController()
    let vc = EKCalendarChooser(selectionStyle: .multiple, displayStyle: .allCalendars, entityType: .event, eventStore: eventStore)
    vc.showsDoneButton = true
    vc.showsCancelButton = true
    vc.delegate = self

    vc.selectedCalendars = selectedCalendars
    let nvc = UINavigationController(rootViewController: vc)

    presentingVC?.present(nvc, animated: true, completion: nil)

  }

  func calendarChooserDidFinish(_ calendarChooser: EKCalendarChooser) {
          var calendars: [String] = []
          
          for calendar in calendarChooser.selectedCalendars {
            calendars.append(calendar.calendarIdentifier)
          }
          print(calendarChooser.selectedCalendars)
          setCalendarIdentifiers(calendars)
          presentingVC?.dismiss(animated: true, completion: nil)
          if calendarInital == true {
            fetchEventsFromCalendar("Calendar")
            self.sendEvent(withName: "calendarChange", body: calendars)
      self.semaphore.signal()
    } else {
        self.sendEvent(withName: "calendarChange", body: calendars)

    }

  }
  
  func calendarChooserDidCancel(_ calendarChooser: EKCalendarChooser) {
          presentingVC?.dismiss(animated: true, completion: nil)
          
          if calendarInital == true {
      self.semaphore.signal()

    } else {
        self.sendEvent(withName: "calendarChange", body: "null")

    }

  }




/*
      Location Functions
      - Gets Permissions for Locations
      - Requests Permissions for Locations, wait for response. Needs Always Allow
      - Uses GeoCoder to get Address corresponding 
      - Prefer to user Visit Monitoring for Real App
      - If using simulator, need to use Location Updates instead to test Location features
*/
@objc func enablePermissions(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) -> Void {
    locationManager.delegate = self
    locationManager.requestWhenInUseAuthorization()
    locationManager.requestAlwaysAuthorization()
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
    locationManager.distanceFilter = 50
    locationManager.allowsBackgroundLocationUpdates = true
    locationManager.pausesLocationUpdatesAutomatically = false
      locationManager.startMonitoringVisits() //Make Sure this is active for release
   locationManager.startUpdatingLocation() //Simulator Debug as Visits doesn't work
    resolve(true)

  }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
//      let stationarySpeedThreshold: CLLocationSpeed = 0.5
//      let stationaryTimeThreshold: TimeInterval = 60
      
      
      
//      if locations.last!.speed > stationarySpeedThreshold {
      for location in locations {
        geoCoder.reverseGeocodeLocation(location) { placemarks, _ in
          var description = ""
          var city = ""

          if let place = placemarks?.first {
            description = "\(place)"
            city = place.locality ?? "" 
          }
          
          self.sendEvent(withName: "locationChange", body: ["lat": locations.last?.coordinate.latitude as Any, "lon": locations.last?.coordinate.longitude as Any, "description": description, "arrivalTime": locations.last?.timestamp.timeIntervalSince1970 ?? 0, "departureTime" : "", "type": "route", "speed": String(locations.last?.speed ?? 0), "city": city as Any] as [String : Any])
        }

      }
        //      }



    
    


  }

    func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {

    let clLocation = CLLocation(latitude: visit.coordinate.latitude, longitude: visit.coordinate.longitude)
    geoCoder.reverseGeocodeLocation(clLocation) { placemarks, _ in
      var description = ""
      var city = ""
      var arrivalTime = 0
      var departureTime = 0
      
      if let place = placemarks?.first {
        description = "\(place)"
        city = place.locality ?? ""

      }
      if visit.arrivalDate == .distantPast {
        departureTime = Int(visit.departureDate.timeIntervalSince1970)
      } else if visit.departureDate == .distantFuture{
        arrivalTime = Int(visit.arrivalDate.timeIntervalSince1970)
      } else {
        arrivalTime = Int(visit.arrivalDate.timeIntervalSince1970)
        departureTime = Int(visit.departureDate.timeIntervalSince1970)
      }
      

      
      self.sendEvent(withName: "locationChange", body: ["lat": visit.coordinate.latitude as Any, "lon": visit.coordinate.longitude as Any, "description": description, "arrivalTime": arrivalTime as Any, "departureTime" : departureTime as Any, "type": "visit", "city": city as Any] as [String : Any])

        
      
    }
  

  }

/*
      Photos/Gallery Functions
      - Gets Permissions for Gallery
      - Requests Permissions for Gallery, wait for response
      - Gets all photos (we have access to) in the user's local gallery from over a specified period (usually week)
      - Returns 
        - Name: File name
        - localIdentifier: id of the file used to fetch it 
        - Location (Latitude, Longitude): Location where taken. Null if N/A or downloaded.
        - Creation - Time Created
*/
  
  @objc func fetchPhotos(_ cameraRollOnly: Bool) {
 testIdentifiers = []
 let fetchOptions = PHFetchOptions()
  let requestOptions = PHImageRequestOptions()
  requestOptions.isSynchronous = true
//    let dateOne =  Calendar.current.startOfDay(for: Date())
//    let dateTwo = Calendar.current.date(byAdding: .day, value: 1, to: dateOne)
 fetchOptions.predicate = NSPredicate(format: "mediaType = %d AND ( creationDate > %@ ) AND ( creationDate < %@ )", PHAssetMediaType.image.rawValue, startDate as NSDate, endDate as NSDate)

  
  
  let  fetchedAssets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
 
fetchedAssets.enumerateObjects({ (object, count, stop) in
  self.sendEvent(withName: "photoChange", body: count)
  var newPhoto = [String: String]()

  newPhoto["name"] = PHAssetResource.assetResources(for: object).first?.originalFilename

  newPhoto["localIdentifier"] = object.localIdentifier
  PHImageManager.default().requestImage(for: object, targetSize: CGSize(width: 1000,height: 1000), contentMode: .aspectFit, options: requestOptions) { image, _ in
    self.reverseGeoCodePhoto = DispatchSemaphore(value: 0)
    if let pngData = image?.pngData() {
//          newPhoto["data"] = String(decoding: pngData, as: UTF8.self)
      newPhoto["data"] = pngData.base64EncodedString()
      
    }
    
  }

  if let unwrappedDate = object.creationDate {
    newPhoto["creation"] = String(unwrappedDate.timeIntervalSince1970)
  } else {
    newPhoto["creation"] = "null"
  }
  if let location = object.location {
    print("GETTING PHOTO")
    newPhoto["lat"] = String(location.coordinate.latitude)
    newPhoto["lon"] = String(location.coordinate.longitude)
    let clLocation = CLLocation(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
//        let a = CLLocation(latitude: <#T##CLLocationDegrees#>, longitude: <#T##CLLocationDegrees#>)
    
    CLGeocoder().reverseGeocodeLocation(location) { placemarks, error in
      print("GETTING LOCATION")
      if let error = error as? CLError {
//            print(error.localizedDescription.debugDescription)
        newPhoto["error"] = error.localizedDescription.debugDescription
      } else if let place = placemarks?.first {
        let description = "\(place)"
//            print(description)

        newPhoto["description"] = description
//            print(newPhoto["description"] ?? "")

      }
      self.reverseGeoCodePhoto.signal()
    }
  } else {
    newPhoto["lat"] = "null"
    newPhoto["lon"] = "null"
    newPhoto["loc"] = "null"
    self.reverseGeoCodePhoto.signal()



  }
  self.reverseGeoCodePhoto.wait()
  self.testIdentifiers.append(newPhoto)
  print("SHOW LOCATION")
  print(newPhoto["description"] ?? "No Desc")
        
})


}
  
  
  @available(iOS 14, *)
  @objc func getPhotosAccess() -> Void {
     let status2 = PHPhotoLibrary.authorizationStatus(for: .readWrite)
     switch status2 {
        case .notDetermined: requestPhotosAccess(); photoThread.wait();
            // The user hasn't determined this app's access.
        case .restricted: photoAccess = false
            // The system restricted this app's access.
        case .denied: photoAccess = false
            // The user explicitly denied this app's access.
        case .authorized: photoAccess = true
            // The user authorized this app to access Photos data.
        case .limited: photoAccess = true;
            // The user authorized this app for limited Photos access.
        @unknown default: print("test")
        }
    
  }

  @available(iOS 14, *)
  func requestPhotosAccess() {
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
      self.photoThread.signal()
    }
  }
  
  @available(iOS 14, *)
  @objc func getPhotosFromNative(_ cameraRollOnly: Bool, withResolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      photoAccess = false
  getPhotosAccess()
  if photoAccess == true {
    fetchPhotos(cameraRollOnly)
    resolve(testIdentifiers)

  } else {
    reject("E_COUNT2", "DENIED", NSError(domain:"", code:100, userInfo:nil))
  }

    } catch {
      reject("E_COUNT2", "DENIED", NSError(domain:"", code:105, userInfo:nil))
    }
    

      }
  




/*
Other Functions
*/
  
  @objc func setDateRange(_ data: Int, data2: Int) -> Void {
    let date = NSDate(timeIntervalSince1970: TimeInterval(data))
    startDate = date as Date
    let date2 = NSDate(timeIntervalSince1970: TimeInterval(data2))
    endDate = date2 as Date


      }

  // we need to override this method and
  // return an array of event names that we can listen to
  override func supportedEvents() -> [String]! {
    return ["onIncrement", "init", "locationChange", "onCalendar", "calendarChange", "photoCount", "photoChange"]
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
