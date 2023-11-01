import React, {useState, useEffect} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {
  StyleSheet,
  View,
  NativeModules,
  NativeEventEmitter,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import notifee, {EventType} from '@notifee/react-native';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

import useDatabaseHooks from '../utils/hooks/useDatabaseHooks';
import useSettingsHooks from '../utils/hooks/useSettingsHooks';

import {EventTypes} from '../utils/Enums';
import getMemories from '../utils/getMemories';

import AnimatedLaunchScreen from '../modules/onboarding/views/AnimatedLaunchScreen';
import AppContext from '../contexts/AppContext';
import OnboardingView from '../../OnboardingView';
import onCreateTriggerReminder from '../utils/createOpenReminder';
import onCreateTriggerNotification from '../utils/createNotification';
import Location from '../../src/utils/native-modules/NativeFuncs.js';
import generateMemories from '../utils/generateMemories';

const RootStack = createNativeStackNavigator();

const MainNavigator = () => {
  const {createVisitsTable, insertData, retrieveData, retrieveSpecificData} =
    useDatabaseHooks();
  // const {calendars} = useSettingsHooks();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  //// future authentication implementation here
  const isAuthenticated = true;

  useEffect(() => {
    setIsLoading(true);
  }, []);

  const [entries, setEntries] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [onBoarding, setOnBoarding] = useState(
    useSettingsHooks.getBoolean('onboarding'),
  );
  // const {onBoarding, calendars} = useSettingsHooks();

  const getFormatedTimeString = (time1, time2 = null) => {
    const date = new Date(time1);
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = '0' + date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? '0' + hours : 12;
    // Seconds part from the timestamp
    var formattedTime =
      hours.toString().slice(-2) +
      ':' +
      minutes.toString().slice(-2) +
      ' ' +
      ampm;
    if (time2 === null) {
      return formattedTime;
    } else {
      return `${formattedTime}-${getFormatedTimeString(time2)}`;
    }
  };

  useEffect(() => {
    const getEntries = async () => {
      try {
        console.log('LOADING ENTRIES DATA');
        const localEntries = await retrieveData('Entries');
        console.log({localEntries});
        var updatedEntries = localEntries.map(localEntry => {
          return {
            ...localEntry,
            tags: JSON.parse(localEntry.tags),
            time: parseInt(localEntry.time),
            emotion: parseInt(localEntry.emotion),
            vote: parseInt(localEntry.vote),
            // emotions:
            //   localEntry.emotions === '' ? [] : JSON.parse(localEntry.emotions),
            // votes: localEntry.votes === '' ? [] : JSON.parse(localEntry.votes),
            title: localEntry.title,
            origins: {
              entry: {
                time: parseInt(localEntry.bodyModifiedAt),
                source: localEntry.bodyModifiedSource,
              },
              title: {
                time: parseInt(localEntry.titleModifiedAt),
                source: localEntry.titleModifiedSource,
              },
            },
            events: JSON.parse(localEntry.events),
            entry: localEntry.body,
            showAsYesterday:
              parseInt(localEntry.showAsYesterday) === 1 ? true : false,
            generated: parseInt(localEntry.generated) === 0 ? false : true,
          };
        });
        console.log({updatedEntries});
        setEntries(updatedEntries);
        setLoadingEntries(false);
      } catch (e) {
        console.error(e);
      }
    };
    const refreshMemories = async () => {
      try {
        console.log('LOADING MEMORIES DATA');
        const updatedMemories = await getMemories();
        // if (updatedMemories === undefined)
        console.log({updatedMemories});
        setMemories(updatedMemories);
        // setEntries(updatedEntries);
        // setLoadingEntries(false);
      } catch (e) {
        console.error('initial memory load', e);
      }
    };
    if (onBoarding === false) {
      setLoadingEntries(true);
      getEntries();
      refreshMemories();
      console.log({
        calendars: useSettingsHooks.getString('settings.calendars'),
      });
      try {
        NativeModules.Location.setCalendarIdentifiers(
          JSON.parse(useSettingsHooks.getString('settings.calendars')),
        );
      } catch (E) {
        console.error(E);
      }
    } else {
      setLoadingEntries(false);
    }
  }, []);

  const [loadingMessage, setLoadingMessage] = useState('');
  const [memoryLoadingMessage, setMemoryLoadingMessage] =
    useState('Not Needed');
  const [memoryLoadingState, setMemoryLoadingState] = useState(false);
  const [storyLoadingMessage, setStoryLoadingMessage] = useState('Busy');

  const CounterEvents = new NativeEventEmitter(NativeModules.Location);

  const getPermissionsAndData = async ({date, start, end}) => {
    const onboarding = useSettingsHooks.getBoolean('onboarding');
    if (onboarding === false) {
      // setGeneratingEntry(true);
    }

    console.log('Get Permissions and Data');
    // setGettingData(true);
    // setLoading(true);
    //DAY
    var events = [];
    var locations = [];
    var photos = [];
    // GET CALENDAR EVENTS
    // let startOfUnixTime = moment(date).startOf('day').unix();

    // let endOfUnixTime = moment(date).endOf('day').unix();
    let endOfUnixTime, startOfUnixTime;
    if (date !== undefined) {
      endOfUnixTime = new Date(date);
      endOfUnixTime.setHours(
        useSettingsHooks.getNumber('settings.createEntryTime'),
      );
      endOfUnixTime.setMinutes(0);
      endOfUnixTime.setSeconds(0);
      endOfUnixTime.setMilliseconds(0);
      startOfUnixTime = new Date(endOfUnixTime.getTime());
      startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
      // startOfUnixTime.setHours(startOfUnixTime.getHours() - 1);
    } else {
      endOfUnixTime = end;
      startOfUnixTime = start;
    }
    console.log('endOfUnixTime', endOfUnixTime.toLocaleString());
    endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
    startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);

    Location.setDateRange(startOfUnixTime, endOfUnixTime);
    try {
      console.log('events', {startOfUnixTime, endOfUnixTime});
      setLoadingMessage('Getting Calendar Events');
      console.log('Getting Calendar Events');
      if (onboarding === false) {
        events = await Location.getCalendarEvents(
          startOfUnixTime,
          endOfUnixTime,
        );
        console.log({events});
        events = events.filter(event => parseInt(event.end) <= endOfUnixTime);
        console.log(
          events.map(event =>
            new Date(parseInt(event.end) * 1000).toLocaleString(),
          ),
        );
        console.log(new Date(endOfUnixTime * 1000).toLocaleString());
      } else {
        await Location.enableCalendarPermissions();
      }
    } catch (e) {
      if (e.message === 'DENIED') {
        console.error('GIVE PERMISSION TO APP FOR CALENDAR USAGE');
      } else {
        console.error(e);
      }
    }
    console.log('locations');
    setLoadingMessage('Getting Location Events');

    // GET LOCATIONS
    if (onboarding === false) {
      retrieveSpecificData(
        startOfUnixTime * 1000,
        endOfUnixTime * 1000,
        res => {
          (locations = res.map(obj => {
            return {
              description: obj.description.split(',')[0],
              time: obj.date,
              lat: obj.lat,
              long: obj.lon,
            };
          })),
            console.log(locations);
        },
      );
    }

    //GET PHOTOS
    console.log('photos');
    setLoadingMessage('Getting Photo Events');
    var photoLength = 0;
    var photoIndex = 0;

    CounterEvents.removeAllListeners('photoCount');
    CounterEvents.addListener('photoCount', res => {
      console.log(`photoCount ${new Date().toISOString()}`, res);
      photoLength = res;
    });
    CounterEvents.removeAllListeners('photoChange');
    CounterEvents.addListener('photoChange', res => {
      console.log(`photoChange ${new Date().toISOString()}`, res);
      photoIndex = res;
      setLoadingMessage(`Getting Photo Events - ${photoIndex}/${photoLength}`);
    });

    var includeDownloadedPhotosCheck =
      useSettingsHooks.getBoolean('settings.includeDownloadedPhotos') || false;

    try {
      if (onboarding === false) {
        photos = await Location.getPhotosFromNative(
          !includeDownloadedPhotosCheck,
        );

        console.log({photos});
        console.log({includeDownloadedPhotosCheck});

        if (includeDownloadedPhotosCheck !== true) {
          setLoadingMessage('Filtering out downloaded Photos');
          photos = photos.filter(photo => photo.lat !== 'null');
        }
      } else {
        Location.getPhotosAccess();
        await new Promise((resolve, reject) => {
          Alert.alert(
            'Send Photos for Analysis',
            'Photos taken from the camera will be sent to Amazon to be analyzed. We WILL NOT store these photos.\nDo you wish to proceed?',

            [
              {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                  // setPhotoAnalysis(true);
                  useSettingsHooks.set('settings.photoAnalysis', true);
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  // setPhotoAnalysis(false);
                  useSettingsHooks.set('settings.photoAnalysis', false);
                  resolve(false);
                },
              },
            ],
          );
        });

        await new Promise((resolve, reject) => {
          Alert.alert(
            'Include Other Photos',
            'Photos downloaded or from Third Party apps WILL be included in your entries.\nDo you wish to proceed? Select no to exclude these photos.',

            [
              {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                  // setIncludeDownloadedPhotos(true);
                  useSettingsHooks.set(
                    'settings.includeDownloadedPhotos',
                    true,
                  );
                  includeDownloadedPhotosCheck = true;
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  // setIncludeDownloadedPhotos(false);
                  useSettingsHooks.set(
                    'settings.includeDownloadedPhotos',
                    false,
                  );
                  includeDownloadedPhotosCheck = false;
                  resolve(false);
                },
              },
            ],
          );
        });
      }
    } catch (e) {
      console.error({e});
    }
    // console.log({photos});

    // NOTIFICATIONS
    await notifee.requestPermission();
    CounterEvents.removeAllListeners('photoChange');
    CounterEvents.removeAllListeners('photoCount');
    photos = photos.map(photo => {
      return {
        ...photo,
        long: parseFloat(photo.lon),
        lat: parseFloat(photo.lat),
      };
    });
    //RETURNS
    return {
      photos,
      locations,
      events,
    };
  };

  const readyToGenerateMemory = async ({start, end}) => {
    setMemoryLoadingMessage('Generating');
    setMemoryLoadingState(true);
    const eventData = await getPermissionsAndData({start, end});
    console.log('Event Data For Memory Generation', eventData);
    const newMemories = await generateMemories({
      data: eventData,
      // date: date.getTime(),
    });
    const updatedMemories = await getMemories();
    setMemories(updatedMemories);
    useSettingsHooks.set('settings.lastMemoryCheckTime', Date.now());
  };

  const checkIfReadyToGenerate = async () => {
    const date = new Date(Date.now());
    const lastMemoryCheckTime = new Date(
      useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
      // 0,
    );

    //SAME DAY

    /*DIFFERENT DAYS
    if did past 22 night before and time is now above 8{

    } else {

    }
      */
    // if (lastMemoryCheckTime.toDateString() !== date.toDateString()) {
    // } else {
    //   if (lastMemoryCheckTime.getHours() < 8 && date.getHours() >= 8) {
    //     // 0-8
    //   } else if (lastMemoryCheckTime.getHours() < 15 && date.getHours() >= 15) {
    //     //15-22
    //   } else if (lastMemoryCheckTime.getHours() < 22 && date.getHours() >= 22) {
    //   }
    // }

    const checkIfMemoryReadyToGenerate = async () => {
      setMemoryLoadingMessage('Checking');
      /*
      MEMORY GENERATION
    */
      console.log('Check if memory can be generated');
      console.log(date.getHours());
      console.log(lastMemoryCheckTime.getHours());
      console.log(lastMemoryCheckTime.toDateString());
      console.log(date.getHours());
      //If current time between 22:00:00 and 07:59:59
      if (date.getHours() >= 22 || date.getHours() < 8) {
        // to generate 15-21:59
        //check if can
        console.log('current time between 10:00PM and 08:00AM');

        console.log(lastMemoryCheckTime.toLocaleString());
        const yesterday = new Date(date.getTime());
        yesterday.setDate(yesterday.getDate() - 1);
        if (
          (date.getHours() >= 22 &&
            ((lastMemoryCheckTime.getHours() < 22 &&
              lastMemoryCheckTime.toDateString() === date.toDateString()) ||
              lastMemoryCheckTime.toDateString() !== date.toDateString())) ||
          (date.getHours() < 8 &&
            ((lastMemoryCheckTime.getHours() < 22 &&
              lastMemoryCheckTime.toDateString() ===
                yesterday.toDateString()) ||
              (lastMemoryCheckTime.toDateString() !== date.toDateString() &&
                lastMemoryCheckTime.toDateString() !==
                  yesterday.toDateString())))
        ) {
          console.log('generate 15-21:59');
          const start = new Date(Date.now());
          if (date.getHours() >= 0 && date.getHours() < 22) {
            start.setDate(start.getDate() - 1);
          }
          start.setHours(15);
          start.setMinutes(0);
          start.setSeconds(0);
          start.setMilliseconds(0);
          const end = new Date(start.getTime());
          end.setHours(22);
          end.setMilliseconds(end.getMilliseconds() - 1);
          await readyToGenerateMemory({start, end});
        }
      }
      //If current time between 08:00:00 and 14:59:59
      else if (
        date.getHours() < 15 &&
        ((lastMemoryCheckTime.getHours() < 8 &&
          lastMemoryCheckTime.toDateString() === date.toDateString()) ||
          lastMemoryCheckTime.toDateString() !== date.toDateString())
      ) {
        // to generate 22-7:59
        console.log('generate 22-7:59');
        const start = new Date(Date.now());
        start.setHours(22);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        const end = new Date(start.getTime());
        start.setDate(start.getDate() - 1);
        end.setHours(8);
        end.setMilliseconds(end.getMilliseconds() - 1);
        await readyToGenerateMemory({start, end});
      }
      //If current time between 15:00:00 and 21:59:59
      else if (
        date.getHours() >= 15 &&
        ((lastMemoryCheckTime.getHours() < 15 &&
          lastMemoryCheckTime.toDateString() === date.toDateString()) ||
          lastMemoryCheckTime.toDateString() !== date.toDateString())
      ) {
        // to generate 8-14:59
        console.log('generate 8-14:59');
        const start = new Date(Date.now());
        start.setHours(8);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        const end = new Date(start.getTime());
        end.setHours(15);
        end.setMilliseconds(end.getMilliseconds() - 1);
        await readyToGenerateMemory({start, end});
      } else {
        console.log('Not Ready To Generate Memory');
      }
      console.log('Finished checking If Memory is Ready');
      setMemoryLoadingMessage('Finished');
      setMemoryLoadingState(false);
    };

    const checkIfStoryReadyToGenerate = async () => {
      setStoryLoadingMessage('Checking');
      if (entries.length > 0) {
        /*
          If today is >8AM, check if last entry is before 8AM today.
          If today is <8AM, check if last entry is before 8AM previous day.
          If today is >8PM, check if last entry is before 8PM today
          if today is <8PM, check if last is before 8PM the previous day. 


        */
        const entriesTest = entries.map(entry =>
          new Date(entry.time).toLocaleString(),
        );
        console.log(entriesTest);

        const lastEntry = entries.sort((a, b) => b.time - a.time)[0];
        const lastEntryDate = new Date(lastEntry.time);
        const hourThreshold = useSettingsHooks.getNumber(
          'settings.createEntryTime',
        );
        const todayHour = new Date(Date.now()).getHours();
        const todayTimeThreshold = new Date(Date.now());
        todayTimeThreshold.setHours(hourThreshold);
        todayTimeThreshold.setMinutes(0);
        todayTimeThreshold.setMinutes(0);
        todayTimeThreshold.setMinutes(0);
        console.log(hourThreshold);
        console.log(lastEntryDate.toLocaleString());

        const yesterdayTimeThreshold = new Date(todayTimeThreshold.getTime());
        yesterdayTimeThreshold.setDate(yesterdayTimeThreshold.getDate() - 1);
        if (
          (todayHour >=
            useSettingsHooks.getNumber('settings.createEntryTime') &&
            lastEntryDate.getTime() < todayTimeThreshold.getTime()) ||
          (todayHour < useSettingsHooks.getNumber('settings.createEntryTime') &&
            lastEntryDate.getTime() < yesterdayTimeThreshold.getTime())
        ) {
          console.log('Ready To Generate Story');
          setStoryLoadingMessage('Generating');
          const newEntry = await generateEntry({
            memories: await getMemories(),
            showAsYesterday:
              useSettingsHooks.getNumber('settings.createEntryTime') === 8,
          });
          setEntries([newEntry, ...entries]);
        } else {
          console.log('Not Ready To Generate Story');
        }
      } else {
        if (
          useSettingsHooks.getNumber('settings.onboardingTime') < Date.now()
        ) {
          console.log('Time to generate entry');
          // setFirstEntryGenerated(true);
          console.log('Ready abc123');
          setStoryLoadingMessage('Generating');
          const newEntry = await generateEntry({
            memories: await getMemories(),
            showAsYesterday:
              useSettingsHooks.getNumber('settings.createEntryTime') === 8,
          });
          setEntries([newEntry, ...entries]);
          onCreateTriggerNotification({
            first: false,
            createEntryTime: useSettingsHooks.getNumber(
              'settings.createEntryTime',
            ),
            time: null,
          });
        } else {
          console.log('Not Ready');
        }
      }
      setStoryLoadingMessage('Finished');
    };
    console.log(memories.length);

    await checkIfMemoryReadyToGenerate();
    //Create Local Notifications to go off at 08:00, 15:00 && 22:0
    try {
      onCreateTriggerReminder({remindTime: 8});
      onCreateTriggerReminder({remindTime: 15});
      onCreateTriggerReminder({remindTime: 22});
    } catch (e) {
      console.error({e});
    }
    await checkIfStoryReadyToGenerate();
  };

  const [clickedNotification, setClickedNotification] = useState(null);
  useEffect(() => {
    if (
      ((!loadingEntries && clickedNotification === null) ||
        (!loadingEntries && clickedNotification === true)) &&
      !useSettingsHooks.getBoolean('onboarding')
    ) {
      console.log({loadingEntries, clickedNotification});
      checkIfReadyToGenerate();
      if (clickedNotification === true) {
        setClickedNotification(false);
      }
    }
  }, [loadingEntries, clickedNotification]);

  var inital = null;
  const bootStrap = async () => {
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      console.log(
        'Notification caused application to open',
        initialNotification.notification,
      );
      console.log(
        'Press action used to open the app',
        initialNotification.pressAction,
      );
      inital = true;
    }
  };

  useEffect(() => {
    bootStrap();
    return notifee.onForegroundEvent(({type, detail}) => {
      console.log('foreground', {type, detail});
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          if (inital !== true) {
            setClickedNotification(true);
          } else {
            inital = false;
          }

          // checkIfReadyToGenerate();
          break;
        case 7:
          break;
      }
    });
  }, []);

  // useEffect(() => {
  //   const getPhotos = async () => {
  //     var startOfUnixTime = new Date(Date.now());
  //     startOfUnixTime.setDate(startOfUnixTime.getDate() - 10);
  //     var endOfUnixTime = new Date(Date.now());
  //     endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
  //     startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);
  //     Location.setDateRange(startOfUnixTime, endOfUnixTime);
  //     var photos = [];
  //     console.log('getting photos');
  //     photos = await Location.getPhotosFromNative(false);
  //     console.log('ABC THESE ARE MY PHOTOS', {photos});
  //     console.log('found photos');

  //     return photos || [];
  //   };
  //   getPhotos();
  // }, []);

  useEffect(() => {
    console.log({entries});
  }, [entries]);
  const {width, height} = Dimensions.get('window');
  console.log({width, height});

  // const CounterEvents = new NativeEventEmitter(NativeModules.Location);
  CounterEvents.removeAllListeners('onCalendar');
  CounterEvents.addListener('onCalendar', res => {
    console.log(`TEST ${new Date().toISOString()}`, res);
  });

  NativeModules.Location.enablePermissions()
    .then(res => {
      CounterEvents.removeAllListeners('locationChange');
      CounterEvents.addListener('locationChange', res => {
        console.log('locationChange event', res);
        createVisitsTable();
        insertData(
          Math.floor(parseInt(res.arrivalTime)) * 1000 || Date.now(),
          res.lat,
          res.lon,
          res.description,
        );
        retrieveData('Visits', steps => {
          console.log({steps});
        });
      });
    })
    .catch(e => console.log(e.message, e.code));
  const navTheme = DefaultTheme;
  navTheme.colors.background = '#FBFBFB';

  notifee.setBadgeCount(0);

  // console.log('main navigator', entries, loadingEntries);

  const [firstEntryGenerated, setFirstEntryGenerated] = useState(false);

  const contextValues = {
    entries,
    setEntries,
    memories,
    setMemories,
    loadingEntries,
    onBoarding,
    setOnBoarding,
    devMode,
    setDevMode,
    firstEntryGenerated,
    setFirstEntryGenerated,
    storyLoadingMessage,
    setStoryLoadingMessage,
    checkIfReadyToGenerate,
    readyToGenerateMemory,
    memoryLoadingMessage,
    setMemoryLoadingMessage,
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="AnimatedLaunchScreen"
        screenOptions={{headerShown: false}}>
        <RootStack.Screen
          name="AnimatedLaunchScreen"
          component={AnimatedLaunchScreen}
        />

        <RootStack.Screen
          name="MainApp"
          children={() => (
            <SafeAreaView
              edges={['top', 'left', 'right']}
              style={styles.safeArea}>
              {isAuthenticated ? (
                <AppContext.Provider value={contextValues}>
                  {onBoarding === true || firstEntryGenerated === true ? (
                    <OnboardingView />
                  ) : (
                    <AppNavigator />
                  )}
                </AppContext.Provider>
              ) : (
                <AuthNavigator />
              )}
            </SafeAreaView>
          )}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
});

export default MainNavigator;
