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
  let eventStore = EKEventStore()
  var testIdentifiers: [[String: String]] = []

  var dateEvents: [[String: String]] = []
  var startDate: Date!
  var endDate: Date!
  let semaphore = DispatchSemaphore(value: 0)
  let photoThread = DispatchSemaphore(value: 1)
  var calendarDenied = false
  var photoAccess = false






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
          case .notDetermined: requestAccessToCalendar("Calendar"); semaphore.wait();
          case .authorized: fetchEventsFromCalendar("Calendar")
          case .denied: calendarDenied = true
          default: break
          }
      }
  @objc

  
  func requestAccessToCalendar(_ calendarTitle: String) {
    eventStore.requestAccess(to: EKEntityType.event) { (accessGranted, error) in
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

                    dateEvents.append(newEvent)
                  }
              }
          }

          // Print the event titles so check if everything works correctly
          print(dateEvents)
      }
  @objc func getCalendarEvents(_ data: Int, data2: Int, withResolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    calendarDenied = false
    let date = NSDate(timeIntervalSince1970: TimeInterval(data))
    startDate = date as Date
    let date2 = NSDate(timeIntervalSince1970: TimeInterval(data2))
    endDate = date2 as Date

    fetchEventsFromCalendar()
    if calendarDenied == true {
      reject("E_COUNT2", "DENIED", NSError(domain:"", code:101, userInfo:nil))

    } else {
      resolve(dateEvents)
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
    locationManager.distanceFilter = kCLDistanceFilterNone
    locationManager.allowsBackgroundLocationUpdates = true
     locationManager.startMonitoringVisits()
//    locationManager.startUpdatingLocation()
    resolve(true)

  }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {

    
    geoCoder.reverseGeocodeLocation(locations.last!) { placemarks, _ in
      if let place = placemarks?.first {
        let description = "\(place)"
        self.sendEvent(withName: "locationChange", body: ["lat": locations.last?.coordinate.latitude as Any, "lon": locations.last?.coordinate.longitude as Any, "description": description] as [String : Any])

      }
    }


  }

    func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {

    let clLocation = CLLocation(latitude: visit.coordinate.latitude, longitude: visit.coordinate.longitude)
    geoCoder.reverseGeocodeLocation(clLocation) { placemarks, _ in
      if let place = placemarks?.first {
        let description = "\(place)"
        self.sendEvent(withName: "locationChange", body: ["lat": clLocation.coordinate.latitude as Any, "lon": clLocation.coordinate.longitude as Any, "description": description] as [String : Any])

      }
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

   @objc func fetchPhotos() {
    testIdentifiers = []
    let fetchOptions = PHFetchOptions()
    let dateOne =  Calendar.current.startOfDay(for: Date())
    let dateTwo = Calendar.current.date(byAdding: .day, value: 1, to: dateOne)
    fetchOptions.predicate = NSPredicate(format: "mediaType = %d AND ( creationDate > %@ ) AND ( creationDate < %@ )", PHAssetMediaType.image.rawValue, dateOne as NSDate, dateTwo! as NSDate)
    PHAsset.fetchAssets(with: .image, options: fetchOptions).enumerateObjects({ (object, count, stop) in
      var newPhoto = [String: String]()

      newPhoto["name"] = PHAssetResource.assetResources(for: object).first?.originalFilename

      newPhoto["localIdentifier"] = object.localIdentifier
      if let unwrappedDate = object.creationDate {
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
      self.testIdentifiers.append(newPhoto)
      
    })

  }

  @available(iOS 14, *)
  func getPhotosAccess() -> Void {
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
  @objc func getPhotosFromNative(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    do {
      photoAccess = false
  getPhotosAccess()
  if photoAccess == true {
    fetchPhotos()
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
