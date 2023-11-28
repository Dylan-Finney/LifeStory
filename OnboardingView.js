import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  StyleSheet,
  Image,
  Button,
  NativeEventEmitter,
  Animated,
  RefreshControl,
  FlatList,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Svg, {Defs, Rect, LinearGradient, Stop} from 'react-native-svg';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import FirstEntryIcon from './src/assets/first-entry.svg';
import AngerIcon from './src/assets/emotions/Anger.svg';
import FrownIcon from './src/assets/emotions/Frown.svg';
import GrinIcon from './src/assets/emotions/Grin.svg';
import NeutralIcon from './src/assets/emotions/Neutral.svg';
import SmileIcon from './src/assets/emotions/Smile.svg';

import notifee, {
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

// import AMImage from './src/assets/am_image.svg';
// import AMImage from './src/assets/AMImage.png';

import moment from 'moment';
import AppContext from './src/contexts/AppContext';
import useDatabaseHooks from './src/utils/hooks/useDatabaseHooks';
import Location from './src/utils/native-modules/NativeFuncs';

import useSettingsHooks from './src/utils/hooks/useSettingsHooks';
import Config from 'react-native-config';
import {theme} from './src/theme/styling';
import Onboarding from './src/components/Onboarding';
import * as RNLocalize from 'react-native-localize';
import {NativeModules} from 'react-native';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './src/utils/metrics';

import DatePicker from 'react-native-date-picker';

import onCreateTriggerNotification from './src/utils/createNotification';

import CalendarEventIcon from './src/assets/calendar-event.svg';

import LocationEventIcon from './src/assets/event-location.svg';
import PhotoEventIcon from './src/assets/event-photo.svg';

import OnboardingButton from './src/components/OnboardingButton';
import OnboardingBackground from './src/components/OnboardingBackground';
import onCreateTriggerReminder from './src/utils/createOpenReminder';
import SingleMapMemo from './src/components/SingleMapMemo';
import generateMemories from './src/utils/generateMemories';
import generateEntry from './src/utils/generateEntry';
import {ActionSheetScreens, EventTypes} from './src/utils/Enums';
import getMemories from './src/utils/getMemories';
import NewModalItem from './src/components/ActionSheet/NewModalItem';

const {RNShare} = NativeModules;
const {Configuration, OpenAIApi} = require('openai');
// import {Rekognition} from 'aws-sdk/'
// var AWS = require('aws-sdk/dist/aws-sdk-react-native');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: Config.AWS_ACCESS_KEY,
  secretAccessKey: Config.AWS_SECRET_KEY,
  region: Config.AWS_REGION,
});
const Rekognition = new AWS.Rekognition();
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const {
  retrieveSpecificData,
  saveEntryData,
  updateEntryData,
  createEntryTable,
  createMemoriesTable,
  saveMemoryData,
  updateMemoryData,
  deleteMemoryData,
} = useDatabaseHooks();
export default OnboardingView = ({route, navigation}) => {
  // const {
  //   onBoarding,
  //   setOnBoarding,
  //   photoAnalysis,
  //   includeDownloadedPhotos,
  //   setIncludeDownloadedPhotos,
  //   setPhotoAnalysis,
  //   locationAliases,
  //   createEntryTime,
  //   language,
  //   globalWritingSettings,
  //   onboardingTime,
  // } = useSettingsHooks();
  const CounterEvents = new NativeEventEmitter(NativeModules.Location);

  const baseEntry = {
    tags: [],
    time: Date.now(),
    emotion: -1,
    emotions: [
      // {
      //   startIndex: 0,
      //   endIndex: 5,
      //   emotion: 0,
      //   time: 1689856646,
      // },
    ],
    votes: [
      // {
      //   startIndex: 0,
      //   endIndex: 5,
      //   vote: 0,
      //   time: 1689856646,
      // },
    ],
    title: '',
    origins: {
      entry: {
        time: 0,
        source: 'manual',
      },
      title: {
        time: 0,
        source: 'manual',
      },
    },
    generated: false,
    entry: '',
  };
  const {
    loadingEntries,
    entries,
    setEntries,
    onBoarding,
    setOnBoarding,
    memories,
    setMemories,
    devMode,
    firstEntryGenerated,
    setFirstEntryGenerated,
    checkIfReadyToGenerate,
  } = useContext(AppContext);
  // console.log({entries, memories});

  const [loading, setLoading] = useState(false);

  const [generatingEntry, setGeneratingEntry] = useState(false);
  const [clickedNotification, setClickedNotification] = useState(null);
  const rangeViewValues = {
    DAYS: 0,
    WEEKS: 1,
    MONTHS: 2,
  };

  const [loadingMessage, setLoadingMessage] = useState('');
  const [memoryLoadingMessage, setMemoryLoadingMessage] =
    useState('Not Needed');
  const [memoryLoadingState, setMemoryLoadingState] = useState(false);
  const [storyLoadingMessage, setStoryLoadingMessage] = useState('Busy');

  // const [onBoarding, setOnBoarding] = useState(
  //   useSettingsHooks.getBoolean('onboarding'),
  // );

  const [refreshedFromPull, setRefreshedFromPull] = useState(false);

  console.log('useSettingsHooks', useSettingsHooks.getBoolean('onboarding'));
  console.log('onboarding', onBoarding);

  const getPermissionsAndData = async ({date, start, end}) => {
    const onboarding = useSettingsHooks.getBoolean('onboarding');
    if (onboarding === false) {
      setGeneratingEntry(true);
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

  const generateEntry2 = async ({memories}) => {
    console.log(memories);
  };

  const createManualEntry = date => {
    setGeneratingEntry(true);
    var entriesCopy = [...entries];
    var newEntry = {
      ...baseEntry,
      time: date,
      events: [],
      entry: '',
      title: 'New Entry',
      generated: false,
    };
    entriesCopy.push(newEntry);
    try {
      createEntryTable();
      saveEntryData({
        tags: '',
        title: newEntry.title,
        time: newEntry.time,
        emotion: -1,
        emotions: '',
        votes: '',
        titleModifiedAt: Date.now(),
        titleModifiedSource: 'manual',
        bodyModifiedAt: Date.now(),
        bodyModifiedSource: 'manual',
        events: '',
        body: newEntry.entry,
        generated: 0,
      });
    } catch (e) {
      console.error(e);
    }
    setEntries(entriesCopy);
    setGeneratingEntry(false);
  };

  const getNextMemoryTime = () => {
    // const now = new Date(Date.now());
    const lastMemoryCheckTime = new Date(
      useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
      // 0,
    );
    var timeStr = '';
    if (
      lastMemoryCheckTime.getHours() >= 22 ||
      lastMemoryCheckTime.getHours() < 8
    ) {
      if (lastMemoryCheckTime.getHours() >= 22) {
        lastMemoryCheckTime.setDate(lastMemoryCheckTime.getDate() + 1);
      }
      lastMemoryCheckTime.setHours(8);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    } else if (lastMemoryCheckTime.getHours() < 15) {
      lastMemoryCheckTime.setHours(15);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    } else {
      lastMemoryCheckTime.setHours(22);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    }
    return timeStr;
  };

  const getEventIcon = type => {
    switch (type) {
      case EventTypes.LOCATION:
        return <LocationEventIcon />;
      case EventTypes.PHOTO:
        return <PhotoEventIcon />;
      case EventTypes.CALENDAR_EVENT:
        return <CalendarEventIcon />;
    }
  };

  console.log(Dimensions.get('window'));

  // const checkIfReadyToGenerate = async () => {
  //   const date = new Date(Date.now());
  //   const lastMemoryCheckTime = new Date(
  //     useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
  //     // 0,
  //   );

  //   //SAME DAY

  //   /*DIFFERENT DAYS
  //   if did past 22 night before and time is now above 8{

  //   } else {

  //   }
  //     */
  //   // if (lastMemoryCheckTime.toDateString() !== date.toDateString()) {
  //   // } else {
  //   //   if (lastMemoryCheckTime.getHours() < 8 && date.getHours() >= 8) {
  //   //     // 0-8
  //   //   } else if (lastMemoryCheckTime.getHours() < 15 && date.getHours() >= 15) {
  //   //     //15-22
  //   //   } else if (lastMemoryCheckTime.getHours() < 22 && date.getHours() >= 22) {
  //   //   }
  //   // }

  //   const readyToGenerateMemory = async ({start, end}) => {
  //     setMemoryLoadingMessage('Generating');
  //     setMemoryLoadingState(true);
  //     const eventData = await getPermissionsAndData({start, end});
  //     console.log('Event Data For Memory Generation', eventData);
  //     const newMemories = await generateMemories({
  //       data: eventData,
  //       date: date.getTime(),
  //     });
  //     const updatedMemories = await getMemories();
  //     setMemories(updatedMemories);
  //     useSettingsHooks.set('settings.lastMemoryCheckTime', Date.now());
  //   };

  //   const checkIfMemoryReadyToGenerate = async () => {
  //     setMemoryLoadingMessage('Checking');
  //     /*
  //     MEMORY GENERATION
  //   */
  //     console.log('Check if memory can be generated');
  //     console.log(date.getHours());
  //     console.log(lastMemoryCheckTime.getHours());
  //     console.log(lastMemoryCheckTime.toDateString());
  //     console.log(date.getHours());
  //     //If current time between 22:00:00 and 07:59:59
  //     if (date.getHours() >= 22 || date.getHours() < 8) {
  //       // to generate 15-21:59
  //       //check if can
  //       console.log('current time between 10:00PM and 08:00AM');

  //       console.log(lastMemoryCheckTime.toLocaleString());
  //       const yesterday = new Date(date.getTime());
  //       yesterday.setDate(yesterday.getDate() - 1);
  //       if (
  //         (date.getHours() >= 22 &&
  //           ((lastMemoryCheckTime.getHours() < 22 &&
  //             lastMemoryCheckTime.toDateString() === date.toDateString()) ||
  //             lastMemoryCheckTime.toDateString() !== date.toDateString())) ||
  //         (date.getHours() < 8 &&
  //           ((lastMemoryCheckTime.getHours() < 22 &&
  //             lastMemoryCheckTime.toDateString() ===
  //               yesterday.toDateString()) ||
  //             (lastMemoryCheckTime.toDateString() !== date.toDateString() &&
  //               lastMemoryCheckTime.toDateString() !==
  //                 yesterday.toDateString())))
  //       ) {
  //         console.log('generate 15-21:59');
  //         const start = new Date(Date.now());
  //         if (date.getHours() >= 0 && date.getHours() < 22) {
  //           start.setDate(start.getDate() - 1);
  //         }
  //         start.setHours(15);
  //         start.setMinutes(0);
  //         start.setSeconds(0);
  //         start.setMilliseconds(0);
  //         const end = new Date(start.getTime());
  //         end.setHours(22);
  //         end.setMilliseconds(end.getMilliseconds() - 1);
  //         await readyToGenerateMemory({start, end});
  //       }
  //     }
  //     //If current time between 08:00:00 and 14:59:59
  //     else if (
  //       date.getHours() < 15 &&
  //       ((lastMemoryCheckTime.getHours() < 8 &&
  //         lastMemoryCheckTime.toDateString() === date.toDateString()) ||
  //         lastMemoryCheckTime.toDateString() !== date.toDateString())
  //     ) {
  //       // to generate 22-7:59
  //       console.log('generate 22-7:59');
  //       const start = new Date(Date.now());
  //       start.setHours(22);
  //       start.setMinutes(0);
  //       start.setSeconds(0);
  //       start.setMilliseconds(0);
  //       const end = new Date(start.getTime());
  //       start.setDate(start.getDate() - 1);
  //       end.setHours(8);
  //       end.setMilliseconds(end.getMilliseconds() - 1);
  //       await readyToGenerateMemory({start, end});
  //     }
  //     //If current time between 15:00:00 and 21:59:59
  //     else if (
  //       date.getHours() >= 15 &&
  //       ((lastMemoryCheckTime.getHours() < 15 &&
  //         lastMemoryCheckTime.toDateString() === date.toDateString()) ||
  //         lastMemoryCheckTime.toDateString() !== date.toDateString())
  //     ) {
  //       // to generate 8-14:59
  //       console.log('generate 8-14:59');
  //       const start = new Date(Date.now());
  //       start.setHours(8);
  //       start.setMinutes(0);
  //       start.setSeconds(0);
  //       start.setMilliseconds(0);
  //       const end = new Date(start.getTime());
  //       end.setHours(15);
  //       end.setMilliseconds(end.getMilliseconds() - 1);
  //       await readyToGenerateMemory({start, end});
  //     } else {
  //       console.log('Not Ready To Generate Memory');
  //     }
  //     console.log('Finished checking If Memory is Ready');
  //     setMemoryLoadingMessage('Finished');
  //     setMemoryLoadingState(false);
  //   };

  //   const checkIfStoryReadyToGenerate = async () => {
  //     setStoryLoadingMessage('Checking');
  //     if (entries.length > 0) {
  //       /*
  //         If today is >8AM, check if last entry is before 8AM today.
  //         If today is <8AM, check if last entry is before 8AM previous day.
  //         If today is >8PM, check if last entry is before 8PM today
  //         if today is <8PM, check if last is before 8PM the previous day.

  //       */
  //       const entriesTest = entries.map(entry =>
  //         new Date(entry.time).toLocaleString(),
  //       );
  //       console.log(entriesTest);

  //       const lastEntry = entries.sort((a, b) => b.time - a.time)[0];
  //       const lastEntryDate = new Date(lastEntry.time);
  //       const hourThreshold = useSettingsHooks.getNumber(
  //         'settings.createEntryTime',
  //       );
  //       const todayHour = new Date(Date.now()).getHours();
  //       const todayTimeThreshold = new Date(Date.now());
  //       todayTimeThreshold.setHours(hourThreshold);
  //       todayTimeThreshold.setMinutes(0);
  //       todayTimeThreshold.setMinutes(0);
  //       todayTimeThreshold.setMinutes(0);
  //       console.log(hourThreshold);
  //       console.log(lastEntryDate.toLocaleString());

  //       const yesterdayTimeThreshold = new Date(todayTimeThreshold.getTime());
  //       yesterdayTimeThreshold.setDate(yesterdayTimeThreshold.getDate() - 1);
  //       if (
  //         (todayHour >=
  //           useSettingsHooks.getNumber('settings.createEntryTime') &&
  //           lastEntryDate.getTime() < todayTimeThreshold.getTime()) ||
  //         (todayHour < useSettingsHooks.getNumber('settings.createEntryTime') &&
  //           lastEntryDate.getTime() < yesterdayTimeThreshold.getTime())
  //       ) {
  //         console.log('Ready To Generate Story');
  //         setStoryLoadingMessage('Generating');
  //         const newEntry = await generateEntry({memories});
  //         setEntries([newEntry, ...entries]);
  //       } else {
  //         console.log('Not Ready To Generate Story');
  //       }
  //     } else {
  //       if (
  //         useSettingsHooks.getNumber('settings.onboardingTime') < Date.now()
  //       ) {
  //         console.log('Time to generate entry');
  //         // setFirstEntryGenerated(true);
  //         console.log('Ready abc123');
  //         setStoryLoadingMessage('Generating');
  //         const newEntry = await generateEntry({memories});
  //         setEntries([newEntry, ...entries]);
  //         onCreateTriggerNotification({
  //           first: false,
  //           createEntryTime: useSettingsHooks.getNumber(
  //             'settings.createEntryTime',
  //           ),
  //           time: null,
  //         });
  //       } else {
  //         console.log('Not Ready');
  //       }
  //     }
  //     setStoryLoadingMessage('Finished');
  //   };
  //   console.log(memories.length);

  //   await checkIfMemoryReadyToGenerate();
  //   //Create Local Notifications to go off at 08:00, 15:00 && 22:0
  //   try {
  //     // onCreateTriggerReminder({remindTime: 8});
  //     // onCreateTriggerReminder({remindTime: 15});
  //     // onCreateTriggerReminder({remindTime: 22});
  //   } catch (e) {
  //     console.error({e});
  //   }
  //   await checkIfStoryReadyToGenerate();
  // };

  useEffect(() => {
    console.log({loadingEntries});
  }, [loadingEntries]);
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
  const H_MAX_HEIGHT = 150;
  const H_MIN_HEIGHT = 0;
  const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;

  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const headerNew = createRef();
  const scrollRef = createRef();
  // const headerScrollHeight = scrollOffsetY.interpolate({
  //   inputRange: [0, H_SCROLL_DISTANCE],
  //   outputRange: [H_MAX_HEIGHT * 2, H_MIN_HEIGHT],
  //   extrapolate: 'clamp',
  // });

  const gifScale = scrollOffsetY.interpolate({
    inputRange: [-100, 0],
    outputRange: [75, 0],
    extrapolate: 'clamp',
  });

  function findMatches(regex, str, matches = []) {
    const res = regex.exec(str);
    res && matches.push(res) && findMatches(regex, str, matches);
    return matches;
  }

  gifScale.addListener(val => {
    console.log({val, refreshedFromPull});
    if (val.value > 70 && refreshedFromPull === false) {
      console.log('PIKACHU');
      checkIfReadyToGenerate();
      setRefreshedFromPull(true);
    } else if (val.value === 0 && refreshedFromPull === true) {
      setRefreshedFromPull(false);
    }
  });

  // const headerScrollHeight = scrollOffsetY.interpolate({
  //   inputRange: [0, H_SCROLL_DISTANCE],
  //   outputRange: [H_MAX_HEIGHT * 2, H_MIN_HEIGHT],
  //   extrapolate: 'clamp',
  // });
  const [showNewHeader, setShowNewHeader] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [entryHeaderList, setEntryHeaderList] = useState([]);
  const [entryHeaderIndex, setEntryHeaderIndex] = useState(0);
  // scrollOffsetY.removeAllListeners();
  // scrollOffsetY.addListener(val => {
  //   // if (val.value <= 0) {
  //   //   setEntryHeaderIndex(0);
  //   // } else {
  //   //   for (var i = 0; i < entryHeaderList.length; i++) {
  //   //     if (entryHeaderList[i].y > val.value) {
  //   //       setEntryHeaderIndex(i - 1);
  //   //       break;
  //   //     } else {
  //   //       if (i === entryHeaderList.length - 1) {
  //   //         setEntryHeaderIndex(i);
  //   //       }
  //   //     }
  //   //   }
  //   // }
  //   console.log(val);
  //   console.log(gifScale);
  //   // scrollRef.current;
  //   // console.log(scrollRef.current);

  //   // console.log({val, entryHeaderList});
  //   // if (val.value > H_SCROLL_DISTANCE) {
  //   //   setShowNewHeader(true);
  //   // } else {
  //   //   setShowNewHeader(false);
  //   // }
  // });
  // const color = scrollOffsetY.interpolate({
  //   inputRange: [0, H_SCROLL_DISTANCE],
  //   outputRange: ['#06609E', 'white'],
  //   extrapolate: 'identity',
  // });
  // const rangeViewHeight = scrollOffsetY.interpolate({
  //   inputRange: [0, 100],
  //   outputRange: [75, 0],
  //   extrapolate: 'clamp',
  // });
  // const rangeViewPadding = scrollOffsetY.interpolate({
  //   inputRange: [0, 100],
  //   outputRange: [20, 0],
  //   extrapolate: 'clamp',
  // });
  // const headerHeight = scrollOffsetY.interpolate({
  //   inputRange: [100, 150],
  //   outputRange: [0, 100],
  //   extrapolate: 'clamp',
  // });
  // const headerPadding = scrollOffsetY.interpolate({
  //   inputRange: [100, 150],
  //   outputRange: [0, 10],
  //   extrapolate: 'clamp',
  // });
  // const footerHeight = scrollOffsetY.interpolate({
  //   inputRange: [0, 100],
  //   outputRange: [75, 0],
  //   extrapolate: 'clamp',
  // });

  // const floatingButtonBottom = scrollOffsetY.interpolate({
  //   inputRange: [0, 100],
  //   outputRange: [100, 25],
  //   extrapolate: 'clamp',
  // });

  const emotions = {
    NA: 0,
    HORRIBLE: 1,
    BAD: 2,
    NEUTRAL: 3,
    GOOD: 4,
    GREAT: 5,
  };

  const emotionAttributes = {
    BORDER: 0,
    BACKGROUND: 1,
    STROKE: 2,
  };

  const emotionToColor = ({emotion, need}) => {
    switch (emotion) {
      case emotions.HORRIBLE:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#E93535';
          case emotionAttributes.BACKGROUND:
            return '#FDEBEB';
          default:
            return 'black';
        }
      case emotions.BAD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#C839D4';
          case emotionAttributes.BACKGROUND:
            return '#F9EBFB';
          default:
            return 'black';
        }
      case emotions.NEUTRAL:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#6D6D6D';
          case emotionAttributes.BACKGROUND:
            return '#E7E7E7';
          default:
            return 'black';
        }
      case emotions.GOOD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#118ED1';
          case emotionAttributes.BACKGROUND:
            return '#E7F4FA';
          default:
            return 'black';
        }
      case emotions.GREAT:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#11A833';
          case emotionAttributes.BACKGROUND:
            return '#E7F6EB';
          default:
            return 'black';
        }
      default:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return 'black';
          case emotionAttributes.BACKGROUND:
            return 'black';
          default:
            return 'black';
        }
    }
  };

  const emotionToIcon = ({emotion, active, color}) => {
    const primaryColor =
      color === undefined
        ? active
          ? emotionToColor({
              emotion,
              need: emotionAttributes.STROKE,
            })
          : '#0b0b0b99'
        : color;
    switch (emotion) {
      case emotions.HORRIBLE:
        return <AngerIcon primaryColor={primaryColor} />;
      case emotions.BAD:
        return <FrownIcon primaryColor={primaryColor} />;
      case emotions.NEUTRAL:
        return <NeutralIcon primaryColor={primaryColor} />;
      case emotions.GOOD:
        return <SmileIcon primaryColor={primaryColor} />;
      case emotions.GREAT:
        return <GrinIcon primaryColor={primaryColor} />;
      default:
        return <></>;
    }
  };

  const emotionToString = emotion => {
    switch (emotion) {
      case emotions.HORRIBLE:
        return 'Bad';
      case emotions.BAD:
        return 'Sad';
      case emotions.NEUTRAL:
        return 'Neutral';
      case emotions.GOOD:
        return 'Glad';
      case emotions.GREAT:
        return 'Happy';

      default:
        return 'N/A';
    }
  };

  const ModalItem = ({icon, boldText, softText, onPress}) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <View style={{padding: 10, backgroundColor: 'gray'}}>{icon}</View>
        <Text>
          <Text style={{fontWeight: 600}}>{boldText}</Text> {softText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <OnboardingBackground />
      <Onboarding
        endOnboarding={() => {
          setOnBoarding(false);
          useSettingsHooks.set('onboarding', false);
          console.log('END ONBOARDING');
          try {
            // onCreateTriggerReminder({remindTime: 8});
            // onCreateTriggerReminder({remindTime: 15});
            // onCreateTriggerReminder({remindTime: 22});
          } catch (e) {
            console.error({e});
          }
          checkIfReadyToGenerate();
        }}
        generateEntry={generateEntry}
        getPermissionsAndData={getPermissionsAndData}
      />

      {firstEntryGenerated === true && (
        <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              paddingBottom: 200,
              // transform: 'translate(-50%, -50%)',
            }}>
            <FirstEntryIcon />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              // maxFontSizeMultiplier={1}
              allowFontScaling={false}
              style={{
                color: theme.onboarding.title,
                fontWeight: '700',
                fontSize: moderateScale(28),
                marginBottom: verticalScale(15),
                // marginTop: verticalScale(20),
              }}>
              Congratulations
            </Text>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={{
                color: theme.onboarding.text,
                fontWeight: '400',
                fontSize: moderateScale(16),
                marginBottom: verticalScale(50),
              }}>
              Your first story is ready for your reflections
            </Text>
            <OnboardingButton
              text={generatingEntry === true ? loadingMessage : 'See the story'}
              onPress={() => {
                setFirstEntryGenerated(false);
              }}
              disabled={generatingEntry}
            />
          </View>
        </View>
      )}
    </>
  );
};
