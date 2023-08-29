//
//  File.swift
//  JournalApp
//
//  Created by Dylan Finney on 01/08/2023.
//

import Foundation
import EventKit
import CoreLocation

@objc(Counter)
class Counter: NSObject, CLLocationManagerDelegate  {
  var count = 4
  var count2 = 4
  let eventStore = EKEventStore()
  var titles: [String] = []
  var logsArr: [String] = []
  var startDates: [Date] = []
      var endDates: [Date] = []
  var example: [[String: String]] = []
  
  var mgr: CLLocationManager?

  var backgroundlocations: [CLLocation] = []
  var backgroundlocationsTwo: [[String: String]] = []

//  var example2: [Dictionary] = []



  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["initialCount": 0]
  }
  @objc
  func load(_ callback: RCTResponseSenderBlock) {
    fetchEventsFromCalendar()
    fetchLocations()
//    backgroundlocations.append(CLLocation(latitude: 37.785834, longitude: -122.406417))
//    var newEvent = [String: String]()
//    for newLocation in backgroundlocations{
//      var newEvent = [String: String]()
//      newEvent["lat"] = String(CLLocation(latitude: 37.785834, longitude: -122.406417).coordinate.latitude)
//      backgroundlocationsTwo.append(newEvent)
//    }
//
//    var newEvent = [String: String]()
//    newEvent["lat"] = String(CLLocation(latitude: 37.785834, longitude: -122.406417).coordinate.latitude)
//    backgroundlocationsTwo.append(newEvent)

//    let status = locationManager.authorizationStatus
//    let value = -1
//    switch status {
//    case .notDetermined: requestAccessToCalendar("Calendar")
//    case .authorized: fetchEventsFromCalendar("Calendar")
//    case .denied: print("Access denied")
//    default: break
//    }

    callback([["titles": titles, "test2": example, "test3": backgroundlocations, "test4": backgroundlocationsTwo, "test5": String(backgroundlocations.count), "logs": logsArr]])

  }
  func fetchLocations(){
    mgr = CLLocationManager()
    mgr?.delegate = self
    mgr?.requestWhenInUseAuthorization()
    mgr?.requestAlwaysAuthorization()
    mgr?.desiredAccuracy = kCLLocationAccuracyBest
    mgr?.distanceFilter = kCLDistanceFilterNone
    mgr?.allowsBackgroundLocationUpdates = true
    mgr?.startUpdatingLocation()
    logsArr.append("Inital")

//    mgr.desiredAccuracy = kCLLocationAccuracyBest
//    mgr.requestAlwaysAuthorization()
//    mgr.allowsBackgroundLocationUpdates = true

//    locationManager = CLLocationManager()
//    locationManager?.delegate = self
//
//
//    // 3
//    locationManager?.requestWhenInUseAuthorization()
  }

  @objc
  func fetchEventsFromCalendar(_ calendarTitle: String) -> Void {
          for calendar in eventStore.calendars(for: .event) {
              if calendar.title == calendarTitle {
                  let oneMonthAgo = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
                  let oneMonthAfter = Calendar.current.date(byAdding: .month, value: 1, to: Date()) ?? Date()
                  let predicate = eventStore.predicateForEvents(
                      withStart: oneMonthAgo,
                      end: oneMonthAfter,
                      calendars: [calendar]
                  )
                  let events = eventStore.events(matching: predicate)
                  for event in events {
                    var newEvent = [String: String]()
                    newEvent["title"] = event.title
                      titles.append(event.title)
                      startDates.append(event.startDate as Date)
                      endDates.append(event.endDate as Date)
                    example.append(newEvent)
//                    example2.append(newEvent)
                  }
              }
          }

          // Print the event titles so check if everything works correctly
          print(titles)
      }

  @objc
  func fetchEventsFromCalendar() -> Void {
          let status = EKEventStore.authorizationStatus(for: EKEntityType.event)
          switch status {
          case .notDetermined: requestAccessToCalendar("Calendar")
          case .authorized: fetchEventsFromCalendar("Calendar")
          case .denied: print("Access denied")
          default: break
          }
      }

  @objc
  func requestAccessToCalendar(_ calendarTitle: String) {
          eventStore.requestAccess(to: EKEntityType.event) { (_, _) in
              self.fetchEventsFromCalendar(calendarTitle)
          }
      }
  func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    // backgroundlocations.append(contentsOf: locations)
    logsArr.append("newElement: String")
    guard let location = locations.last else { return }
    // backgroundlocations.append(locations.last)
    logsArr.append("newElement: String2")

  }
func locationManager(manager: CLLocationManager!, didFailWithError error: NSError!) {
    mgr?.stopUpdatingLocation()
   logsArr.append(error.localizedDescription)

 }
//  @objc
//  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
//          switch manager.authorizationStatus {
//          case .notDetermined:
//              print("When user did not yet determined")
//          case .restricted:
//              print("Restricted by parental control")
//          case .denied:
//              print("When user select option Dont't Allow")
//          // 1
//          case .authorizedAlways:
//              print("When user select option Change to Always Allow")
//          case .authorizedWhenInUse:
//              print("When user select option Allow While Using App or Allow Once")
//              // 2
//              locationManager?.requestAlwaysAuthorization()
//          default: 
//              print("default")
//          }
//      }


  @objc
    static func requiresMainQueueSetup() -> Bool {
      return true
    }
}
