import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  // Modal,
} from 'react-native';

import Modal from 'react-native-modal';
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
import AIRewriteIcon from './src/assets/ai-rewrite-icon.svg';
import FirstEntryIcon from './src/assets/first-entry.svg';

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
import CreateEntryButton from './src/modules/entries/components/CreateEntryButton';
import {theme} from './src/theme/styling';
import Onboarding from './src/components/Onboarding';
import HomeTop from './src/components/HomeTop';
import HomeHeading from './src/components/HomeHeading';
import EntryList from './src/modules/entries/components/EntryList';
import * as RNLocalize from 'react-native-localize';
import {NativeModules} from 'react-native';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './src/utils/metrics';

import DatePicker from 'react-native-date-picker';

import {decode, encode} from 'base-64';
import {useAppState} from '@react-native-community/hooks';
import onCreateTriggerNotification from './src/utils/createNotification';
import {Swipeable} from 'react-native-gesture-handler';
import toDateString from './src/utils/toDateString';
import DownvoteIcon from './src/assets/ModalDownvote.svg';
import UpvoteIcon from './src/assets/ModalUpvote.svg';
import NewEntryIcon from './src/assets/NewEntry.svg';
import SettingsIcon from './src/assets/Settings.svg';
import CalendarEventIcon from './src/assets/calendar-event.svg';
import LabelIcon from './src/assets/Labelling.svg';
import DaysMenuIcon from './src/assets/days-menu.svg';
import MomentsMenuIcon from './src/assets/moments-menu.svg';
import SearchMenuIcon from './src/assets/search-menu.svg';
import LocationEventIcon from './src/assets/event-location.svg';
import PhotoEventIcon from './src/assets/event-photo.svg';

import {emotions} from './src/utils/utils';
import {ImageAsset} from './src/utils/native-modules/NativeImage';
import MapView, {Marker} from 'react-native-maps';
import OnboardingButton from './src/components/OnboardingButton';
import OnboardingBackground from './src/components/OnboardingBackground';
import onCreateTriggerReminder from './src/utils/createOpenReminder';
import SingleMapMemo from './src/components/SingleMapMemo';
import generateMemories from './src/utils/generateMemories';
import generateEntry from './src/utils/generateEntry';
import {EventTypes} from './src/utils/Enums';
import getMemories from './src/utils/getMemories';
// const {
//   DetectFacesCommand,
//   DetectLabelsCommand,
//   RekognitionClient,
// } = require('@aws-sdk/client-rekognition');

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
} = useDatabaseHooks();
export default FullHomeView = ({route, navigation}) => {
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
  } = useContext(AppContext);
  // console.log({entries, memories});

  const [loading, setLoading] = useState(false);

  const [firstEntryGenerated, setFirstEntryGenerated] = useState(false);

  const [generatingEntry, setGeneratingEntry] = useState(false);
  const [clickedNotification, setClickedNotification] = useState(null);
  const rangeViewValues = {
    DAYS: 0,
    WEEKS: 1,
    MONTHS: 2,
  };
  const [rangeView, setRangeView] = useState(rangeViewValues.DAYS);

  const [scroll, setScroll] = useState(false);
  const [drag, setDrag] = useState(false);
  const screenValues = {
    SEARCH: 0,
    READ: 1,
    MEMORIES: 2,
  };
  const [loadingMessage, setLoadingMessage] = useState('');
  const [memoryLoadingMessage, setMemoryLoadingMessage] =
    useState('Not Needed');
  const [storyLoadingMessage, setStoryLoadingMessage] = useState('Busy');

  const [screen, setScreen] = useState(screenValues.MEMORIES);
  // const [onBoarding, setOnBoarding] = useState(
  //   useSettingsHooks.getBoolean('onboarding'),
  // );

  const [showModal, setShowModal] = useState(false);
  const [currentRichModeEntryIndex, setCurrentRichModeEntryIndex] = useState();

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(false);
  const [highlightedMemory, setHighlightedMemory] = useState(-1);
  const swipeableRef = useRef(null);
  console.log('useSettingsHooks', useSettingsHooks.getBoolean('onboarding'));
  console.log('onboarding', onBoarding);
  useEffect(() => {
    console.log(route);
    if (route.params?.entry) {
      setLoading(true);
      console.log(route);
      var entriesCopy = [...entries];
      // .sort((a, b) => a.time - b.time)
      // .sort((a, b) => moment(b.time).week() - moment(a.time).week());
      console.log(entriesCopy);
      const {index, ...newEntry} = route.params.entry;
      entriesCopy.splice(index, 1, newEntry);
      console.log(entriesCopy);
      updateEntryData(
        newEntry.tags.length === 0 ? '' : JSON.stringify(newEntry.tags),
        newEntry.title,
        newEntry.time,
        newEntry.emotion,
        newEntry.tags.emotions === 0 ? '' : JSON.stringify(newEntry.emotions),
        newEntry.tags.votes === 0 ? '' : JSON.stringify(newEntry.votes),
        newEntry.origins.entry.time,
        newEntry.origins.entry.source,
        newEntry.origins.title.time,
        newEntry.origins.title.source,
        newEntry.tags.events === 0 ? '' : JSON.stringify(newEntry.events),
        newEntry.entry,
        newEntry.id,
      );
      setEntries(entriesCopy);
      setLoading(false);
    }
  }, [route.params]);
  useEffect(() => {
    // console.log('home entries useEffect', {entries});
  }, [entries]);

  const getAddressName = address => {
    var locationAliasesArray = JSON.parse(
      useSettingsHooks.getString('settings.locationAliases'),
    );
    var aliasObj = locationAliasesArray.find(
      locationAliasObj => locationAliasObj.address === address,
    );
    if (aliasObj !== undefined) {
      return aliasObj.alias;
    } else {
      return '';
    }
  };

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

    const readyToGenerateMemory = async ({start, end}) => {
      setMemoryLoadingMessage('Generating');
      const eventData = await getPermissionsAndData({start, end});
      console.log('Event Data For Memory Generation', eventData);
      const newMemories = await generateMemories({
        data: eventData,
        date: date.getTime(),
      });
      const updatedMemories = await getMemories();
      setMemories(updatedMemories);
      useSettingsHooks.set('settings.lastMemoryCheckTime', Date.now());
    };

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
          const newEntry = await generateEntry({memories});
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
          const newEntry = await generateEntry({memories});
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
  const headerScrollHeight = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT * 2, H_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  function findMatches(regex, str, matches = []) {
    const res = regex.exec(str);
    res && matches.push(res) && findMatches(regex, str, matches);
    return matches;
  }

  // const headerScrollHeight = scrollOffsetY.interpolate({
  //   inputRange: [0, H_SCROLL_DISTANCE],
  //   outputRange: [H_MAX_HEIGHT * 2, H_MIN_HEIGHT],
  //   extrapolate: 'clamp',
  // });
  const [showNewHeader, setShowNewHeader] = useState(false);
  const [entryHeaderList, setEntryHeaderList] = useState([]);
  const [entryHeaderIndex, setEntryHeaderIndex] = useState(0);
  scrollOffsetY.removeAllListeners();
  scrollOffsetY.addListener(val => {
    if (val.value <= 0) {
      setEntryHeaderIndex(0);
    } else {
      for (var i = 0; i < entryHeaderList.length; i++) {
        if (entryHeaderList[i].y > val.value) {
          setEntryHeaderIndex(i - 1);
          break;
        } else {
          if (i === entryHeaderList.length - 1) {
            setEntryHeaderIndex(i);
          }
        }
      }
    }

    // console.log({val, entryHeaderList});
    // if (val.value > H_SCROLL_DISTANCE) {
    //   setShowNewHeader(true);
    // } else {
    //   setShowNewHeader(false);
    // }
  });
  const color = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: ['#06609E', 'white'],
    extrapolate: 'identity',
  });
  const rangeViewHeight = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [75, 0],
    extrapolate: 'clamp',
  });
  const rangeViewPadding = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });
  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });
  const headerPadding = scrollOffsetY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 10],
    extrapolate: 'clamp',
  });
  const footerHeight = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [75, 0],
    extrapolate: 'clamp',
  });

  const floatingButtonBottom = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 25],
    extrapolate: 'clamp',
  });

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
    <SafeAreaView
      style={{
        flex: 1,
        // backgroundColor: 'red'
      }}>
      <StatusBar
        barStyle={'dark-content'}
        // backgroundColor={onBoarding === true ? 'white' : '#F9F9F9'}
        backgroundColor={'white'}
      />
      {onBoarding === true || firstEntryGenerated === true ? (
        <>
          <OnboardingBackground />
          {onBoarding === true && (
            <Onboarding
              endOnboarding={() => {
                setOnBoarding(false);
                useSettingsHooks.set('onboarding', false);
                console.log('END ONBOARDING');
                try {
                  onCreateTriggerReminder({remindTime: 8});
                  onCreateTriggerReminder({remindTime: 15});
                  onCreateTriggerReminder({remindTime: 22});
                } catch (e) {
                  console.error({e});
                }
                checkIfReadyToGenerate();
              }}
              generateEntry={generateEntry}
              getPermissionsAndData={getPermissionsAndData}
            />
          )}
          {firstEntryGenerated === true && (
            <View
              style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
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
                  text={
                    generatingEntry === true ? loadingMessage : 'See the story'
                  }
                  onPress={() => {
                    setFirstEntryGenerated(false);
                  }}
                  disabled={generatingEntry}
                />
              </View>
              {/* <Text
                // maxFontSizeMultiplier={1}
                allowFontScaling={false}
                style={{
                  color: theme.onboarding.title,
                  fontWeight: '700',
                  fontSize: moderateScale(28),
                  marginBottom: verticalScale(20),
                  marginTop: verticalScale(20),
                }}>
                Congratulations
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: theme.onboarding.text,
                  fontWeight: '400',
                  fontSize: moderateScale(16),
                  marginBottom: verticalScale(20),
                }}>
                Your first story is ready for your reflections
              </Text>
              <OnboardingButton
                text={
                  generatingEntry === true ? loadingMessage : 'See the story'
                }
                onPress={() => {
                  setFirstEntryGenerated(false);
                }}
                disabled={generatingEntry}
              /> */}
              {/* <TouchableOpacity
                style={{}}
                onPress={() => {
                  setFirstEntryGenerated(false);
                }}>
                <Text>
                  {generatingEntry === true ? loadingMessage : 'See the story'}
                </Text>
              </TouchableOpacity> */}
            </View>
          )}
        </>
      ) : (
        <View
          style={{
            // backgroundColor: 'green',
            flex: 1,
            // height: Dimensions.get('screen').height,
          }}>
          <Modal
            coverScreen
            animationInTiming={200}
            animationIn={'slideInUp'}
            isVisible={showModal}
            // presentationStyle={'pageSheet'}
            // transparent={true}
            onRequestClose={() => {
              setShowModal(false);
            }}
            onBackdropPress={() => {
              setShowModal(false);
            }}
            onSwipeComplete={() => {
              setShowModal(false);
            }}
            swipeDirection={['down']}
            style={{justifyContent: 'flex-end', margin: 0}}>
            <View style={{backgroundColor: 'white'}}>
              <View
                style={{
                  alignSelf: 'center',
                  width: 100,
                  height: 5,
                  backgroundColor: 'gray',
                }}></View>
            </View>
            <View style={{backgroundColor: 'white', padding: 20, gap: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10,
                }}>
                {emotions.map((emotion, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        // changeEmotion(i);
                      }}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: verticalScale(3),
                          paddingHorizontal: horizontalScale(3),
                          gap: horizontalScale(2),
                          backgroundColor:
                            theme.entry.buttons.toggle.background.inactive,
                          borderColor:
                            theme.entry.buttons.toggle.border.inactive,
                          borderWidth: 1,
                          borderRadius: 5,
                        }}>
                        {emotion.icon(false)}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View
                style={{height: 2, width: '100%', backgroundColor: 'black'}}
              />
              <ModalItem
                icon={
                  <UpvoteIcon
                    stroke={theme.entry.buttons.toggle.icon.inactive}
                  />
                }
                boldText={'Upvote'}
                softText={'as more meaningful'}
              />
              <ModalItem
                icon={
                  <DownvoteIcon
                    stroke={theme.entry.buttons.toggle.icon.inactive}
                  />
                }
                boldText={'Downvote'}
                softText={'as less meaningful'}
              />
              <ModalItem
                icon={<LabelIcon />}
                boldText={'Add labels'}
                softText={'for addtional meaning'}
              />
              <ModalItem
                icon={<AIRewriteIcon stroke={'black'} />}
                boldText={'AI Rewrite'}
                softText={''}
              />

              <View
                style={{height: 2, width: '100%', backgroundColor: 'black'}}
              />
            </View>
          </Modal>

          {/* <ScrollView removeClippedSubviews={true}> */}
          {screenValues.READ === screen && (
            <View style={{flex: 1}}>
              <TouchableOpacity
                onPress={async () => {
                  const newEntry = await generateEntry({
                    // memories: [
                    //   {
                    //     id: 1,
                    //     time: 1697994699000,
                    //     body: 'At 3:00 PM, I had a driving test. After my third attempt, I finally passed.',
                    //   },
                    //   {
                    //     id: 2,
                    //     time: 1698023499000,
                    //     body: 'At 6:00 PM, I had a wonderful meal at a resturant. The buffet was a let down but was cheap enough',
                    //   },
                    // ],
                    memories,
                  });
                  setEntries([newEntry, ...entries]);
                }}>
                <Text>Generate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  retrieveSpecificData(0, Date.now(), res => {
                    var locations;
                    (locations = res.map(obj => {
                      return {
                        description: obj.description.split(',')[0],
                        time: obj.date,
                        lat: obj.lat,
                        long: obj.lon,
                      };
                    })),
                      console.log(locations);
                  });
                }}>
                <Text>Check Location Data</Text>
              </TouchableOpacity>
              <Text>Generation Status: {storyLoadingMessage}</Text>
              <Text>
                Selected Entry Creation Time:{' '}
                {useSettingsHooks.getNumber('settings.createEntryTime')}
                {':00'}
              </Text>
              <FlatList
                data={entries}
                keyExtractor={entry => entry.id}
                removeClippedSubviews={true}
                initialNumToRender={2}
                maxToRenderPerBatch={1}
                updateCellsBatchingPeriod={100}
                windowSize={7}
                style={{flex: 1}}
                renderItem={({item, index}) => (
                  <View
                    key={index}
                    style={{
                      marginHorizontal: 20,
                      padding: 10,
                      borderRadius: 20,
                    }}>
                    {/* {console.log({item, index})} */}
                    {/* <Text>Test</Text> */}
                    <Text>{item.body}</Text>

                    <Text>{JSON.stringify(item)}</Text>
                    {index !== entries.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          width: '100%',
                          marginVertical: 20,
                          backgroundColor: 'rgba(11, 11, 11, 0.1)',
                        }}></View>
                    )}
                  </View>
                )}></FlatList>
            </View>
          )}
          {screenValues.MEMORIES === screen && (
            <>
              <Text>Next Memory Creation: {getNextMemoryTime()}</Text>
              <Text>Memory Length: {memories?.length || 0}</Text>
              <Text>
                Last Time Memories Generated:{' '}
                {new Date(
                  useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
                  // 0,
                ).toLocaleString()}
              </Text>
              <Text>Generation Status: {memoryLoadingMessage}</Text>
              <FlatList
                data={memories}
                keyExtractor={memory => memory.id}
                removeClippedSubviews={true}
                initialNumToRender={2}
                maxToRenderPerBatch={1}
                updateCellsBatchingPeriod={100}
                windowSize={7}
                style={{flex: 1}}
                // contentContainerStyle={{flex: 1}}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      marginHorizontal: 20,
                      padding: 10,
                      borderRadius: 20,
                    }}>
                    {console.log({item, index})}
                    <TouchableOpacity
                      onPress={() => {
                        if (highlightedMemory === index) {
                          setHighlightedMemory(-1);
                        } else {
                          setHighlightedMemory(index);
                          setShowModal(true);
                        }
                      }}
                      style={{
                        backgroundColor:
                          highlightedMemory === index ? 'gray' : 'white',
                      }}>
                      <Text>{item.body}</Text>
                      <Text>{JSON.stringify(item)}</Text>
                      <View style={{marginTop: 20}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                          }}>
                          <View
                            style={{
                              padding: 5,
                              borderRadius: 30,
                              borderWidth: 2,
                              borderColor: '#EAEAEA',
                              backgroundColor: 'white',
                            }}>
                            {getEventIcon(item.type)}
                          </View>
                          <View>
                            <Text
                              style={{
                                color: 'rgba(11, 11, 11, 0.8)',
                                fontWeight: 600,
                              }}>
                              {item.type === EventTypes.LOCATION &&
                                item.eventsData.description}
                              {item.type === EventTypes.PHOTO &&
                                item.eventsData.name}
                              {item.type === EventTypes.CALENDAR_EVENT &&
                                item.eventsData.title}
                            </Text>
                            <Text
                              style={{
                                color: 'rgba(11, 11, 11, 0.6)',
                              }}>
                              {item.formattedTime}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {[EventTypes.PHOTO, EventTypes.LOCATION].includes(
                        item.type,
                      ) && (
                        <SingleMapMemo
                          lat={item.eventsData.lat}
                          long={item.eventsData.long}
                        />
                      )}
                      {[EventTypes.PHOTO].includes(item.type) && (
                        <View
                          style={{
                            height: 200,
                            // width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: 20,
                          }}>
                          <View
                            style={{
                              height: 200,
                              width: 200,
                              borderRadius: 20,
                              overflow: 'hidden',
                            }}>
                            <ImageAsset
                              localIdentifier={item.eventsData.localIdentifier}
                              setHeight={200}
                              setWidth={200}
                              // height={1}
                              style={{
                                // flex: 1,
                                height: 200,
                                width: 200,
                              }}
                            />
                          </View>
                        </View>
                      )}
                      {[EventTypes.CALENDAR_EVENT].includes(item.type) &&
                        item.eventsData.notes !== undefined && (
                          <ScrollView style={{height: 200}}>
                            <Text
                              style={
                                {
                                  // overflow: 'scroll',
                                  // width: '100%',
                                  // height: 200,
                                }
                              }>
                              {item.eventsData.notes}
                            </Text>
                          </ScrollView>
                        )}
                    </TouchableOpacity>
                    {index !== memories.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          width: '100%',
                          marginVertical: 20,
                          backgroundColor: 'rgba(11, 11, 11, 0.1)',
                        }}></View>
                    )}
                  </View>
                )}></FlatList>
            </>
          )}
          {/* </ScrollView> */}
          {screen === screenValues.MEMORIES && (
            <Animated.View
              style={{
                position: 'absolute',
                right: 30,
                bottom:
                  screen === screenValues.MEMORIES ? 100 : floatingButtonBottom,
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'rgba(11, 11, 11, 0.1)',
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.44,
                shadowRadius: 10.32,

                elevation: 16,

                shadowColor: '#000',
              }}>
              <TouchableOpacity
                onPress={async () => {
                  const date = new Date(Date.now());
                  const mode = 'manual';
                  if (mode === 'generate') {
                    await generateEntry({
                      data: await getPermissionsAndData({date: date.getTime()}),
                      date: date.getTime(),
                    });
                  } else if (mode === 'manual') {
                    createManualEntry(date.getTime());
                  }
                }}>
                <NewEntryIcon />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View
            style={{
              justifyContent: 'space-evenly',
              flexDirection: 'row',
              backgroundColor: '#DAD9DD',
              // flexGrow: 1,
              // justifyContent: 'flex-end',
              // alignSelf: 'flex-end',
              // bottom: 0,

              height: screen === screenValues.MEMORIES ? 75 : footerHeight,
            }}>
            <TouchableOpacity
              onPress={() => {
                // swipeableRef.current.close();

                setScreen(screenValues.READ);
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <DaysMenuIcon
                fill={screen === screenValues.READ ? '#3286B3' : '#68696A'}
              />
              <Text
                style={{
                  color: screen === screenValues.READ ? '#3286B3' : '#68696A',
                }}
                allowFontScaling={false}>
                Stories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setScreen(screenValues.MEMORIES);
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <MomentsMenuIcon
                fill={screen === screenValues.MEMORIES ? '#3286B3' : '#68696A'}
              />
              <Text
                style={{
                  color:
                    screen === screenValues.MEMORIES ? '#3286B3' : '#68696A',
                }}
                allowFontScaling={false}>
                Memories
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Settings');
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <DaysMenuIcon
                fill={screen === screenValues.READ ? '#3286B3' : '#68696A'}
              />
              <Text
                style={{
                  color: screen === screenValues.READ ? '#3286B3' : '#68696A',
                }}
                allowFontScaling={false}>
                Settings
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};
