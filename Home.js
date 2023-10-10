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

import notifee, {
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

// import AMImage from './src/assets/am_image.svg';
// import AMImage from './src/assets/AMImage.png';

import moment from 'moment';
import AppContext from './Context';
import useDatabaseHooks from './useDatabaseHooks';
import Location from './NativeFuncs';

import useSettingsHooks from './useSettingsHooks';
import Config from 'react-native-config';
import CreateEntryButton from './src/modules/entries/components/CreateEntryButton';
import {theme} from './Styling';
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
} from './src/utils/Metrics';
import DatePicker from 'react-native-date-picker';
import {decode, encode} from 'base-64';
import {useAppState} from '@react-native-community/hooks';
import onCreateTriggerNotification from './src/utils/CreateNotification';
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

import {emotions} from './Utils';
import {ImageAsset} from './NativeImage';
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

const {retrieveSpecificData, saveEntryData, updateEntryData, createEntryTable} =
  useDatabaseHooks();
export default FullHomeView = ({route, navigation}) => {
  const {
    onBoarding,
    setOnBoarding,
    photoAnalysis,
    includeDownloadedPhotos,
    setIncludeDownloadedPhotos,
    setPhotoAnalysis,
    locationAliases,
    createEntryTime,
    language,
    globalWritingSettings,
    onboardingTime,
  } = useSettingsHooks();
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
  const {loadingEntries, entries, setEntries} = useContext(AppContext);

  const [loading, setLoading] = useState(false);

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
    RICH: 2,
  };

  const [screen, setScreen] = useState(screenValues.READ);

  const [showModal, setShowModal] = useState(false);
  const [currentRichModeEntryIndex, setCurrentRichModeEntryIndex] = useState();

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(false);
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
    console.log('home entries useEffect', {entries});
  }, [entries]);

  const getPermissionsAndData = async date => {
    if (onBoarding === false) {
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
    let endOfUnixTime = new Date(date);
    endOfUnixTime.setHours(createEntryTime);
    endOfUnixTime.setMinutes(0);
    endOfUnixTime.setSeconds(0);
    endOfUnixTime.setMilliseconds(0);
    let startOfUnixTime = new Date(endOfUnixTime.getTime());
    startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
    endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
    startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);

    Location.setDateRange(startOfUnixTime, endOfUnixTime);
    try {
      console.log('events', {startOfUnixTime, endOfUnixTime});
      events = await Location.getCalendarEvents(startOfUnixTime, endOfUnixTime);
      console.log({events});
    } catch (e) {
      if (e.message === 'DENIED') {
        console.error('GIVE PERMISSION TO APP FOR CALENDAR USAGE');
      } else {
        console.error(e);
      }
    }
    console.log('locations');
    // GET LOCATIONS
    retrieveSpecificData(startOfUnixTime * 1000, endOfUnixTime * 1000, res => {
      (locations = res.map(obj => {
        return {
          description: obj.description.split(',')[0],
          time: obj.date,
        };
      })),
        console.log(locations);
    });
    //GET PHOTOS
    console.log('photos');
    var includeDownloadedPhotosCheck = includeDownloadedPhotos || false;
    try {
      photos = await Location.getPhotosFromNative();
      console.log({photos});
      if (onBoarding === true) {
        await new Promise((resolve, reject) => {
          Alert.alert(
            'Send Photos for Analysis',
            'Photos taken from the camera will be sent to Amazon to be analyzed. We WILL NOT store these photos.\nDo you wish to proceed?',

            [
              {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                  setPhotoAnalysis(true);
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  setPhotoAnalysis(false);
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
                  setIncludeDownloadedPhotos(true);
                  includeDownloadedPhotosCheck = true;
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  setIncludeDownloadedPhotos(false);
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
    console.log({photos});
    console.log({includeDownloadedPhotosCheck});
    if (includeDownloadedPhotosCheck !== true) {
      photos = photos.filter(photo => photo.lat !== 'null');
    }

    // NOTIFICATIONS
    await notifee.requestPermission();
    //RETURNS
    return {
      photos,
      locations,
      events,
    };
  };

  const generateEntry = async ({data, date}) => {
    setGeneratingEntry(true);
    console.log('Generate');
    var {locations, events, photos} = data;

    console.log({photos});

    var entryCreationTime = new Date(Date.now());
    entryCreationTime.setHours(createEntryTime);
    entryCreationTime.setMinutes(0);
    entryCreationTime.setSeconds(0);
    entryCreationTime.setMilliseconds(0);
    // console.log({entryCreationTime});
    // entryCreationTime = entryCreationTime.getTime();
    // setGettingData(true);
    // setLoading(true);
    //DAY
    // var events = [];
    // var locations = [];
    var counter = 1;
    // var photos = [];
    var entriesCopy = [...entries];
    var entryEvents = [];
    // GET CALENDAR EVENTS
    // let startOfUnixTime = moment(date).startOf('day').unix();

    // let endOfUnixTime = moment(date).endOf('day').unix();
    let endOfUnixTime = new Date(date);
    endOfUnixTime.setHours(createEntryTime);
    endOfUnixTime.setMinutes(0);
    endOfUnixTime.setSeconds(0);
    endOfUnixTime.setMilliseconds(0);
    let startOfUnixTime = new Date(endOfUnixTime.getTime());
    startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
    endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
    startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);
    // ASK CHATGPT TO CREATE ENTRY

    var autoGenerate =
      locations.length === 0 && events.length === 0 && photos.length === 0
        ? false
        : true;
    if (photos.length > 0 && photoAnalysis === true) {
      await Promise.all(
        photos.map(async photo => {
          const image = decode(photo.data);
          const length = image.length;
          const imageBytes = new ArrayBuffer(length);
          const ua = new Uint8Array(imageBytes);
          for (var i = 0; i < length; i++) {
            ua[i] = image.charCodeAt(i);
          }
          var response;
          try {
            response = await Rekognition.detectLabels({
              Image: {Bytes: ua},
            }).promise();
            console.log('Rekognition.detectLabels Response', response);
            /*
            {
                  Labels: [
                    {
                      Name: 'Clothing',
                      Confidence: 100,
                      Instances: [],
                      Parents: [],
                      Aliases: [{Name: 'Apparel'}],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Coat',
                      Confidence: 100,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Plant',
                      Confidence: 99.12316131591797,
                      Instances: [],
                      Parents: [],
                      Aliases: [],
                      Categories: [{Name: 'Plants and Flowers'}],
                    },
                    {
                      Name: 'Vegetation',
                      Confidence: 99.12316131591797,
                      Instances: [],
                      Parents: [{Name: 'Plant'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Adult',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Female',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Person',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [],
                      Aliases: [{Name: 'Human'}],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Woman',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [
                        {Name: 'Adult'},
                        {Name: 'Female'},
                        {Name: 'Person'},
                      ],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Land',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Nature'}, {Name: 'Outdoors'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Nature',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Outdoors'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Outdoors',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Tree',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Plant'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Woodland',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [
                        {Name: 'Land'},
                        {Name: 'Nature'},
                        {Name: 'Outdoors'},
                        {Name: 'Plant'},
                        {Name: 'Tree'},
                        {Name: 'Vegetation'},
                      ],
                      Aliases: [{Name: 'Forest'}],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Jacket',
                      Confidence: 92.2098159790039,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}, {Name: 'Coat'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Standing',
                      Confidence: 65.57921600341797,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Actions'}],
                    },
                    {
                      Name: 'Hair',
                      Confidence: 63.32209014892578,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Beauty and Personal Care'}],
                    },
                    {
                      Name: 'Raincoat',
                      Confidence: 56.83426284790039,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}, {Name: 'Coat'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Walking',
                      Confidence: 56.17829513549805,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Actions'}],
                    },
                    {
                      Name: 'Hood',
                      Confidence: 55.42615509033203,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                  ],
                  LabelModelVersion: '3.0',
                }; 
            */
          } catch (e) {
            console.error('Error with Rekognition.detectLabels', e);
            return photo;
          }
          const labels = response.Labels;
          const labelsFiltered = labels.filter(label => label.Confidence >= 80);
          const labelsWithTitle = labelsFiltered.map(label => {
            if (
              label.Categories.filter(category => category.Name).some(
                r =>
                  [
                    'Person Description',
                    'Actions',
                    'Events and Attractions',
                  ].indexOf(r) >= 0,
              )
            ) {
              return {
                ...label,
                title: `${label.Instances.length}x${label.Name}`,
              };
            } else {
              return {
                ...label,
                title: label.Name,
              };
            }
            // return `${label.Instances.length}x${label.Name}`;
          });
          const str = `an image has been described through tags, these are the tags used:
                ${labelsWithTitle.map(label => label.title).toString()}
          string these tags together into a full ${language} description of the image, do not make up any details not described by those tags. Do not try to describe how the image feels. Keep it short.`;
          console.log({
            str,
            labelsWithTitle,
            response: JSON.stringify(labels),
          });
          try {
            const completion = await openai.createChatCompletion({
              // model: 'gpt-3.5-turbo',
              model: 'gpt-4',
              messages: [{role: 'user', content: str}],
            });
            console.log({
              completion: completion.data.choices[0].message?.content,
            });
            return {
              ...photo,
              labels: labelsWithTitle,
              description: completion.data.choices[0].message?.content,
            };
          } catch (e) {
            console.error('Error with creating photo caption', e);
            return {...photo, labels: 'null'};
          }
        }),
      ).then(res => {
        console.log({res});
        photos = res;
      });
    }
    var locationAliasesArray = JSON.parse(locationAliases);
    const getAddressName = address => {
      var aliasObj = locationAliasesArray.find(
        locationAliasObj => locationAliasObj.address === address,
      );
      if (aliasObj !== undefined) {
        return aliasObj.alias;
      } else {
        return '';
      }
    };
    var response = '';
    if (autoGenerate === true) {
      locations = locations.map(location => {
        var address = location.description.split(',')[0];
        var alias = getAddressName(address);
        entryEvents.push({
          type: 'location',
          id: counter,
          time: location.time,
          title: alias !== '' ? `${alias} (${address})` : address,
          additionalNotes: '',
        });
        return {
          ...location,
          id: counter++,
          alias,
        };
      });
      events = events.map(event => {
        entryEvents.push({
          type: 'calendar',
          id: counter,
          time: parseInt(event.start) * 1000,
          endTime: parseInt(event.end) * 1000,
          title: event.title,
          additionalNotes: event.notes,
          calendar: {
            title: event.calendar,
            color: event.calendarColor,
          },
        });
        return {
          ...event,
          time: parseInt(event.start) * 1000,
          id: counter++,
        };
      });
      photos = photos.map(photo => {
        entryEvents.push({
          type: 'photo',
          id: counter,
          time: Math.floor(parseFloat(photo.creation) * 1000),
          localIdentifier: photo.localIdentifier,
          title: photo.name,
          description: photo.description,
        });
        return {
          ...photo,
          creation: Math.floor(parseFloat(photo.creation) * 1000),
          id: counter++,
          description: photo.description || 'None',
          labels: photo.labels || 'null',
        };
      });
      console.log({photos});
      var eventListStr = `${
        locations.length > 0
          ? `Locations Visited:
              ${locations.map(
                location =>
                  `${
                    location.alias !== ''
                      ? location.alias
                      : location.description
                  } @${moment(location.time).format('LT')} (id:${location.id})`,
              )}`
          : ''
      }

              ${
                events.length > 0
                  ? `Events:
              ${events.map(
                event => `${event.title} @${
                  event.isAllDay === 'true'
                    ? `All-Day`
                    : `${moment(parseInt(event.start) * 1000).format(
                        'LT',
                      )}-${moment(parseInt(event.end) * 1000).format('LT')}`
                } (id:${event.id})
              `,
              )}`
                  : ''
              }

              ${
                photos.length > 0
                  ? `Photos Taken:
              ${photos.map(
                photo =>
                  `${
                    photo.labels !== 'null'
                      ? `Labels: ${photo.labels
                          .map(label => label.title)
                          .toString()}`
                      : ''
                  } ${photo.lat !== 'null' ? `Lat: ${photo.lat}` : ''} ${
                    photo.lon !== 'null' ? `Lon: ${photo.lon}` : ''
                  } @${moment(photo.creation).format('LT')}(id:${photo.id})`,
              )}`
                  : ''
              }
              `;
      console.log('CREATE NEW ENTRY', eventListStr);
      console.log('EVENTS', {photos, locations, events});

      try {
        const completion = await openai.createChatCompletion({
          // model: 'gpt-3.5-turbo',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are to act as my journal writer. I will give you a list of events that took place today and you are to generate a journal entry based on that. The diary entry should be a transcription of the events that you are told. Do not add superfluous details that you are unsure if they actually happened as this will be not useful to me. Add a [[X]] every time one of the events has been completed, e.g. I went to a meeting [[X]] then I went to the beach. [[X]] Replace X with the number assigned to the event. If at the end of a sentence, add after the closing punctuation. There is no need for sign ins (Dear Diary) or send offs (Yours sincerely). Do not introduce any details, events, etc not supplied by the user. Keep it short. Each photo will be described by a series of tags. Write the entry in the ${language} language. ${
                JSON.parse(globalWritingSettings).generate
              }`,
            },
            {role: 'user', content: eventListStr},
          ],
        });
        console.log({completion});
        response = completion.data.choices[0].message?.content;
      } catch (e) {
        console.error({e});
      }

      // const response =
      //   'This is a test entry. Please respond. &gt;';
      console.log(response);

      entriesCopy.push({
        ...baseEntry,
        time: entryCreationTime.getTime(),
        entry: '',
        events: entryEvents,
        entry: response,
        title: 'New Entry',
      });
    } else {
      entriesCopy.push({
        ...baseEntry,
        time: entryCreationTime.getTime(),
        entry: '',
        events: [],
        entry: 'No events found.',
        title: 'New Entry',
      });
      console.log('CREATE NEW ENTRY', 'No events found');
    }
    console.log({
      startOfUnixTime,
      entryEvents,
      entry: entriesCopy[entriesCopy.length - 1],
    });
    try {
      createEntryTable();
      saveEntryData({
        tags: '',
        title: 'New Entry',
        time: entryCreationTime.getTime(),
        emotion: -1,
        emotions: '',
        votes: '',
        titleModifiedAt: Date.now(),
        titleModifiedSource: 'auto',
        bodyModifiedAt: Date.now(),
        bodyModifiedSource: 'auto',
        events: entryEvents.length === 0 ? '' : JSON.stringify(entryEvents),
        body:
          entryEvents.length === 0
            ? 'No events found.'
            : entriesCopy[entriesCopy.length - 1].entry,
        generated: 1,
      });
    } catch (e) {
      console.error(e);
    }

    setEntries(entriesCopy);
    setGeneratingEntry(false);
    // setLoading(false);

    /*
      GET ALL DATA
      CHECK TO SEE IF AUTO GENERATE OR NOT
      CREATE MANUAL
      CREATE AUTO
      SAVE
      */
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

  const getEventIcon = type => {
    switch (type) {
      case 'location':
        return <LocationEventIcon />;
      case 'photo':
        return <PhotoEventIcon />;
      case 'calendar':
        return <CalendarEventIcon />;
    }
  };

  console.log(Dimensions.get('window'));

  const checkIfReadyToGenerate = async () => {
    var now = new Date(Date.now());
    if (entries.length > 0) {
      if (
        new Date(entries.sort((a, b) => b.time - a.time)[0].time).getDate() <
          now.getDate() &&
        now.getHours() >= createEntryTime
      ) {
        console.log('Time to generate entry');
        await generateEntry({
          data: await getPermissionsAndData(now.getTime()),
          date: now.getTime(),
        });
        onCreateTriggerNotification({
          first: false,
          createEntryTime,
          time: null,
        });
      } else {
        console.log('Not Ready');
      }
    } else {
      if (onboardingTime < Date.now()) {
        console.log('Time to generate entry');
        await generateEntry({
          data: await getPermissionsAndData(now.getTime()),
          date: now.getTime(),
        });
        onCreateTriggerNotification({
          first: false,
          createEntryTime,
          time: null,
        });
      } else {
        console.log('Not Ready');
      }
    }
  };

  useEffect(() => {
    console.log({loadingEntries});
  }, [loadingEntries]);
  useEffect(() => {
    if (
      ((!loadingEntries && clickedNotification === null) ||
        (!loadingEntries && clickedNotification === true)) &&
      !onBoarding
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

    console.log({val, entryHeaderList});
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
      {onBoarding === true ? (
        <>
          <Svg
            height={`${Dimensions.get('window').height}`}
            width={`${Dimensions.get('window').width}`}
            style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={theme.onboarding.background.from}
                />
                <Stop
                  offset="100%"
                  stopColor={theme.onboarding.background.to}
                />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad)" />
          </Svg>
          <Onboarding
            endOnboarding={() => {
              setOnBoarding(false);
            }}
            generateEntry={generateEntry}
            getPermissionsAndData={getPermissionsAndData}
          />
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
              <ModalItem
                icon={<SettingsIcon />}
                boldText={'Settings'}
                softText={''}
                onPress={() => {
                  navigation.navigate('Settings');
                  setShowModal(false);
                }}
              />
            </View>
          </Modal>
          {/* <DatePicker
            modal
            mode="date"
            open={open}
            date={date}
            onConfirm={async date => {
              setOpen(false);
              // console.log({date: });
              if (mode === 'generate') {
                await generateEntry({
                  data: await getPermissionsAndData(date.getTime()),
                  date: date.getTime(),
                });
              } else if (mode === 'manual') {
                createManualEntry(date.getTime());
              }
              // setDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          /> */}

          {/* <HomeTop navigation={navigation} /> */}
          {/* <HomeHeading
            entries={entries.length}
            manual={entries.filter(entry => entry.generated !== true).length}
            events={
              entries
                .map(entry => entry.events)
                .flat()
                .filter(event => event.type !== 'photo').length
            }
            photos={
              entries
                .map(entry => entry.events)
                .flat()
                .filter(event => event.type === 'photo').length
            }
          /> */}
          {/* {showNewHeader === true ? (
            <View>
              <Text></Text>
            </View>
          ) : ( */}
          <Animated.View
            style={{
              // backgroundColor: screen === screenValues.RICH ? '#06609E' : color,
              backgroundColor: '#06609E',

              padding: screen === screenValues.RICH ? 20 : rangeViewPadding,
              // flexShrink: 1,
              height: screen === screenValues.RICH ? 75 : rangeViewHeight,
              overflow: 'hidden',
              // height: headerScrollHeight,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                backgroundColor: '#0A5487',
                borderRadius: 5,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setRangeView(rangeViewValues.DAYS);
                }}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: '10%',
                  marginVertical: 5,
                  marginHorizontal: '1%',
                  borderRadius: 5,
                  backgroundColor:
                    rangeView === rangeViewValues.DAYS ? '#06609E' : '#0A5487',
                }}>
                <Text allowFontScaling={false} style={{color: 'white'}}>
                  Days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRangeView(rangeViewValues.WEEKS);
                }}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: '10%',
                  marginVertical: 5,
                  marginHorizontal: '1%',
                  borderRadius: 5,
                  backgroundColor:
                    rangeView === rangeViewValues.WEEKS ? '#06609E' : '#0A5487',
                }}>
                <Text allowFontScaling={false} style={{color: 'white'}}>
                  Weeks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRangeView(rangeViewValues.MONTHS);
                }}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: '10%',
                  marginVertical: 5,
                  marginHorizontal: '1%',
                  borderRadius: 5,
                  backgroundColor:
                    rangeView === rangeViewValues.MONTHS
                      ? '#06609E'
                      : '#0A5487',
                }}>
                <Text allowFontScaling={false} style={{color: 'white'}}>
                  Months
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents={'box-none'}
            style={{
              overflow: 'hidden',
              backgroundColor: 'rgba(0,0,0,0)',
              paddingBottom: 500,
              position: 'absolute',
              width: '100%',
              zIndex: 999,
            }}>
            <Animated.View
              style={{
                backgroundColor: 'white',
                padding: screen === screenValues.RICH ? 0 : headerPadding,
                width: '100%',
                height: screen === screenValues.RICH ? 0 : headerHeight,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                gap: 10,
                shadowOpacity: 0.58,
                shadowRadius: 16.0,

                elevation: 24,
              }}>
              {entryHeaderList.length > 0 && (
                <>
                  {/* {console.log({entryHeaderList, entryHeaderIndex})} */}
                  <Text
                    allowFontScaling={false}
                    style={{fontWeight: '600', fontSize: 20}}>
                    {entryHeaderList[entryHeaderIndex].time}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontStyle: 'italic',
                      fontWeight: '600',
                      fontSize: 20,
                    }}>
                    {entryHeaderList[entryHeaderIndex].title}
                  </Text>
                </>
              )}
            </Animated.View>
          </Animated.View>

          <Swipeable
            // dragOffsetFromRightEdge={100}
            onBegan={() => {
              console.log('allonsy');
            }}
            onSwipeableOpen={() => {
              console.log('open');
            }}
            onSwipeableClose={() => {
              console.log('close');
            }}
            onSwipeableWillOpen={() => {
              console.log('will open');
              setDrag(false);
              setScreen(screenValues.RICH);
            }}
            onSwipeableWillClose={() => {
              console.log('will close');
              setDrag(false);
              setScreen(screenValues.READ);
            }}
            enabled={!scroll}
            containerStyle={{flex: 1}}
            onActivated={() => {
              setDrag(true);
              console.log('activate');
            }}
            // ON
            renderRightActions={(val1, val2) => {
              console.log({val1, val2});
              const trans = val2.interpolate({
                inputRange: [-Dimensions.get('screen').width, -150],
                outputRange: [0, Dimensions.get('screen').width],
                extrapolate: 'clamp',
              });
              // useEffect(() => {
              //   console.log({trans});
              // }, [trans]);
              console.log({trans});
              const currentEntry =
                entries.length > 0
                  ? entries.sort((a, b) => b.time - a.time)[
                      currentRichModeEntryIndex
                    ]
                  : {};
              let pattern = /\[\[\d+\]\]/g;

              let matches = currentEntry?.entry
                ?.split(pattern)
                .filter(text => text !== '' && text.split(' ').length > 0);
              // const matches2 = pattern.exec(currentEntry?.entry);
              const matches2 = findMatches(
                /\[\[\d+\]\]/g,
                currentEntry?.entry,
              ).flat();

              console.log({entry: currentEntry?.entry, matches2, matches});
              // console.log({matches, matches2, events: currentEntry?.events.find((event)=>{event.id})});

              return (
                <Animated.View
                  style={{
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexGrow: 1,
                    // transform: val1,
                    //Dimensions.get('screen').width
                    transform: [{translateX: trans}],
                  }}>
                  <ScrollView>
                    {entries.length > 0 && currentEntry !== undefined && (
                      <View style={{padding: 10}}>
                        <View style={{gap: 10}}>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: 18,
                              fontWeight: 600,
                              color: '#8A888A',
                            }}>
                            {toDateString(currentEntry.time)}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={{fontSize: 20, fontWeight: 600}}>
                            {currentEntry.title}
                          </Text>
                          {/* <Text allowFontScaling={false} style={{fontSize: 16}}> */}
                          {matches.map((text, textIndex) => {
                            // const eventData =
                            //   matches2?.length > 0
                            //     ? currentEntry?.events.find(
                            //         event =>
                            //           event.id ===
                            //           matches2[textIndex].substring(
                            //             2,
                            //             matches2[textIndex].length - 1,
                            //           ),
                            //       )
                            //     : {};
                            // console.log(
                            //   matches2[textIndex].substring(
                            //     2,
                            //     matches2[textIndex].length - 2,
                            //   ),
                            // );
                            // console.log({matches2, text, textIndex});
                            // console.log(
                            // matches2 !== null
                            //   ? matches2[textIndex].substring(
                            //       2,
                            //       matches2[textIndex].length - 2,
                            //     )
                            //   : null,
                            // );
                            console.log({matches2, textIndex, text});
                            const eventLookFor =
                              matches2 !== null &&
                              (matches.length === matches2.length ||
                                textIndex < matches2.length)
                                ? matches2[textIndex].substring(
                                    2,
                                    matches2[textIndex].length - 2,
                                  )
                                : null;
                            const eventData =
                              eventLookFor !== null
                                ? currentEntry?.events.find(
                                    event =>
                                      event.id === parseInt(eventLookFor),
                                  )
                                : null;
                            console.log(parseInt(eventLookFor));
                            console.log(eventData);
                            const getFormatedTimeString = (
                              time1,
                              time2 = null,
                            ) => {
                              const date = new Date(time1);
                              var hours = date.getHours();
                              // Minutes part from the timestamp
                              var minutes = '0' + date.getMinutes();

                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              hours = hours % 12;
                              hours = hours ? '0' + hours : 12;
                              // Seconds part from the timestamp
                              var formattedTime =
                                hours.substr(-2) +
                                ':' +
                                minutes.substr(-2) +
                                ' ' +
                                ampm;
                              if (time2 === null) {
                                return formattedTime;
                              } else {
                                return `${formattedTime}-${getFormatedTimeString(
                                  time2,
                                )}`;
                              }
                            };

                            var formattedTime;
                            if (eventData !== null) {
                              var time2 = eventData.endTime || null;
                              formattedTime = getFormatedTimeString(
                                eventData.time,
                                time2,
                              );
                            }

                            return (
                              text.split(' ').length > 0 && (
                                <View key={textIndex}>
                                  <Text
                                    allowFontScaling={false}
                                    style={{fontSize: 16}}>
                                    {text}
                                  </Text>
                                  {eventData !== null && (
                                    <View>
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
                                          }}>
                                          {getEventIcon(eventData.type)}
                                        </View>
                                        <View>
                                          <Text
                                            style={{
                                              color: 'rgba(11, 11, 11, 0.8)',
                                              fontWeight: 600,
                                            }}>
                                            {eventData.title}
                                          </Text>
                                          <Text
                                            style={{
                                              color: 'rgba(11, 11, 11, 0.6)',
                                            }}>
                                            {formattedTime}
                                          </Text>
                                        </View>
                                      </View>
                                      {eventData.type === 'photo' ? (
                                        <ImageAsset
                                          localIdentifier={
                                            eventData.localIdentifier
                                          }
                                          // setHeight={200}
                                          // setWidth={100}
                                          // height={1}
                                          style={{
                                            flex: 1,
                                            // height: '100%',
                                            // width: '100%',
                                            height: 200,
                                          }}
                                        />
                                      ) : (
                                        <View
                                          style={{
                                            backgroundColor: 'red',
                                            width: '90%',
                                            height: 200,
                                          }}
                                        />
                                      )}
                                    </View>
                                  )}
                                  {textIndex !== matches.length - 1 && (
                                    <View
                                      style={{
                                        height: 1,
                                        width: '100%',
                                        backgroundColor:
                                          'rgba(11, 11, 11, 0.1)',
                                      }}></View>
                                  )}
                                </View>
                              )
                            );
                          })}
                          {/* </Text> */}
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </Animated.View>
              );
            }}>
            <View>
              <ScrollView
                // pagingEnabled
                contentContainerStyle={{
                  paddingVertical: verticalScale(10),
                  paddingHorizontal: horizontalScale(10),
                  // flexGrow: 1,
                  backgroundColor:
                    headerScrollHeight < H_MAX_HEIGHT / 2 ? 'black' : 'white',
                }}
                onScroll={Animated.event(
                  [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
                  {useNativeDriver: false},
                )}
                // ONsCROLL
                scrollEnabled={!drag}
                onScrollBeginDrag={() => {
                  console.log('start');
                  setScroll(true);
                }}
                onScrollEndDrag={() => {
                  console.log('end');
                  setScroll(false);
                }}
                scrollEventThrottle={16}>
                {/* <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginBottom: 10,
              }}>
              {generatingEntry ? (
                <Text
                  allowFontScaling={false}
                  style={{fontSize: moderateScale(14)}}>
                  Loading...
                </Text>
              ) : (
                <>
                  <CreateEntryButton
                    onPress={async () => {
                      // await generateEntry(await getPermissionsAndData());
                      setOpen(true);
                      setMode('generate');
                    }}
                    text={'Generate new entry'}
                  />
                  <CreateEntryButton
                    onPress={() => {
                      setOpen(true);
                      setMode('manual');
                    }}
                    text={'Create new entry (Manual)'}
                  />
                </>
              )}
            </View> */}

                {!loading && !loadingEntries ? (
                  <>
                    {entries.length === 0 ? (
                      <View style={{gap: 20}}>
                        <Image
                          source={
                            createEntryTime === 8
                              ? require('./src/assets/AMImage.png')
                              : require('./src/assets/PMImage.png')
                          }
                          resizeMode="contain"
                          style={{
                            alignSelf: 'center',
                            display: 'flex',
                            marginTop: 50,
                            width: horizontalScale(250),
                            height: verticalScale(250),
                            justifyContent: 'center',
                          }}
                        />
                        <Text
                          allowFontScaling={false}
                          style={{
                            fontWeight: 600,
                            textAlign: 'center',
                            fontSize: 23,
                          }}>
                          Please wait till 8
                          {createEntryTime === 8 ? 'AM' : 'PM'}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={{
                            fontWeight: 400,
                            textAlign: 'center',
                            fontSize: 18,
                          }}>
                          We will notify you as soon as your first daily summary
                          will be ready
                        </Text>
                      </View>
                    ) : (
                      // <EntryList entries={entries} navigation={navigation} />
                      <View style={{gap: 10}}>
                        {entries
                          .sort((a, b) => b.time - a.time)
                          .map((currEntry, currEntryIndex) => {
                            const dateText = toDateString(currEntry.time);
                            return (
                              <View
                                onTouchStart={() => {
                                  console.log('yee-haw');
                                  setCurrentRichModeEntryIndex(currEntryIndex);
                                }}
                                onTouchEndCapture={() => {
                                  if (!scroll && !drag) {
                                    console.log('TOUCH END');
                                    setShowModal(true);
                                  }
                                }}
                                onLayout={event => {
                                  // console.log(event.nativeEvent.layout);
                                  // console.log({
                                  //   entries: entries.length,
                                  //   entryHeaderList: entryHeaderList.length,
                                  // });
                                  if (
                                    entryHeaderList.length ===
                                    entries.length - 1
                                  ) {
                                    var newList = [
                                      ...entryHeaderList,
                                      {
                                        y: event.nativeEvent.layout.y,
                                        title: currEntry.title,
                                        time: dateText,
                                        height: event.nativeEvent.layout.height,
                                      },
                                    ];
                                    setEntryHeaderList(
                                      newList.sort((a, b) => a.y - b.y),
                                    );
                                  } else if (
                                    entryHeaderList.length < entries.length
                                  ) {
                                    setEntryHeaderList([
                                      ...entryHeaderList,
                                      {
                                        y: event.nativeEvent.layout.y,
                                        title: currEntry.title,
                                        time: dateText,
                                        height: event.nativeEvent.layout.height,
                                      },
                                    ]);
                                  }
                                }}
                                key={currEntryIndex}>
                                <View style={{gap: 10}}>
                                  <Text
                                    allowFontScaling={false}
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 600,
                                      color: '#8A888A',
                                    }}>
                                    {dateText}
                                  </Text>
                                  <Text
                                    allowFontScaling={false}
                                    style={{fontSize: 20, fontWeight: 600}}>
                                    {currEntry.title}
                                  </Text>
                                  <Text
                                    allowFontScaling={false}
                                    style={{fontSize: 16}}>
                                    {currEntry.entry}
                                  </Text>
                                </View>

                                {currEntryIndex !== entries.length - 1 ? (
                                  <View
                                    style={{
                                      backgroundColor: 'black',
                                      width: '100%',
                                      height: 1,
                                      marginTop: 10,
                                    }}
                                  />
                                ) : (
                                  <>
                                    {/* {console.log('entryHeaderList', {
                                      entryHeaderList: entryHeaderList,
                                      entryHeaderList2:
                                        entryHeaderList[currEntryIndex],
                                      currEntryIndex,
                                    })} */}
                                    {entryHeaderList.length ===
                                      entries.length && (
                                      <>
                                        {/* {console.log('VIEW')}
                                        {console.log({entryHeaderList})}
                                        {console.log({currEntryIndex})}
                                        {console.log(
                                          entryHeaderList[currEntryIndex],
                                        )} */}
                                        {/* 
                                    {console.log('entryHeaderList', {
                                      entryHeaderList: entryHeaderList,
                                      entryHeaderList2:
                                        entryHeaderList[currEntryIndex],
                                      currEntryIndex,
                                    })} */}
                                        <View
                                          style={{
                                            width: '100%',
                                            height:
                                              Dimensions.get('window').height -
                                              entryHeaderList[currEntryIndex]
                                                .height,
                                          }}
                                        />
                                      </>
                                    )}
                                  </>
                                )}
                              </View>
                            );
                          })}
                      </View>
                    )}
                  </>
                ) : (
                  //
                  <>
                    {console.log({loading, loadingEntries})}
                    <Text allowFontScaling={false}>Loading Entries...</Text>
                  </>
                )}
              </ScrollView>
            </View>
          </Swipeable>
          <Animated.View
            style={{
              position: 'absolute',
              right: 30,
              bottom: screen === screenValues.RICH ? 100 : floatingButtonBottom,
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
                const mode = 'generate';
                if (mode === 'generate') {
                  await generateEntry({
                    data: await getPermissionsAndData(date.getTime()),
                    date: date.getTime(),
                  });
                } else if (mode === 'manual') {
                  createManualEntry(date.getTime());
                }
              }}>
              <NewEntryIcon />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              justifyContent: 'space-evenly',
              flexDirection: 'row',
              backgroundColor: '#DAD9DD',
              // flexGrow: 1,
              // justifyContent: 'flex-end',
              // alignSelf: 'flex-end',
              // bottom: 0,

              height: screen === screenValues.RICH ? 75 : footerHeight,
            }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <SearchMenuIcon
                fill={screen === screenValues.SEARCH ? '#3286B3' : '#68696A'}
              />
              <Text
                style={{
                  color: screen === screenValues.SEARCH ? '#3286B3' : '#68696A',
                }}
                allowFontScaling={false}>
                Search
              </Text>
            </View>

            <View
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
                Read View
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <MomentsMenuIcon
                fill={screen === screenValues.RICH ? '#3286B3' : '#68696A'}
              />
              <Text
                style={{
                  color: screen === screenValues.RICH ? '#3286B3' : '#68696A',
                }}
                allowFontScaling={false}>
                Rich View
              </Text>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};
