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
import BinIcon from './src/assets/Bin.svg';
import PenIcon from './src/assets/Pen.svg';
import WritingAnimation from './src/assets/writing.gif';

import {emotions} from './src/utils/utils';
import {ImageAsset} from './src/utils/native-modules/NativeImage';
import MapView, {Marker} from 'react-native-maps';
import OnboardingButton from './src/components/OnboardingButton';
import OnboardingBackground from './src/components/OnboardingBackground';
import onCreateTriggerReminder from './src/utils/createOpenReminder';
import SingleMapMemo from './src/components/SingleMapMemo';
import generateMemories from './src/utils/generateMemories';
import generateEntry from './src/utils/generateEntry';
import {ActionSheetScreens, EventTypes} from './src/utils/Enums';
import getMemories from './src/utils/getMemories';
import NewModalItem from './src/NewModalItem';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  Box,
  Divider,
} from '@gluestack-ui/themed';
import LabellingSheet from './src/LabellingSheet';
import {KeyboardAvoidingView} from '@gluestack-ui/themed';
import EditSheet from './src/EditSheet';
import {Pressable} from '@gluestack-ui/themed';
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
  updateMemoryData,
  deleteMemoryData,
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
    devMode,
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
  const [memoryLoadingState, setMemoryLoadingState] = useState(false);
  const [storyLoadingMessage, setStoryLoadingMessage] = useState('Busy');

  const [screen, setScreen] = useState(screenValues.MEMORIES);
  // const [onBoarding, setOnBoarding] = useState(
  //   useSettingsHooks.getBoolean('onboarding'),
  // );

  const [refreshedFromPull, setRefreshedFromPull] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [actionsheetScreen, setActionsheetScreen] = useState(
    ActionSheetScreens.MEMORIES.BASE,
  );
  // const [showModal, setShowModal] = useState(false);
  const [currentRichModeEntryIndex, setCurrentRichModeEntryIndex] = useState();

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(false);
  const [highlightedMemory, setHighlightedMemory] = useState({
    index: -1,
    id: null,
  });
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
      setMemoryLoadingState(true);
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
      <Actionsheet
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setHighlightedMemory({
            index: -1,
            id: null,
          });
        }}>
        <ActionsheetBackdrop />
        <ActionsheetContent pb={50} maxHeight={'80%'}>
          <ActionsheetDragIndicatorWrapper pb={10}>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ScrollView>
            {actionsheetScreen === ActionSheetScreens.MEMORIES.BASE && (
              <>
                <Box
                  flexDirection="row"
                  justifyContent="center"
                  gap={10}
                  mb={5}>
                  {[1, 2, 3, 4, 5].map(val => {
                    return (
                      <Pressable
                        key={val}
                        onPress={() => {
                          var updatedMemories = [...memories];
                          var memory = updatedMemories[highlightedMemory.index];
                          memory.emotion = memory.emotion === val ? 0 : val;
                          updatedMemories[highlightedMemory.index] = memory;
                          setMemories(updatedMemories);
                          updateMemoryData({
                            tags: JSON.stringify(memory.tags),
                            type: memory.type,
                            body: memory.body,
                            bodyModifiedAt: memory.bodyModifiedAt,
                            bodyModifiedSource: memory.bodyModifiedSource,
                            emotion: memory.emotion,
                            eventsData: JSON.stringify(memory.eventsData),
                            time: memory.time,
                            vote: memory.vote,
                            id: highlightedMemory.id,
                          });
                        }}>
                        <Box
                          width={50}
                          height={50}
                          backgroundColor={
                            memories[highlightedMemory.index]?.emotion === val
                              ? emotionToColor({
                                  emotion: val,
                                  need: emotionAttributes.BACKGROUND,
                                })
                              : 'white'
                          }
                          borderWidth={1}
                          justifyContent="center"
                          alignItems="center"
                          borderColor={
                            memories[highlightedMemory.index]?.emotion === val
                              ? emotionToColor({
                                  emotion: val,
                                  need: emotionAttributes.BACKGROUND,
                                })
                              : emotionToColor({
                                  need: emotionAttributes.BORDER,
                                })
                          }
                          rounded={'$md'}>
                          <Box aspectRatio={1} height={'65%'} width={'65%'}>
                            {emotionToIcon({
                              emotion: val,
                              active:
                                memories[highlightedMemory.index]?.emotion ===
                                val,
                            })}
                            {/* <AngerIcon
                              primaryColor={
                                memories[highlightedMemory.index]?.emotion ===
                                val
                                  ? emotionToColor({
                                      emotion: val,
                                      need: emotionAttributes.STROKE,
                                    })
                                  : '#0b0b0b99'
                              }
                              // fill={
                              //   // memories[highlightedMemory.index]?.emotion ===
                              //   // val
                              //   //   ? emotionToColor({
                              //   //       need: emotionAttributes.BORDER,
                              //   //     })
                              //   //   : emotionToColor({
                              //   //       need: emotionAttributes.BORDER,
                              //   //     })
                              //   '#000'
                              // }
                              // fill={'#000'}
                            /> */}
                          </Box>
                          {/* default stroke: 6D6D6D */}
                        </Box>
                      </Pressable>
                    );
                  })}
                </Box>
                <Divider backgroundColor="black" height={1} />
                <NewModalItem
                  boldText={'Upvote'}
                  normalText={'as more meaningful'}
                  icon={
                    <UpvoteIcon
                      primaryColor={'black'}
                      // stroke={theme.entry.buttons.toggle.icon.inactive}
                    />
                  }
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.vote += 1;
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                  num={
                    memories[highlightedMemory.index]?.vote > 0
                      ? memories[highlightedMemory.index]?.vote
                      : undefined
                  }
                />
                <NewModalItem
                  boldText={'Downvote'}
                  normalText={'as less meaningful'}
                  icon={<DownvoteIcon primaryColor={'black'} />}
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.vote -= 1;
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                  num={
                    memories[highlightedMemory.index]?.vote < 0
                      ? Math.abs(memories[highlightedMemory.index]?.vote)
                      : undefined
                  }
                  numStyle={1}
                />
                <NewModalItem
                  boldText={'Add labels'}
                  normalText={'for additional meaning'}
                  icon={<LabelIcon primaryColor={'black'} />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.MEMORIES.LABELS)
                  }
                  num={
                    Object.values(
                      memories[highlightedMemory.index]?.tags || [],
                    ).flat().length
                  }
                />
                {/* <NewModalItem
                  boldText={'Redo'}
                  normalText={''}
                  icon={
                    <DownvoteIcon
                      stroke={theme.entry.buttons.toggle.icon.inactive}
                    />
                  }
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.tags = {
                      roles: [],
                      modes: [],
                      other: [],
                    };
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                /> */}
                <NewModalItem
                  boldText={'Edit'}
                  normalText={'manually or with the help of AI'}
                  icon={<PenIcon />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.MEMORIES.EDIT)
                  }
                />

                <Divider backgroundColor="black" height={1} />
                <NewModalItem
                  boldText={'Delete Memory'}
                  icon={<BinIcon />}
                  danger={true}
                  onPress={() => {
                    var updatedMemories = [...memories];
                    updatedMemories.splice(highlightedMemory.index, 1);
                    setMemories(updatedMemories);
                    deleteMemoryData({
                      id: highlightedMemory.id,
                    });
                    setShowModal(false);
                  }}
                />
              </>
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.LABELS && (
              <LabellingSheet
                activeLabels={memories[highlightedMemory.index]?.tags}
                update={({labels}) => {
                  var updatedMemories = [...memories];
                  var memory = updatedMemories[highlightedMemory.index];
                  memory.tags = labels;
                  updatedMemories[highlightedMemory.index] = memory;
                  setMemories(updatedMemories);
                  updateMemoryData({
                    tags: JSON.stringify(memory.tags),
                    type: memory.type,
                    body: memory.body,
                    bodyModifiedAt: memory.bodyModifiedAt,
                    bodyModifiedSource: memory.bodyModifiedSource,
                    emotion: memory.emotion,
                    eventsData: JSON.stringify(memory.eventsData),
                    time: memory.time,
                    vote: memory.vote,
                    id: highlightedMemory.id,
                  });
                }}
              />
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.EDIT && (
              <EditSheet
                type="memory"
                body={memories[highlightedMemory.index]?.body}
                success={({body}) => {
                  var updatedMemories = [...memories];
                  var memory = updatedMemories[highlightedMemory.index];
                  memory.body = body;
                  updatedMemories[highlightedMemory.index] = memory;
                  setMemories(updatedMemories);
                  updateMemoryData({
                    tags: JSON.stringify(memory.tags),
                    type: memory.type,
                    body: memory.body,
                    bodyModifiedAt: memory.bodyModifiedAt,
                    bodyModifiedSource: memory.bodyModifiedSource,
                    emotion: memory.emotion,
                    eventsData: JSON.stringify(memory.eventsData),
                    time: memory.time,
                    vote: memory.vote,
                    id: highlightedMemory.id,
                  });
                  setShowModal(false);
                }}
                cancel={() => {
                  setShowModal(false);
                }}
              />
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.CREATE && (
              <EditSheet
                type="memory"
                body={''}
                create={true}
                success={async ({body}) => {
                  var newMemory = {
                    tags: {
                      roles: [],
                      body: [],
                      other: [],
                    },
                    type: -1,
                    body: body,
                    bodyModifiedAt: 0,
                    bodyModifiedSource: 'manual',
                    emotion: 0,
                    eventsData: {},
                    time: Date.now(),
                    vote: 0,
                  };
                  try {
                    createMemoriesTable();
                    const saveResult = await saveMemoryData({
                      ...newMemory,
                      tags: JSON.stringify(newMemory.tags),
                      eventsData: JSON.stringify(newMemory.eventsData),
                    });
                    newMemory.id = saveResult.insertId;
                  } catch (e) {
                    console.error({e});
                    newMemory.saved = false;
                  }
                  var updatedMemories = [newMemory, ...memories];
                  setMemories(updatedMemories);
                  setShowModal(false);
                }}
                cancel={() => {
                  setShowModal(false);
                }}
              />
            )}
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>
      <View
        style={{
          // backgroundColor: 'green',
          flex: 1,
          // height: Dimensions.get('screen').height,
        }}>
        {/* <Modal
            coverScreen
            animationInTiming={200}
            animationIn={'slideInUp'}
            isVisible={false}
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
              
            </View>
          </Modal> */}

        {/* <Actionsheet isOpen={showActionSheet}>
            <ActionsheetContent></ActionsheetContent>
          </Actionsheet> */}

        {/* <ScrollView removeClippedSubviews={true}> */}
        {screenValues.READ === screen && (
          <View style={{flex: 1}}>
            {devMode === true && (
              <>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      setStoryLoadingMessage('Generating');
                      createEntryTable();
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
                      setStoryLoadingMessage('Finished');
                    } catch (e) {
                      console.error({e});
                      setStoryLoadingMessage('Finished with error');
                    }
                  }}>
                  <Text>Generate</Text>
                </TouchableOpacity>
                <Text>Generation Status: {storyLoadingMessage}</Text>
                <Text>
                  Selected Entry Creation Time:{' '}
                  {useSettingsHooks.getNumber('settings.createEntryTime')}
                  {':00'}
                </Text>
              </>
            )}
            <FlatList
              data={entries}
              keyExtractor={entry => entry.id}
              removeClippedSubviews={true}
              initialNumToRender={2}
              maxToRenderPerBatch={1}
              updateCellsBatchingPeriod={100}
              windowSize={7}
              ListEmptyComponent={() => {
                return (
                  <View>
                    <Text>No Stories yet</Text>
                  </View>
                );
              }}
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
            {devMode === true && (
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
              </>
            )}
            {/* <WritingAnimation /> */}
            <Animated.View
              style={{
                // backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                // aspectRatio: 1,
                height: memoryLoadingState === true ? 75 : gifScale || 0,
                zIndex: 999,
                left: 0,
                right: 0,
                position: memoryLoadingState === true ? 'relative' : 'absolute',
                overflow: 'hidden',
              }}>
              <Image
                source={require('./src/assets/writing.gif')}
                style={{width: 75, height: 75}}
              />
            </Animated.View>
            <FlatList
              data={memories}
              keyExtractor={memory => memory.id}
              ref={scrollRef}
              removeClippedSubviews={true}
              initialNumToRender={2}
              maxToRenderPerBatch={1}
              updateCellsBatchingPeriod={100}
              windowSize={7}
              ListEmptyComponent={() => {
                return (
                  <View>
                    <Text>No Memories yet</Text>
                  </View>
                );
              }}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
                {useNativeDriver: false},
              )}
              scrollEventThrottle={16}
              // onDra
              // refreshing={false}
              // onRefresh={() => {
              //   console.log(`${Date.now()} test`);
              // }}
              // refreshControl={
              //   <RefreshControl
              //     colors={['#9Bd35A', '#689F38']}
              //     refreshing={false}
              //     onRefresh={() => {
              //       console.log(`${Date.now()} test`);
              //     }}
              //   />
              // }
              style={{flex: 1}}
              // contentContainerStyle={{flex: 1}}
              renderItem={({item, index}) => (
                <View
                  style={{
                    padding: 20,
                    // paddingTop: 5,
                    borderRadius: 20,
                    backgroundColor: '#F6F6F6',
                  }}>
                  {console.log({item, index})}
                  <Pressable
                    onPressIn={() => {
                      setHighlightedMemory({index, id: item.id});
                    }}
                    onPress={() => {
                      setHighlightedMemory({index, id: item.id});
                      setShowModal(true);
                      setActionsheetScreen(ActionSheetScreens.MEMORIES.BASE);
                    }}
                    px={10}
                    py={15}
                    rounded={'$md'}
                    backgroundColor={
                      highlightedMemory.index === index ? '#E9E9E9' : '#F6F6F6'
                    }>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 18,
                        lineHeight: 24,
                        fontWeight: 400,
                        color: '#0b0b0bcc',
                      }}>
                      {item.body}
                    </Text>
                    {devMode === true && (
                      <Text
                        allowFontScaling={false}
                        style={{paddingVertical: 5}}>
                        {JSON.stringify(item)}
                      </Text>
                    )}
                    {item.type > -1 && (
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
                              numberOfLines={
                                item.type === EventTypes.PHOTO ? 1 : undefined
                              }
                              style={{
                                color: 'rgba(11, 11, 11, 0.8)',
                                fontWeight: 600,
                                marginRight: 50,
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
                    )}

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
                    <Box flexDirection="row" gap={10} my={20}>
                      {item.emotion > 0 && (
                        <Box
                          px={10}
                          py={5}
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                          gap={5}
                          rounded={'$full'}
                          backgroundColor={emotionToColor({
                            emotion: item.emotion,
                            need: emotionAttributes.BACKGROUND,
                          })}>
                          <Box
                            aspectRatio={1}
                            height={30}
                            width={30}
                            p={4}
                            justifyContent="center"
                            alignItems="center"
                            rounded={'$md'}
                            backgroundColor={emotionToColor({
                              emotion: item.emotion,
                              need: emotionAttributes.STROKE,
                            })}>
                            {emotionToIcon({
                              emotion: item.emotion,
                              active: false,
                              color: '#fff',
                            })}
                          </Box>

                          <Text
                            style={{
                              fontWeight: 600,
                              color: emotionToColor({
                                emotion: item.emotion,
                                need: emotionAttributes.STROKE,
                              }),
                            }}>
                            {emotionToString(item.emotion)}
                          </Text>
                        </Box>
                      )}
                      {item.vote !== 0 && (
                        <Box
                          px={10}
                          py={5}
                          backgroundColor={
                            item.vote > 0 ? '#DFECF2' : '#E7E7E7'
                          }
                          justifyContent="center"
                          flexDirection="row"
                          rounded={'$full'}
                          gap={5}
                          alignItems="center">
                          <Box
                            aspectRatio={1}
                            height={30}
                            width={30}
                            p={4}
                            justifyContent="center"
                            alignItems="center"
                            rounded={'$md'}
                            backgroundColor={
                              item.vote > 0 ? '#118ED1' : '#6D6D6D'
                            }>
                            {item.vote > 0 ? (
                              <UpvoteIcon primaryColor={'white'} />
                            ) : (
                              <DownvoteIcon primaryColor={'white'} />
                            )}
                          </Box>
                          <Text
                            style={{
                              color: item.vote > 0 ? '#118ED1' : '#6D6D6D',
                              fontWeight: 600,
                            }}>
                            {item.vote}
                          </Text>
                        </Box>
                      )}
                      {Object.values(item.tags).flat().length > 0 && (
                        <Box
                          px={10}
                          py={5}
                          backgroundColor={'#DFECF2'}
                          justifyContent="center"
                          flexDirection="row"
                          rounded={'$full'}
                          gap={5}
                          alignItems="center">
                          <Box
                            aspectRatio={1}
                            height={30}
                            width={30}
                            p={4}
                            justifyContent="center"
                            alignItems="center"
                            rounded={'$md'}
                            backgroundColor={'#118ED1'}>
                            <LabelIcon primaryColor={'white'} />
                          </Box>
                          <Text style={{color: '#118ED1', fontWeight: 600}}>
                            {Object.values(item.tags).flat().length}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Pressable>
                  {index !== memories.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        width: '100%',
                        marginTop: 20,
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
                // const date = new Date(Date.now());
                // const mode = 'manual';
                // if (mode === 'generate') {
                //   await generateEntry({
                //     data: await getPermissionsAndData({date: date.getTime()}),
                //     date: date.getTime(),
                //   });
                // } else if (mode === 'manual') {
                //   createManualEntry(date.getTime());
                // }
                setShowModal(true);
                setActionsheetScreen(ActionSheetScreens.MEMORIES.CREATE);
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

            height: 75,
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
                color: screen === screenValues.MEMORIES ? '#3286B3' : '#68696A',
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
    </SafeAreaView>
  );
};
